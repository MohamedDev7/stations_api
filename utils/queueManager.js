// utils/queueManager.js
const { Queue } = require("bullmq");

// Create queue instance for management
const notificationQueue = new Queue("notification", {
    connection: {
        host: "127.0.0.1",
        port: 6379,
        maxRetriesPerRequest: null,
    },
});

class QueueManager {
    /**
     * Clear all waiting (pending) jobs
     */
    static async clearWaitingJobs() {
        try {
            const waitingJobs = await notificationQueue.getWaiting();
            console.log(`Found ${waitingJobs.length} waiting jobs`);
            
            for (const job of waitingJobs) {
                await job.remove();
            }
            
            console.log(`✅ Cleared ${waitingJobs.length} waiting jobs`);
            return waitingJobs.length;
        } catch (error) {
            console.error("❌ Error clearing waiting jobs:", error);
            throw error;
        }
    }

    /**
     * Clear all delayed jobs
     */
    static async clearDelayedJobs() {
        try {
            const delayedJobs = await notificationQueue.getDelayed();
            console.log(`Found ${delayedJobs.length} delayed jobs`);
            
            for (const job of delayedJobs) {
                await job.remove();
            }
            
            console.log(`✅ Cleared ${delayedJobs.length} delayed jobs`);
            return delayedJobs.length;
        } catch (error) {
            console.error("❌ Error clearing delayed jobs:", error);
            throw error;
        }
    }

    /**
     * Clear all failed jobs
     */
    static async clearFailedJobs() {
        try {
            const failedJobs = await notificationQueue.getFailed();
            console.log(`Found ${failedJobs.length} failed jobs`);
            
            for (const job of failedJobs) {
                await job.remove();
            }
            
            console.log(`✅ Cleared ${failedJobs.length} failed jobs`);
            return failedJobs.length;
        } catch (error) {
            console.error("❌ Error clearing failed jobs:", error);
            throw error;
        }
    }

    /**
     * Clear all completed jobs
     */
    static async clearCompletedJobs() {
        try {
            const completedJobs = await notificationQueue.getCompleted();
            console.log(`Found ${completedJobs.length} completed jobs`);
            
            for (const job of completedJobs) {
                await job.remove();
            }
            
            console.log(`✅ Cleared ${completedJobs.length} completed jobs`);
            return completedJobs.length;
        } catch (error) {
            console.error("❌ Error clearing completed jobs:", error);
            throw error;
        }
    }

    /**
     * Clear ALL jobs (waiting, delayed, failed, completed)
     */
    static async clearAllJobs() {
        try {
            console.log("🧹 Starting to clear all jobs...");
            
            const results = {
                waiting: await this.clearWaitingJobs(),
                delayed: await this.clearDelayedJobs(),
                failed: await this.clearFailedJobs(),
                completed: await this.clearCompletedJobs()
            };
            
            const total = Object.values(results).reduce((sum, count) => sum + count, 0);
            console.log(`✅ Total jobs cleared: ${total}`);
            console.log("📊 Breakdown:", results);
            
            return results;
        } catch (error) {
            console.error("❌ Error clearing all jobs:", error);
            throw error;
        }
    }

    /**
     * Get queue statistics
     */
    static async getQueueStats() {
        try {
            const waiting = await notificationQueue.getWaiting();
            const delayed = await notificationQueue.getDelayed();
            const active = await notificationQueue.getActive();
            const completed = await notificationQueue.getCompleted();
            const failed = await notificationQueue.getFailed();

            const stats = {
                waiting: waiting.length,
                delayed: delayed.length,
                active: active.length,
                completed: completed.length,
                failed: failed.length,
                total: waiting.length + delayed.length + active.length + completed.length + failed.length
            };

            console.log("📊 Queue Statistics:", stats);
            return stats;
        } catch (error) {
            console.error("❌ Error getting queue stats:", error);
            throw error;
        }
    }

    /**
     * Pause the queue (stops processing new jobs)
     */
    static async pauseQueue() {
        try {
            await notificationQueue.pause();
            console.log("⏸️ Queue paused");
        } catch (error) {
            console.error("❌ Error pausing queue:", error);
            throw error;
        }
    }

    /**
     * Resume the queue
     */
    static async resumeQueue() {
        try {
            await notificationQueue.resume();
            console.log("▶️ Queue resumed");
        } catch (error) {
            console.error("❌ Error resuming queue:", error);
            throw error;
        }
    }

    /**
     * Drain the queue (remove all waiting jobs and stop processing)
     */
    static async drainQueue() {
        try {
            await notificationQueue.drain();
            console.log("🚰 Queue drained (all waiting jobs removed)");
        } catch (error) {
            console.error("❌ Error draining queue:", error);
            throw error;
        }
    }
}

module.exports = QueueManager;
