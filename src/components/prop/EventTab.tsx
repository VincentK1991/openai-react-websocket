import React from 'react';
import { ArrowUp, ArrowDown } from 'react-feather';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client';


interface EventTabProps {
  events: {
    realtimeEvents: any[];
  };
  utils: {
    formatTime: (time: number) => string;
  };
  visualization: {
    clientCanvasRef: React.RefObject<HTMLCanvasElement>;
    serverCanvasRef: React.RefObject<HTMLCanvasElement>;
  };
  eventList: {
    eventsScrollRef: React.RefObject<HTMLDivElement>;
    expandedEvents: { [key: string]: boolean };
    setExpandedEvents: React.Dispatch<
      React.SetStateAction<{ [key: string]: boolean }>
    >;
  };
}

export function EventTab({
  events,
  utils,
  visualization,
  eventList,
}: EventTabProps) {
  return (
    <div>
      {/* Events Visualization */}
      <div className="visualization flex mt-4">
        <div className="visualization-entry client flex-1">
          <canvas ref={visualization.clientCanvasRef} />
        </div>
        <div className="visualization-entry server flex-1">
          <canvas ref={visualization.serverCanvasRef} />
        </div>
      </div>

      {/* Events List */}
      <div
        className="events-list overflow-y-auto mt-4"
        ref={eventList.eventsScrollRef}
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
                    eventList.setExpandedEvents((prev) => ({
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
                {!!eventList.expandedEvents[event.event_id] && (
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
