'use client';

import { useState } from 'react';
import { useGroundwaterWells, useGroundwaterHeatmap } from '@/lib/hooks/use-groundwater';
import { Loading } from '@/components/common/loading';
import { ErrorMessage } from '@/components/common/error-message';
import { EmptyState } from '@/components/common/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';
import { GroundwaterWell } from '@/lib/types';

export default function GroundwaterDashboardPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const { data: wells, isLoading, error, refetch } = useGroundwaterWells();
  const { data: heatmapData } = useGroundwaterHeatmap(selectedRegion || undefined);

  if (isLoading) {
    return <Loading fullScreen text="Loading groundwater wells..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage error={error as Error} retry={refetch} />
      </div>
    );
  }

  if (!wells || wells.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="No groundwater wells found"
          description="There are no groundwater monitoring wells available at this time."
        />
      </div>
    );
  }

  const regions = Array.from(
    new Set(wells.map((w) => w.region).filter(Boolean)),
  ) as string[];

  const filteredWells = selectedRegion
    ? wells.filter((w) => w.region === selectedRegion)
    : wells;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Groundwater Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor groundwater depth, quality, and regional trends
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Wells
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {wells.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Wells
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {wells.filter((w) => w.isActive).length}
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

      {/* Heatmap Info */}
      {heatmapData && heatmapData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Regional Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {heatmapData.length} wells with depth data in{' '}
              {selectedRegion || 'all regions'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Wells Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWells.map((well) => (
          <WellCard key={well.id} well={well} />
        ))}
      </div>
    </div>
  );
}

function WellCard({ well }: { well: GroundwaterWell }) {
  const location = well.location as { lat: number; lng: number };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{well.name}</CardTitle>
            {well.aquiferType && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {well.aquiferType}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {well.region && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Region:</span>
              <span className="ml-2">{well.region}</span>
            </div>
          )}

          {well.state && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">State:</span>
              <span className="ml-2">{well.state}</span>
            </div>
          )}

          {location && (
            <div className="text-xs text-gray-500 dark:text-gray-500">
              📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}

          <Link href={`/groundwater/${well.id}`}>
            <Button variant="primary" className="w-full mt-4">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

