'use client';

import { useParams } from 'next/navigation';
import { useDam, useDamCapacity, useDamCapacityHistory } from '@/lib/hooks/use-dams';
import { useDamCapacityUpdates } from '@/lib/hooks/use-websocket';
import { Loading } from '@/components/common/loading';
import { ErrorMessage } from '@/components/common/error-message';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChartComponent } from '@/components/charts/line-chart';
import { formatDate, getStatusBadgeColor, formatNumber, calculatePercentage } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { useState } from 'react';

export default function DamDetailPage() {
  const params = useParams();
  const damId = params.id as string;
  const [days, setDays] = useState(7);

  // Enable real-time updates
  useDamCapacityUpdates(damId);

  const { data: dam, isLoading: damLoading } = useDam(damId);
  const { data: capacity, isLoading: capacityLoading } = useDamCapacity(damId);

  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');

  const { data: capacityHistory, isLoading: historyLoading } =
    useDamCapacityHistory(damId, startDate, endDate, 100);

  if (damLoading || capacityLoading) {
    return <Loading fullScreen text="Loading dam data..." />;
  }

  if (!dam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage error="Dam not found" />
      </div>
    );
  }

  const location = dam.location as { lat: number; lng: number };
  const capacityData = capacity as any;

  // Prepare chart data
  const chartData =
    capacityHistory?.map((cap: any) => ({
      date: formatDate(cap.timestamp, 'MMM dd'),
      storage: Number(cap.storage),
      percentage: Number(cap.percentage),
    })) || [];

  const currentPercentage = capacityData?.percentage || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {dam.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {dam.region || 'Unknown Region'} • {dam.type || 'Reservoir'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Capacity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Storage</CardTitle>
          </CardHeader>
          <CardContent>
            {capacityData?.storage !== null && capacityData?.storage !== undefined ? (
              <>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatNumber(capacityData.storage, 2)} MCM
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Capacity:
                    </span>
                    <span className="font-medium">
                      {formatNumber(capacityData.capacity, 2)} MCM
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full transition-all"
                      style={{ width: `${currentPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0%</span>
                    <span className="font-medium">{currentPercentage.toFixed(1)}%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                      capacityData.status || 'normal',
                    )}`}
                  >
                    {capacityData.status || 'normal'}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No capacity data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Inflow/Outflow Card */}
        <Card>
          <CardHeader>
            <CardTitle>Flow Rates</CardTitle>
          </CardHeader>
          <CardContent>
            {capacityData?.inflowRate !== null &&
            capacityData?.inflowRate !== undefined ? (
              <>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">
                        Inflow:
                      </span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {formatNumber(capacityData.inflowRate, 2)} m³/s
                      </span>
                    </div>
                  </div>
                  {capacityData.outflowRate !== null &&
                    capacityData.outflowRate !== undefined && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">
                            Outflow:
                          </span>
                          <span className="font-medium text-orange-600 dark:text-orange-400">
                            {formatNumber(capacityData.outflowRate, 2)} m³/s
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No flow data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Power Generation Card */}
        <Card>
          <CardHeader>
            <CardTitle>Power Generation</CardTitle>
          </CardHeader>
          <CardContent>
            {capacityData?.powerGeneration !== null &&
            capacityData?.powerGeneration !== undefined ? (
              <>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatNumber(capacityData.powerGeneration, 2)} MW
                </div>
                {dam.powerCapacity && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Capacity: {formatNumber(dam.powerCapacity, 2)} MW
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No power generation data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historical Chart */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Capacity History</CardTitle>
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
              dataKey="percentage"
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

      {/* Dam Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dam Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dam.type && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="font-medium">{dam.type}</span>
              </div>
            )}
            {dam.region && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Region:
                </span>
                <span className="font-medium">{dam.region}</span>
              </div>
            )}
            {dam.state && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">State:</span>
                <span className="font-medium">{dam.state}</span>
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
            {dam.height && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Height:</span>
                <span className="font-medium">
                  {formatNumber(dam.height, 2)} m
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capacity Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Total Capacity:
              </span>
              <span className="font-medium">
                {formatNumber(dam.totalCapacity, 2)} MCM
              </span>
            </div>
            {capacityData?.storage && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Current Storage:
                </span>
                <span className="font-medium">
                  {formatNumber(capacityData.storage, 2)} MCM
                </span>
              </div>
            )}
            {dam.powerCapacity && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Power Capacity:
                </span>
                <span className="font-medium">
                  {formatNumber(dam.powerCapacity, 2)} MW
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

