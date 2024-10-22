import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from 'src/components/button/Button';
import { ConversationTab } from 'src/components/prop/ConversationTab';
import { EventTab } from 'src/components/prop/EventTab';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from 'src/components/tabs/Tabs';
import { ConsoleHeader } from 'src/components/prop/ConsoleHeader';
import { ChartTab } from 'src/components/prop/ChartTab';

import { barChartData, scatterPlotChartData } from 'src/components/chart/renderChart';
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
      <ConsoleHeader resetAPIKey={resetAPIKey} apiKey={apiKey} audioObjects={audioObjects} />
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
            {/* Conversation UI Tab */}
            <ConversationTab
              conversation={conversation}
              textInput={textInput}
              connection={connection}
              output={output}
              audio={audio}
            />
          </TabsContent>

          <TabsContent value="events">
            {/* Events Visualization Tab */}
            <EventTab
              events={conversation}
              utils={utils}
            />
          </TabsContent>
          <TabsContent value="chart">
            {/* Chart UI Tab */}
            <ChartTab data={barChartData} />
            <ChartTab data={scatterPlotChartData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
