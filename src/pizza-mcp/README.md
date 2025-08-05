<div align="center">

# Pizza MCP server (Azure Container Apps)

[![Open project in GitHub Codespaces](https://img.shields.io/badge/Codespaces-Open-blue?style=flat-square&logo=github)](https://codespaces.new/Azure-Samples/pizza-mcp-agents?hide_repo_select=true&ref=main&quickstart=true)
![Node version](https://img.shields.io/badge/Node.js->=22-3c873a?style=flat-square)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Fastify](https://img.shields.io/badge/Fastify-black?style=flat-square&logo=fastify)](https://www.fastify.io)

[Overview](#overview) • [MCP tools](#mcp-tools) • [Development](#development)

</div>

## Overview

This is the Pizza MCP server, exposing the Pizza API as a Model Context Protocol (MCP) server. The MCP server allows LLMs to interact with the pizza ordering process through MCP tools.

This server supports the following transport types:
- **Streamable HTTP**
- **SSE** (legacy, not recommended for new applications)
- **Stdio** (currently only supported when starting the server locally with `npm start`)

The remote server is deployed with [Azure Container Apps](https://learn.microsoft.com/azure/container-apps/overview).

<div align="center">
  <img src="../pizza-api/docs/images/architecture.drawio.png" alt="Service architecture" />
</div>

## MCP tools

The Pizza MCP server provides the following tools:

| Tool Name | Description |
|-----------|-------------|
| get_pizzas | Get a list of all pizzas in the menu |
| get_pizza_by_id | Get a specific pizza by its ID |
| get_toppings | Get a list of all toppings in the menu |
| get_topping_by_id | Get a specific topping by its ID |
| get_topping_categories | Get a list of all topping categories |
| get_orders | Get a list of all orders in the system |
| get_order_by_id | Get a specific order by its ID |
| place_order | Place a new order with pizzas (requires `userId`) |
| delete_order_by_id | Cancel an order if it has not yet been started (status must be `pending`, requires `userId`) |

## Test with MCP inspector

First, you need to start the Pizza API and Pizza MCP server locally.

1. In a terminal window, start MCP Inspector:
    ```bash
    npx -y @modelcontextprotocol/inspector
    ```
2. Ctrl+click to load the MCP Inspector web app from the URL displayed by the app (e.g. http://127.0.0.1:6274)
3. In the MCP Inspector, set the transport type to **HTTP** and 
3. Put `http://localhost:3000/mcp` in the URL field and click on the **Connect** button.
4. In the **Tools** tab, select **List Tools**. Click on a tool and select **Run Tool**.

> [!NOTE]
> This application also provides an SSE endpoint if you use `/sse` instead of `/mcp` in the URL field. 

## Development

### Getting started

Follow the instructions [here](../../README.md#getting-started) to set up the development environment for the entire Pizza MCP Agents project.

### Run the application

You can run the following command to run the application server:

```bash
npm start
```

Alternatively, you can also use Docker to run the application:

```bash
npm run docker:build
npm run docker:run
```

This will start the application in a Docker container. The MCP server is then available at `http://localhost:3000/sse` or `http://localhost:3000/mcp` for the SSE and streamable HTTP endpoints, respectively.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the MCP server with HTTP and SSE endpoints |
| `npm run start:local` | Start the MCP server with STDIO transport |
| `npm run dev` | Start the MCP server with hot reload |
| `npm run dev:local` | Start the MCP server with hot reload and STDIO transport |
| `npm run build` | Build the TypeScript source |
| `npm run clean` | Clean build artifacts |
| `npm run docker:build` | Build the Docker image for the MCP server |
| `npm run docker:run` | Run the Docker container for the MCP server |

### Configuration

The application uses environment variables for configuration:

| Variable | Description | Default |
|----------|-------------|---------|
| `PIZZA_API_URL` | URL of the Pizza API server | `http://localhost:7071` |

> [!NOTE]
> When running locally without any Pizza API configuration set, the MCP server will default to using the local Pizza API server at `http://localhost:7071`. If the Pizza API is not running, the MCP server will log an error when receiving tool requests.
