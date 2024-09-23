import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

function Canvas({ setCanvas }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    });
    setCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [setCanvas]);

  return <canvas ref={canvasRef} />;
}

export default Canvas;