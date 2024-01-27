import {NextRequest, NextResponse} from "next/server";
import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";
import {Database, TablesInsert} from "@/types/supabase";
import {cookies} from "next/headers";
import {Twilio} from "twilio";
import {convertMessageListOptionsAndInstance} from "@/code/twilio";
import {ApiLogger, LoggingMode} from "@/app/api/logger";
import {z} from 'zod';
import {createErrorResponse} from '@/app/api/helper';
import {SendPayloadListSchema} from "@/schema";
import {MessageInstance} from "twilio/lib/rest/api/v2010/account/message";

type MESSAGE_SENT = 'messages_sent';
const SEND_ENDPOINT = `/api/wa/send`;

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const payloadList = Array.isArray(payload) ? payload : [payload];

        const parsed = SendPayloadListSchema.safeParse(payloadList);
        console.log(JSON.stringify(parsed, null, 2));
        if (!parsed.success) {
            return createErrorResponse({
                message: 'Invalid request payload',
                details: 'The provided data does not match the expected format',
                code: 'INVALID_PAYLOAD',
            }, 400);
        }

        const supabase = createRouteHandlerClient<Database>({cookies: () => cookies()});
        const apiLogger = new ApiLogger(supabase, LoggingMode.All, 10, SEND_ENDPOINT);
        const twilio = new Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

        const responses: MessageInstance[] = await Promise.all(
            parsed.data.map(params => twilio.messages.create(params))
        );

        const insertMessagesPayload: TablesInsert<MESSAGE_SENT>[] = responses.map((response, index) =>
            convertMessageListOptionsAndInstance({
                create: parsed.data[index],
                response
            })
        );

        const insertMessagesStartTime = new Date();
        const insertMessageResult = await supabase.from('messages_sent')
            .insert(insertMessagesPayload)
            .select()
            .then((response) => {
                apiLogger.logSupabaseOperation(
                    'messages_sent',
                    'INSERT',
                    insertMessagesStartTime,
                    response,
                    insertMessagesPayload
                );
                return response;
            });

        await apiLogger.flush();

        if (insertMessageResult.error) {
            return createErrorResponse({
                message: 'Database insertion failed',
                details: insertMessageResult.error.message,
                code: 'DB_INSERTION_ERROR',
            }, 500);
        }

        return new NextResponse(JSON.stringify(insertMessageResult.data), {
            status: 201,
            headers: {'Content-Type': 'application/json'}
        });
    } catch (error: any) {
        return createErrorResponse({
            message: 'Internal server error',
            details: error.message || 'Unknown error occurred',
            code: 'INTERNAL_SERVER_ERROR',
        }, 500);
    }
}
