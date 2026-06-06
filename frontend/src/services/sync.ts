import { getDb } from '../db/database';
import { apiFetch, getAuthState, setAuthTokens } from './api';

export interface QueuedEvent {
  id: number;
  client_generated_id: string;
  type: string;
  module: string;
  payload: string; // JSON string
  client_timestamp: string | number;
  retry_count: number;
}

// Function to generate a UUID for event tracking
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Initializes the local sync queue table in SQLite database.
 */
export async function initSyncQueueTable(): Promise<void> {
  try {
    const db = getDb();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_generated_id TEXT UNIQUE,
        type TEXT NOT NULL,
        module TEXT NOT NULL,
        payload TEXT NOT NULL,
        client_timestamp TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS dead_letter_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_generated_id TEXT UNIQUE,
        type TEXT NOT NULL,
        module TEXT NOT NULL,
        payload TEXT NOT NULL,
        client_timestamp TEXT NOT NULL,
        retry_count INTEGER,
        error_message TEXT,
        created_at TEXT
      );
    `);
  } catch (error) {
    console.error('Failed to initialize sync queue table:', error);
  }
}

/**
 * Queues a progress event locally.
 * If online, triggers a synchronization replay storm immediately in the background.
 */
export async function queueProgressEvent(
  type: string,
  moduleName: string,
  payload: Record<string, any>
): Promise<void> {
  try {
    await initSyncQueueTable();
    const db = getDb();
    const clientGeneratedId = generateUUID();
    const clientTimestamp = Date.now();
    const payloadStr = JSON.stringify(payload);

    await db.runAsync(
      `INSERT INTO sync_queue (client_generated_id, type, module, payload, client_timestamp, retry_count)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [clientGeneratedId, type, moduleName, payloadStr, clientTimestamp]
    );

    console.log(`Queued progress event locally: ${type} (${clientGeneratedId})`);
    
    // Trigger sync in the background (fire and forget)
    syncQueuedEvents().catch((err) => {
      console.warn('Background sync failed (expected if offline):', err);
    });
  } catch (error) {
    console.error('Failed to queue progress event:', error);
  }
}

let isSyncing = false;

/**
 * Replays all queued progress events to the server.
 * Handles duplicate checking, LWW conflicts, achievements unlocked, and points increments.
 */
