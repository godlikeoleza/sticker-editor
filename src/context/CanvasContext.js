import React, { createContext, useState, useRef, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';

export const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [color, setColor] = useState('#000000');
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [stickers, setStickers] = useState([]);

  useEffect(() => {
    const canvasElement = document.getElementById('canvas');
    const canvasInstance = new fabric.Canvas(canvasElement, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });
    setCanvas(canvasInstance);

    return () => {
      canvasInstance.dispose();
    };
  }, []);

  const saveState = useCallback(() => {
    if (canvas) {
      const json = JSON.stringify(canvas.toJSON(['id', 'selectable']));
      setHistory(prevHistory => {
        const newHistory = [...prevHistory.slice(0, currentStep + 1), json];
        setCurrentStep(newHistory.length - 1);
        setCanUndo(newHistory.length > 1);
        setCanRedo(false);
        return newHistory;
      });
    }
  }, [canvas, currentStep]);

  useEffect(() => {
    if (canvas) {
      const handleModification = () => {
        saveState();
      };

      canvas.on('object:added', handleModification);
      canvas.on('object:modified', handleModification);
      canvas.on('object:removed', handleModification);

      return () => {
        canvas.off('object:added', handleModification);
        canvas.off('object:modified', handleModification);
        canvas.off('object:removed', handleModification);
      };
    }
  }, [canvas, saveState]);

  const undo = useCallback(() => {
    if (currentStep > 0 && canvas) {
      const prevState = JSON.parse(history[currentStep - 1]);
      canvas.loadFromJSON(prevState, () => {
        canvas.renderAll();
        setCurrentStep(prevStep => prevStep - 1);
        setCanUndo(currentStep > 1);
        setCanRedo(true);
      });
    }
  }, [canvas, currentStep, history]);
  
  const redo = useCallback(() => {
    if (currentStep < history.length - 1 && canvas) {
      const nextState = JSON.parse(history[currentStep + 1]);
      canvas.loadFromJSON(nextState, () => {
        canvas.renderAll();
        setCurrentStep(prevStep => prevStep + 1);
        setCanUndo(true);
        setCanRedo(currentStep < history.length - 2);
      });
    }
  }, [canvas, currentStep, history]);

  const toggleDrawingMode = useCallback(() => {
    if (canvas) {
      setDrawingMode(prevMode => {
        const newMode = !prevMode;
        canvas.isDrawingMode = newMode;
        if (newMode) {
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
          canvas.freeDrawingBrush.color = color;
          canvas.freeDrawingBrush.width = 5;
        }
        return newMode;
      });
    }
  }, [canvas, color]);

  const toggleEraser = useCallback(() => {
    if (canvas) {
      setIsEraserActive(prev => {
        const newMode = !prev;
        if (newMode) {
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
          canvas.freeDrawingBrush.color = '#ffffff';
          canvas.freeDrawingBrush.width = 20;
        } else {
          canvas.isDrawingMode = false;
        }
        return newMode;
      });
    }
  }, [canvas]);

  const zoomIn = useCallback(() => {
    if (canvas) {
      canvas.setZoom(canvas.getZoom() * 1.1);
      canvas.renderAll();
    }
  }, [canvas]);

  const zoomOut = useCallback(() => {
    if (canvas) {
      canvas.setZoom(canvas.getZoom() / 1.1);
      canvas.renderAll();
    }
  }, [canvas]);

  const groupObjects = useCallback(() => {
    if (canvas) {
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length > 1) {
        const group = new fabric.Group(activeObjects, {
          originX: 'center',
          originY: 'center'
        });
        canvas.discardActiveObject();
        activeObjects.forEach(obj => canvas.remove(obj));
        canvas.add(group);
        canvas.setActiveObject(group);
        canvas.renderAll();
        saveState();
      }
    }
  }, [canvas, saveState]);
  
  const ungroupObjects = useCallback(() => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === 'group') {
        const items = activeObject.getObjects();
        const groupCenter = activeObject.getCenterPoint();
        activeObject.destroy();
        canvas.remove(activeObject);
        items.forEach(item => {
          canvas.add(item);
          item.set({
            left: groupCenter.x + item.left,
            top: groupCenter.y + item.top
          });
          item.setCoords();
        });
        canvas.renderAll();
        saveState();
      }
    }
  }, [canvas, saveState]);

  const addStickerToCanvas = useCallback((stickerDataURL) => {
    if (canvas) {
      fabric.Image.fromURL(stickerDataURL, (img) => {
        img.scaleToWidth(200);
        canvas.add(img);
        canvas.centerObject(img);
        canvas.renderAll();
        saveState();
      }, { crossOrigin: 'anonymous' });
    }
  }, [canvas, saveState]);

  const moveObjectToLayer = useCallback((direction) => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        if (direction === 'up') {
          canvas.bringForward(activeObject);
        } else if (direction === 'down') {
          canvas.sendBackwards(activeObject);
        } else if (direction === 'top') {
          canvas.bringToFront(activeObject);
        } else if (direction === 'bottom') {
          canvas.sendToBack(activeObject);
        }
        canvas.renderAll();
        saveState();
      }
    }
  }, [canvas, saveState]);

  const saveSelectedAsSticker = useCallback(() => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const tempCanvas = document.createElement('canvas');
        
        let width, height;
        if (activeObject.type === 'group') {
          const boundingRect = activeObject.getBoundingRect(true);
          width = boundingRect.width;
          height = boundingRect.height;
        } else {
          width = activeObject.getScaledWidth();
          height = activeObject.getScaledHeight();
        }
        
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        activeObject.clone((clonedObj) => {
          const tempFabricCanvas = new fabric.StaticCanvas(tempCanvas);
          clonedObj.set({
            left: 0,
            top: 0,
            originX: 'left',
            originY: 'top'
          });
          tempFabricCanvas.add(clonedObj);
          tempFabricCanvas.renderAll();
          
          const stickerDataUrl = tempCanvas.toDataURL();
          setStickers(prevStickers => [...prevStickers, stickerDataUrl]);
        });
      } else {
        const dataURL = canvas.toDataURL();
        setStickers(prevStickers => [...prevStickers, dataURL]);
      }
    }
  }, [canvas]);

  const deleteSelectedObject = useCallback(() => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject);
        canvas.renderAll();
        saveState();
      }
    }
  }, [canvas, saveState]);

  const clearCanvas = useCallback(() => {
    if (canvas) {
      canvas.clear();
      canvas.setBackgroundColor('#ffffff');
      canvas.renderAll();
      saveState();
    }
  }, [canvas, saveState]);

  return (
    <CanvasContext.Provider
      value={{
        canvas,
        setCanvas,
        canvasRef,
        drawingMode,
        setDrawingMode,
        color,
        setColor,
        undo,
        redo,
        toggleDrawingMode,
        toggleEraser,
        zoomIn,
        zoomOut,
        groupObjects,
        ungroupObjects,
        canUndo,
        canRedo,
        addStickerToCanvas,
        isEraserActive,
        setIsEraserActive,
        moveObjectToLayer,
        saveSelectedAsSticker,
        deleteSelectedObject,
        clearCanvas,
        stickers,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};