# YOU & I CREATION AI Assistant — Working Copy

This ZIP is a separate copy of the original website backup with a basic customer-facing AI assistant added.

## Added
- Floating “Ask YOU & I” assistant button/chat panel in `index.html`.
- Vercel serverless endpoint: `api/assistant.js`.
- Server-side product catalogue lookup through the existing `api/_product-store.js`.
- Business-specific rules for product prices/stock, service enquiries, inspections, WhatsApp, and escalation.

## Required environment variables (Vercel)
- `OPENAI_API_KEY` — required to enable AI responses.
- `OPENAI_MODEL` — optional; defaults to `gpt-4.1-mini`.
- Existing Supabase variables must be present for the catalogue lookup: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

## Current scope and limitations
- The assistant fetches product catalogue data on the server and passes a limited selection into the AI prompt.
- The assistant does NOT yet connect to customer orders, order status, payment verification, or interior-project billing/completion records.
- Product lookup uses the existing Products table schema (`Name`, `Price`, `Image url`, `Category`, `Stock`, `Description`).
- Never expose Supabase service-role credentials to the browser.
- No Rewards feature was added.
- No changes were made to live Vercel, Supabase, or the deployed website.

## Deployment
Do not deploy until the user explicitly approves. Test the separate copy first.


## Secure customer order tracking (working-copy update)
- The Track Order page now asks for tracking ID, checkout email, and checkout phone.
- The server verifies email and phone against the order record before returning the limited tracking summary.
- Tracking ID alone is not enough to view order details.
- Customer verification details are checked server-side and are not returned in the response. Tracking lookup uses POST (not URL query parameters) to reduce exposure in URL/access logs.
- The AI chat does not access private order records; it directs customers to the Track Order page.
- This is a code-level update in the separate working copy. It still requires testing with the actual Vercel/Supabase environment before deployment.
