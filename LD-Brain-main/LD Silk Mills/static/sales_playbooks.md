# LD Silk Mills — Sales Playbooks
**Last Updated: 2026-04-20**

---

## Playbook A — Agent Quality + Activation

**Goal**: Net-value optimization of 220 active agents (not just activation of dormant ones).

1. Extract net-value ranking: Pull agent-attributed revenue + return rates from SAB. Calculate Net Broker Value per agent.
2. Tier within the 220 active agents (see agent_network.md for tiering framework)
3. Structural conversations with all brokers >30% return rate (MRT protocol)
4. Platinum program for top-20: monthly founder-level call, first-look fabric drops, fast commission pay
5. **Measure**: agent net-realized revenue per month (not gross), return rate per agent, trend

**First-week action**: SAB extract of all 576 agents with gross revenue + return volume. Build net-value ranking. Identify all >30% return rate brokers.
**Success metric**: Structural conversations with all >30% brokers within 60 days; net-realized broker revenue as standing dashboard metric.

---

## Playbook B — Silk → Linkd Cross-Sell

**Goal**: Convert Silk customers to Linkd jobwork customers at near-zero acquisition cost.

1. Filter Silk customers buying poly / print-friendly substrates (Tier 4 Digital Quality)
2. Prioritize top 500 by revenue
3. Send free printed sample on their existing fabric with their name on it
4. Linkd NBD lead follows up within 48 hours
5. Both Silk SP and Linkd side get credit for closed conversion

**Return-Rate Filter (mandatory)**: Before routing any broker-driven customer to Linkd, cross-reference Silk broker data. Any Silk broker with >30% trailing return rate must NOT be activated for Linkd until their Silk structural conversation is complete.

**First-week action**: SAB export of Silk customers with >50% poly purchases. Top 20 for pilot.
**Success metric**: 10% conversion of top 500 = 50 new Linkd accounts in 90 days.

---

## Playbook C — Key Account Growth (Wallet Share)

**Goal**: Lift wallet share with top 20 Silk customers.

1. Pick top 20 by revenue
2. Map: what we sell them / what they buy elsewhere / what we could sell them
3. Quarterly Business Review (Gaurav-led) with each top customer
4. Ask: "What else are you sourcing? What would make you consolidate with us?"
5. Cross-sell Silk ↔ Linkd ↔ Cotton where applicable

**First-week action**: Pick ONE top customer. Write a one-page wallet-share sheet. Call this week.
**Success metric**: Wallet share baselined on top 20 within 30 days; top 10 have monthly touch cadence.

---

## Playbook D — Silk Top-10 Proactive Defense

**Goal**: Stop losing top-10 customers silently (Chur Textiles is the live example of failure).

- Monthly proactive call cadence with all top 10 (not waiting for problems)
- Named relationship owner per account
- Early-warning signals: drop in order frequency, slower payments, quieter calls → trigger founder-level outreach
- Cross-sell Linkd to top-10 as a dilution strategy — harder to churn a customer buying from two companies

---

## SP Triage Plan

**Reality**: 3–5 of 20 SPs drive 70%+ of revenue. 15+ SPs are unmeasured, passive, or dormant.

**Three buckets (once net-revenue data lands from Mahesh's SAB extract):**
1. **Retain core** (3–5 SPs): investment, recognition, retention plans
2. **Reactivate middle** (~5–7 with potential): coaching, targets, 90-day trial
3. **Decisions on bottom** (~8–10): performance conversation or exit

**⚠️ SP Assignment Gap**: All major T12 accounts show "Not Assigned" in SAB. Gaurav to assign named SP to all top-50 accounts by T12 volume. Required for SP reporting to work.

---

## CRM & Pipeline

**Current stack**: Google Sheets + Apps Script (custom-built) | SAB (orders, invoicing, agent attribution)

**Pipeline stages:**
1. New enquiry → 2. Qualified → 3. Sample sent → 4. Quoted → 5. Negotiation → 6. Closed-won → 7. Closed-lost (with reason code) → 8. Dormant

**Rule**: Every enquiry has a named owner and last-touch date. No orphans.

**Data to build**:
- Conversion rate per stage
- Cycle time per stage
- Closed-lost reason codes
- Source attribution — which channel converts best?

**Migrate off Google Sheets when**: >200 active enquiries/month OR multi-company CRM needed OR role-based access control is breached.
