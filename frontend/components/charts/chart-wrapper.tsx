'use client';

import { lazy, Suspense, ComponentType } from 'react';
import { LoadingSpinner } from '../common/loading';

// Lazy load chart components for better performance
const LineChartComponent = lazy(() =>
  import('./line-chart').then((mod) => ({ default: mod.LineChartComponent })),
);

const BarChartComponent = lazy(() =>
  import('./bar-chart').then((mod) => ({ default: mod.BarChartComponent })),
);

interface ChartWrapperProps {
  type: 'line' | 'bar';
  [key: string]: any;
}

export function ChartWrapper({ type, ...props }: ChartWrapperProps) {
  const ChartComponent: ComponentType<any> =
    type === 'line' ? LineChartComponent : BarChartComponent;

  return (
    <Suspense fallback={<LoadingSpinner size="md" />}>
      <ChartComponent {...props} />
    </Suspense>
  );
}