export async function syncQueuedEvents(): Promise<void> {
  if (isSyncing) return;
  
  const auth = getAuthState();
  if (!auth.isAuthenticated) {
    // Sync requires active user session to map progress to server
    return;
  }

  isSyncing = true;
  let currentBatch: QueuedEvent[] = [];
  
  try {
    await initSyncQueueTable();
    const db = getDb();
    
    // Get up to 20 events in the queue (Chunked sync batching)
    currentBatch = await db.getAllAsync<QueuedEvent>(
      'SELECT * FROM sync_queue ORDER BY client_timestamp ASC LIMIT 20'
    );

    if (currentBatch.length === 0) {
      isSyncing = false;
      return;
    }

    console.log(`Attempting to sync ${currentBatch.length} progress events...`);

    // Prepare payload
    const eventsPayload = currentBatch.map((e) => ({
      type: e.type,
      module: e.module,
      payload: JSON.parse(e.payload),
      clientGeneratedId: e.client_generated_id,
      clientTimestamp: Number(e.client_timestamp),
      eventVersion: '1.0.0',
      producerVersion: '1.0.0',
    }));

    const syncId = generateUUID();
    const response = await apiFetch('/api/v1/progress/events', {
      method: 'POST',
      headers: {
        'X-Sync-Id': syncId,
        'X-Idempotency-Key': syncId,
      },
      body: JSON.stringify(eventsPayload),
    });

    if (!response.ok) {
      throw new Error(`Sync request failed with status ${response.status}`);
    }

    const resBody = await response.json();
    const { diagnostics, events: processedEvents, unlockedAchievements } = resBody.data;

    console.log('Sync processing results:', diagnostics);

    // Process individual event outcomes to clear local queue
    for (const remoteEvent of processedEvents) {
      const clientGeneratedId = remoteEvent.clientGeneratedId || remoteEvent.eventId;
      const status = remoteEvent.status;

      // COMPLETED, DUPLICATE, or DISCARDED events are finalized and can be removed from local queue
      if (status === 'COMPLETED' || status === 'DUPLICATE' || status === 'DISCARDED') {
        await db.runAsync('DELETE FROM sync_queue WHERE client_generated_id = ?', [clientGeneratedId]);
      } else if (status === 'FAILED') {
        // Increment retry count in local queue, discard if exceeds max limit (5)
        const currentEvent = currentBatch.find((e) => e.client_generated_id === clientGeneratedId);
        const newRetryCount = (currentEvent?.retry_count || 0) + 1;
        if (newRetryCount >= 5) {
          await db.runAsync('DELETE FROM sync_queue WHERE client_generated_id = ?', [clientGeneratedId]);
          await db.runAsync(
            `INSERT OR IGNORE INTO dead_letter_queue (client_generated_id, type, module, payload, client_timestamp, retry_count, error_message, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              clientGeneratedId,
              currentEvent?.type || 'unknown',
              currentEvent?.module || 'unknown',
              currentEvent?.payload || '{}',
              String(currentEvent?.client_timestamp || Date.now()),
              newRetryCount,
              'Server returned FAILED status',
              new Date().toISOString(),
            ]
          );
          console.warn(`Event ${clientGeneratedId} exceeded max retries on server FAILED. Moved to DLQ.`);
        } else {
          await db.runAsync(
            'UPDATE sync_queue SET retry_count = ? WHERE client_generated_id = ?',
            [newRetryCount, clientGeneratedId]
          );
        }
      }
    }

    // Reward local achievements and user points
    if (unlockedAchievements && unlockedAchievements.length > 0) {
      // 1. Get first active student ID
      const student = await db.getFirstAsync<{ id: number }>('SELECT id FROM students LIMIT 1');
      if (student) {
        for (const achievement of unlockedAchievements) {
          try {
            await db.runAsync(
              'INSERT OR IGNORE INTO achievements (student_id, badge_key, earned_at) VALUES (?, ?, ?)',
              [
                student.id,
                achievement.badgeKey || achievement.badge_key,
                achievement.earnedAt || achievement.earned_at || new Date().toISOString(),
              ]
            );
          } catch (err) {
            console.error('Failed to save achievement locally:', err);
          }
        }
      }
    }

    // Refresh user profile in auth state to reflect updated points
    if (auth.user) {
      const meResponse = await apiFetch('/api/v1/auth/me');
      if (meResponse.ok) {
        const meBody = await meResponse.json();
        const updatedUser = meBody.data?.user;
        if (updatedUser) {
          await setAuthTokens(auth.accessToken!, auth.refreshToken!, updatedUser);
        }
      }
    }

    // If batch was full, recursively trigger next batch sync in background
    if (currentBatch.length === 20) {
      isSyncing = false;
      setTimeout(() => {
        syncQueuedEvents().catch((err) => console.warn('Background chunk sync failed:', err));
      }, 250);
      return;
    }

  } catch (error: any) {
    console.warn('Offline sync failed (device is likely offline or server unreachable):', error);
    // Increment retry count for the current batch to prevent deadlocks
    const db = getDb();
    for (const event of currentBatch) {
      const newRetry = (event.retry_count || 0) + 1;
      if (newRetry >= 5) {
        await db.runAsync('DELETE FROM sync_queue WHERE client_generated_id = ?', [event.client_generated_id]);
        await db.runAsync(
          `INSERT OR IGNORE INTO dead_letter_queue (client_generated_id, type, module, payload, client_timestamp, retry_count, error_message, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            event.client_generated_id,
            event.type,
            event.module,
            event.payload,
            String(event.client_timestamp),
            newRetry,
            error.message || String(error),
            new Date().toISOString(),
          ]
        );
        console.warn(`Event ${event.client_generated_id} exceeded max retries. Moved to DLQ.`);
      } else {
        await db.runAsync(
          'UPDATE sync_queue SET retry_count = ? WHERE client_generated_id = ?',
          [newRetry, event.client_generated_id]
        );
      }
    }
  } finally {
    isSyncing = false;
  }
}

// Automatically subscribe to auth state to trigger sync on login
let lastAuthState = false;
import('./api').then(({ subscribeToAuth }) => {
  subscribeToAuth((state) => {
    if (state.isAuthenticated && !lastAuthState) {
      lastAuthState = true;
      syncQueuedEvents().catch(() => {});
    } else if (!state.isAuthenticated) {
      lastAuthState = false;
    }
  });
});
