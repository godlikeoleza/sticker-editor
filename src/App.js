// src/App.js
import React from 'react';
import { CanvasProvider } from './context/CanvasContext';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import { Box } from '@mui/material';

function App() {
  return (
    <CanvasProvider>
      <Toolbar />
      <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
        <Canvas />
      </Box>
    </CanvasProvider>
  );
}

export default App;