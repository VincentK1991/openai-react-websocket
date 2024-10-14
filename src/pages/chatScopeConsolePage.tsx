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
import {
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Avatar,
} from '@chatscope/chat-ui-kit-react';

import { ArrowUp, ArrowDown } from 'react-feather';
import { WavRenderer } from '../utils/wav_renderer';

import { useRealtimeClient } from 'src/hooks/useRealtimeClient';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

export function ChatScopeConsolePage() {
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
      <div className="content-top">
        <div className="content-title">
          <img src="/openai-logomark.svg" alt="Logo" width="24" height="24" />
          <span>Realtime Console</span>
        </div>
        <div className="content-api-key">
          {!process.env.REACT_APP_LOCAL_RELAY_SERVER_URL && (
            <Button onClick={resetAPIKey}>
              API Key: {apiKey.slice(0, 3)}...
            </Button>
          )}
        </div>
      </div>
      <div className="content-main">
        <Tabs defaultValue="conversation" className="space-y-2">
          <TabsList className="bg-gray-100 rounded-md p-2">
            <TabsTrigger value="conversation" 
            className="chat-tab">
              Conversation
            </TabsTrigger>
            <TabsTrigger value="events" 
            className="chat-tab">
              Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversation">
            {/* Conversation UI */}
            <ChatContainer>
              <MessageList>
                {conversation.items.map((conversationItem) => {
                  const isUser = conversationItem.role === 'user';
                  const messageType = conversationItem.type;
                  const avatarSrc = isUser
                    ? '/user-avatar.png'
                    : '/assistant-avatar.png';

                  // Color-code messages based on type
                  let backgroundColor = '#FFFFFF'; // Default color
                  if (messageType === 'function_call') {
                    backgroundColor = '#E0F7FA'; // Light cyan for function calls
                  } else if (messageType === 'function_call_output') {
                    backgroundColor = '#FFF3E0'; // Light orange for function outputs
                  } else if (isUser) {
                    backgroundColor = '#DCF8C6'; // Light green for user messages
                  }

                  return (
                    <Message
                      key={conversationItem.id}
                      model={{
                        message:
                          conversationItem.formatted.text ||
                          conversationItem.formatted.transcript ||
                          '(No content)',
                        //sentTime: utils.formatTime(new Date()),
                        sender: isUser ? 'User' : 'Assistant',
                        direction: isUser ? 'outgoing' : 'incoming',
                        position: 'normal',
                      }}
                      style={{ backgroundColor }}
                    >
                      <Avatar
                        src={avatarSrc}
                        name={isUser ? 'User' : 'Assistant'}
                      />
                    </Message>
                  );
                })}
              </MessageList>
              <MessageInput
                placeholder="Type your message here..."
                value={textInput.value}
                onChange={(val) => textInput.setValue(val)}
                onSend={(message) => {
                  textInput.setValue(message);
                  // Create a synthetic event
                  const syntheticEvent = {
                    preventDefault: () => {},
                    target: { value: message },
                  } as unknown as React.FormEvent<HTMLFormElement>;
                  textInput.handleSubmit(syntheticEvent);
                }}
                disabled={!connection.isConnected}
                attachButton={false}
              />
            </ChatContainer>
          </TabsContent>

          <TabsContent value="events">
            {/* Events Visualization */}
            <div className="visualization">
              <div className="visualization-entry client">
                <canvas ref={clientCanvasRef} />
              </div>
              <div className="visualization-entry server">
                <canvas ref={serverCanvasRef} />
              </div>
            </div>

            {/* Events List */}
            <div className="events-list" ref={eventsScrollRef}>
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
                  <div className="event" key={event.event_id}>
                    <div className="event-timestamp">
                      {utils.formatTime(realtimeEvent.time)}
                    </div>
                    <div className="event-details">
                      <div
                        className="event-summary"
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
                          className={`event-source ${
                            event.type === 'error'
                              ? 'error'
                              : realtimeEvent.source
                          }`}
                        >
                          {realtimeEvent.source === 'client' ? (
                            <ArrowUp />
                          ) : (
                            <ArrowDown />
                          )}
                          <span>
                            {event.type === 'error'
                              ? 'error!'
                              : realtimeEvent.source}
                          </span>
                        </div>
                        <div className="event-type">
                          {event.type}
                          {count && ` (${count})`}
                        </div>
                      </div>
                      {!!expandedEvents[event.event_id] && (
                        <div className="event-payload">
                          {JSON.stringify(event, null, 2)}
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
        <div className="content-actions">
          <Switch
            id="conversation-mode"
            checked={output.mode === 'conversation'}
            onCheckedChange={(checked) =>
              output.setMode(checked ? 'conversation' : 'text')
            }
            className="chat-switch w-160 h-80"
          >
            <span className="text-xs text-white">{output.mode === 'conversation' ? 'Conversation' : 'Text'}</span>
          </Switch>
          {/* <Label htmlFor="conversation-mode">Conversation Mode</Label> */}

          <Switch
            id="push-to-talk"
            checked={audio.canPushToTalk}
            onCheckedChange={(checked) =>
              audio.changeTurnEndType(checked ? 'none' : 'server_vad')
            }
            className="chat-switch w-16 h-8"
          >
            <span className="text-xs text-white">
              {audio.canPushToTalk ? 'Manual' : 'Voice Activity Detection'}
            </span>
          </Switch>
          {/* <Label htmlFor="push-to-talk">Push to Talk</Label> */}
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
      <div className="content-right">
        <div className="content-block kv">
          <div className="content-block-title">set_memory()</div>
          <div className="content-block-body content-kv">
            {JSON.stringify(conversation.memoryKv, null, 2)}
          </div>
        </div>
      </div>
    </div>
  );
}
