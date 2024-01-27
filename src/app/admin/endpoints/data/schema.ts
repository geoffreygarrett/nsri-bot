import { z } from 'zod';

export const logEndpointSchema = z.object({
    id: z.string(),
    created_at: z.string(), // Assuming this is serialized as a string
    endpoint: z.string(),
    parent_endpoint: z.string().optional().nullable().default(null),
    method: z.string(),
    request_body: z.string().optional().nullable().default(null),
    request_headers: z.string().optional().nullable().default(null),
    response_body: z.string().optional().nullable().default(null),
    response_headers: z.string().optional().nullable().default(null),
    response_status: z.number().optional().nullable().default(null),
    duration: z.number(),
    ip: z.string().optional().nullable().default(null),
    error: z.string().optional().nullable().default(null),
    metadata: z.record(z.any()).optional().nullable().default(null),
});

export type LogEndpoint = z.infer<typeof logEndpointSchema>;
