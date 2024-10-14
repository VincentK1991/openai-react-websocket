import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index';
import { instructions } from '../utils/conversation_config';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client';
import {
  extractTextToNeo4j,
  ExtractorToNeo4jToolDefinition,
} from '../Tools/extractorToNeo4j';
import {
  getTextFromRelatedKeyConcept,
  TextFromRelatedKeyConceptsToolDefinition,
} from '../Tools/textFromRelatedKeyConcept';
import {
  getTextFromEmbedding,
  TextFromEmbeddingToolDefinition,
} from '../Tools/textFromEmbedding';
import {
  getAdditionalTextFromChunks,
  AdditionalTextFromKeyConceptToolDefinition,
} from '../Tools/additionalTextFromChunks';

const LOCAL_RELAY_SERVER_URL: string =
  process.env.REACT_APP_LOCAL_RELAY_SERVER_URL || '';

interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
}

export function useRealtimeClient() {
  // ... (keep state variables and refs)
  const [isConnected, setIsConnected] = useState(false);
  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const [outputMode, setOutputMode] = useState<'conversation' | 'text'>('text');
  const startTimeRef = useRef<string>(new Date().toISOString());
  const [items, setItems] = useState<ItemType[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<{
    [key: string]: boolean;
  }>({});
  const [canPushToTalk, setCanPushToTalk] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [memoryKv, setMemoryKv] = useState<{ [key: string]: any }>({});
  const [inputText, setInputText] = useState('');
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const apiKey = LOCAL_RELAY_SERVER_URL
    ? ''
    : localStorage.getItem('tmp::voice_api_key') ||
      prompt('OpenAI API Key') ||
      '';
  if (apiKey !== '') {
    localStorage.setItem('tmp::voice_api_key', apiKey);
  }
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient(
      LOCAL_RELAY_SERVER_URL
        ? { url: LOCAL_RELAY_SERVER_URL }
        : {
            apiKey: apiKey,
          }
    )
  );
  const connection = {
    isConnected,
    connect: useCallback(async () => {
      const client = clientRef.current;
      const wavRecorder = wavRecorderRef.current;
      const wavStreamPlayer = wavStreamPlayerRef.current;

      // Set modalities before connecting
      const modalities = outputMode === 'text' ? ['text'] : ['text', 'audio'];
      await client.updateSession({ modalities });
      // Set other session parameters before connecting
      await client.updateSession({ instructions: instructions });
      await client.updateSession({
        input_audio_transcription: { model: 'whisper-1' },
      });
      // Set state variables
      startTimeRef.current = new Date().toISOString();
      setIsConnected(true);
      setRealtimeEvents([]);
      setItems(client.conversation.getItems());

      // Connect to microphone
      await wavRecorder.begin();

      // Connect to audio output
      await wavStreamPlayer.connect();

      // Connect to realtime API
      await client.connect();
      client.sendUserMessageContent([
        {
          type: `input_text`,
          text: `Hello!`,
        },
      ]);

      if (client.getTurnDetectionType() === 'server_vad') {
        await wavRecorder.record((data) => client.appendInputAudio(data.mono));
      }
    }, [outputMode]),
    disconnect: useCallback(async () => {
      setIsConnected(false);
      setRealtimeEvents([]);
      setItems([]);
      setMemoryKv({});

      const client = clientRef.current;
      client.disconnect();

      const wavRecorder = wavRecorderRef.current;
      await wavRecorder.end();

      const wavStreamPlayer = wavStreamPlayerRef.current;
      await wavStreamPlayer.interrupt();
    }, []),
  };

  const conversation = {
    items,
    realtimeEvents,
    memoryKv,
    deleteItem: useCallback(async (id: string) => {
      const client = clientRef.current;
      client.deleteItem(id);
    }, []),
  };

  const audio = {
    canPushToTalk,
    isRecording,
    startRecording: useCallback(async () => {
      setIsRecording(true);
      const client = clientRef.current;
      const wavRecorder = wavRecorderRef.current;
      const wavStreamPlayer = wavStreamPlayerRef.current;
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }, []),
    stopRecording: useCallback(async () => {
      setIsRecording(false);
      const client = clientRef.current;
      const wavRecorder = wavRecorderRef.current;
      await wavRecorder.pause();
      client.createResponse();
    }, []),
    changeTurnEndType: useCallback(async (value: string) => {
      const client = clientRef.current;
      const wavRecorder = wavRecorderRef.current;
      if (value === 'none' && wavRecorder.getStatus() === 'recording') {
        await wavRecorder.pause();
      }
      client.updateSession({
        turn_detection: value === 'none' ? null : { type: 'server_vad' },
      });
      if (value === 'server_vad' && client.isConnected()) {
        await wavRecorder.record((data) => client.appendInputAudio(data.mono));
      }
      setCanPushToTalk(value === 'none');
    }, []),
  };

  const textInput = {
    value: inputText,
    setValue: setInputText,
    handleSubmit: useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const client = clientRef.current;
        if (inputText.trim() !== '') {
          // Send the text input to the conversation
          client.sendUserMessageContent([
            {
              type: 'input_text',
              text: inputText.trim(),
            },
          ]);
          setInputText('');
        }
      },
      [inputText]
    ),
  };

  const output = {
    mode: outputMode,
    setMode: useCallback(
      async (value: 'text' | 'conversation') => {
        if (isConnected) {
          await connection.disconnect();
          setOutputMode(value);
          await connection.connect();
        } else {
          setOutputMode(value);
        }
      },
      [isConnected]
    ),
  };

  const utils = {
    formatTime: useCallback((timestamp: string) => {
      const startTime = startTimeRef.current;
      const t0 = new Date(startTime).valueOf();
      const t1 = new Date(timestamp).valueOf();
      const delta = t1 - t0;
      const hs = Math.floor(delta / 10) % 100;
      const s = Math.floor(delta / 1000) % 60;
      const m = Math.floor(delta / 60_000) % 60;
      const pad = (n: number) => {
        let s = n + '';
        while (s.length < 2) {
          s = '0' + s;
        }
        return s;
      };
      return `${pad(m)}:${pad(s)}.${pad(hs)}`;
    }, []),
  };

  const audioObjects = {
    wavRecorder: wavRecorderRef.current,
    wavStreamPlayer: wavStreamPlayerRef.current,
  };

  useEffect(() => {
    const client = clientRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    // Set instructions
    client.updateSession({ instructions: instructions });
    // Set transcription, otherwise we don't get user transcriptions back
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

    // Add tools
    client.addTool(
      {
        name: 'set_memory',
        description: 'Saves important data about the user into memory.',
        parameters: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description:
                'The key of the memory value. Always use lowercase and underscores, no other characters.',
            },
            value: {
              type: 'string',
              description: 'Value can be anything represented as a string',
            },
          },
          required: ['key', 'value'],
        },
      },
      async ({ key, value }: { [key: string]: any }) => {
        setMemoryKv((memoryKv) => {
          const newKv = { ...memoryKv };
          newKv[key] = value;
          return newKv;
        });
        return { ok: true };
      }
    );
    client.addTool(
      ExtractorToNeo4jToolDefinition,
      async ({ arxivUrl }: { [key: string]: any }) => {
        const text = await extractTextToNeo4j(arxivUrl);
        return { ok: true, text };
      }
    );
    client.addTool(
      TextFromRelatedKeyConceptsToolDefinition,
      async ({ keyConcept }: { [key: string]: any }) => {
        const text = await getTextFromRelatedKeyConcept(keyConcept);
        return { ok: true, text };
      }
    );
    client.addTool(
      TextFromEmbeddingToolDefinition,
      async ({ query }: { [key: string]: any }) => {
        const text = await getTextFromEmbedding(query);
        return { ok: true, text };
      }
    );
    client.addTool(
      AdditionalTextFromKeyConceptToolDefinition,
      async ({ keyConcept }: { [key: string]: any }) => {
        const text = await getAdditionalTextFromChunks(keyConcept);
        return { ok: true, text };
      }
    );
    // Handle realtime events from client + server for event logging
    client.on('realtime.event', (realtimeEvent: RealtimeEvent) => {
      setRealtimeEvents((realtimeEvents) => {
        const lastEvent = realtimeEvents[realtimeEvents.length - 1];
        if (lastEvent?.event.type === realtimeEvent.event.type) {
          // If we receive multiple events in a row, aggregate them for display purposes
          lastEvent.count = (lastEvent.count || 0) + 1;
          return realtimeEvents.slice(0, -1).concat(lastEvent);
        } else {
          return realtimeEvents.concat(realtimeEvent);
        }
      });
    });
    client.on('error', (event: any) => console.error(event));
    client.on('conversation.interrupted', async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
    });
    client.on('conversation.updated', async ({ item, delta }: any) => {
      const items = client.conversation.getItems();
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      if (item.status === 'completed' && item.formatted.audio?.length) {
        const wavFile = await WavRecorder.decode(
          item.formatted.audio,
          24000,
          24000
        );
        item.formatted.file = wavFile;
      }
      if (delta?.function_output) {
        const functionOutputItem: any = {
          id: `function-output-${item.id}`,
          type: 'function_output',
          role: 'assistant',
          formatted: {
            text: delta.function_output.text,
            function: {
              name: delta.function_output.name,
              output: delta.function_output.arguments,
            },
          },
        };
        items.push(functionOutputItem);
      }
      setItems(items);
    });

    setItems(client.conversation.getItems());
    return () => {
      client.reset();
    };
  }, []);

  return {
    connection,
    conversation,
    audio,
    textInput,
    output,
    utils,
    audioObjects,
  };
}
