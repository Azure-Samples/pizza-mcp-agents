<div align="center">

# Azure Container Apps Pizza MCP server

[![Open project in GitHub Codespaces](https://img.shields.io/badge/Codespaces-Open-blue?style=flat-square&logo=github)](https://codespaces.new/Azure-Samples/pizza-mcp-agents?hide_repo_select=true&ref=main&quickstart=true)
![Node version](https://img.shields.io/badge/Node.js->=22-3c873a?style=flat-square)

[Overview](#overview) • [MCP tools](#mcp-tools) • [Development](#development)

</div>

## Overview

This is the Pizza MCP server, exposing the Pizza API as a Model Context Protocol (MCP) server. The MCP server allows LLMs to interact with the pizza ordering process through MCP tools.

This server supports the following transport types:
- **SSE**
- **Streamable HTTP**
- **Stdio** (currently only supported when starting the server locally with `npm start`)

The remote server is deployed with [Azure Container Apps](https://learn.microsoft.com/azure/container-apps/overview).

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
3. In the MCP Inspector, set the transport type to **SSE** and 
3. Put `http://localhost:3000/sse` in the URL field and click on the **Connect** button.
4. In the **Tools** tab, select **List Tools**. Click on a tool and select **Run Tool**.

> [!NOTE]
> This application also provides a streamable HTTP endpoint if you use `/mcp` instead of `/sse` in the URL field. 

## Development

### Setup development environment

You can run this project directly in your browser by using GitHub Codespaces, which will open a web-based VS Code.

1. [**Fork**](https://github.com/Azure-Samples/pizza-mcp-agents/fork) the project to create your own copy of this repository.
2. On your forked repository, select the **Code** button, then the **Codespaces** tab, and clink on the button **Create codespace on main**.
   ![Screenshot showing how to create a new codespace](../../docs/images/codespaces.png?raw=true)
3. Wait for the Codespace to be created, it should take a few minutes.

If you prefer to run the project locally, follow [these instructions](../../README.md#use-your-local-environment).

### Run the application

You can run the following command to run the application server:

```bash
npm start:server
```

Alternatively, you can also use Docker to run the application:

```bash
npm run docker:build
npm run docker:run
```

This will start the application in a Docker container. The MCP server is then available at `http://localhost:3000/sse` or `http://localhost:3000/mcp` for the SSE and streamable HTTP endpoints, respectively.
