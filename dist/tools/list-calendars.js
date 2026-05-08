export async function registerListCalendars(client, server) {
    const calendars = await client.getCalendars();
    server.registerTool("list-calendars", {
        description: "List all calendars returning both name and URL",
        inputSchema: {},
    }, async () => {
        return { content: [{ type: "text", text: JSON.stringify(calendars) }] };
    });
}
