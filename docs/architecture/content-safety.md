# Content Safety 

Read Check: inspect or block malicious

Yes — provisioning Azure AI Content Safety is quick, and your instinct about placement is exactly right.

## Content Safety as a shared resource

It's a **standalone Azure AI service** (one endpoint + key) that any number of apps can call. Treating it as **shared infrastructure in its own resource group** is the correct pattern — same logic you applied to APIM and Log Analytics.

```
rg-shared-ai/
   └─ Azure AI Content Safety  ◄── APIM (Pizza), other apps, future projects
```

Not in the pizza RG — it's cross-cutting, like a platform service.

## Quick provision (Portal)

**1.** Portal → **Create resource** → search **Content Safety** → **Create**.

**2.** Settings:
- **Subscription:** your sub
- **Resource group:** a shared one (e.g. `rg-shared-ai`) — create new if needed
- **Region:** **swedencentral** (match APIM to minimize latency; verify Content Safety is available there — if not, pick the nearest supported, e.g. westeurope)
- **Name:** `cs-shared` (or similar)
- **Pricing tier:** **Free (F0)** is fine for a demo (limited QPS); **S0** for real volume
- Create → wait ~1 min.

**3.** After deploy → resource → **Keys and Endpoint** → copy:
- **Endpoint** (e.g. `https://cs-shared.cognitiveservices.azure.com/`)
- **Key 1**

## How APIM will use it

The MCP content-safety policy (`llm-content-safety` or a custom `send-request` to the Content Safety REST API) runs in **inbound**, inspects the request body (the MCP tool arguments / prompt), and **blocks** if it exceeds severity thresholds for hate/violence/sexual/self-harm — returning a 4xx before the backend is hit.

> Auth note: APIM → Content Safety can use the **key** (simplest) or **managed identity** (cleaner). For the demo, the key via a `named value` is fastest; we can mention MI as the production upgrade.

## ⚠️ One caveat for MCP specifically
Content Safety is built to score **natural-language text**. MCP tool calls are **JSON-RPC** payloads — so the policy needs to **extract the meaningful text** (e.g. a tool argument like an order note) and send *that* to Content Safety, not the raw JSON envelope. We'll target a specific field so the demo is meaningful (e.g. screen a free-text `nickname`/`note` argument for abuse).

Your action: provision **Content Safety** in a shared RG (Free tier, swedencentral or nearest supported), grab the **Endpoint + Key**, and tell me when ready. Also confirm: should APIM authenticate to it with the **key** (fast) or **managed identity** (cleaner)? Then I'll build the content-safety policy.


Read Check: production upgrade. One caveat

You're right — **no language model in this resource group.** Confirmed from your inventory:

| Resource | Type |
|----------|------|
| `appi-…` | Application Insights |
| `ca-pizza-mcp-…` | Container App (the MCP server) |
| `cae-…` | Container Apps Environment |
| `cosmos-…` | Cosmos DB |
| `crr…` | Container Registry |
| `dash-…` | Shared dashboard |
| `func-pizza-api-…` | Function App (REST API) |
| `func-registration-api-…` | Function App |
| `id-pizza-mcp-…` | Managed Identity |
| `log-…` | Log Analytics workspace |
| `pizza-webapp` | Static Web App (front end) |
| `plan-…` ×2 | App Service plans |
| `registration-webapp` | Static Web App |
| `str…` | Storage account |

**No Azure OpenAI, no Content Safety, no Cognitive Services.** So the app's "natural language" isn't processed by any LLM here — it's just free-text fields (pizza nicknames/notes) stored and passed through. There's nothing AI-based to govern *yet*.

## What this clarifies

The "NL" in the front end is **user-entered text**, not model I/O. That's actually a **great fit for Content Safety** — you'd screen that user text for abuse before it's stored/processed. But it requires provisioning the Content Safety resource (none exists).

## Important: this is shared infra, outside the pizza project

You said it yourself — Content Safety would be **shared across many apps** and **shouldn't live in the pizza RG**. That makes provisioning it a **separate infrastructure decision**, not part of "finishing the pizza backend."

So two honest paths:

1. **Provision shared Content Safety now** (in a new `rg-shared-ai`) → then I build the APIM content-safety policy that screens the free-text field. Completes the content-safety layer.
2. **Defer content safety** (since the shared resource is a broader infra decision) and instead **close the MCP backend with rate limiting** — which needs no new resources and is already written.

Given you wanted the **backend complete** and content safety needs net-new shared infra, my recommendation: **finish rate limiting now** (zero dependencies, marks a governance layer done), and treat **Content Safety as a deliberate shared-infra provisioning task** you do when you're ready to stand up `rg-shared-ai`.

Your action: pick —
- **"rate limiting"** → I'll have you paste the parked policy and demo the 429s (backend effectively complete), or
- **"provision content safety"** → spin up the shared resource, then I build the screening policy.