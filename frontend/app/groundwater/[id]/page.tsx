'use client';

import { useParams } from 'next/navigation';
import {
  useGroundwaterWell,
  useGroundwaterCurrentDepth,
  useGroundwaterDepthHistory,
  useGroundwaterQuality,
} from '@/lib/hooks/use-groundwater';
import { Loading } from '@/components/common/loading';
import { ErrorMessage } from '@/components/common/error-message';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChartComponent } from '@/components/charts/line-chart';
import { formatDate, formatNumber } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { useState } from 'react';

export default function GroundwaterWellDetailPage() {
  const params = useParams();
  const wellId = params.id as string;
  const [days, setDays] = useState(30);

  const { data: well, isLoading: wellLoading } = useGroundwaterWell(wellId);
  const { data: currentDepth, isLoading: depthLoading } =
    useGroundwaterCurrentDepth(wellId);
  const { data: quality } = useGroundwaterQuality(wellId);

  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');

  const { data: depthHistory, isLoading: historyLoading } =
    useGroundwaterDepthHistory(wellId, startDate, endDate, 100);

  if (wellLoading || depthLoading) {
    return <Loading fullScreen text="Loading well data..." />;
  }

  if (!well) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage error="Well not found" />
      </div>
    );
  }

  const location = well.location as { lat: number; lng: number };
  const depthData = currentDepth as any;

  // Prepare chart data
  const chartData =
    depthHistory?.map((depth: any) => ({
      date: formatDate(depth.timestamp, 'MMM dd'),
      depth: Number(depth.depth),
      season: depth.season,
    })) || [];

  const qualityData = quality as any;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {well.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {well.region || 'Unknown Region'} • {well.aquiferType || 'Groundwater Well'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Depth Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Depth</CardTitle>
          </CardHeader>
          <CardContent>
            {depthData?.depth !== null && depthData?.depth !== undefined ? (
              <>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatNumber(depthData.depth, 2)} m
                </div>
                {depthData.season && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Season: {depthData.season}
                  </div>
                )}
                {depthData.timestamp && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Updated: {formatDate(depthData.timestamp)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No depth data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quality Card */}
        <Card>
          <CardHeader>
            <CardTitle>Water Quality</CardTitle>
          </CardHeader>
          <CardContent>
            {qualityData?.quality ? (
              <div className="space-y-2">
                {qualityData.quality.tds && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">TDS:</span>
                    <span className="font-medium">
                      {formatNumber(qualityData.quality.tds, 2)} mg/L
                    </span>
                  </div>
                )}
                {qualityData.quality.ph && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">pH:</span>
                    <span className="font-medium">
                      {formatNumber(qualityData.quality.ph, 2)}
                    </span>
                  </div>
                )}
                {qualityData.quality.arsenic && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Arsenic:</span>
                    <span className="font-medium text-red-600">
                      {formatNumber(qualityData.quality.arsenic, 3)} mg/L
                    </span>
                  </div>
                )}
                {qualityData.quality.fluoride && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Fluoride:</span>
                    <span className="font-medium">
                      {formatNumber(qualityData.quality.fluoride, 3)} mg/L
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No quality data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Well Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Well Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {well.region && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Region:</span>
                <span className="font-medium">{well.region}</span>
              </div>
            )}
            {well.state && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">State:</span>
                <span className="font-medium">{well.state}</span>
              </div>
            )}
            {well.aquiferType && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Aquifer:</span>
                <span className="font-medium">{well.aquiferType}</span>
              </div>
            )}
            {location && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Coordinates:</span>
                <span className="font-medium text-xs">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historical Depth Chart */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Depth History</CardTitle>
            <div className="flex gap-2">
              {[30, 90, 180].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    days === d
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {d} days
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <Loading text="Loading historical data..." />
          ) : chartData.length > 0 ? (
            <LineChartComponent
              data={chartData}
              dataKey="depth"
              xAxisKey="date"
              strokeColor="#10b981"
              title=""
            />
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No historical data available for this period
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

