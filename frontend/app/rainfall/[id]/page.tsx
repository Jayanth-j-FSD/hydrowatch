'use client';

import { useParams } from 'next/navigation';
import {
  useRainfallStation,
  useRainfallForecast,
  useRainfallHistory,
  useRainfallSeasonal,
} from '@/lib/hooks/use-rainfall';
import { Loading } from '@/components/common/loading';
import { ErrorMessage } from '@/components/common/error-message';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChartComponent } from '@/components/charts/line-chart';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { formatDate, formatNumber } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { useState } from 'react';

export default function RainfallStationDetailPage() {
  const params = useParams();
  const stationId = params.id as string;
  const [days, setDays] = useState(7);
  const [selectedYear, setSelectedYear] = useState<number | undefined>();

  const { data: station, isLoading: stationLoading } = useRainfallStation(stationId);
  const { data: forecastData, isLoading: forecastLoading } = useRainfallForecast(
    stationId,
    days,
  );

  const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');

  const { data: historyData, isLoading: historyLoading } = useRainfallHistory(
    stationId,
    startDate,
    endDate,
    100,
  );

  const { data: seasonalData, isLoading: seasonalLoading } = useRainfallSeasonal(
    stationId,
    selectedYear,
  );

  if (stationLoading || forecastLoading) {
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
  const forecast = forecastData?.forecast || [];

  // Prepare forecast chart data
  const forecastChartData = forecast.map((f) => ({
    date: formatDate(f.date, 'MMM dd'),
    rainfall: Number(f.predictedRainfall),
    confidence: Number(f.confidence),
    intensity: f.intensity,
  }));

  // Prepare historical chart data
  const historyChartData =
    historyData?.map((h) => ({
      date: formatDate(h.date, 'MMM dd'),
      rainfall: Number(h.rainfall),
      season: h.season,
    })) || [];

  // Prepare seasonal chart data
  const seasonalChartData = seasonalData?.seasonal
    ? Object.entries(seasonalData.seasonal).map(([season, data]: [string, any]) => ({
        season: season.charAt(0).toUpperCase() + season.slice(1),
        total: Number(data.total || 0),
        days: Number(data.days || 0),
        average: data.days > 0 ? Number(data.total) / Number(data.days) : 0,
      }))
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {station.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {station.region || 'Unknown Region'} • Rainfall Station
        </p>
      </div>

      {/* Forecast Chart */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>7-Day Forecast</CardTitle>
            <div className="flex gap-2">
              {[7, 14].map((d) => (
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
          {forecastLoading ? (
            <Loading text="Loading forecast..." />
          ) : forecastChartData.length > 0 ? (
            <BarChartComponent
              data={forecastChartData}
              dataKey="rainfall"
              xAxisKey="date"
              fillColor="#10b981"
              title=""
            />
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No forecast data available
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Historical Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Historical Rainfall (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <Loading text="Loading historical data..." />
            ) : historyChartData.length > 0 ? (
              <LineChartComponent
                data={historyChartData}
                dataKey="rainfall"
                xAxisKey="date"
                strokeColor="#3b82f6"
                title=""
              />
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No historical data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Seasonal Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Seasonal Analysis</CardTitle>
              <select
                value={selectedYear || new Date().getFullYear()}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
              >
                {[2024, 2023, 2022].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {seasonalLoading ? (
              <Loading text="Loading seasonal data..." />
            ) : seasonalChartData.length > 0 ? (
              <BarChartComponent
                data={seasonalChartData}
                dataKey="average"
                xAxisKey="season"
                fillColor="#8b5cf6"
                title=""
              />
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No seasonal data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Forecast Details */}
      {forecast.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Forecast Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {forecast.slice(0, 7).map((f, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {formatDate(f.date, 'MMM dd')}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {formatNumber(f.predictedRainfall, 1)} mm
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {f.intensity} • {f.confidence}% confidence
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Station Information */}
      <Card>
        <CardHeader>
          <CardTitle>Station Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {station.region && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Region:</span>
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
              <span className="text-gray-600 dark:text-gray-400">Coordinates:</span>
              <span className="font-medium text-sm">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>
          )}
          {station.elevation && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Elevation:</span>
              <span className="font-medium">{station.elevation} m</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

