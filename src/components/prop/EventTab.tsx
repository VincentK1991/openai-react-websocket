import React, { useRef, useEffect, useState } from 'react';
import { AudioVisualizer } from './AudioVisualizer';
import { ArrowUp, ArrowDown } from 'react-feather';

interface EventTabProps {
  events: {
    realtimeEvents: any[];
  };
  utils: {
    formatTime: (time: string) => string;
  };
}

export function EventTab({ events, utils }: EventTabProps) {
  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const eventsScrollHeightRef = useRef(0);
  const [expandedEvents, setExpandedEvents] = useState<{
    [key: string]: boolean;
  }>({});

  // Auto-scroll to bottom when new events are added
  useEffect(() => {
    if (eventsScrollRef.current) {
      const eventsEl = eventsScrollRef.current;
      const scrollHeight = eventsEl.scrollHeight;
      if (scrollHeight !== eventsScrollHeightRef.current) {
        eventsEl.scrollTop = scrollHeight;
        eventsScrollHeightRef.current = scrollHeight;
      }
    }
  }, [events]);

  return (
    <div>
      {/* Events List */}
      <div
        className="events-list overflow-y-auto mt-4"
        ref={eventsScrollRef}
        style={{ maxHeight: '60%' }}
      >
        {!events.realtimeEvents.length && `Awaiting connection...`}
        {events.realtimeEvents.map((realtimeEvent) => {
          const count = realtimeEvent.count;
          const event = { ...realtimeEvent.event };
          if (event.type === 'input_audio_buffer.append' && event.audio) {
            event.audio = `[trimmed: ${event.audio.length} bytes]`;
          } else if (event.type === 'response.audio.delta' && event.delta) {
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
                      {event.type === 'error' ? 'error!' : realtimeEvent.source}
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
    </div>
  );
}
