# Linkd Prints — Capacity Specifications
**Last Updated: 2026-04-20 | Source: Phase 3 ERP Extract**

---

## Printing Machines — 10 Total

| Machine | Model Name | Print Heads | Max Width | Capacity/Day (Mtrs) | Status |
|---|---|---|---|---|---|
| 1 | Pantone (3-head) | 3 | 72" | 1,200 | **IDLE** |
| 2 | Pantone (3-head) | 3 | 72" | 1,200 | **IDLE** |
| 3 | **PANTONE L1916** | 16 | 72" | 4,800 | Active |
| 4 | **PANTONE XENONS** | 8 | 72" | 1,200 | Active |
| 5 | Pantone (3-head) | 3 | 72" | 1,200 | **IDLE** |
| 6 | Pantone (3-head) | 3 | 72" | 1,200 | **IDLE** |
| 7 | Pantone (3-head) | 3 | 72" | 1,200 | **IDLE** |
| 8 | **PANTONE XENONS** | 8 | 72" | 3,000 | Active |
| 9 | **PANTONE L1912** | 12 | 72" | 4,000 | Active |
| 10 | **PANTONE L1916** | 16 | 72" | 4,800 | Active |
| **Active total** | | | | **17,800 mtrs/day** | |
| **Idle total** | | | | **6,000 mtrs/day** | |
| **All 10 total** | | | | **23,800 mtrs/day** | |

*Active fleet: 1× L1912 (12-head), 2× L1916 (16-head), 2× XENONS (8-head). All 72" max width. Idle machines are older 3-head units — smaller capacity, suitable for lower-complexity overflow jobs.*

**Key observations:**
- The 5 idle machines are ALL 3-head (small) units at 1,200 mtrs/day each. The active machines are the high-capacity ones.
- If the 5 idle printing machines were reactivated: +6,000 mtrs/day theoretical → +~90,000 mtrs/month practical (at 50% efficiency). **Zero capex required.**
- Idle machines handle lower complexity/smaller jobs. If Book B2 volumes grow, reactivating them for overflow is a credible path.

---

## Fusing Machines — 2 Total (Both Active)

| Machine | Type | Model | Capacity/Day (Mtrs) | Fusing Speed | Status |
|---|---|---|---|---|---|
| 1 | Fusing | Mahaveer Engineer | 5,000 | 60–90 m/hr at 185–230°C | Active |
| 2 | Fusing | Mahaveer Engineer | 14,000 | 60–90 m/hr at 185–230°C | Active |
| **Total** | | | **19,000 mtrs/day** | | |

**Fusing is MANDATORY for every job** — it is the sublimation transfer step where the printed paper and grey fabric go through the fusing machine together, transferring the design into the polyester fibers permanently. No job can complete without fusing.

**Fusing capacity (19,000 mtrs/day) is well above active printing capacity (17,800 mtrs/day) — fusing is NOT the bottleneck. Printing is the constraint.** The fusing machines can handle more than the printing machines can feed them.

---

## Capacity Summary

| Metric | Value |
|---|---|
| **Active printing capacity (practical)** | ~350,000 mtrs/month |
| **Current output** | ~164,549 mtrs/month (≈47%) |
| **Book A — LD Silk captive** | 126,865 mtrs/month |
| **Book A — LD Cotton captive** | 1,087 mtrs/month |
| **Book B1 (traders, 28 parties)** | ~36,597 mtrs/month |
| **Book B2 (direct brands)** | 0 today |
| **Spare capacity** | **~185,451 mtrs/month** |
| **12-month target** | 300,000 mtrs/month (86% utilization) |
| **If idle machines reactivated** | +~90,000 mtrs/month additional |
| **Total Linkd jobwork revenue (T12)** | ₹7.66 Cr |

---

## Calendar Machine Technical Specs

| Spec | Value |
|---|---|
| Max fabric width | 72" (1,829 mm) |
| Temperature range | 100°C – 220°C |
| Pressure | 5 – 50 tons (variable hydraulic) |
| Speed | 30 – 80 meters/min |
| Roller type | Polished steel + cotton-composite rollers |
| Compatible fabrics | Polyester, viscose, silk blends, cotton-synthetic |

---

## Capacity Allocation Policy (OPEN — Must Write)

When both captive and external work compete for machine time, how does machine allocation happen?
- **Status**: No written rule exists. Must be documented.
- **Owner**: Raghav
- **Principle**: Protect Book B growth; don't starve it for captive overflow.
