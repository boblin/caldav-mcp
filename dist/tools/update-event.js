import { z } from "zod";
const recurrenceRuleSchema = z.object({
    freq: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
    interval: z.number().optional(),
    count: z.number().optional(),
    until: z.string().datetime({ offset: true }).optional(),
    byday: z.array(z.string()).optional(),
    bymonthday: z.array(z.number()).optional(),
    bymonth: z.array(z.number()).optional(),
});
export function registerUpdateEvent(client, server) {
    server.registerTool("update-event", {
        description: "Updates an existing event in the calendar specified by its URL. Only provided fields are changed.",
        inputSchema: {
            uid: z.string(),
            calendarUrl: z.string(),
            summary: z.string().optional(),
            start: z.string().datetime({ offset: true }).optional(),
            end: z.string().datetime({ offset: true }).optional(),
            description: z.string().optional(),
            location: z.string().optional(),
            recurrenceRule: recurrenceRuleSchema.optional(),
        },
    }, async (args) => {
        const { uid, calendarUrl, summary, start, end, description, location, recurrenceRule, } = args;
        const base = calendarUrl.endsWith("/") ? calendarUrl : `${calendarUrl}/`;
        const href = `${base}${uid}.ics`;
        const [existing] = await client.getEventsByHref(calendarUrl, [href]);
        if (!existing) {
            throw new Error(`Event not found: ${uid}`);
        }
        const updated = await client.updateEvent(calendarUrl, {
            ...existing,
            ...(summary !== undefined && { summary }),
            ...(start !== undefined && { start: new Date(start) }),
            ...(end !== undefined && { end: new Date(end) }),
            ...(description !== undefined && { description }),
            ...(location !== undefined && { location }),
            ...(recurrenceRule !== undefined && {
                recurrenceRule: recurrenceRule,
            }),
        });
        return {
            content: [{ type: "text", text: updated.uid }],
        };
    });
}
