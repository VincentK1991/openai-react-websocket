import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from 'src/components/button/Button';
import { Label } from 'src/components/label/Label';
import { ConversationTab } from 'src/components/prop/ConversationTab';
import { EventTab } from 'src/components/prop/EventTab';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from 'src/components/tabs/Tabs';
import { Switch } from 'src/components/switch/Switch';
import { Input } from 'src/components/input/Input';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from 'src/components/avatar/Avatar';

import { ArrowUp, ArrowDown } from 'react-feather';
import { WavRenderer } from '../utils/wav_renderer';
import { renderChart, barChartData, scatterPlotChartData } from 'src/components/chart/renderChart';
import { useRealtimeClient } from 'src/hooks/useRealtimeClient';
import './shadcnConsolePage.css';
export function ShadcnConsolePage() {
  const {
    connection,
    conversation,
    audio,
    textInput,
    output,
    utils,
    audioObjects,
  } = useRealtimeClient();

  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);
  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const eventsScrollHeightRef = useRef(0);
  const [expandedEvents, setExpandedEvents] = useState<{
    [key: string]: boolean;
  }>({});

  // useEffect for canvas rendering
  useEffect(() => {
    let isLoaded = true;

    const wavRecorder = audioObjects.wavRecorder;
    const clientCanvas = clientCanvasRef.current;
    let clientCtx: CanvasRenderingContext2D | null = null;

    const wavStreamPlayer = audioObjects.wavStreamPlayer;
    const serverCanvas = serverCanvasRef.current;
    let serverCtx: CanvasRenderingContext2D | null = null;

    const render = () => {
      if (isLoaded) {
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

  // useEffect for auto-scrolling event logs
  useEffect(() => {
    if (eventsScrollRef.current) {
      const eventsEl = eventsScrollRef.current;
      const scrollHeight = eventsEl.scrollHeight;
      // Only scroll if height has just changed
      if (scrollHeight !== eventsScrollHeightRef.current) {
        eventsEl.scrollTop = scrollHeight;
        eventsScrollHeightRef.current = scrollHeight;
      }
    }
  }, [conversation.realtimeEvents]);

  // useEffect for auto-scrolling conversation logs
  useEffect(() => {
    const conversationEls = [].slice.call(
      document.body.querySelectorAll('[data-conversation-content]')
    );
    for (const el of conversationEls) {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
  }, [conversation.items]);

  const resetAPIKey = useCallback(() => {
    const apiKey = prompt('OpenAI API Key');
    if (apiKey !== null) {
      localStorage.clear();
      localStorage.setItem('tmp::voice_api_key', apiKey);
      window.location.reload();
    }
  }, []);
  const apiKey = localStorage.getItem('tmp::voice_api_key') || '';

  return (
    <div data-component="ConsolePage">
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
        </div>
      </div>
      <div className="content-main p-4">
        <Tabs defaultValue="conversation" className="space-y-2">
          <TabsList className="bg-gray-100 rounded-md p-2">
            <TabsTrigger value="conversation" className="chat-tab">
              Conversation
            </TabsTrigger>
            <TabsTrigger value="events" className="chat-tab">
              Events
            </TabsTrigger>
            <TabsTrigger value="chart" className="chat-tab">
              Chart
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversation">
            {/* Conversation UI */}
            <ConversationTab
              conversation={conversation}
              textInput={textInput}
              connection={connection}
              output={output}
              audio={audio}
            />
          </TabsContent>

          <TabsContent value="events">
            {/* Events Visualization */}
            <EventTab
              events={{
                realtimeEvents: conversation.realtimeEvents,
              }}
              utils={{
                formatTime: (time: number) => utils.formatTime(time.toString()),
              }}
              visualization={{
                clientCanvasRef: clientCanvasRef,
                serverCanvasRef: serverCanvasRef,
              }}
              eventList={{
                eventsScrollRef: eventsScrollRef,
                expandedEvents: expandedEvents,
                setExpandedEvents: setExpandedEvents,
              }}
            />
          </TabsContent>
          <TabsContent value="chart">
            {/* Chart UI */}
            {renderChart(barChartData)}
            {renderChart(scatterPlotChartData)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
