# Rate Limiting

The natural next governance policy is rate-limit-by-key — caps calls per subscription key (great demo: hammer it, watch 429s appear in App Insights/GatewayLogs). It's a one-policy add at the All operations inbound scope.

Your action: run the KQL and confirm the /mcp requests appear in App Insights — then tell me to proceed with rate limiting (I'll give you the policy snippet and a way to demo the 429s).

Read Check: hammer it, watch 429s

## Rate limiting for Pizza MCP

We'll add **`rate-limit-by-key`** at the **All operations** inbound scope, keyed on the subscription key — so each client gets their own quota.

## The policy

**1.** APIM → **APIs** → **Pizza MCP** → **Design** → **All operations** → **Inbound processing** → **`</>`**.

**2.** Add the `rate-limit-by-key` line inside `<inbound>`, after `<base />` and before/after `set-backend-service` (order among them doesn't matter for rejection):

```xml
<inbound>
    <base />
    <!--
        Rate limit: max 10 calls per 60 seconds PER subscription key.
        Exceeding it returns HTTP 429 Too Many Requests before the backend is called.
        counter-key uses the subscription id so each client has an independent quota.
    -->
    <rate-limit-by-key calls="10"
                       renewal-period="60"
                       counter-key="@(context.Subscription?.Id ?? context.Request.IpAddress)"
                       remaining-calls-header-name="X-RateLimit-Remaining"
                       total-calls-header-name="X-RateLimit-Limit"
                       retry-after-header-name="Retry-After" />
    <set-backend-service backend-id="pizza-mcp-backend" />
</inbound>
```

**3.** **Save.**

## What each part does
- **`calls="10" renewal-period="60"`** — 10 requests per 60-second sliding window. (Tune for the demo; low numbers make 429s easy to trigger.)
- **`counter-key`** — the quota bucket. `context.Subscription.Id` = per-key limits; falls back to IP if no subscription (defensive).
- **`*-header-name`** — APIM adds response headers so clients see remaining quota and when to retry. Great for the demo visual.

## Demo the 429
Hammer it past 10 calls in a minute:
- **Easiest:** click **Send** on the Test tab ~12 times quickly. Calls 11+ return **429 Too Many Requests** with a `Retry-After` header.
- Watch `X-RateLimit-Remaining` count down to 0, then the 429.

## See it in observability
```kql
requests
| where timestamp > ago(15m)
| where tostring(customDimensions["API Name"]) == "Pizza MCP"
| summarize count() by resultCode
```
You'll see a split of `200` and `429` — concrete proof governance is enforcing.

> ⚠️ Scope note: at **All operations**, the limit covers initialize + every tool call combined. That's fine for the demo. If you'd rather meter only tool *calls* (not the handshake), we'd move it to a per-operation scope later. Also: `rate-limit-by-key` isn't supported on the **Consumption** tier — if you're on Consumption, use `rate-limit` (per-product) instead. Your earlier streaming success suggests you're on a higher tier, so `rate-limit-by-key` should work.

Your action: add the policy, Save, click Send ~12× to trigger 429s, then run the KQL — tell me you see the 200/429 split, and we move to **auth (JWT validation)** or **content safety**, your pick.