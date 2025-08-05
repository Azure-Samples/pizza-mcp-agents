import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { tools } from './tools.js';

export function getMcpServer() {
  const server = new McpServer({
    name: 'pizza-mcp',
    description:
      'Pizza tools to interact with the pizza API. Use these tools whenever you need information about pizzas, toppings, and orders. You can also use them to place new pizza orders and manage existing orders.',
    version: '1.0.0',
  });
  for (const tool of tools) {
    createMcpTool(server, tool);
  }
  return server;
}

// Helper that wraps MCP tool creation
// It handles arguments typing, error handling and response formatting
export function createMcpTool<T extends z.ZodTypeAny>(
  server: McpServer,
  options: {
    name: string;
    description: string;
    schema?: z.ZodObject<z.ZodRawShape, any, T>;
    handler: (args: z.infer<z.ZodObject<z.ZodRawShape, any, T>>) => Promise<string>;
  },
) {
  if (!options.schema) {
    server.tool(options.name, options.description, async () => {
      try {
        // console.log("Executing MCP tool:", toolArguments.name);
        const result = await options.handler(undefined as any);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error executing MCP tool:', errorMessage);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  } else {
    server.tool(options.name, options.description, options.schema.shape, async (args: z.ZodRawShape) => {
      try {
        // console.log("Executing MCP tool:", toolArguments.name);
        // console.log("Tool arguments:", args);
        const result = await options.handler(args);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error executing MCP tool:', errorMessage);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }
}
