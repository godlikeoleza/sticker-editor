import React from 'react';
import { Grid } from '@mui/material';
import { fabric } from 'fabric';

function StickerPanel({ stickers, canvas }) {
  const handleStickerClick = (stickerUrl) => {
    fabric.Image.fromURL(stickerUrl, (img) => {
      img.scaleToWidth(100);
      canvas.add(img);
      canvas.renderAll();
    });
  };

  return (
    <Grid container spacing={1}>
      {stickers.map((sticker, index) => (
        <Grid item key={index} xs={4}>
          <img
            src={sticker}
            alt={`Sticker ${index}`}
            style={{ width: '100%', cursor: 'pointer' }}
            onClick={() => handleStickerClick(sticker)}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default StickerPanel;