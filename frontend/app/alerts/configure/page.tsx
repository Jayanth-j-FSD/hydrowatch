'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useAlertConfigurations,
  useCreateAlertConfiguration,
  useUpdateAlertConfiguration,
  useDeleteAlertConfiguration,
} from '@/lib/hooks/use-alerts';
import { useRiverStations } from '@/lib/hooks/use-river-stations';
import { useDams } from '@/lib/hooks/use-dams';
import { Loading } from '@/components/common/loading';
import { ErrorMessage } from '@/components/common/error-message';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertConfiguration } from '@/lib/types';

export default function ConfigureAlertsPage() {
  const router = useRouter();
  const { data: configurations, isLoading } = useAlertConfigurations();
  const createMutation = useCreateAlertConfiguration();
  const updateMutation = useUpdateAlertConfiguration();
  const deleteMutation = useDeleteAlertConfiguration();
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AlertConfiguration | null>(null);

  if (isLoading) {
    return <Loading fullScreen text="Loading alert configurations..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Configure Alerts
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Set up alerts for water resource monitoring
        </p>
      </div>

      <div className="mb-6">
        <Button
          variant="primary"
          onClick={() => {
            setEditingConfig(null);
            setShowForm(true);
          }}
        >
          + Create New Alert
        </Button>
      </div>

      {showForm && (
        <AlertConfigurationForm
          config={editingConfig}
          onSave={() => {
            setShowForm(false);
            setEditingConfig(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingConfig(null);
          }}
        />
      )}

      {/* Existing Configurations */}
      {configurations && configurations.length > 0 ? (
        <div className="space-y-4">
          {configurations.map((config) => (
            <Card key={config.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {config.type.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Entity ID: {config.entityId}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          config.enabled
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}
                      >
                        {config.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>
                        Threshold: {config.thresholdOperator} {config.thresholdValue}
                      </p>
                      <p>Channels: {config.channels.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingConfig(config);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this alert?')) {
                          try {
                            await deleteMutation.mutateAsync(config.id);
                          } catch (error) {
                            console.error('Failed to delete:', error);
                          }
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No alert configurations yet
            </p>
            <Button variant="primary" onClick={() => setShowForm(true)}>
              Create Your First Alert
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AlertConfigurationForm({
  config,
  onSave,
  onCancel,
}: {
  config: AlertConfiguration | null;
  isEditing?: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    type: config?.type || ('river' as 'river' | 'dam' | 'groundwater' | 'rainfall'),
    entityId: config?.entityId || '',
    thresholdOperator: config?.thresholdOperator || ('gt' as 'gt' | 'lt' | 'eq'),
    thresholdValue: config?.thresholdValue?.toString() || '',
    channels: config?.channels || ([] as ('sms' | 'email' | 'push')[]),
    enabled: config?.enabled ?? true,
  });

  const createMutation = useCreateAlertConfiguration();
  const updateMutation = useUpdateAlertConfiguration();
  const { data: stations } = useRiverStations();
  const { data: dams } = useDams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        thresholdValue: parseFloat(formData.thresholdValue),
      };

      if (config) {
        await updateMutation.mutateAsync({
          id: config.id,
          ...data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleChannelToggle = (channel: 'sms' | 'email' | 'push') => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const availableEntities =
    formData.type === 'river'
      ? stations?.map((s) => ({ id: s.id, name: s.name })) || []
      : formData.type === 'dam'
        ? dams?.map((d) => ({ id: d.id, name: d.name })) || []
        : [];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{config ? 'Edit Alert' : 'Create New Alert'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alert Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as any,
                  entityId: '', // Reset entity when type changes
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="river">River</option>
              <option value="dam">Dam</option>
              <option value="groundwater">Groundwater</option>
              <option value="rainfall">Rainfall</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entity
            </label>
            <select
              value={formData.entityId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, entityId: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            >
              <option value="">Select {formData.type}</option>
              {availableEntities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Operator
              </label>
              <select
                value={formData.thresholdOperator}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    thresholdOperator: e.target.value as any,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="gt">Greater Than (&gt;)</option>
                <option value="lt">Less Than (&lt;)</option>
                <option value="eq">Equals (=)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Threshold Value
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.thresholdValue}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, thresholdValue: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Channels
            </label>
            <div className="flex gap-4">
              {(['email', 'sms', 'push'] as const).map((channel) => (
                <label key={channel} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.channels.includes(channel)}
                    onChange={() => handleChannelToggle(channel)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {channel.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, enabled: e.target.checked }))
              }
              className="mr-2"
              id="enabled"
            />
            <label htmlFor="enabled" className="text-sm text-gray-700 dark:text-gray-300">
              Enable this alert
            </label>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : config
                  ? 'Update Alert'
                  : 'Create Alert'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

