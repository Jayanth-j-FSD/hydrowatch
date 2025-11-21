'use client';

import { useState } from 'react';
import { useRainfallStations, useRainfallRiskIndicators } from '@/lib/hooks/use-rainfall';
import { Loading } from '@/components/common/loading';
import { ErrorMessage } from '@/components/common/error-message';
import { EmptyState } from '@/components/common/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RainfallStation } from '@/lib/types';

export default function RainfallForecastPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const { data: stations, isLoading, error, refetch } = useRainfallStations();
  const { data: riskIndicators } = useRainfallRiskIndicators(
    selectedRegion || undefined,
  );

  if (isLoading) {
    return <Loading fullScreen text="Loading rainfall stations..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage error={error as Error} retry={refetch} />
      </div>
    );
  }

  if (!stations || stations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="No rainfall stations found"
          description="There are no rainfall monitoring stations available at this time."
        />
      </div>
    );
  }

  const regions = Array.from(
    new Set(stations.map((s) => s.region).filter(Boolean)),
  ) as string[];

  const filteredStations = selectedRegion
    ? stations.filter((s) => s.region === selectedRegion)
    : stations;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Rainfall Forecast
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          7-day forecasts, historical patterns, and risk indicators
        </p>
      </div>

      {/* Risk Indicators */}
      {riskIndicators && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Rainfall (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {riskIndicators.averageRainfall?.toFixed(2) || '0'} mm
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Drought Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-3xl font-bold ${
                  riskIndicators.droughtRisk === 'high'
                    ? 'text-red-600 dark:text-red-400'
                    : riskIndicators.droughtRisk === 'medium'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-green-600 dark:text-green-400'
                }`}
              >
                {riskIndicators.droughtRisk || 'low'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Flood Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-3xl font-bold ${
                  riskIndicators.floodRisk === 'high'
                    ? 'text-red-600 dark:text-red-400'
                    : riskIndicators.floodRisk === 'medium'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-green-600 dark:text-green-400'
                }`}
              >
                {riskIndicators.floodRisk || 'low'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Stations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stations.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Stations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stations.filter((s) => s.isActive).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {regions.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {regions.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Region
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStations.map((station) => (
          <StationCard key={station.id} station={station} />
        ))}
      </div>
    </div>
  );
}

function StationCard({ station }: { station: RainfallStation }) {
  const location = station.location as { lat: number; lng: number };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{station.name}</CardTitle>
            {station.region && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {station.region}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {station.elevation && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Elevation:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {station.elevation} m
              </span>
            </div>
          )}

          {location && (
            <div className="text-xs text-gray-500 dark:text-gray-500">
              📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}

          <Link href={`/rainfall/${station.id}`}>
            <Button variant="primary" className="w-full mt-4">
              View Forecast
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

