# LD Group — Cash Position & Daily Dashboard
**Last Updated: 2026-04-20**

---

## Current Status

**Cash status**: Stretched, watchful. Random pressure (not seasonal) — driven by delayed payments and unexpected large buys.
**Consolidated cash view**: DOES NOT EXIST. Building this is Group Priority #3.

---

## Daily Cash Dashboard Project

**Goal**: One number, every morning, across all 4 companies.

### The Daily Brief (5 lines, by 9am)

```
LD GROUP CASH BRIEF — [date]

1. Total cash on hand (all 4 companies, all banks):   ₹X Cr
2. Net receivables due this week:                      ₹Y Cr
3. Net payables due this week:                         ₹Z Cr
4. Projected cash at end of week:                      ₹W Cr
5. Red flags (if any):                                  [list]
```

### Build Phases

| Phase | Timeline | Method |
|---|---|---|
| **Phase 1** | Weeks 1–2 | Manual. Accounts team fills Google Sheet by 9am. Proves the habit. |
| **Phase 2** | Months 2–3 | Semi-automated. Daily ERP CSV exports → Apps Script pulls → validated by accounts. |
| **Phase 3** | Month 4+ | Automated dashboard. Real-time bank feeds. Drill-down per company. |

### Auto-Flag Conditions (trigger review)

- Cash drops >20% week-over-week
- Any receivable >₹50L overdue >30 days → flag with customer name
- Any payable >₹50L due in 3 days without cash cover
- Vhagar marketing burn without matching sales
- Cotton fixed-cost burn without utilization improvement
- Any single bank account below ₹10L

---

## Weekly Cash Council

**When**: Mondays 9:15am | **Duration**: 15 min

Agenda:
1. Review last week actual vs projected
2. Flag red alerts
3. Decide any payment accelerations or deferments

**Owners**: Dilip + Naushi + Mahesh + Raghav

---

## Open Action

- Phase 1 (manual Google Sheet) has not started yet. Dilip + Naushi + Mahesh to kick off.
- No bank account balances captured in the brain yet.
