import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";

// Format alert data

// Build a server instance and register its tools. serveStdio calls this
// whenever it needs an instance, so every call must return a fresh one.
function createServer() {
  const server = new McpServer({
    name: "calculadora",
    version: "1.0.0",
  });

  server.registerTool(
    "suma",
    {
      description: "suma 2 numeros",
      inputSchema: z.object({
        a: z.number().describe("introduce un numero"),
        b: z.number().describe("introduce el 2do numero"),
      }),
    },
    async ({ a, b }) => {
      return {
        content: [
          {
            type: "text",
            text: `${a+b}`,
          },
        ],
      };
    },
  );



  return server;
}

serveStdio(createServer, {
  onerror: (error) => console.error("Weather MCP Server error:", error),
});
console.error("Weather MCP Server running on stdio");
