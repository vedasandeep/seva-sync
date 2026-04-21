import { database as prisma } from '../../infrastructure/database';

export interface SyncQueueItem {
  id: string;
  action: string;
  taskId: string;
  data: Record<string, unknown>;
  createdAt: string;
  lastUpdatedAt?: string;
  updatedBy?: string;
  version?: number;
}

export interface ConflictItem {
  taskId: string;
  local: {
    status: string;
    description?: string;
    updatedAt: string;
  };
  server: {
    status: string;
    description?: string;
    updatedAt: string;
    updatedBy: string;
  };
}

export class SyncService {
  /**
   * Sync multiple task updates (bulk sync)
   * Returns synced, failed, and conflict items
   */
  async bulkSync(items: SyncQueueItem[], volunteerId: string) {
    const syncedItems: string[] = [];
    const failedItems: string[] = [];
    const conflictItems: ConflictItem[] = [];

    for (const item of items) {
      try {
        // Check for conflicts before syncing
        const task = await prisma.task.findUnique({
          where: { id: item.taskId },
        });

        if (!task) {
          failedItems.push(item.id);
          continue;
        }

        // Detect conflict using version, lastUpdatedAt, and updatedBy
        const hasConflict = this.detectConflict(item, task);

        if (hasConflict) {
          conflictItems.push({
            taskId: item.taskId,
            local: {
              status: item.data.status as string || task.status,
              description: item.data.description as string,
              updatedAt: item.lastUpdatedAt || new Date().toISOString(),
            },
            server: {
              status: task.status,
              description: task.description || '',
              updatedAt: task.updatedAt.toISOString(),
              updatedBy: task.updatedBy || 'System',
            },
          });
          continue;
        }

        // No conflict, apply the update
        await this.applyTaskUpdate(item, task, volunteerId);
        syncedItems.push(item.id);
      } catch (error) {
        console.error(`[SyncService] Error syncing item ${item.id}:`, error);
        failedItems.push(item.id);
      }
    }

    return {
      syncedItems,
      failedItems,
      conflictItems,
      success: true,
    };
  }

  /**
   * Detect conflicts using version, lastUpdatedAt, updatedBy
   */
  private detectConflict(localItem: SyncQueueItem, serverTask: any): boolean {
    // If no version info on local, assume no conflict
    if (!localItem.version && !localItem.lastUpdatedAt) {
      return false;
    }

    // If timestamps are the same, no conflict
    if (localItem.lastUpdatedAt === serverTask.updatedAt.toISOString()) {
      return false;
    }

    // If versions are the same, no conflict
    if (localItem.version === (serverTask.version || 0)) {
      return false;
    }

    // Same updatedBy and version, no conflict
    if (
      localItem.updatedBy === serverTask.updatedBy &&
      localItem.version === (serverTask.version || 0)
    ) {
      return false;
    }

    // Conflict detected
    return true;
  }

  /**
   * Apply a single task update
   */
  private async applyTaskUpdate(item: SyncQueueItem, task: any, volunteerId: string) {
    const updateData: any = {};

    if (item.data.status) {
      updateData.status = item.data.status;
    }

    if (item.data.description !== undefined) {
      updateData.description = item.data.description;
    }

    if (item.data.assignedVolunteerId) {
      updateData.assignedVolunteerId = item.data.assignedVolunteerId;
    }

    // Update the task
    await prisma.task.update({
      where: { id: item.taskId },
      data: {
        ...updateData,
        updatedBy: volunteerId,
        updatedAt: new Date(),
        version: ((task.version as number) || 0) + 1,
      },
    });
  }

  /**
   * Resolve a conflict by applying user's choice
   */
  async resolveConflict(
    taskId: string,
    resolution: 'local' | 'server',
    localData: any,
    volunteerId: string
  ) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // If user chose local, apply the local changes
    if (resolution === 'local') {
      const updateData: any = {
        updatedBy: volunteerId,
        updatedAt: new Date(),
        version: ((task.version as number) || 0) + 1,
      };

      if (localData.status) {
        updateData.status = localData.status;
      }

      if (localData.description !== undefined) {
        updateData.description = localData.description;
      }

      return await prisma.task.update({
        where: { id: taskId },
        data: updateData,
      });
    }

    // If user chose server, just update the version and return
    return await prisma.task.update({
      where: { id: taskId },
      data: {
        version: ((task.version as number) || 0) + 1,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Get sync status summary
   */
  async getSyncStatus(volunteerId: string) {
    // This is a simple status endpoint
    // In a real implementation, you'd track sync queue per volunteer
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      volunteerId,
    };
  }
}

export const syncService = new SyncService();
