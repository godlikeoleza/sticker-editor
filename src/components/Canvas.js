// src/components/Canvas.js
import React, { useContext, useEffect } from 'react';
import { CanvasContext } from '../context/CanvasContext';

const Canvas = () => {
  const { canvas, canvasRef, drawingMode, color } = useContext(CanvasContext);

  useEffect(() => {
    if (canvas) {
      canvas.isDrawingMode = drawingMode;
      if (drawingMode) {
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.width = 5;
      }
    }
  }, [drawingMode, color, canvas]);

  return <canvas id="canvas" ref={canvasRef} />;
};

export default Canvas;