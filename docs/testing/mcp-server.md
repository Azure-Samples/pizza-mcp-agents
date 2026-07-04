# Testing MCP Server    

Read Check: holds the real MCP

Policy saved. Now validate the wiring end to end.

## Step 5 — Test

**1.** In APIM, from **POST /mcp** operation navigate to the **Test** tab.

**2.** Scroll to **Request body** → set type to **raw**, content-type `application/json` → paste:
```json
{ "jsonrpc": "2.0", "id": 1, "method": "initialize", "params": { "protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": { "name": "apim-test", "version": "1.0" } } }
```

**3.** Also add a request **header** (MCP servers require it):
- Name: `Accept`
- Value: `application/json, text/event-stream`

**4.** Click **Send**.

## What to expect
- **200 OK** with a JSON-RPC result (server name, version, capabilities) → wiring works. ✅
- **406 / "Not Acceptable"** → the `Accept` header is missing or wrong (fix step 3).
- **404** → operation path or suffix mismatch.
- **500 / 502** → backend URL or routing issue.

Your action: click **Send** and tell me the **HTTP status** (and the first line of the response body if it's not 200) — then we troubleshoot or move to the Product + Subscription step.