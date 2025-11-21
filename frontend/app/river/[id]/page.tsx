'use client';

import { useParams } from 'next/navigation';
import {
  useRiverStation,
  useRiverCurrentLevel,
  useRiverHistoricalLevels,
} from '@/lib/hooks/use-river-stations';
import { useRiverStationUpdates } from '@/lib/hooks/use-websocket';
import { Loading } from '@/components/common/loading';
import { ErrorMessage } from '@/components/common/error-message';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChartComponent } from '@/components/charts/line-chart';
import { formatDate, getStatusBadgeColor, formatNumber } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { useState } from 'react';

export default function RiverStationDetailPage() {
  const params = useParams();
  const stationId = params.id as string;
  const [days, setDays] = useState(7);

  // Enable real-time updates
  useRiverStationUpdates(stationId);

  const { data: station, isLoading: stationLoading } = useRiverStation(stationId);
  const { data: currentLevel, isLoading: levelLoading } =
    useRiverCurrentLevel(stationId);

  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');

  const { data: historicalLevels, isLoading: historyLoading } =
    useRiverHistoricalLevels(stationId, startDate, endDate, 100);

  if (stationLoading || levelLoading) {
    return <Loading fullScreen text="Loading station data..." />;
  }

  if (!station) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage error="Station not found" />
      </div>
    );
  }

  const location = station.location as { lat: number; lng: number };
  const levelData = currentLevel as any;

  // Prepare chart data
  const chartData =
    historicalLevels?.map((level: any) => ({
      date: formatDate(level.timestamp, 'MMM dd'),
      level: Number(level.level),
      status: level.status,
    })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {station.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {station.riverName} • {station.region || 'Unknown Region'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Level Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Water Level</CardTitle>
          </CardHeader>
          <CardContent>
            {levelData?.level !== null && levelData?.level !== undefined ? (
              <>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatNumber(levelData.level, 2)} m
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                      levelData.status || 'safe',
                    )}`}
                  >
                    {levelData.status || 'safe'}
                  </span>
                </div>
                {levelData.timestamp && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Updated: {formatDate(levelData.timestamp)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No level data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Danger Level Card */}
        <Card>
          <CardHeader>
            <CardTitle>Danger Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
              {formatNumber(station.dangerLevel, 2)} m
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Warning threshold
            </p>
          </CardContent>
        </Card>

        {/* Flood Level Card */}
        <Card>
          <CardHeader>
            <CardTitle>Flood Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
              {formatNumber(station.floodLevel, 2)} m
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Critical threshold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Historical Chart */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historical Water Levels</CardTitle>
            <div className="flex gap-2">
              {[7, 30, 90].map((d) => (
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
              dataKey="level"
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

      {/* Station Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Station Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">River:</span>
              <span className="font-medium">{station.riverName}</span>
            </div>
            {station.region && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Region:
                </span>
                <span className="font-medium">{station.region}</span>
              </div>
            )}
            {station.state && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">State:</span>
                <span className="font-medium">{station.state}</span>
              </div>
            )}
            {location && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Coordinates:
                </span>
                <span className="font-medium text-sm">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </span>
              </div>
            )}
            {station.elevation && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Elevation:
                </span>
                <span className="font-medium">
                  {formatNumber(station.elevation, 2)} m
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Danger Level:
              </span>
              <span className="font-medium text-yellow-600">
                {formatNumber(station.dangerLevel, 2)} m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Flood Level:
              </span>
              <span className="font-medium text-red-600">
                {formatNumber(station.floodLevel, 2)} m
              </span>
            </div>
            {levelData?.level && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Current vs Danger:
                  </span>
                  <span
                    className={`font-medium ${
                      levelData.level >= station.dangerLevel
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {formatNumber(
                      levelData.level - station.dangerLevel,
                      2,
                    )}{' '}
                    m
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

