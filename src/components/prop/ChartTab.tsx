import React from 'react';
import {
  renderChart,
} from 'src/components/chart/renderChart';
import { ChartData } from 'src/components/chart/renderChart';

interface ChartTabProps {
  data: ChartData<any>;
};

export function ChartTab({ data }: ChartTabProps) {
  return (
    <div>
      {renderChart(data)}
    </div>
  );
}
