import React, { useState, useContext, useEffect } from 'react';
import {
  AppBar,
  Toolbar as MuiToolbar,
  IconButton,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  Box,
  Tooltip,
  Popover,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { SketchPicker } from 'react-color';
import { fabric } from 'fabric';
import BrushIcon from '@mui/icons-material/Brush';
import CircleIcon from '@mui/icons-material/Circle';
import RectangleIcon from '@mui/icons-material/Rectangle';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import GroupIcon from '@mui/icons-material/Group';
import GroupRemoveIcon from '@mui/icons-material/GroupRemove';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import PaletteIcon from '@mui/icons-material/Palette';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import PentagonIcon from '@mui/icons-material/Pentagon';
import LayersIcon from '@mui/icons-material/Layers';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FilterIcon from '@mui/icons-material/Filter';
import CreateIcon from '@mui/icons-material/Create';
import { CanvasContext } from '../context/CanvasContext';

const API_KEY = 'igtwy4nyA1ujak9pXyxDbg22';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const Toolbar = () => {
  const {
    canvas,
    toggleDrawingMode,
    toggleEraser,
    drawingMode,
    color,
    setColor,
    undo,
    redo,
    zoomIn,
    zoomOut,
    groupObjects,
    ungroupObjects,
    canUndo,
    canRedo,
    addStickerToCanvas,
    isEraserActive,
    moveObjectToLayer,
    saveSelectedAsSticker,
    deleteSelectedObject,
    clearCanvas,
    stickers
  } = useContext(CanvasContext);

  const [text, setText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
  const [shapesMenuAnchor, setShapesMenuAnchor] = useState(null);
  const [layersMenuAnchor, setLayersMenuAnchor] = useState(null);
  const [textMenuAnchor, setTextMenuAnchor] = useState(null);

  useEffect(() => {
    if (canvas) {
      canvas.freeDrawingBrush.color = color;
    }
  }, [color, canvas]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const dataUrl = f.target.result;
      fabric.Image.fromURL(dataUrl, (img) => {
        img.scaleToWidth(200);
        canvas.add(img);
        canvas.centerObject(img);
        canvas.renderAll();
      }, { crossOrigin: 'anonymous' });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async () => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image') {
      alert('Пожалуйста, выберите изображение для удаления фона');
      return;
    }

    const dataUrl = activeObject.toDataURL();
    const blob = await (await fetch(dataUrl)).blob();

    const formData = new FormData();
    formData.append('image_file', blob, 'image.png');
    formData.append('size', 'auto');

    try {
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': API_KEY,
        },
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        fabric.Image.fromURL(url, (img) => {
          img.set({
            left: activeObject.left,
            top: activeObject.top,
            scaleX: activeObject.scaleX,
            scaleY: activeObject.scaleY,
          });
          canvas.remove(activeObject);
          canvas.add(img);
          canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
      } else {
        console.error('Error removing background:', await response.text());
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddText = () => {
    if (!canvas) return;
    const textObject = new fabric.Text(text, {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fill: color,
      fontSize: 20,
    });
    canvas.add(textObject);
    canvas.renderAll();
    setText('');
    setTextMenuAnchor(null);
  };

  const handleAddShape = (shapeType) => {
    if (!canvas) return;

    let shape;
    switch (shapeType) {
      case 'circle':
        shape = new fabric.Circle({
          radius: 50,
          fill: color,
          left: 100,
          top: 100,
        });
        break;
      case 'rectangle':
        shape = new fabric.Rect({
          width: 100,
          height: 75,
          fill: color,
          left: 100,
          top: 100,
        });
        break;
      case 'triangle':
        shape = new fabric.Triangle({
          width: 100,
          height: 100,
          fill: color,
          left: 100,
          top: 100,
        });
        break;
      case 'star':
        shape = new fabric.Path('M 0 0 L 75 50 L 100 0 L 125 50 L 200 0 L 150 75 L 200 100 L 125 100 L 100 150 L 75 100 L 0 100 L 50 75 Z', {
          fill: color,
          left: 100,
          top: 100,
        });
        break;
      case 'pentagon':
        shape = new fabric.Path('M 0 0 L 100 0 L 150 75 L 75 150 L 0 75 Z', {
          fill: color,
          left: 100,
          top: 100,
        });
        break;
      case 'arrow':
        shape = new fabric.Path('M 0 0 L 200 0 L 170 -30 M 200 0 L 170 30', {
          fill: '',
          stroke: color,
          strokeWidth: 3,
          left: 100,
          top: 100,
        });
        break;
      default:
        return;
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    setShapesMenuAnchor(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <MuiToolbar>
          <StyledIconButton color="inherit" onClick={clearCanvas}>
            <Tooltip title="Создать новую чистую канву">
              <AddIcon />
            </Tooltip>
          </StyledIconButton>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="raised-button-file"
            multiple
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="raised-button-file">
            <StyledIconButton color="inherit" component="span">
              <Tooltip title="Загрузить изображение">
                <CloudUploadIcon />
              </Tooltip>
            </StyledIconButton>
          </label>
          <StyledIconButton color="inherit" onClick={handleRemoveBackground}>
            <Tooltip title="Удалить фон">
              <FilterIcon />
            </Tooltip>
          </StyledIconButton>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <StyledIconButton color="inherit" onClick={toggleDrawingMode}>
            <Tooltip title={drawingMode ? "Выключить режим рисования" : "Включить режим рисования"}>
              <BrushIcon />
            </Tooltip>
          </StyledIconButton>
          <StyledIconButton color="inherit" onClick={toggleEraser}>
            <Tooltip title={isEraserActive ? "Выключить ластик" : "Включить ластик"}>
              <DeleteSweepIcon />
            </Tooltip>
          </StyledIconButton>
          <StyledIconButton color="inherit" onClick={(e) => setShapesMenuAnchor(e.currentTarget)}>
            <Tooltip title="Добавить фигуру">
              <AddIcon />
            </Tooltip>
          </StyledIconButton>
          <Menu
            anchorEl={shapesMenuAnchor}
            open={Boolean(shapesMenuAnchor)}
            onClose={() => setShapesMenuAnchor(null)}
          >
            <MenuItem onClick={() => handleAddShape('circle')}><CircleIcon /> Круг</MenuItem>
            <MenuItem onClick={() => handleAddShape('rectangle')}><RectangleIcon /> Прямоугольник</MenuItem>
            <MenuItem onClick={() => handleAddShape('triangle')}><ChangeHistoryIcon /> Треугольник</MenuItem>
            <MenuItem onClick={() => handleAddShape('star')}><StarIcon /> Звезда</MenuItem>
            <MenuItem onClick={() => handleAddShape('pentagon')}><PentagonIcon /> Пятиугольник</MenuItem>
            <MenuItem onClick={() => handleAddShape('arrow')}><ArrowRightAltIcon /> Стрелка</MenuItem>
          </Menu>
          <StyledIconButton color="inherit" onClick={(e) => setTextMenuAnchor(e.currentTarget)}>
            <Tooltip title="Добавить текст">
              <CreateIcon />
            </Tooltip>
          </StyledIconButton>
          <Menu
            anchorEl={textMenuAnchor}
            open={Boolean(textMenuAnchor)}
            onClose={() => setTextMenuAnchor(null)}
          >
            <MenuItem>
              <TextField
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Введите текст"
                size="small"
                sx={{ width: 200 }}
              />
            </MenuItem>
            <MenuItem onClick={handleAddText}>Добавить текст</MenuItem>
          </Menu>
          <StyledIconButton color="inherit" onClick={(e) => setColorPickerAnchor(e.currentTarget)}>
            <Tooltip title="Выбрать цвет">
              <PaletteIcon />
            </Tooltip>
          </StyledIconButton>
          <Popover
            open={Boolean(colorPickerAnchor)}
            anchorEl={colorPickerAnchor}
            onClose={() => setColorPickerAnchor(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <SketchPicker color={color} onChange={(newColor) => setColor(newColor.hex)} />
          </Popover>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <StyledIconButton color="inherit" onClick={undo} disabled={!canUndo}>
            <Tooltip title="Отменить">
              <UndoIcon />
            </Tooltip>
          </StyledIconButton>
          <StyledIconButton color="inherit" onClick={redo} disabled={!canRedo}>
            <Tooltip title="Повторить">
              <RedoIcon />
            </Tooltip>
          </StyledIconButton>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <StyledIconButton color="inherit" onClick={zoomIn}>
            <Tooltip title="Увеличить">
              <ZoomInIcon />
            </Tooltip>
          </StyledIconButton>
          <StyledIconButton color="inherit" onClick={zoomOut}>
            <Tooltip title="Уменьшить">
              <ZoomOutIcon />
            </Tooltip>
          </StyledIconButton>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <StyledIconButton color="inherit" onClick={groupObjects}>
            <Tooltip title="Сгруппировать объекты">
              <GroupIcon />
            </Tooltip>
          </StyledIconButton>
          <StyledIconButton color="inherit" onClick={ungroupObjects}>
            <Tooltip title="Разгруппировать объекты">
              <GroupRemoveIcon />
            </Tooltip>
          </StyledIconButton>
          <StyledIconButton color="inherit" onClick={(e) => setLayersMenuAnchor(e.currentTarget)}>
            <Tooltip title="Управление слоями">
              <LayersIcon />
            </Tooltip>
          </StyledIconButton>
          <Menu
            anchorEl={layersMenuAnchor}
            open={Boolean(layersMenuAnchor)}
            onClose={() => setLayersMenuAnchor(null)}
          >
            <MenuItem onClick={() => { moveObjectToLayer('up'); setLayersMenuAnchor(null); }}>
              <ArrowUpwardIcon /> Переместить вверх
            </MenuItem>
            <MenuItem onClick={() => { moveObjectToLayer('down'); setLayersMenuAnchor(null); }}>
              <ArrowDownwardIcon /> Переместить вниз
            </MenuItem>
            <MenuItem onClick={() => { moveObjectToLayer('top'); setLayersMenuAnchor(null); }}>
              <VerticalAlignTopIcon /> На передний план
            </MenuItem>
            <MenuItem onClick={() => { moveObjectToLayer('bottom'); setLayersMenuAnchor(null); }}>
              <VerticalAlignBottomIcon /> На задний план
            </MenuItem>
          </Menu>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <StyledIconButton color="inherit" onClick={saveSelectedAsSticker}>
            <Tooltip title="Сохранить выбранный объект как стикер">
              <SaveIcon />
            </Tooltip>
          </StyledIconButton>
          <StyledIconButton color="inherit" onClick={deleteSelectedObject}>
            <Tooltip title="Удалить выбранный объект">
              <DeleteIcon />
            </Tooltip>
          </StyledIconButton>
        </MuiToolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, p: 2, display: 'flex' }}>
        <Box sx={{ flexGrow: 1 }}>
          <canvas id="canvas" />
        </Box>
        {stickers.length > 0 && (
          <Paper sx={{ width: 200, p: 2, ml: 2, overflowY: 'auto' }}>
            <Typography variant="subtitle1" gutterBottom>Сохраненные стикеры:</Typography>
            <Grid container spacing={1}>
              {stickers.map((sticker, index) => (
                <Grid item key={index} xs={6}>
                  <img 
                    src={sticker} 
                    alt={`Sticker ${index}`} 
                    style={{ width: '100%', cursor: 'pointer' }} 
                    onClick={() => addStickerToCanvas(sticker)}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default Toolbar;