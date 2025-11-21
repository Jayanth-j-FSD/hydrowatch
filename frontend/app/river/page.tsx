'use client';

import { useState } from 'react';
import { useRiverStations, useRiverAlerts } from '@/lib/hooks/use-river-stations';
import { Loading } from '@/components/common/loading';
import { ErrorMessage } from '@/components/common/error-message';
import { EmptyState } from '@/components/common/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, getStatusBadgeColor, formatNumber } from '@/lib/utils';
import Link from 'next/link';
import { RiverStation } from '@/lib/types';

export default function RiverTrackerPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const { data: stations, isLoading, error, refetch } = useRiverStations();
  const { data: alerts } = useRiverAlerts();

  if (isLoading) {
    return <Loading fullScreen text="Loading river stations..." />;
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
          title="No river stations found"
          description="There are no river monitoring stations available at this time."
        />
      </div>
    );
  }

  // Get unique regions for filter
  const regions = Array.from(
    new Set(stations.map((s) => s.region).filter(Boolean)),
  ) as string[];

  // Filter stations by region
  const filteredStations = selectedRegion
    ? stations.filter((s) => s.region === selectedRegion)
    : stations;

  // Get active alerts count
  const activeAlertsCount = alerts?.length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          River Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor real-time river water levels and flood risks
        </p>
      </div>

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
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {activeAlertsCount}
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

function StationCard({ station }: { station: RiverStation }) {
  const location = station.location as { lat: number; lng: number };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{station.name}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {station.riverName}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {station.region && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Region:</span>
              <span className="ml-2">{station.region}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Danger Level:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatNumber(station.dangerLevel, 2)} m
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Flood Level:
            </span>
            <span className="font-medium text-orange-600 dark:text-orange-400">
              {formatNumber(station.floodLevel, 2)} m
            </span>
          </div>

          {location && (
            <div className="text-xs text-gray-500 dark:text-gray-500">
              📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}

          <Link href={`/river/${station.id}`}>
            <Button variant="primary" className="w-full mt-4">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

