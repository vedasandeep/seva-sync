import { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/hooks';
import { useTasks, useTaskAssignment } from '../features/tasks/hooks';
import { TaskList } from '../features/tasks/components';
import { useOffline, useOfflineSync } from '../hooks';
import { fetchTasks, fetchNearbyTasks } from '../lib/api';
import { Layout, Tabs, Button } from '../components';

export default function TasksPage() {
  const { volunteer } = useAuth();
  const { tasks, loadFromDB } = useTasks();
  const { acceptTask, completeTask } = useTaskAssignment();
  const { isOffline } = useOffline();
  const { syncNow, syncing, pendingSyncCount } = useOfflineSync();
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  // Load tasks from DB on mount
  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  // Fetch tasks when online
  useEffect(() => {
    if (!isOffline && volunteer) {
      setLoading(true);
      fetchTasks().then(() => {
        loadFromDB();
        setLoading(false);
      });
    }
  }, [isOffline, volunteer, loadFromDB]);

  // Get location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleFetchNearby = async () => {
    if (!location) {
      alert('Location not available');
      return;
    }
    setLoading(true);
    await fetchNearbyTasks(location.lat, location.lon);
    await loadFromDB();
    setLoading(false);
  };

  const handleAcceptTask = async (taskId: string) => {
    setLoadingTaskId(taskId);
    try {
      const result = await acceptTask(taskId);
      if (result.success) {
        await loadFromDB();
      }
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    setLoadingTaskId(taskId);
    try {
      const result = await completeTask(taskId);
      if (result.success) {
        await loadFromDB();
      }
    } finally {
      setLoadingTaskId(null);
    }
  };

  const myTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const nearbyTasks = tasks.filter((t) => t.status === 'OPEN');

  const tabs = [
    {
      label: `My Tasks (${myTasks.length})`,
      value: 'my',
      content: (
        <TaskList
          tasks={myTasks}
          loading={loading}
          empty="No active tasks. Check nearby tasks!"
          onTaskComplete={handleCompleteTask}
          loadingTaskId={loadingTaskId}
        />
      ),
    },
    {
      label: `Nearby (${nearbyTasks.length})`,
      value: 'nearby',
      content: (
        <TaskList
          tasks={nearbyTasks}
          loading={loading}
          empty="No nearby tasks found."
          onTaskAccept={handleAcceptTask}
          loadingTaskId={loadingTaskId}
        />
      ),
    },
  ];

  return (
    <Layout title="Tasks" volunteerName={volunteer?.name || 'Volunteer'}>
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleFetchNearby}
            disabled={!location || isOffline}
            variant="secondary"
          >
            Find Nearby Tasks
          </Button>
          <Button
            onClick={() => syncNow()}
            loading={syncing}
            disabled={syncing || !isOffline || pendingSyncCount === 0}
          >
            {syncing ? 'Syncing...' : `Sync Now (${pendingSyncCount})`}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} defaultValue="my" />
      </div>
    </Layout>
  );
}
