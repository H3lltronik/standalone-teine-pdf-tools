import pLimit, { type LimitFunction } from 'p-limit';

/**
 * High-resolution stopwatch for measuring task duration.
 * Uses performance.now() when available, fallback to Date.now().
 */
export class TaskTimer {
    private startTime: number;

    constructor() {
        this.startTime = typeof performance !== 'undefined' && typeof performance.now === 'function'
            ? performance.now()
            : Date.now();
    }

    /** Elapsed time in milliseconds since construction. */
    elapsedMs(): number {
        const now = typeof performance !== 'undefined' && typeof performance.now === 'function'
            ? performance.now()
            : Date.now();
        return now - this.startTime;
    }

    /** Reset the timer (starts counting from now). */
    reset(): void {
        this.startTime = typeof performance !== 'undefined' && typeof performance.now === 'function'
            ? performance.now()
            : Date.now();
    }
}

export type OnTaskTimingCallback = (index: number, durationMs: number) => void;

/**
 * Wrapper around p-limit to run promise-returning functions with limited concurrency.
 * Use for controlling parallel work (e.g. image compression, API calls).
 */
export class PromisePool {
    private readonly limit: LimitFunction;

    constructor(concurrency: number) {
        if (concurrency < 1) {
            throw new Error('PromisePool concurrency must be >= 1');
        }
        this.limit = pLimit(concurrency);
    }

    get activeCount(): number {
        return this.limit.activeCount;
    }

    get pendingCount(): number {
        return this.limit.pendingCount;
    }

    get concurrency(): number {
        return this.limit.concurrency;
    }

    set concurrency(value: number) {
        this.limit.concurrency = value;
    }

    clearQueue(): void {
        this.limit.clearQueue();
    }

    /**
     * Run a single async function through the pool (respects concurrency).
     * Optionally report execution time via onTiming(index, durationMs). Index is 0 for run().
     */
    run<T>(fn: () => Promise<T>, onTiming?: OnTaskTimingCallback): Promise<T> {
        return this.limit(async (): Promise<T> => {
            const timer = new TaskTimer();
            try {
                return await fn();
            } finally {
                onTiming?.(0, timer.elapsedMs());
            }
        });
    }

    /**
     * Map over an iterable with limited concurrency. Order of results is preserved.
     * Optionally report each task's execution time via onTaskTiming(index, durationMs).
     */
    map<Input, Result>(
        iterable: Iterable<Input>,
        mapper: (input: Input, index: number) => Promise<Result> | Result,
        onTaskTiming?: OnTaskTimingCallback
    ): Promise<Result[]> {
        const wrappedMapper = async (input: Input, index: number): Promise<Result> => {
            const timer = new TaskTimer();
            try {
                return await mapper(input, index);
            } finally {
                onTaskTiming?.(index, timer.elapsedMs());
            }
        };
        return this.limit.map(iterable, wrappedMapper);
    }
}
