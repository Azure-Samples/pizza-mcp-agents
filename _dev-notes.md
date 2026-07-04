# Dev Notes




## Consume MCP Server


Good news: the repo already has a fast path documented, and since you deployed to Azure last week, the *fastest* option needs no local setup at all.

## Fastest — MCP Inspector against your deployed server

The MCP server runs on Azure Container Apps and exposes `/mcp`. Just point the official inspector at it:

## Start RestClient
code src/pizza-api/api.http

https://func-pizza-api-rgx6n3tlqbfzq.azurewebsites.net/api/pizzas
Accept: application/json


MCP Inspector:

```bash
npx -y @modelcontextprotocol/inspector
```

Then in the web UI it opens (e.g. `http://127.0.0.1:6274`):
1. Transport type → **Streamable HTTP**
2. URL → `https://ca-pizza-mcp-rgx6n3tlqbfzq.kindwave-94c4ef22.swedencentral.azurecontainerapps.io/mcp.    
    (https://<your-container-app-url>/mcp - ACA Url appended with /mcp)`
3. **Connect** → **Tools** tab → **List Tools** → pick one → **Run Tool**

That's the whole loop. No Pizza API to start, no build — it hits the live backend. (Grab the URL from the Container App in the portal, or `azd env get-values` / your deploy output.)

> Quick sanity check first: open `https://<your-container-app-url>/` in a browser — the root returns a JSON status with the API URL it's using (server.ts).

## If you'd rather run it locally

---


Two processes, because the MCP server is just a facade over the REST API (config.ts defaults to `http://localhost:7071`):

```bash
# Terminal 1 — Pizza API (Functions) on :7071
cd src/pizza-api && npm install && npm start

# Terminal 2 — MCP server on :3000
cd src/pizza-mcp && npm install && npm start
```

Then run the inspector and connect to `http://localhost:3000/mcp`.

## Even simpler if you just want it inside an agent

The server also supports **stdio** (local.ts) via `npm run start:local` — that's the mode VS Code / Claude Desktop launch directly through an MCP client config, so you skip the inspector entirely and test from a real LLM.

| Goal | Fastest route |
|------|---------------|
| Poke tools manually, no setup | MCP Inspector → deployed `/mcp` |
| Manual + offline/local | Run API + MCP locally, Inspector → `localhost:3000/mcp` |
| Test from an actual agent | stdio (`npm run start:local`) wired into VS Code MCP config |

Your action: confirm whether you want the **deployed** URL route (tell me if you don't have the Container App URL handy — I can pull it from the infra/azd config) or the **local** route, and I'll give you the exact next command.