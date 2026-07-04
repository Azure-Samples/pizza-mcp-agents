# App Insights & Obv

## Log Analytics

Read Check: provision one workspace-based App

Correct — that's the recommended pattern. **One Log Analytics workspace serving many apps**, with separate App Insights *components* feeding into it.

## The two layers (don't conflate them)

| Layer | Recommended count | Role |
|-------|------------------|------|
| **Log Analytics workspace** | **One** (shared) | The data lake — stores all telemetry; where you run KQL across everything |
| **Application Insights component** | **One per app/workload** | The telemetry "lens" each app reports through; all point at the shared workspace |

```
App Insights: pizza-mcp     ─┐
App Insights: pizza-rest     ─┼──► one shared Log Analytics workspace
App Insights: (future apps)  ─┘        (single KQL surface)
```

## Why this is best practice
- **Unified querying** — one workspace = cross-app KQL joins, correlation, one cost/retention policy.
- **Per-app clarity** — each App Insights component keeps its own App Map node, role name, and dashboards, so apps stay distinguishable.
- **RBAC + billing** — managed once at the workspace.

## So this refines my earlier answer
Earlier I said "one App Insights instance" for the MCP-vs-REST demo. With the workspace pattern, you actually have a clean choice:

- **Option 1 — One shared App Insights for both** (MCP-raw + REST-as-MCP), separated by **API name dimension**. Simplest; both in one component.
- **Option 2 — One App Insights per backend** (`appi-pizza-mcp`, `appi-pizza-rest`), **both feeding the one shared workspace**. Cleaner separation (distinct App Maps), still unified KQL at the workspace.

For your **side-by-side governance demo**, **Option 2 is actually nicer** now that we're workspace-based: two distinct App Insights nodes (clear "MCP vs REST" separation in dashboards/App Map) but **one workspace** so you can still query them together. It aligns exactly with the best practice you cited.

## Provisioning order
1. **Create/choose one Log Analytics workspace** (swedencentral) — shared.
2. **Create App Insights component(s)** → set **Resource mode = Workspace-based** → point to that workspace.
   - Option 1: one component now (`appi-pizza`).
   - Option 2: `appi-pizza-mcp` now, `appi-pizza-rest` later.
3. Grab the **Connection String** of the component APIM will log to.

Your action: tell me **Option 1 (one shared App Insights)** or **Option 2 (one per backend, shared workspace)** — then provision the workspace + component(s), grab the **Connection String**, and I'll wire APIM's Logger + Diagnostics to it.



## App Insight

Ques: Going to expose both MCP server raw and then the Rest backend as an MCP server. Would it be wise to have two App Insights instances?

Read Check: governance policies → I'd

Good architecture question. Short answer: **No — use one App Insights instance**, separate by dimensions instead.

## Why one instance is better here

| Concern | One instance + dimensions | Two instances |
|---------|--------------------------|---------------|
| **Cross-cutting demo story** | ✅ Single pane to compare MCP-raw vs REST-as-MCP side by side in one query | ❌ Must jump between resources, can't easily join |
| **Correlation** | ✅ End-to-end traces follow a request across both in one place | ❌ Broken correlation across resources |
| **Cost / quota** | ✅ One ingestion stream, simpler caps | ❌ Two to manage |
| **APIM wiring** | ✅ APIM has one Logger; APIs point to it | ❌ Multiple loggers to maintain |

## How you separate the two backends *within* one instance

You don't need separate instances to tell them apart — you tag telemetry:

1. **By API name** — APIM automatically stamps the **API name** on every request telemetry record. So `Pizza MCP` vs `Pizza REST (as MCP)` are already distinguishable in `requests` by the `name`/`url` dimension.
2. **Custom dimension** (optional, stronger) — add a header/property in the APIM policy, e.g. `set-header backend-flavor: mcp-raw` vs `rest-as-mcp`, surfaced as a custom dimension.
3. **Cloud role name** — keep each app's role distinct so the App Map shows two nodes feeding one instance.

Then in App Insights you filter/group: `requests | summarize count() by tostring(customDimensions.apiName)`.

## When two instances *would* make sense (not your case)
- Different teams/owners with separate RBAC and billing boundaries.
- Compliance requiring data isolation.
- Wildly different retention/sampling needs.

For a **single demo comparing MCP vs REST governance**, one instance is the right call — it's literally the better story because you can chart them together.

## Provisioning tip
When you create it, also note:
- **Workspace-based** App Insights (the modern default — backed by a Log Analytics workspace). Pick or create a workspace.
- Same **region** as APIM (swedencentral) to minimize egress and latency.
- Grab the **Connection String** (not just the instrumentation key) — that's what the APIM Logger will use.

Your action: provision **one workspace-based App Insights** in swedencentral, grab its **Connection String**, and tell me when it's ready — then I'll walk you through wiring APIM's **Logger + Diagnostics** to it and adding the observability policy to the Pizza MCP API.