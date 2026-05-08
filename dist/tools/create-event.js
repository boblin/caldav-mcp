import { z } from "zod";
const recurrenceRuleSchema = z.object({
    freq: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
    interval: z.number().optional(),
    count: z.number().optional(),
    until: z.string().datetime({ offset: true }).optional(), // ISO 8601 string
    byday: z.array(z.string()).optional(), // e.g. ["MO", "TU"]
    bymonthday: z.array(z.number()).optional(),
    bymonth: z.array(z.number()).optional(),
});
export function registerCreateEvent(client, server) {
    server.registerTool("create-event", {
        description: "Creates an event in the calendar specified by its URL",
        inputSchema: {
            summary: z.string(),
            start: z
                .string()
                .datetime({ offset: true })
                .describe("Start datetime (ISO 8601)"),
            end: z
                .string()
                .datetime({ offset: true })
                .describe("End datetime (ISO 8601)"),
            calendarUrl: z.string(),
            description: z.string().optional(),
            location: z.string().optional(),
            recurrenceRule: recurrenceRuleSchema.optional(),
        },
    }, async (args) => {
        const { calendarUrl, summary, start, end, description, location, recurrenceRule, } = args;
        const event = await client.createEvent(calendarUrl, {
            summary: summary,
            start: new Date(start),
            end: new Date(end),
            ...(description !== undefined && { description }),
            ...(location !== undefined && { location }),
            recurrenceRule: recurrenceRule,
        });
        return {
            content: [{ type: "text", text: event.uid }],
        };
    });
}
