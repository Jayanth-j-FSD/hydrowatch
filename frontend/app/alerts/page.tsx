'use client';

import { useState } from 'react';
import {
  useActiveAlerts,
  useAlertHistory,
  useAcknowledgeAlert,
} from '@/lib/hooks/use-alerts';
import { Loading } from '@/components/common/loading';
import { ErrorMessage } from '@/components/common/error-message';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, getStatusBadgeColor } from '@/lib/utils';
import Link from 'next/link';
import { Alert } from '@/lib/types';

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const { data: activeAlerts, isLoading: activeLoading } = useActiveAlerts();
  const { data: alertHistory, isLoading: historyLoading } = useAlertHistory(100);
  const acknowledgeMutation = useAcknowledgeAlert();

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeMutation.mutateAsync(alertId);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Alerts Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and manage alerts for water resources
            </p>
          </div>
          <Link href="/alerts/configure">
            <Button variant="primary">Configure Alert</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Active Alerts ({activeAlerts?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Alert History
          </button>
        </nav>
      </div>

      {/* Active Alerts */}
      {activeTab === 'active' && (
        <div>
          {activeLoading ? (
            <Loading text="Loading active alerts..." />
          ) : activeAlerts && activeAlerts.length > 0 ? (
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={handleAcknowledge}
                  isAcknowledging={acknowledgeMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No active alerts at this time
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Alert History */}
      {activeTab === 'history' && (
        <div>
          {historyLoading ? (
            <Loading text="Loading alert history..." />
          ) : alertHistory && alertHistory.length > 0 ? (
            <div className="space-y-4">
              {alertHistory.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={handleAcknowledge}
                  isAcknowledging={false}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No alert history available
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function AlertCard({
  alert,
  onAcknowledge,
  isAcknowledging,
}: {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  isAcknowledging: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                  alert.severity,
                )}`}
              >
                {alert.severity}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {alert.type}
              </span>
              {alert.entityName && (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {alert.entityName}
                </span>
              )}
            </div>
            <p className="text-gray-900 dark:text-white mb-2">{alert.message}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Triggered: {formatDate(alert.triggeredAt)}</span>
              {alert.resolvedAt && (
                <span>Resolved: {formatDate(alert.resolvedAt)}</span>
              )}
            </div>
          </div>
          {!alert.acknowledged && !alert.resolvedAt && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAcknowledge(alert.id)}
              disabled={isAcknowledging}
            >
              {isAcknowledging ? 'Acknowledging...' : 'Acknowledge'}
            </Button>
          )}
          {alert.acknowledged && (
            <span className="text-sm text-green-600 dark:text-green-400">
              ✓ Acknowledged
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

