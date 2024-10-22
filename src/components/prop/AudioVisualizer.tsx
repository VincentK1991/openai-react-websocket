import React, { useEffect, useRef } from 'react';
import { WavRenderer } from 'src/utils/wav_renderer';

interface AudioVisualizerProps {
  audioObjects: {
    wavRecorder: any;
    wavStreamPlayer: any;
  };
  small?: boolean;
}

export function AudioVisualizer({ audioObjects, small }: AudioVisualizerProps) {
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isLoaded = true;
    const { wavRecorder, wavStreamPlayer } = audioObjects;
    const clientCanvas = clientCanvasRef.current;
    const serverCanvas = serverCanvasRef.current;
    let clientCtx: CanvasRenderingContext2D | null = null;
    let serverCtx: CanvasRenderingContext2D | null = null;

    const render = () => {
      if (isLoaded) {
        // Client Canvas Rendering
        if (clientCanvas) {
          if (!clientCanvas.width || !clientCanvas.height) {
            clientCanvas.width = clientCanvas.offsetWidth;
            clientCanvas.height = clientCanvas.offsetHeight;
          }
          clientCtx = clientCtx || clientCanvas.getContext('2d');
          if (clientCtx) {
            clientCtx.clearRect(0, 0, clientCanvas.width, clientCanvas.height);
            const result = wavRecorder.recording
              ? wavRecorder.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              clientCanvas,
              clientCtx,
              result.values,
              '#0099ff',
              10,
              0,
              8
            );
          }
        }

        // Server Canvas Rendering
        if (serverCanvas) {
          if (!serverCanvas.width || !serverCanvas.height) {
            serverCanvas.width = serverCanvas.offsetWidth;
            serverCanvas.height = serverCanvas.offsetHeight;
          }
          serverCtx = serverCtx || serverCanvas.getContext('2d');
          if (serverCtx) {
            serverCtx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
            const result = wavStreamPlayer.analyser
              ? wavStreamPlayer.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              serverCanvas,
              serverCtx,
              result.values,
              '#009900',
              10,
              0,
              8
            );
          }
        }

        window.requestAnimationFrame(render);
      }
    };
    render();

    return () => {
      isLoaded = false;
    };
  }, [audioObjects]);
  // Adjust styles based on the `small` prop
  const canvasStyle = small
    ? { width: '100px', height: '50px', marginRight: '10px' }
    : { width: '100%', height: '100%' };

  return (
    <div>
      <canvas ref={clientCanvasRef} style={canvasStyle} />
      <canvas ref={serverCanvasRef} style={canvasStyle} />
    </div>
  );
}