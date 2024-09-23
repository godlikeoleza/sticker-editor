import React, { useState } from 'react';
import { AppBar, Toolbar as MuiToolbar, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Button, Input, CircularProgress, FormControl, FormControlLabel, Radio, RadioGroup, TextField, Menu, MenuItem } from '@mui/material';
import { ChromePicker } from 'react-color';
import { fabric } from 'fabric';
import axios from 'axios';
import MenuIcon from '@mui/icons-material/Menu';
import BrushIcon from '@mui/icons-material/Brush';
import DeleteIcon from '@mui/icons-material/Delete';
import CircleIcon from '@mui/icons-material/Circle';
import RectangleIcon from '@mui/icons-material/Rectangle';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

function Toolbar({ canvas, addSticker, isRemoving, setIsRemoving }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saveOption, setSaveOption] = useState('withoutBackground');
  const [drawingMode, setDrawingMode] = useState(false);
  const [text, setText] = useState('');
  const [color, setColor] = useState('#000000');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (f) => {
      fabric.Image.fromURL(f.target.result, (img) => {
        img.scaleToWidth(200);
        canvas.add(img);
        canvas.renderAll();
      });
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async () => {
    if (!canvas.getActiveObject()) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    const activeObject = canvas.getActiveObject();
    if (activeObject.type !== 'image') {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    setIsRemoving(true);

    try {
      const imageData = activeObject.toDataURL();
      const formData = new FormData();
      formData.append('image_file', dataURItoBlob(imageData), 'image.png');
      formData.append('size', 'auto');

      const response = await axios({
        method: 'post',
        url: 'https://api.remove.bg/v1.0/removebg',
        data: formData,
        responseType: 'arraybuffer',
        headers: {
          'X-Api-Key': 'igtwy4nyA1ujak9pXyxDbg22',
        },
      });

      const base64Image = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      fabric.Image.fromURL(`data:image/png;base64,${base64Image}`, (img) => {
        img.set({
          left: activeObject.left,
          top: activeObject.top,
          scaleX: activeObject.scaleX,
          scaleY: activeObject.scaleY,
          angle: activeObject.angle,
        });
        canvas.remove(activeObject);
        canvas.add(img);
        canvas.renderAll();
      });
    } catch (error) {
      console.error('Error removing background:', error);
      alert('Произошла ошибка при удалении фона');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSaveSticker = () => {
    let stickerDataURL;
    if (saveOption === 'withoutBackground') {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === 'image') {
        stickerDataURL = activeObject.toDataURL({
          format: 'png',
          quality: 0.8
        });
      } else {
        alert('Пожалуйста, выберите изображение');
        return;
      }
    } else {
      stickerDataURL = canvas.toDataURL({
        format: 'png',
        quality: 0.8
      });
    }
    addSticker(stickerDataURL);
  };

  const handleCreateNewCanvas = () => {
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
  };

  const handleToggleDrawingMode = () => {
    setDrawingMode(!drawingMode);
    canvas.isDrawingMode = !drawingMode;
  };

  const handleAddText = () => {
    const textObj = new fabric.Text(text, {
      left: 100,
      top: 100,
      fill: color,
      fontSize: 20
    });
    canvas.add(textObj);
    canvas.renderAll();
  };

  const handleAddShape = (shape) => {
    let shapeObj;
    switch (shape) {
      case 'circle':
        shapeObj = new fabric.Circle({
          left: 100,
          top: 100,
          radius: 50,
          fill: color
        });
        break;
      case 'rectangle':
        shapeObj = new fabric.Rect({
          left: 100,
          top: 100,
          width: 100,
          height: 50,
          fill: color
        });
        break;
      case 'arrow':
        shapeObj = new fabric.Path('M 0 0 L 100 0 L 80 -20 M 100 0 L 80 20', {
          left: 100,
          top: 100,
          fill: '',
          stroke: color,
          strokeWidth: 5
        });
        break;
      default:
        return;
    }
    canvas.add(shapeObj);
    canvas.renderAll();
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Вспомогательная функция для конвертации Data URI в Blob
  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  return (
    <div>
      <AppBar position="static">
        <MuiToolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Button color="inherit" onClick={handleCreateNewCanvas}>Новая канва</Button>
          <Button color="inherit" onClick={handleSaveSticker}>Сохранить стикер</Button>
        </MuiToolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List>
          <ListItem>
            <Input type="file" onChange={handleImageUpload} />
          </ListItem>
          <ListItem button onClick={handleRemoveBackground} disabled={isRemoving}>
            <ListItemIcon>
              {isRemoving ? <CircularProgress size={24} /> : <DeleteIcon />}
            </ListItemIcon>
            <ListItemText primary="Удалить фон" />
          </ListItem>
          <Divider />
          <ListItem>
            <FormControl component="fieldset">
              <RadioGroup
                row
                aria-label="saveOption"
                name="saveOption"
                value={saveOption}
                onChange={(e) => setSaveOption(e.target.value)}
              >
                <FormControlLabel value="withoutBackground" control={<Radio />} label="Сохранить без фона" />
                <FormControlLabel value="withCanvas" control={<Radio />} label="Сохранить с канвой" />
              </RadioGroup>
            </FormControl>
          </ListItem>
          <Divider />
          <ListItem button onClick={handleToggleDrawingMode}>
            <ListItemIcon>
              <BrushIcon />
            </ListItemIcon>
            <ListItemText primary={drawingMode ? 'Карандаш (Отключить рисование)' : 'Карандаш (Включить рисование)'} />
          </ListItem>
          <ListItem>
            <TextField
              label="Текст"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button onClick={handleAddText}>Добавить текст</Button>
          </ListItem>
          <Divider />
          <ListItem button onClick={handleMenuClick}>
            <ListItemIcon>
              <CircleIcon />
            </ListItemIcon>
            <ListItemText primary="Добавить объект" />
          </ListItem>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { handleAddShape('circle'); handleMenuClose(); }}>
              <ListItemIcon>
                <CircleIcon />
              </ListItemIcon>
              <ListItemText primary="Круг" />
            </MenuItem>
            <MenuItem onClick={() => { handleAddShape('rectangle'); handleMenuClose(); }}>
              <ListItemIcon>
                <RectangleIcon />
              </ListItemIcon>
              <ListItemText primary="Прямоугольник" />
            </MenuItem>
            <MenuItem onClick={() => { handleAddShape('arrow'); handleMenuClose(); }}>
              <ListItemIcon>
                <ArrowRightAltIcon />
              </ListItemIcon>
              <ListItemText primary="Стрелка" />
            </MenuItem>
          </Menu>
          <Divider />
          <ListItem>
            <ChromePicker color={color} onChange={(newColor) => setColor(newColor.hex)} />
          </ListItem>
        </List>
      </Drawer>
    </div>
  );
}

export default Toolbar;