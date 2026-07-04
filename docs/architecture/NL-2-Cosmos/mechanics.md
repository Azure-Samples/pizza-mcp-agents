User: How do I run this app

GitHub Copilot: Read Check: Default language is Python.

Let me look at the project's docs to give you accurate run instructions.  

Read [](file:///Volumes/robvet-stuff/_vetCode/_ai/_demos-27/Pizza-Demos/MCP/pg-pizza-mcp-agents/package.json)

Read [](file:///Volumes/robvet-stuff/_vetCode/_ai/_demos-27/Pizza-Demos/MCP/pg-pizza-mcp-agents/README.md#1-1), lines 1 to 200

To run this app locally:

```bash
# From the project root — installs deps for all services (preinstall runs automatically)
npm install

# Start all services concurrently
npm start
```

That brings up:
- **Pizza web app** → http://localhost:4280
- **Registration web app** → http://localhost:5173
- **Pizza API** (Azure Functions) → http://localhost:7071
- **Pizza MCP server** → http://localhost:3000/mcp

Prerequisites: Node.js ≥ 22, Docker, and (only if the API fails to auto-start) Azure Functions Core Tools.

Notes:
- Running locally without an Azure deploy uses **in-memory storage**, so data resets when you stop the servers.
- To exercise the MCP server, either launch the MCP Inspector with `npx -y @modelcontextprotocol/inspector` and connect to `http://localhost:3000/mcp`, or wire it into GitHub Copilot via a mcp.json file.
- To deploy to Azure instead: `azd auth login` then `azd up`.

Your action: run `npm install && npm start` from the repo root, then open http://localhost:4280.

User: Somewhere in this app lies a component that does txt-2-sql, or, at least, a sql dialect that Cosmos DB can understand. Can you locate it please

GitHub Copilot: Read Check: Pizza API and

Let me search for Cosmos DB query construction in the codebase.  

Searched codebase for "text to SQL natural language to Cosmos DB query generation", 10 results

Searched for regex `SELECT .* FROM|querySpec|query:|CosmosClient|container\.items\.query|cosmos`, 20 results

Found it. There's no LLM-style natural-language-to-SQL component in this repo, but the place that **dynamically builds Cosmos DB NoSQL SQL queries** is in the Pizza API's database service.

**File:** db-service.ts

The key method is `DbService.getOrders()` (around db-service.ts), which assembles a parameterized Cosmos DB SQL string from filter options:

```ts
// Build Cosmos DB SQL query dynamically
let query = 'SELECT * FROM c';
const filters: string[] = [];
const parameters: { name: string; value: any }[] = [];
if (userId) {
  filters.push('c.userId = @userId');
  parameters.push({ name: '@userId', value: userId });
}
if (statuses && statuses.length > 0) {
  filters.push('ARRAY_CONTAINS(@statuses, LOWER(c.status))');
  parameters.push({ name: '@statuses', value: statuses.map((s) => s.toLowerCase()) });
}
if (lastMs && lastMs > 0) {
  const since = new Date(Date.now() - lastMs).toISOString();
  filters.push('c.createdAt >= @since');
  parameters.push({ name: '@since', value: since });
}
if (filters.length > 0) {
  query += ' WHERE ' + filters.join(' AND ');
}
const querySpec = { query, parameters };
```

This is the Cosmos DB **NoSQL (SQL API) dialect** — note the Cosmos-specific idioms like `FROM c`, `ARRAY_CONTAINS()`, `LOWER()`, and `@param` bindings.

Other spots in the same file that emit Cosmos SQL (simpler, static queries):
- `getPizzas()` / `getToppings()` → `SELECT * FROM c` ([~line 178](src/pizza-api/src/db-service.ts#L178))
- `getToppingsByCategory()` → `SELECT * FROM c WHERE c.category = @category` ([~line 226](src/pizza-api/src/db-service.ts#L226))
- `seedInitialDataIfEmpty()` → `SELECT VALUE COUNT(1) FROM c` ([~line 153](src/pizza-api/src/db-service.ts#L153))
- `getRegisteredUsers()` → `SELECT VALUE COUNT(1) FROM c` ([~line 463](src/pizza-api/src/db-service.ts#L463))

One clarification: the term "text-2-sql" usually means an AI that turns a user's natural-language question into SQL. That does **not** exist here — the MCP server exposes fixed, typed tools (`get_orders`, `place_order`, etc.) rather than free-form query generation. The dynamic query builder above is the closest match.

Want me to look at whether the MCP tools layer (tools.ts) passes any free-text query through to these methods?

User: No, there is natural language being input. 

GitHub Copilot: Read Check: using the Azure Developer

Let me dig deeper into the MCP tools and any LLM/agent code that might accept free text.  

Searched for regex `chat\.completions|ChatCompletion|systemPrompt|system prompt|prompt|natural language|nl2sql|text-to-sql|text2sql|generateQuery|AzureOpenAI|openai`, 20 results

Read [](file:///Volumes/robvet-stuff/_vetCode/_ai/_demos-27/Pizza-Demos/MCP/pg-pizza-mcp-agents/src/pizza-mcp/src/tools.ts)

Let me check the orders-get function (which parses human-style filters) and the agent notebook.    

Searched for regex `parseDuration|last|minutes|hours|/\(\\d|regex|match\(|lastMs` (`**/src/pizza-api/**`), 20 results

Read [](file:///Volumes/robvet-stuff/_vetCode/_ai/_demos-27/Pizza-Demos/MCP/pg-pizza-mcp-agents/src/pizza-api/src/functions/orders-get.ts)

User: look at the MCP server

GitHub Copilot: Read Check: Model Context Protocol

Let me read the full MCP server source.    

Read [](file:///Volumes/robvet-stuff/_vetCode/_ai/_demos-27/Pizza-Demos/MCP/pg-pizza-mcp-agents/src/pizza-mcp/src/mcp.ts)

Read [](file:///Volumes/robvet-stuff/_vetCode/_ai/_demos-27/Pizza-Demos/MCP/pg-pizza-mcp-agents/src/pizza-mcp/src/server.ts)

I've now read the entire MCP server (mcp.ts, server.ts, tools.ts, config.ts). Here's the honest finding:

**The MCP server itself contains no text-to-SQL and no LLM call.** It is a thin, stateless proxy:

- server.ts — an Express app exposing `/mcp` (Streamable HTTP) and `/sse`. It just manages transport/session plumbing.
- mcp.ts — registers each tool with the MCP SDK and wraps error handling.
- tools.ts — 9 strongly-typed tools (Zod schemas) that each just `fetch()` the Pizza API REST endpoints.

So where does "natural language" enter? **Outside this codebase, in the MCP *client*** (GitHub Copilot, Claude, etc.). The flow is:

```
User free text ("show me pending orders from the last hour")
        ↓   ← natural language lives HERE, in the LLM client
LLM picks a tool + fills structured args
        ↓   MCP protocol (JSON-RPC, structured)
pizza-mcp tools.ts → fetch() → Pizza API REST
        ↓
db-service.ts builds Cosmos NoSQL SQL  ← the "SQL dialect" part
```

The LLM is what converts natural language → structured tool arguments. The server never sees free text turned into SQL.

The only "human-ish" parsing inside the app is lightweight, not AI:
- `get_orders` tool accepts `last: "60m"` / `"2h"` and `status` as a comma list ([tools.ts ~line 50](src/pizza-mcp/src/tools.ts#L50)).
- The Pizza API parses that `"60m"/"2h"` string with a regex `^(\d+)([mh])$` in orders-get.ts, converting it to `lastMs`, which then feeds the dynamic Cosmos SQL builder in db-service.ts.

So the two halves you're describing are split:
1. **Natural language → structured args** = the external LLM client (not in this repo).
2. **Structured args → Cosmos NoSQL SQL** = db-service.ts `getOrders()`.

Is it possible you're thinking of a different entry point — e.g. the agent notebook agent.ipynb.md or a Copilot prompt doc — where a natural-language prompt is wired to the model? I can inspect that next if so.

User: So the prompts instructs the LM to do all this?

GitHub Copilot: Read Check: Pizza tools to interact

Essentially, yes — but it's split across three layers of natural-language instructions, none of which is hand-written SQL. Here's exactly what "instructs" the model:

**1. The server-level description** (mcp.ts):
```
'Pizza tools to interact with the pizza API. Use these tools whenever you
 need information about pizzas, toppings, and orders. You can also use them
 to place new pizza orders and manage existing orders.'
```
This tells the model *when* to reach for this toolset at all.

**2. Each tool's `description` + Zod schema `.describe()` strings** (tools.ts) — these are the real instructions. For `get_orders`:
```ts
description: 'Get a list of orders in the system',
schema: z.object({
  userId: z.string().optional().describe('Filter orders by user ID'),
  status: z.string().optional().describe('Filter by order status. Comma-separated list allowed.'),
  last:   z.string().optional().describe("Filter orders created in the last X minutes or hours (e.g. '60m', '2h')"),
}),
```
The MCP SDK serializes these into the JSON-Schema the model receives. So the model is *told*: "there's a `last` field, give me something like `'60m'` or `'2h'`." That description is what makes the model convert "in the last hour" → `last: "60m"`. No SQL is ever described to the model.

**3. The model's own training** does the actual mapping (natural language → those structured fields). The repo only supplies the field names, types, and example hints.

So the division of labor is:

| Layer | Who/what | Responsibility |
|-------|----------|----------------|
| Tool descriptions + schemas | This repo (tools.ts) | Tell the model what fields exist and give examples |
| NL → structured args | The LLM (Copilot/Claude) | Interpret the user's sentence, fill the fields |
| structured args → REST query | tools.ts handler | `URLSearchParams` build |
| `"60m"` → `lastMs` | API (orders-get.ts regex) | Parse the shorthand |
| filters → Cosmos NoSQL SQL | db-service.ts `getOrders()` | Build the actual `SELECT ... WHERE` |

The closest thing to a written "prompt" is those `.describe()` strings and tool descriptions — that's the entirety of what this codebase tells the model to do. There is no system prompt in the server, and no place where the model is asked to emit SQL; it only emits structured tool arguments, and your own code turns those into the Cosmos query.

Want me to show the full set of `.describe()` strings across all 9 tools so you can see every instruction the model receives?