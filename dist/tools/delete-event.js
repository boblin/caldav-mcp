import { z } from "zod";
export function registerDeleteEvent(client, server) {
    server.registerTool("delete-event", {
        description: "Deletes an event in the calendar specified by its URL",
        inputSchema: { uid: z.string(), calendarUrl: z.string() },
    }, async (args) => {
        const { uid, calendarUrl } = args;
        const base = calendarUrl.endsWith("/") ? calendarUrl : `${calendarUrl}/`;
        const href = `${base}${uid}.ics`;
        const etag = await client.getETag(href);
        await client.deleteEvent(calendarUrl, uid, etag);
        return {
            content: [{ type: "text", text: "Event deleted" }],
        };
    });
}
