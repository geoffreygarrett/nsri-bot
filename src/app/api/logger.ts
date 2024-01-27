import {createClient, PostgrestResponse, PostgrestSingleResponse} from '@supabase/supabase-js';
import {SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {Database, Tables, TablesInsert} from "@/types/supabase";


// Define logging modes
export enum LoggingMode {
    All,
    ErrorsOnly,
    None
}

interface FetchOptions {
    method?: string;
    headers?: HeadersInit;
    body?: string;
}


// Initialize Supabase client
// const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY');

export class ApiLogger {
    private loggingMode: LoggingMode;
    private flushThreshold: number;
    private supabase: SupabaseClient<Database>
    parentApiEndpoint?: string;
    private logQueue: TablesInsert<`log_endpoint`>[] = [];

    constructor(supabase: SupabaseClient<Database>,
                loggingMode: LoggingMode = LoggingMode.All, flushThreshold: number = 10, parentApiEndpoint?: string) {
        this.loggingMode = loggingMode;
        this.flushThreshold = flushThreshold;
        this.supabase = supabase;
        this.parentApiEndpoint = parentApiEndpoint;
        this.logQueue = [];
    }

    // New method to log Supabase operations
    async logSupabaseOperation(table: string, method: string, startTime: Date, response: PostgrestResponse<any> | PostgrestSingleResponse<any>
        , payload: any) {
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        const logEntry: TablesInsert<`log_endpoint`> = {
            endpoint: `/supabase/${table}/${method}`,
            method: method,
            request_body: payload ? JSON.stringify(payload) : '',
            response_body: JSON.stringify(response),
            response_status: response.status,
            duration: duration,
            created_at: startTime.toISOString(),
            parent_endpoint: this.parentApiEndpoint,
            metadata: {}, // Additional metadata if needed
            ip: '', // Add logic to capture IP if necessary
            error: response.error ? JSON.stringify(response.error) : null,
        };

        this.enqueueLog(logEntry);
    }


    async logFetch(url: string, options: FetchOptions = {}): Promise<Response> {
        const startTime = new Date();
        try {
            const response = await fetch(url, options);
            const endTime = new Date();
            const duration = endTime.getTime() - startTime.getTime();

            if (this.loggingMode !== LoggingMode.None &&
                (this.loggingMode !== LoggingMode.ErrorsOnly || !response.ok)) {
                const logEntry = await this.createLogEntry(url, options, response, duration, startTime);
                this.enqueueLog(logEntry);
            }

            return response;
        } catch (error) {
            console.error('Fetch error:', error);
            if (this.loggingMode !== LoggingMode.None) {
                const endTime = new Date();
                const duration = endTime.getTime() - startTime.getTime();
                const logEntry = await this.createLogEntry(url, options, null, duration, startTime, error);
                this.enqueueLog(logEntry);
            }
            throw error;
        }
    }

    private async createLogEntry(url: string,
                                 options: FetchOptions,
                                 response: Response | null,
                                 duration: number,
                                 startTime: Date,
                                 error?: any): Promise<TablesInsert<`log_endpoint`>> {
        const {method, headers, body} = options;
        return {
            endpoint: url,
            method: method || 'GET',
            request_body: body || '',
            request_headers: JSON.stringify(headers || {}),
            response_body: response ? await response.clone().text() : '',
            response_headers: response ? JSON.stringify(response.headers) : '',
            response_status: response ? response.status : null,
            duration,
            ip: response ? response.headers.get('CF-Connecting-IP') || '' : '',
            created_at: startTime.toISOString(),
            error: error ? JSON.stringify(error) : null,
            parent_endpoint: this.parentApiEndpoint || null,
            metadata: {} // Add additional metadata as needed
        };
    }

    enqueueLog(logEntry: TablesInsert<`log_endpoint`>): void {
        this.logQueue.push(logEntry);
        if (this.shouldFlushQueue()) {
            this.flushLogQueue();
        }
    }

    private shouldFlushQueue(): boolean {
        return this.logQueue.length >= this.flushThreshold;
    }

    private async flushLogQueue(): Promise<void> {
        if (this.logQueue.length === 0) return;

        const batch = [...this.logQueue];
        this.logQueue = [];

        try {
            const {error} = await this.supabase
                .from('log_endpoint')
                .insert(batch);

            if (error) {
                console.error('Error logging to Supabase:', error);
                // Re-queue the failed batch for retry
                this.logQueue.unshift(...batch);
            }
        } catch (error) {
            console.error('Error flushing log queue:', error);
            // Re-queue the failed batch for retry
            this.logQueue.unshift(...batch);
        }
    }

    // Manually flush the queue
    async flush(): Promise<void> {
        await this.flushLogQueue();
    }

    // Method to change the logging mode
    setLoggingMode(mode: LoggingMode): void {
        this.loggingMode = mode;
    }
}

// export class SupabaseLogger {
//     constructor(private supabase: SupabaseClient<Database>, private apiLogger: ApiLogger) {}
//
//     async select(table: string, query: string) {
//         return this.logOperation(table, 'SELECT', async () => this.supabase.from(table).select(query));
//     }
//
//     async insert(table: string, data: any) {
//         return this.logOperation(table, 'INSERT', async () => this.supabase.from(table).insert(data));
//     }
//
//     async update(table: string, data: any) {
//         return this.logOperation(table, 'UPDATE', async () => this.supabase.from(table).update(data));
//     }
//
//     async delete(table: string, query: string) {
//         return this.logOperation(table, 'DELETE', async () => this.supabase.from(table).delete().match(query));
//     }
//
//     async upsert(table: string, data: any, onConflict: string) {
//         return this.logOperation(table, 'UPSERT', async () => this.supabase.from(table).upsert(data, { onConflict }));
//     }
//
//     private async logOperation(table: string, method: string, operation: () => Promise<any>) {
//         const startTime = new Date();
//         const result = await operation();
//         const endTime = new Date();
//         const duration = endTime.getTime() - startTime.getTime();
//
//         const logEntry = {
//             endpoint: `/supabase/${table}`,
//             method,
//             request_body: method !== 'SELECT' ? JSON.stringify(result.data) : '',
//             response_body: JSON.stringify(result.error ? result.error : result.data),
//             response_status: result.error ? result.error.status : 200,
//             duration,
//             created_at: startTime.toISOString(),
//             parent_endpoint: this.apiLogger.parentApiEndpoint,
//             metadata: {}
//         };
//
//         this.apiLogger.enqueueLog(logEntry);
//         await this.apiLogger.flush();
//
//         return result;
//     }
// }

