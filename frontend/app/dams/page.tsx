'use client';

import { useState } from 'react';
import { useDams, useDamAlerts } from '@/lib/hooks/use-dams';
import { Loading } from '@/components/common/loading';
import { ErrorMessage } from '@/components/common/error-message';
import { EmptyState } from '@/components/common/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';
import { Dam } from '@/lib/types';

export default function DamsDashboardPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const { data: dams, isLoading, error, refetch } = useDams();
  const { data: alerts } = useDamAlerts();

  if (isLoading) {
    return <Loading fullScreen text="Loading dams..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage error={error as Error} retry={refetch} />
      </div>
    );
  }

  if (!dams || dams.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="No dams found"
          description="There are no dams available at this time."
        />
      </div>
    );
  }

  const regions = Array.from(
    new Set(dams.map((d) => d.region).filter(Boolean)),
  ) as string[];

  const filteredDams = selectedRegion
    ? dams.filter((d) => d.region === selectedRegion)
    : dams;

  const activeAlertsCount = alerts?.length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dams Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor reservoir capacity, inflow/outflow, and power generation
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Dams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {dams.length}
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

      {/* Dams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDams.map((dam) => (
          <DamCard key={dam.id} dam={dam} />
        ))}
      </div>
    </div>
  );
}

function DamCard({ dam }: { dam: Dam }) {
  const location = dam.location as { lat: number; lng: number };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{dam.name}</CardTitle>
            {dam.type && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {dam.type}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dam.region && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Region:</span>
              <span className="ml-2">{dam.region}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Total Capacity:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatNumber(dam.totalCapacity, 2)} MCM
            </span>
          </div>

          {dam.powerCapacity && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Power Capacity:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatNumber(dam.powerCapacity, 2)} MW
              </span>
            </div>
          )}

          {location && (
            <div className="text-xs text-gray-500 dark:text-gray-500">
              📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}

          <Link href={`/dams/${dam.id}`}>
            <Button variant="primary" className="w-full mt-4">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

