import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Grid } from '@mui/material';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import StickerPanel from './components/StickerPanel';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [canvas, setCanvas] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [isRemoving, setIsRemoving] = useState(false);

  const addSticker = (stickerUrl) => {
    setStickers([...stickers, stickerUrl]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Toolbar 
              canvas={canvas} 
              addSticker={addSticker} 
              isRemoving={isRemoving} 
              setIsRemoving={setIsRemoving} 
            />
          </Grid>
          <Grid item xs={9}>
            <Canvas setCanvas={setCanvas} />
          </Grid>
          <Grid item xs={3}>
            <StickerPanel stickers={stickers} canvas={canvas} />
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;