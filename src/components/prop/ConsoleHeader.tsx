import React from 'react';
import { Button } from 'src/components/button/Button';
import { AudioVisualizer } from './AudioVisualizer';

interface ConsoleHeaderProps {
  resetAPIKey: () => void;
  apiKey: string;
  audioObjects: {
    wavRecorder: any;
    wavStreamPlayer: any;
  };
}

export function ConsoleHeader({ resetAPIKey, apiKey, audioObjects }: ConsoleHeaderProps) {
  return (
    <div className="content-top flex justify-between items-center p-4">
      <div className="content-title flex items-center">
        <img
          src="/openai-logomark.svg"
          alt="Logo"
          width="24"
          height="24"
          className="mr-2"
        />
        <span className="text-xl font-semibold">Realtime Console</span>
      </div>
      <div className="content-api-key">
        {!process.env.REACT_APP_LOCAL_RELAY_SERVER_URL && (
          <Button onClick={resetAPIKey}>
            API Key: {apiKey.slice(0, 3)}...
          </Button>
        )}
        <AudioVisualizer audioObjects={audioObjects} small />
      </div>
    </div>
  );
}
