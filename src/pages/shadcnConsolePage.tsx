import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from 'src/components/button/Button';
import { Label } from 'src/components/label/Label';
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
          </TabsList>

          <TabsContent value="conversation">
            {/* Conversation UI */}
            <div className="chat-container flex flex-col h-full">
              <div
                className="message-list flex-grow overflow-y-auto p-2"
                data-conversation-content
              >
                {conversation.items.map((conversationItem) => {
                  const isUser = conversationItem.role === 'user';
                  const messageType = conversationItem.type;
                  const avatarSrc = isUser
                    ? '/genghis.png'
                    : '/dreyfus.png';

                  return (
                    <div
                      key={conversationItem.id}
                      className={`message flex items-start mb-4 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isUser && (
                        <Avatar className="mr-2">
                          <AvatarImage src={avatarSrc} alt="Assistant" />
                          <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`message-content max-w-xs md:max-w-md lg:max-w-lg p-2 rounded-lg ${
                          messageType === 'function_call' ? 'bg-green-300 text-black' :
                          messageType === 'function_call_output' ? 'bg-orange-300 text-black' :
                          isUser ? 'bg-blue-400 text-white' : 'bg-pink-300 text-black'
                        }`}
                      >
                        {conversationItem.formatted.text ||
                          conversationItem.formatted.transcript ||
                          (conversationItem.formatted.output && conversationItem.formatted.output) ||
                          (conversationItem.formatted.tool && conversationItem.formatted.tool.name + ': ' + conversationItem.formatted.tool.arguments) ||
                          '(No content)'}
                      </div>
                      {isUser && (
                        <Avatar className="ml-2">
                          <AvatarImage src={avatarSrc} alt="User" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="message-input-container flex items-center mt-4">
                <Input
                  placeholder="Type your message here..."
                  value={textInput.value}
                  onChange={(e) => textInput.setValue(e.target.value)}
                  disabled={!connection.isConnected}
                  className="flex-grow mr-2"
                />
                <Button
                  onClick={() => {
                    const message = textInput.value;
                    textInput.setValue('');
                    // Create a synthetic event
                    const syntheticEvent = {
                      preventDefault: () => {},
                      target: { value: message },
                    } as unknown as React.FormEvent<HTMLFormElement>;
                    textInput.handleSubmit(syntheticEvent);
                  }}
                  disabled={!connection.isConnected}
                >
                  Send
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events">
            {/* Events Visualization */}
            <div className="visualization flex mt-4">
              <div className="visualization-entry client flex-1">
                <canvas ref={clientCanvasRef} />
              </div>
              <div className="visualization-entry server flex-1">
                <canvas ref={serverCanvasRef} />
              </div>
            </div>

            {/* Events List */}
            <div
              className="events-list overflow-y-auto mt-4"
              ref={eventsScrollRef}
              style={{ maxHeight: '400px' }}
            >
              {!conversation.realtimeEvents.length && `Awaiting connection...`}
              {conversation.realtimeEvents.map((realtimeEvent, i) => {
                const count = realtimeEvent.count;
                const event = { ...realtimeEvent.event };
                if (event.type === 'input_audio_buffer.append') {
                  event.audio = `[trimmed: ${event.audio.length} bytes]`;
                } else if (event.type === 'response.audio.delta') {
                  event.delta = `[trimmed: ${event.delta.length} bytes]`;
                }
                return (
                  <div className="event border-b py-2" key={event.event_id}>
                    <div className="event-timestamp text-gray-500 text-sm">
                      {utils.formatTime(realtimeEvent.time)}
                    </div>
                    <div className="event-details">
                      <div
                        className="event-summary flex items-center cursor-pointer"
                        onClick={() => {
                          // Toggle event details
                          const id = event.event_id;
                          setExpandedEvents((prev) => ({
                            ...prev,
                            [id]: !prev[id],
                          }));
                        }}
                      >
                        <div
                          className={`event-source flex items-center mr-2 ${
                            event.type === 'error'
                              ? 'text-red-500'
                              : realtimeEvent.source === 'client'
                              ? 'text-blue-500'
                              : 'text-green-500'
                          }`}
                        >
                          {realtimeEvent.source === 'client' ? (
                            <ArrowUp />
                          ) : (
                            <ArrowDown />
                          )}
                          <span className="ml-1">
                            {event.type === 'error'
                              ? 'error!'
                              : realtimeEvent.source}
                          </span>
                        </div>
                        <div className="event-type font-medium">
                          {event.type}
                          {count && ` (${count})`}
                        </div>
                      </div>
                      {!!expandedEvents[event.event_id] && (
                        <div className="event-payload mt-2 text-sm text-gray-700">
                          <pre>{JSON.stringify(event, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions Section */}
        <div className="content-actions flex items-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="conversation-mode"
              checked={output.mode === 'conversation'}
              onCheckedChange={(checked) =>
                output.setMode(checked ? 'conversation' : 'text')
              }
              className="w-32 h-8"
              labelOn="conversation"
              labelOff="text"
              >
              {/* <span className="ml-2">Mode</span> */}
            </Switch>
            {/* <Label htmlFor="conversation-mode">
              {output.mode === 'conversation'
                ? 'Conversation Mode'
                : 'Text Mode'}
            </Label> */}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="push-to-talk"
              checked={audio.canPushToTalk}
              onCheckedChange={(checked) =>
                audio.changeTurnEndType(checked ? 'none' : 'server_vad')
              }
              className="w-32 h-8"
              labelOn="manual"
              labelOff="VAD"
            />
              {/* <Label htmlFor="push-to-talk">
                {audio.canPushToTalk ? 'Manual' : 'Voice Activity Detection'}
              </Label> */}
          </div>

          <Button
            onMouseDown={audio.startRecording}
            onMouseUp={audio.stopRecording}
            disabled={!connection.isConnected || !audio.canPushToTalk}
          >
            {audio.isRecording ? 'Release to Send' : 'Push to Talk'}
          </Button>

          <Button
            onClick={
              connection.isConnected
                ? connection.disconnect
                : connection.connect
            }
          >
            {connection.isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      </div>

      {/* Memory Key-Value Section */}
      <div className="content-right p-4">
        <div className="content-block kv bg-white shadow rounded-md p-4">
          <div className="content-block-title text-lg font-semibold mb-2">
            set_memory()
          </div>
          <div className="content-block-body content-kv">
            <pre>{JSON.stringify(conversation.memoryKv, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
