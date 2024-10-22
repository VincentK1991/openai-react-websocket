import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'src/components/button/Button';
import { Input } from 'src/components/input/Input';
import { Switch } from 'src/components/switch/Switch';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from 'src/components/avatar/Avatar';

interface ConversationTabProps {
  conversation: {
    items: ItemType[];
    realtimeEvents: any[]; // You might want to define a more specific type for realtimeEvents
  };
  textInput: {
    value: string;
    setValue: (value: string) => void;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  };
  connection: {
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
  };
  output: {
    mode: 'conversation' | 'text';
    setMode: (mode: 'conversation' | 'text') => void;
  };
  audio: {
    canPushToTalk: boolean;
    changeTurnEndType: (type: 'none' | 'server_vad') => void;
    isRecording: boolean;
    startRecording: () => void;
    stopRecording: () => void;
  };
}

export function ConversationTab({
  conversation,
  textInput,
  connection,
  output,
  audio,
}: ConversationTabProps) {
  
  const conversationRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new conversation items are added
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop =
        conversationRef.current.scrollHeight;
    }
  }, [conversation.items]);

  return (
    <div className="chat-container flex flex-col h-full">
      <div
        className="message-list flex-grow overflow-y-auto p-2 mb-4"
        data-conversation-content
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {conversation.items.map((conversationItem: ItemType) => {
          const isUser = conversationItem.role === 'user';
          const messageType = conversationItem.type;
          const avatarSrc = isUser ? '/genghis.png' : '/dreyfus.png';
          const formatted = conversationItem.formatted || {};

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
                  messageType === 'function_call'
                    ? 'bg-green-300 text-black'
                    : messageType === 'function_call_output'
                    ? 'bg-orange-200 text-black'
                    : isUser
                    ? 'bg-blue-400 text-white'
                    : 'bg-pink-200 text-black'
                }`}
              > 
                {messageType === 'function_call_output' ? (
                  <FunctionCallOutput content={formatted.output || '(No content)'} />
                ) : (
                  formatted.text ||
                  formatted.transcript ||
                  formatted.output ||
                  (formatted.tool && `${formatted.tool.name}: ${formatted.tool.arguments}`) ||
                  '(No content)'
                )}
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
      <div className="message-input-container flex items-center">
        <Input
          placeholder="Type your message here..."
          value={textInput.value}
          onChange={(e) => textInput.setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const message = textInput.value;
              textInput.setValue('');
              const syntheticEvent = {
                preventDefault: () => {},
                target: { value: message },
              } as unknown as React.FormEvent<HTMLFormElement>;
              textInput.handleSubmit(syntheticEvent);
            }
          }}
          disabled={!connection.isConnected}
          className="flex-grow mr-2"
        />
        <Button
          onClick={() => {
            const message = textInput.value;
            textInput.setValue('');
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
          />
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
            connection.isConnected ? connection.disconnect : connection.connect
          }
        >
          {connection.isConnected ? 'Disconnect' : 'Connect'}
        </Button>
      </div>
    </div>
  );
}

function FunctionCallOutput({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Try to parse the content as JSON
  let parsedContent: any;
  let isJson = false;
  try {
    parsedContent = JSON.parse(content);
    isJson = true;
  } catch {
    // If parsing fails, it's not JSON
    parsedContent = content;
  }

  if (!isJson) {
    return <pre className="whitespace-pre-wrap">{content}</pre>;
  }

  // Function to recursively process the JSON object
  const processJsonObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.length > 100) {
        result[key] = isExpanded ? value : value.slice(0, 100) + '...';
      } else if (typeof value === 'object' && value !== null) {
        result[key] = processJsonObject(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  const processedContent = processJsonObject(parsedContent.text.results);
  const stringContent = JSON.stringify(processedContent, null, 2);

  return (
    <div>
      <pre className="whitespace-pre-wrap">
        <code>{stringContent}</code>
      </pre>
      {JSON.stringify(parsedContent).length > 500 && (
        <button
          className="text-blue-200 hover:text-blue-400 mt-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}
