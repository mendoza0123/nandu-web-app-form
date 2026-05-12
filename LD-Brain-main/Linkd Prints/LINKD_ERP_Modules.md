---
title: "LINKD ERP — Complete Module & Sub-Module Documentation"
---

<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a1a; }
  h1 { font-size: 26px; color: #1a1a2e; border-bottom: 3px solid #e63946; padding-bottom: 10px; }
  h2 { font-size: 18px; color: #e63946; background: #fff5f5; padding: 8px 14px; border-left: 5px solid #e63946; margin-top: 32px; page-break-before: always; }
  h2:first-of-type { page-break-before: avoid; }
  h3 { font-size: 14px; color: #1a1a2e; margin-top: 16px; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0 18px 0; font-size: 12px; }
  th { background: #1a1a2e; color: #ffffff; padding: 8px 10px; text-align: left; }
  td { padding: 7px 10px; border-bottom: 1px solid #e8e8e8; vertical-align: top; }
  tr:nth-child(even) td { background: #f9f9f9; }
  .cover { text-align: center; padding: 60px 0 40px 0; }
  .cover h1 { font-size: 36px; border: none; }
  .cover p { font-size: 15px; color: #555; }
  .badge { display: inline-block; background: #e63946; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; }
  .note { background: #fff9e6; border-left: 4px solid #f4a261; padding: 8px 12px; font-size: 12px; margin: 8px 0; }
  .total-row td { font-weight: bold; background: #1a1a2e !important; color: white; }
</style>

<div class="cover">

# LINKD PRINTS ERP
## Complete Module & Sub-Module Documentation

**Prepared for**: Linkd Prints Development Team  
**Version**: 2.0  
**Date**: April 2026  
**Total Modules**: 25  
**Total Sub-Modules**: 220+

---

*This document defines every module and sub-module required to build the Linkd Prints ERP system — a complete digital backbone for the digital sublimation printing business.*

</div>

---

## MODULE OVERVIEW

| # | Module Name | Sub-Modules | Priority |
|---|---|---|---|
| 1 | Master Data | 18 | Build First — Foundation |
| 2 | Order Management | 7 | Phase 1 |
| 3 | Inventory / Store Management | 10 | Phase 1 |
| 4 | Production / Job Management | 14 | Phase 1 — Core |
| 5 | Quality Control (QC) | 9 | Phase 2 |
| 6 | KATA — Final QC & Measurement | 9 | Phase 2 |
| 7 | Dispatch & Logistics | 8 | Phase 2 |
| 8 | Purchase Management | 10 | Phase 2 |
| 9 | Design Repository | 9 | Phase 1 |
| 10 | Finance & Accounts | 15 | Phase 3 |
| 11 | HR & Employee Management | 10 | Phase 2 |
| 12 | Attendance | 9 | Phase 2 |
| 13 | Live Order Tracking — Client Facing | 7 | Phase 2 |
| 14 | Machine Maintenance | 9 | Phase 2 |
| 15 | Reports & Analytics | 9 | Phase 4 — Last |
| 16 | Notifications & Alerts | 8 | Ongoing |
| 17 | User Roles & Permissions | 7 | Build First |
| 18 | Customer Portal | 12 | Phase 3 |
| 19 | AI Design Search | 10 | Phase 3 |
| 20 | Design Task Management | 13 | Phase 2 |
| 21 | Employee Checklist System | 10 | Phase 2 |
| 22 | Challan & Lot Management | 14 | Phase 1 |
| 23 | Employee Hiring | 12 | Phase 3 |
| 24 | Lead Generation | 12 | Phase 3 |
| 25 | Production Entry Against Order | 12 | Phase 2 |

---

## MODULE 1 — MASTER DATA

> The foundation of the entire ERP. Every other module reads from Master Data. Must be 100% complete before any other module is built.

| Sub-Module | What It Does |
|---|---|
| Customer Master | Every client's legal name, GST number, trade name, office address, delivery addresses, contact person, phone, credit terms, book type (A-Silk / A-Cotton / B1-Trader / B2-Brand), rate override, status |
| Printing Machine Master | All 10 printing machines — machine ID, name, model, print heads, max width, rated capacity (mtrs/day), status (Active / Idle / Under Maintenance / Retired), maintenance dates |
| Fusing Machine Master | Both fusing machines — capacity (FM-01: 5,000 mtrs/day, FM-02: 14,000 mtrs/day), temperature range (185–230°C), speed range, status. Fusing is MANDATORY for every job |
| Calendar Machine Master | Calendar machine specs — max width 72", temperature 100–220°C, pressure 5–50 tons, speed 30–80 m/min, roller type, status |
| Rate Card Master | Standard rate by width: 36"=₹17, 44"=₹21, 54"=₹26, 58"/62"/64"=₹27, 72"=₹44. Calender +₹1, Rolling +₹1. Customer-level rate overrides. Fusing-only rate (₹9/mtr) |
| Fabric Type Master | Categories of fabric — name, width, GSM, composition, poly %. Auto-flag sublimation suitability: Poly ≥65% = Green, Poly 50–64% = Yellow (conditional), Poly <50% = Red (BLOCKED) |
| Item / Quality Master | Specific named fabric qualities (Nokia 58, Satin Slub, Waffle Lycra, Blackout 54, Fiesta 58, etc.) — linked to Fabric Type, recommended fusing temperature and speed per item |
| Employee Master | All staff — name, employee ID, role, department, shift, MDO certification (Y/N), machine certifications, joining date, status |
| Vendor / Supplier Master | All vendors — paper supplier, ink supplier, consumables, maintenance — name, GST, contact, payment terms, status |
| Paper Master | Korean sublimation paper — width (36"/64"/72"), GSM (38/45), roll length (1,000m/roll), current stock, reorder level, storage requirements (21–25°C, 45–60% humidity) |
| Ink Master | CMYK ink — PANTONE Royal Splash Series, colour (Black/Yellow/Magenta/Cyan), shelf life (12 months), storage temp (15–25°C), current stock, reorder level, batch number |
| Stationery & Consumables Master | Polybags, brown paper rolls, strapping tape, labels, cleaning cloths, gloves, goggles, invoice paper — item, unit, stock, reorder level, vendor |
| Transporter Master | Transport companies — name, contact person, phone, vehicle number, typical routes, status |
| Design Category Master | Standard design categories: Floral, Abstract, Geometrical, Ethnic & Traditional, Typography & Graphic, Kids & Cartoon, Geometric & Optical Art, Solid with Texture, Licensed/Character |
| Defect Type Master | DEF-01 Banding, DEF-02 Ghosting, DEF-03 Colour Drift, DEF-04 Fading Edges, DEF-05 Spotting, DEF-06 Sharpness Loss, DEF-07 Staining, DEF-08 Tear/Hole, DEF-09 Streak, DEF-10 Misalignment |
| Tax / GST Master | Tax codes, CGST/SGST/IGST rates — fabric jobwork attracts 5% GST. HSN code to be verified with CA before go-live |
| Unit of Measure Master | Meters (MTR), Roll (ROL), Piece (PCS), Litre (LTR), Kilogram (KG), Box (BOX) |
| Book Type Master | Book A–Silk (captive, break-even), Book A–Cotton (captive), Book B1–Trader (standard rate, thin margin), Book B2–Brand (premium margin, direct brands — currently ₹0, target channel) |

---

## MODULE 2 — ORDER MANAGEMENT

> From customer confirmation to production-ready status. Every order is tracked from entry to jobcard trigger.

| Sub-Module | What It Does |
|---|---|
| New Order Entry | Create order — customer, fabric type, quantity (meters), design reference, rate, finishing requirements (Fusing: always Y; Calender: Y/N; Rolling: Y/N), deadline, priority (Normal/Urgent/Express) |
| Sample Request | Auto-triggered for every new customer or new design. Tracks sample creation, dispatch to client, and approval. No jobcard created until sample is approved |
| Sample Approval Tracking | Client approves / rejects / requests revision. Approval logged with reference sample physical location. Revision triggers new design version |
| Repeat Order | Quick re-order using previous job's fabric, design, and settings — no re-entry needed. Shade continuity card auto-applied |
| Order Modification | Change deadline, quantity, or instructions — only allowed before printing starts. Rate cannot be changed after confirmation |
| Order Cancellation | Cancel with reason — before printing: allowed. After printing starts: Raghav approval required, partial billing may apply |
| Order Status Dashboard | All open orders — current stage, deadline, colour-coded urgency (Green >3 days / Orange 1–3 days / Red overdue). Filter by book type, customer, MDO, machine |

---

## MODULE 3 — INVENTORY / STORE MANAGEMENT

> Tracks everything physically in the factory — client fabric, paper, ink, consumables. Nothing moves without a record.

| Sub-Module | What It Does |
|---|---|
| Incoming Fabric Challan | Log fabric received from client — customer challan number, date, each piece: expected meters vs actual meters, condition (Good/Damaged/Short). Discrepancy auto-flagged, job blocked until customer acknowledges |
| Fabric Stock Management | Live view per client — Stock ID, fabric name, width, GSM, meters received, meters in production, meters remaining. Status: In Store / Assigned / In Production / Dispatched / Returned |
| Paper Stock Management | Korean paper rolls by width — current stock in rolls, consumption per machine, reorder alert when stock < threshold |
| Ink Stock Management | CMYK ink litres per colour — consumption per machine per job, batch number, reorder alert |
| Consumables Stock | Polybags, labels, tapes, cleaning supplies — stock in, stock out, current balance, reorder alerts |
| Fabric Assignment to Job | Link specific Stock ID to a jobcard — meters committed and deducted from available stock. Warning if required meters > available |
| Goods Return to Customer | Return unused or rejected fabric — return challan created, stock deducted, customer notified |
| Fabric Ageing Report | Fabric in store > 30 days without an order — auto-flagged for follow-up (client may have forgotten) |
| Waste Tracking | Meters committed to job vs meters actually produced — difference logged as waste per job with reason |
| Stock Reports | Client-wise fabric holding, paper consumption summary, ink consumption by colour, low stock alerts, waste summary |

---

## MODULE 4 — PRODUCTION / JOB MANAGEMENT

> The heart of the ERP. Every job from jobcard creation through all three production stages — tracked in real time.

| Sub-Module | What It Does |
|---|---|
| Jobcard Creation | Master job document — links order + fabric stock + design + machine + operator + rate + deadline into one record. Auto-generates Job ID (JOB-YYYY-MM-NNNN) |
| QR Code Generation | Every job gets a QR code embedded in the Jobcard PDF. Scanning the QR at any stage opens that job's screen on mobile — no typing required |
| Printing Machine Assignment | Assign one of 5 active printing machines (L1916 ×2, L1912 ×1, XENONS ×2). Idle machines hidden from selection |
| Fusing Machine Assignment | Assign FM-01 or FM-02 — MANDATORY for every job. FM-02 preferred for high volume (14,000 mtrs/day vs 5,000 mtrs/day) |
| Calendar Assignment | Assign calendar machine — optional per job (default Y). Customer can request soft finish without calendering |
| MDO / Operator Assignment | Assign MDO-certified operator only. Machine assignment restricted to machines operator is certified on |
| Pre-Press Checklist | Before printing starts: room temperature (21–25°C), humidity (45–60%), paper roll loaded, ink levels (CMYK), ICC profile set, test swatch vs approved sample — all must pass |
| Production Queue | All active jobcards sorted: Express > Urgent > Normal, then by deadline. Machine-wise and MDO-wise views |
| Printing Stage | MDO scans QR → logs meters printed per batch, Delta-E colour readings, paper roll changes, waste meters with reason, start and end time |
| Fusing Stage | MANDATORY — printed paper + grey fabric fed together through fusing machine. Heat (185–230°C) transfers design permanently into polyester fibers. Operator logs machine, temp, speed, meters fused |
| Calendering Stage | Operator scans QR → logs temperature, pressure (5–50 tons), speed, meters calendered. Smooth surface finish applied |
| Production Hold Management | Holds auto-created when Delta-E > 5, banding unresolved, or KATA fails. Hold reason, duration, resolution all logged |
| Job Completion | All three stages done → job auto-moves to KATA queue. Supervisor and KATA team notified |
| Live Capacity Dashboard | Real-time view: meters produced today vs rated capacity per machine. Printing total: 17,800 mtrs/day. Fusing total: 19,000 mtrs/day. Refreshes every 15 minutes |

---

## MODULE 5 — QUALITY CONTROL (QC)

> Quality is checked at every stage — before production, during production, and flagged for post-production action.

| Sub-Module | What It Does |
|---|---|
| Sample QC | Pre-dispatch sample check — colour accuracy, sharpness, no visible defects before sending to client |
| Shade Continuity Card | Created on first approved sample. Stores: design ID, machine used, ICC profile, ink batch, temperature settings, approved Delta-E reference values. Used for all future repeat orders |
| In-Production Colour Check | MDO logs Delta-E readings per batch during printing. <2 = acceptable, 2–5 = monitor, >5 = auto production hold |
| Banding Check | Checkbox at every paper roll change — MDO confirms banding check done before continuing. Banding (horizontal stripes) = printhead issue |
| Defect Logging | Any defect: type selected from Defect Master, location on roll (meters from start), severity (Minor/Major/Reject), photo upload MANDATORY |
| Defect Photo Library | All defect photos stored by job, machine, defect type, date. Searchable library builds over time — identifies recurring patterns |
| QC-Triggered Production Hold | Delta-E > 5 detected → job auto-pauses, production hold created, Mahesh + Nandu notified immediately |
| Colour Calibration Log | Weekly ICC profile and ink batch calibration check — logged for full traceability. New ink batch = mandatory recalibration before next job |
| QC Reports | Defect rate % (meters rejected ÷ meters produced), defects by type, by machine, by operator, by fabric type, monthly trends |

---

## MODULE 6 — KATA — FINAL QC & MEASUREMENT

> The absolute last gate before dispatch. Nothing leaves the factory without a KATA Clearance Certificate.

| Sub-Module | What It Does |
|---|---|
| Job Receipt at KATA | Scan Job QR — system confirms all three production stages complete before KATA can begin. Cannot start KATA on an incomplete job |
| Roll-by-Roll Measurement | Each roll measured on KATA inspection machine — digital counter accuracy ±0.5% (±1m per 200m). Measured meters logged per roll |
| Visual Inspection Checklist | Pass/Fail per item: surface stains, holes/tears, print streaks, banding (naked eye), edge alignment, roll winding evenness, roll hardness, colour vs approved sample under D65 light box |
| Defect Marking & Meter Deduction | Defective section cut out — meters deducted from that roll, defect type and photo logged. Remaining accepted meters recalculated |
| Final Meter Calculation | Sum of all accepted meters across all rolls = Final Verified Meters. This number goes to billing — not the original order quantity |
| Shortage Notification | If final meters < ordered meters → customer auto-notified via WhatsApp with reason. Billing adjusted to actual |
| KATA Clearance Certificate | Auto-generated when all rolls accepted and all checklist items pass. Certificate ID: KAT-YYYY-MM-NNNN. Contains: job ID, customer, roll-wise breakdown, KATA operator, date/time |
| KATA Hold | Any checklist failure → job held. Decision: reprint the affected section, credit the customer, or accept with customer written consent |
| Inspection Report | Full report with all measurements, checklist results, defect photos — permanently attached to job record. Customer can download from tracking link |

---

## MODULE 7 — DISPATCH & LOGISTICS

> Controls every fabric exit from the factory. Every dispatch has a document trail and proof of delivery.

| Sub-Module | What It Does |
|---|---|
| Pre-Dispatch System Check | System enforces: KATA Clearance Certificate must exist, all stages complete, invoice generated (or Raghav override), delivery address confirmed, transporter details entered — any failure blocks dispatch |
| Delivery Challan Generation | Auto-created: customer legal name + GST, linked Job ID + KATA ID, roll-wise meter breakdown, total meters, fabric description. Challan ID: DC-YYYY-MM-NNNN |
| Transporter Assignment | Select from Transporter Master, log vehicle number, set expected delivery date |
| Client WhatsApp Notification | Auto-sends WhatsApp message on dispatch — confirmation + challan PDF link. Tracking page updates to "Dispatched" |
| POD (Proof of Delivery) Tracking | System flags every dispatch as "Pending POD". If signed challan not received within 3 days → alert to dispatch team. POD received → job status = Delivered & Closed |
| Dispatch Register | Daily view: all dispatches, customer, meters, challan number, transporter. Monthly view: filterable by customer, book type, date range |
| Goods Return from Customer | Customer returns printed fabric — return challan created, reason logged, condition checked, stock updated |
| Outstanding POD Report | All dispatches where signed POD is not yet received — daily follow-up list |

---

## MODULE 8 — PURCHASE MANAGEMENT

> Every purchase from every vendor — from request to payment — fully tracked.

| Sub-Module | What It Does |
|---|---|
| Purchase Request | Raised manually by any department or auto-triggered when IMS stock hits reorder level. Contains: item, quantity, reason, urgency |
| Vendor Selection | Choose from Vendor Master. View previous purchase history and prices for that item from that vendor |
| Purchase Order (PO) | Formal PO created — item, quantity, rate, delivery date, payment terms. PO number: PO-YYYY-MM-NNNN |
| PO Approval | PO approved by authorised person before sending to vendor. Approval chain configured in Roles module |
| Goods Receipt (GRN) | When items arrive — match against PO. Log actual quantity received, condition, shortages. GRN number generated |
| Quality Check on Receipt | Inspect received paper rolls for damage or wrong width/GSM. Inspect ink for correct batch. Accept or initiate return to vendor |
| Purchase Invoice Entry | Log vendor invoice against GRN — vendor name, invoice number, amount, GST breakdown, due date |
| Vendor Payment | Record payment — amount, date, mode (NEFT/RTGS/cheque/cash), bank reference. Outstanding per vendor tracked |
| Purchase Return | Return damaged or wrong goods — return challan with reason, vendor informed, GRN reversed |
| Purchase History | All purchases by vendor, item, date, quantity, rate, amount — searchable and filterable |

---

## MODULE 9 — DESIGN REPOSITORY

> Every design file Linkd has ever created or printed — stored, versioned, searchable, and linked to production.

| Sub-Module | What It Does |
|---|---|
| Design Upload | Upload design files — TIFF, PSD, JPEG accepted. Auto-check: resolution (<72 DPI blocked, <150 DPI warning). Mandatory metadata on upload |
| Design Metadata & Tagging | Design ID (DSN-YYYY-NNNN), name, category, customer (if client-owned), target width, colour mode (RGB/CMYK), designer name, upload date |
| Version Control | Every modification = new version. Old versions never deleted. Production always runs on client-Approved version. Version history: who changed what, when, why |
| Colorway Management | Same design in multiple colour options — each colorway has its own ICC profile, PANTONE references, client approval status |
| Design Approval Workflow | Client reviews design → Approved / Rejected / Revision Requested. Approval status tracked per version per colorway |
| Client Design Vault | Each customer's private design folder — all their designs, all versions, all approvals. Future: client portal access |
| Design-to-Job Linking | At jobcard creation, MDO selects Design ID + specific version + colorway. System shows only Approved versions. Design parameters auto-fill into jobcard |
| Linkd Internal Library | Designs created by Linkd's own design team — available for Book B2 customers as added-value service |
| Design Search | Search by design ID, name, category, customer, width, colour — full-text and filtered search |

---

## MODULE 10 — FINANCE & ACCOUNTS

> All money in and out — invoices, payments, expenses, statutory compliance, and financial reporting.

| Sub-Module | What It Does |
|---|---|
| Invoice Generation | GST invoice auto-created after KATA clearance. Line items: printing (KATA verified meters × rate), calendering (+₹1/mtr if done), rolling (+₹1/mtr if done). Rate floor check: below floor = blocked |
| Credit Note | Issue credit note for short meters, rejected fabric sections, or agreed discounts — linked to original invoice |
| Payment Receipt | Record payment — customer name, invoice reference, amount, date, mode (NEFT/RTGS/cheque/cash), bank reference |
| Outstanding Management | All unpaid invoices — customer-wise, invoice-wise, amount-wise. One-click WhatsApp payment reminder to customer |
| Overdue Alerts & Ageing | Invoices past due date bucketed: 0–30 / 30–60 / 60–90 / 90+ days. Auto-alerts to finance team and Raghav |
| Expense Entry | Daily operational expenses — category (salary, electricity, maintenance, transport, consumables), amount, payment mode, approved by |
| Petty Cash | Small daily cash expenses — cash in, cash out, running balance, voucher number |
| Inter-Company Billing | Silk jobwork (Book A) and Cotton jobwork (Book A) on separate inter-company challan format (not GST invoice — per CA guidance) |
| Book-wise Revenue Split | Every invoice tagged with Book Type (auto from Customer Master). Reports show: Book A-Silk / A-Cotton / B1 / B2 — revenue, meters, avg rate/mtr per book per month |
| Bank Reconciliation | Match system payment entries against bank statement — identify unmatched entries |
| P&L Statement | Revenue vs costs — monthly and yearly. Book-wise breakdown of margin |
| GST Reports | GSTR-1 and GSTR-3B ready data for CA / filing. HSN-wise summary, customer-wise invoice list |
| Day Book | Every financial transaction in chronological order — date, narration, debit, credit, balance |
| Ledger | Account-wise full transaction history |
| Balance Sheet | Assets vs liabilities snapshot — monthly |

---

## MODULE 11 — HR & EMPLOYEE MANAGEMENT

> Complete employee lifecycle — from joining documents to monthly payroll.

| Sub-Module | What It Does |
|---|---|
| Employee Profile | Personal details, photo, emergency contact, role, department, joining date, probation end date, current status (Active/Inactive/On Leave) |
| Document Storage | Upload and store per employee: Aadhar, PAN, bank passbook, offer letter, contracts, education certificates — with expiry alerts where applicable |
| Department & Designation Management | Create departments and designations. Hierarchy management — who reports to whom |
| Shift Management | Define shifts (Morning/Evening/Night/General), assign employees to shifts, manage shift rotation |
| Machine Certification Tracking | Log which MDOs are certified for which printing machines. Production module restricts machine assignment to certified operators only |
| Salary Structure Setup | Define components per employee: Basic, HRA, Transport Allowance, other allowances, deductions (PF, ESIC, PT, loan recovery) |
| Payroll Processing | Monthly payroll calculation — pulls attendance data, applies salary structure, calculates gross, deductions, net payable |
| Payslip Generation | Individual payslips — printable PDF, can be sent via WhatsApp directly from system |
| Statutory Compliance | PF (12% employee + 12% employer), ESIC (0.75% employee + 3.25% employer), Professional Tax calculations per state slab |
| Employee Exit | Resignation / termination workflow — notice period tracking, final settlement calculation, document handover checklist, account deactivation |

---

## MODULE 12 — ATTENDANCE

> Daily tracking of who is present, what time they arrived, and how long they worked. Feeds directly into payroll.

| Sub-Module | What It Does |
|---|---|
| Daily Attendance Entry | Manual entry or biometric import — Present / Absent / Half-Day / Late for each employee |
| Check-in / Check-out | Biometric machine or QR code scan at entry/exit — auto-logs exact time. Late arrival flagged automatically |
| Shift-wise Attendance | Attendance tracked per shift. Cross-shift workers handled correctly |
| Overtime Tracking | Hours worked beyond standard shift — logged per employee. OT rate configured in salary structure |
| Leave Application | Employee applies for leave via system — type (Casual/Sick/Earned), dates, reason. Manager approves or rejects |
| Leave Balance | Running balance per employee per leave type. Auto-updates on application approval and payroll processing |
| Holiday Calendar | Define company holidays (public + factory-specific). Auto-excluded from attendance calculation |
| Monthly Attendance Report | Summary per employee: total working days, present days, absent days, half-days, late entries, OT hours, leave taken |
| Absenteeism Alert | If a critical operator (MDO, KATA, fusing) is absent → production manager notified immediately so alternate arrangements can be made |

---

## MODULE 13 — LIVE ORDER TRACKING (CLIENT FACING)

> Customers see exactly where their job is at any moment — no calls, no chasing.

| Sub-Module | What It Does |
|---|---|
| Tracking Link Generator | Unique URL auto-created per job when jobcard is generated. Format: linkd.in/track/JOB-NNNN |
| Auto WhatsApp Dispatch | Tracking link sent to customer's WhatsApp automatically when jobcard is created — no manual step |
| Live Status Page | Customer opens link — sees job moving through: Order Confirmed → Sample Approved → Printing → Fusing → Calendering → KATA → Packing → Dispatched → Delivered |
| Stage-wise Timestamps | Each stage shows exact date and time it was completed |
| Shortage / Defect Notification | If KATA finds short meters or cut-out defect — customer sees note on tracking page with reason and deducted meters |
| Document Download | Customer downloads their Delivery Challan and GST Invoice directly from tracking page — no need to call billing |
| No Login Required | Tracking page is public but unique — one URL per job. No password. Works on any phone |

---

## MODULE 14 — MACHINE MAINTENANCE

> Keep all machines running at peak condition. Every service, every breakdown, every spare part — tracked.

| Sub-Module | What It Does |
|---|---|
| Preventive Maintenance Schedule | Set service intervals per machine — weekly, monthly, quarterly. Auto-alert when service is due |
| Maintenance Request | Any operator or supervisor can raise a maintenance request — machine, issue description, urgency |
| Service Log | What was serviced, by whom (in-house or external technician), parts replaced, cost, date completed, next service date |
| Breakdown Log | Unplanned downtime — machine, reported by, breakdown reason, hours lost, resolution steps, technician who fixed it |
| Spare Parts Inventory | Track critical spare parts in store: printheads, rollers, belts, heating elements, fusing rollers — quantity, cost, vendor |
| Machine Status Management | Status changes: Active → Under Maintenance → Active. Status syncs with Production module — machine in maintenance is hidden from jobcard assignment |
| Printhead Replacement Log | Track printhead condition per machine, replacement history, hours run since last replacement, print quality before replacement |
| Maintenance Cost Tracking | Total cost per machine per month — parts + labour. Helps decide when a machine is too expensive to maintain vs replace |
| Machine Downtime Report | Monthly: which machine had most downtime, average breakdown frequency, total hours lost, cost of downtime |

---

## MODULE 15 — REPORTS & ANALYTICS

> Every number the business needs — operations, revenue, quality, customers, machines — in one place.

| Sub-Module | What It Does |
|---|---|
| Daily Operations Dashboard | Meters printed today vs capacity, per-machine utilization %, jobs at each production stage right now, active production holds, jobs overdue, paper stock days remaining, ink levels |
| Revenue Dashboard | Total revenue MTD, Book A vs B1 vs B2 revenue split, avg rate/mtr by book, month-on-month comparison, new orders this week |
| QC Dashboard | Defect rate % (meters rejected ÷ meters produced), defects by type (bar chart), defect rate by machine, by MDO, by fabric type, production hold count and avg duration |
| Customer Analytics | Revenue by customer (Book B ranked), avg order size, order frequency, customers not ordered in 60+ days (reactivation list) |
| Machine Performance Report | Utilization % per machine per month (trend line), meters per machine, total downtime hours, maintenance cost |
| Inventory Reports | Fabric ageing by client, paper stock days remaining per width, ink consumption trend, consumables burn rate |
| Purchase Report | Spend by vendor, spend by item category, pending POs, outstanding vendor payments |
| Finance Report | Outstanding invoices, overdue ageing, P&L summary, GST filing summary, book-wise margin |
| Custom Report Builder | Select any module, apply any date range and filter, export as Excel or PDF |

---

## MODULE 16 — NOTIFICATIONS & ALERTS

> The system proactively tells the right person when something needs attention — before it becomes a problem.

| Sub-Module | What It Does |
|---|---|
| Stock Low Alerts | Paper, ink, consumables below reorder level → auto-alert to purchase team and Mahesh |
| Production Alerts | Job overdue, production hold raised, job stuck at a stage too long (configurable threshold) |
| Quality Alerts | Delta-E above threshold (>5), banding check failed, KATA failed — immediate alert to Nandu Bhai and production manager |
| Finance Alerts | Invoice overdue, large payment received, vendor payment due date approaching |
| Maintenance Alerts | Machine service due (based on schedule), breakdown logged by any operator |
| Client Notifications | Order confirmed, sample dispatched to client, job dispatched — all auto-WhatsApp with relevant document |
| Daily Morning Brief | Auto-generated WhatsApp message to Raghav at 9am: meters yesterday, active jobs, outstanding payments, spare capacity today, any holds |
| Alert Configuration | Admin configures: which alert goes to which role or person. Alert channel: WhatsApp / in-app notification / both |

---

## MODULE 17 — USER ROLES & PERMISSIONS

> Controls who can see and do what. Every action in the system is traceable to a named user.

| Sub-Module | What It Does |
|---|---|
| Role Creation | Define roles: Admin, Production Manager, MDO, QC Inspector, KATA Operator, Finance, Dispatch, HR, Purchasing, Design Head, Designer, Client (read-only) |
| Module Access Control | Assign which modules each role can access — per-module on/off |
| Action-level Permissions | Per role per module: Can View / Can Create / Can Edit / Can Delete / Can Approve — granular control |
| User Account Management | Create login credentials per employee, assign role, reset password, deactivate account on exit |
| Override Permissions | Special elevated actions (rate floor override, sample skip, cancel after printing, inter-company rate change) — Raghav / Admin level only. Every override logged with reason |
| Audit Log | Every action recorded: who, which record, what change, date and time. Cannot be deleted. Used for accountability and dispute resolution |
| Session Management | Auto-logout after configurable inactivity period. Option for single-session (prevents shared logins) |

---

## MODULE 18 — CUSTOMER PORTAL

> Customers get their own login. They browse new designs, place orders, request samples, upload designs — without calling anyone.

| Sub-Module | What It Does |
|---|---|
| Customer Login & Account | Secure login per customer — username + password, linked to their Customer Master record. Mobile-friendly |
| New Design Catalogue | Customers browse designs uploaded by Linkd's design team. New uploads appear weekly or fortnightly. Designs shown as image grid with design ID, category, width |
| Design Favourites / Wishlist | Customer can shortlist / save designs they like — saved to their account for future reference or ordering |
| Sample Request from Portal | Customer sees a design in the catalogue → clicks "Request Sample" → sample request auto-created in Order module, assigned to production |
| Customer Design Upload | Customer uploads their own design file directly from the portal — triggers a Design Development Request to Linkd's design team |
| Design Development Request | Customer submits a custom design brief — theme, colour palette, fabric type, width, reference images. Linkd design team picks it up as a task in Design Task Management module |
| Direct Order Placement | Customer selects a design (from catalogue or their vault), enters fabric details and quantity → order placed directly into ERP. Confirmation sent on WhatsApp |
| Order History | Customer sees all their past and current orders — design, quantity, status, date, invoice |
| Invoice & Challan Download | Customer downloads their own invoices and delivery challans from portal — no need to call billing |
| Tracking Link Access | Customer sees live job status directly inside portal (same data as WhatsApp tracking link) |
| Messages / Communication | Customer sends messages to Linkd team from portal — logged, assigned, replied within ERP |
| Portal Access Control | Admin decides what each customer can see and do — some customers get full access, some get view-only catalogue access |

---

## MODULE 19 — AI DESIGN SEARCH

> Find any design in seconds — by design number, by description, or by uploading a reference image. No more hunting through file folders.

| Sub-Module | What It Does |
|---|---|
| Search by Design Number | Type a design code or partial name → instant exact match from the entire design library |
| Search by Reference Image | Upload any image — a photo, screenshot, competitor sample, or hand sketch. AI scans the entire design library and returns visually similar designs ranked by similarity |
| Similar Design Suggestions | Along with the exact or closest match, AI shows 5–10 visually similar designs the customer or sales team can offer as alternatives |
| AI Auto-Tagging | When a new design is uploaded, AI automatically tags it: dominant colours, pattern type (geometric/floral/abstract), style, motifs present — makes all future searches more accurate |
| Colour-Based Search | Search by colour: "show all designs with navy blue and gold" — AI filters by dominant colours detected in design files |
| Category + AI Combined Search | Combine a manual category filter (e.g. Floral) with an image upload — AI finds floral designs most visually similar to the reference |
| Search History | Every search logged — customer-wise and operator-wise. Helps understand what clients are actively looking for (sales intelligence) |
| Search Results Thumbnail Grid | Results displayed as image thumbnails — not just file names. Click thumbnail for full design details |
| AI Accuracy Feedback | Users can mark results as "correct match" or "wrong match" — AI model continuously improves based on this feedback |
| Bulk Design Indexing | When new designs are uploaded in batch (weekly/fortnightly uploads), AI auto-indexes all new files overnight so they are immediately searchable |

---

## MODULE 20 — DESIGN TASK MANAGEMENT

> Every designer knows exactly what they are working on. Design Head has full visibility of all work in progress.

| Sub-Module | What It Does |
|---|---|
| Task Creation | Create a task — type, detailed description, reference images, target width, deadline, priority (Urgent/High/Normal/Low) |
| Task Types | New Design Creation / Design Modification / Colorway Development / Client Brief / Customer Development Request / Internal Linkd Library / Sample Preparation |
| Task Assignment | Design Head assigns task to a specific designer. Unassigned task pool visible to Design Head for distribution |
| Task Status Tracking | To Do → In Progress → Under Review → Revision Requested → Completed. Status updated by designer and Design Head |
| Designer Workload View | See all tasks per designer — how many open, how many overdue, total active tasks. Helps Design Head balance load |
| Design File Attachment | Designer attaches completed design file directly to the task on completion — auto-triggers upload to Design Repository with metadata pre-filled |
| Task Comments & Feedback | Designer and Design Head comment on task — revision notes, reference links, approvals. All communication on record |
| Revision Tracking | If task is sent back for revision — revision count tracked, reason logged, revised version compared against original |
| Task Deadline Alerts | Designer alerted 24 hours before deadline. Design Head alerted when any task is overdue |
| Task Approval | Design Head reviews completed task — approves or requests revision. Approved task file moves to Design Repository |
| Design Head Dashboard | Full view of all tasks across all designers — by status, by deadline, by designer, by type |
| Client Task Link | Tasks created from Customer Portal design development requests are linked — client can see their request status |
| Performance Report | Tasks completed per designer per month, revision rate, on-time delivery %, average task completion time |

---

## MODULE 21 — EMPLOYEE CHECKLIST SYSTEM

> Every employee has a defined checklist. Every task gets done at the right frequency. Supervisors see compliance live.

| Sub-Module | What It Does |
|---|---|
| Checklist Template Creation | Admin creates named checklist templates — list of tasks, checks, or steps an employee must complete |
| Checklist Item Types | Simple tick (done/not done) / Numeric entry (e.g. "enter temperature reading: ___°C") / Photo proof (employee must upload a photo as evidence) |
| Frequency Setting | Set how often each checklist must be completed: Per Shift / Daily / Weekly / Monthly / Per Job / Per Machine Start-up |
| Employee / Role Assignment | Assign checklist template to specific employee or to a role (all MDOs get the same daily checklist) |
| Checklist Execution | Employee opens their checklist on mobile or tablet — ticks items, enters numeric values, uploads photos. Submission timestamped |
| Missed Checklist Alert | If checklist not submitted by the required time → supervisor notified automatically |
| Supervisor View | See all employees' checklist completion status for the day/week — who is compliant, who missed |
| Compliance Report | Which checklists are being completed vs missed — by employee, by department, by period. % compliance score |
| Checklist History | Full log of every submitted checklist — who, when, what was ticked, what values were entered, photos attached |
| Checklist Version Control | If a template is updated — version history maintained. Old submissions remain linked to the version that was active at submission time |

**Example Checklists:**
- MDO Daily Start-up: Machine warm-up confirm, paper roll check, ink level CMYK, test swatch vs reference, room temperature & humidity log
- Fusing Operator: Machine temperature pre-check, roller condition, paper-fabric alignment test, speed setting confirm
- KATA Operator: Inspection machine calibration, light box (D65) check, counter reset, defect photo upload readiness
- Dispatch: POD pending list reviewed, packing material stock, challan printer paper stocked

---

## MODULE 22 — CHALLAN & LOT MANAGEMENT

> Every movement of fabric — incoming, outgoing, or internal — has a challan and lot number. Full traceability from receipt to delivery.

| Sub-Module | What It Does |
|---|---|
| Lot Creation | Group fabric pieces/rolls from one customer for one job into a Lot. Lot Number: LOT-YYYY-MM-NNNN. One lot = one traceable unit through the entire factory |
| Lot Number Assignment | Auto-generated at fabric receipt (Inward Challan stage). Every roll inside a lot gets a sub-tag |
| Lot Tracking | Real-time location of every lot: In Store → Assigned to Job → Printing → Fusing → Calendering → KATA → Packing → Dispatched → Delivered |
| Inward Challan | Customer fabric arriving — challan with lot number, fabric details, expected vs actual meters, condition, receiving officer, date |
| Outward / Delivery Challan | Printed fabric going to customer — challan with lot number, roll-wise meter breakdown, KATA certificate reference, transporter details |
| Internal Transfer Challan | Fabric moving within factory between departments (Store → Production → KATA → Dispatch) — challan created at every internal handover |
| Job / Production Challan | Created when a lot is assigned to a jobcard — links lot permanently to job. Used for production accountability |
| Purchase Inward Challan | Paper rolls, ink, consumables arriving from vendor — purchase challan with PO reference, GRN number |
| Return Challan | Fabric returned to customer or vendor — return challan with reason (excess, damaged, wrong quality), original challan reference |
| Challan Number Series | Separate auto-incrementing number series per challan type: IN-XXXX (inward), OUT-XXXX (outward), INT-XXXX (internal), JOB-XXXX (job), RET-XXXX (return) |
| Challan Amendment | If challan details need correction after creation — amendment record created. Original challan preserved, amendment linked to it |
| Challan Cancellation | Cancel a challan with reason and authorisation. Cancelled challan remains in records (soft delete only, not removed) |
| Challan Register | Searchable register of all challans by type, customer, lot number, date range, status |
| Lot Movement History | For any lot number — show every challan ever created for it, from first receipt to final dispatch. Complete audit trail |

---

## MODULE 23 — EMPLOYEE HIRING

> Manage every hire from the moment a need is raised to the new employee's first day — organised and documented.

| Sub-Module | What It Does |
|---|---|
| Job Requisition | Department raises a hiring request — role, number of positions, reason (replacement / new position), required by date, urgency |
| Requisition Approval | HR and management review and approve or reject the requisition before job posting |
| Job Description | Create job description — role title, department, key responsibilities, required skills, experience, salary range, work location |
| Candidate Database | Store all CVs received — from job portals, WhatsApp, referrals, walk-in applicants. Searchable by role, skills, experience |
| Application Tracking | Per candidate: Applied → Shortlisted → Interview Round 1 → Interview Round 2 → Selected / Rejected at each stage |
| Interview Scheduling | Set interview date, time, interviewer name. Auto-notification sent to candidate (WhatsApp/call) and interviewer |
| Interview Feedback Form | Interviewer fills structured feedback — skills rating, attitude, communication, role fit, recommendation (Hire/Hold/Reject), notes |
| Offer Letter Generation | Auto-generate offer letter from template — fills in designation, department, salary, joining date, probation period |
| Pre-Joining Document Checklist | Documents to collect before joining: Aadhar, PAN, bank account details, previous experience letter, education certificate |
| Onboarding Checklist | First-day checklist: ID card issued, system access created, machine training scheduled, factory induction done, department introduction |
| Probation Tracking | Set probation end date — alert raised 2 weeks before for confirmation / extension decision |
| Recruitment Reports | Open positions count, CVs received per role, time-to-hire, offer acceptance rate, source analysis (referral vs portal vs walk-in) |

---

## MODULE 24 — LEAD GENERATION

> Capture every potential customer. Ensure every lead is followed up. Know exactly where each lead is in the pipeline.

| Sub-Module | What It Does |
|---|---|
| Lead Capture | Log leads from: WhatsApp inquiry, trade show / exhibition, referral from existing customer, online inquiry, cold outreach, walk-in visitor |
| Lead Source Tracking | Tag every lead with its source — helps analyse which channel brings highest-quality leads and conversions |
| Lead Database | Searchable list — company name, contact person, phone, city, fabric type interest, estimated monthly volume, source, date captured |
| Lead Qualification | Classify lead: Hot (ready to buy) / Warm (interested, evaluating) / Cold (just browsing) |
| Lead Assignment | Assign lead to a specific team member for follow-up — with deadline for first contact |
| Follow-up Reminders | Set next follow-up date per lead. System sends reminder to assigned person before the date |
| Lead Status Pipeline | New → Contacted → Interested → Sample Requested → Sample Approved → Negotiation → Converted → Lost |
| Lead-to-Customer Conversion | When lead is won — one-click to create Customer Master record. No re-entry of data already captured |
| Lost Reason Tracking | If lead lost — reason logged: Price too high / Quality concern / Capacity unavailable / Went to competitor / No response / Not the right fit |
| Sample Request from Lead | Before converting to customer — lead can request a test print sample. Sample request created in Order module linked to lead |
| Conversion Report | Leads converted this month, conversion rate %, average days from first contact to conversion, source-wise conversion comparison |
| Lead Funnel View | Visual pipeline showing how many leads are at each stage — identify bottlenecks in the sales funnel |

---

## MODULE 25 — PRODUCTION ENTRY AGAINST ORDER

> Log actual meters produced every day against each order. Know exactly how far along every job is — and what is still pending.

| Sub-Module | What It Does |
|---|---|
| Daily Production Entry | Operator enters: Job ID / Order number, machine used, meters completed this session, waste meters, reason for waste, shift (morning/evening/night) |
| Machine-wise Entry | Same order can run across multiple machines or multiple shifts — each entry is linked to one machine and one operator |
| Operator-wise Entry | Each MDO logs their own production. Individual accountability tracked over time |
| Shift-wise Entry | Morning / evening / night shift entries logged separately — supervisor can see full-day production split by shift |
| Production vs Order Target | System shows live: Total ordered meters / Total produced so far / Remaining meters / Completion % per job |
| Carry-Forward Tracking | If today's production is short of the daily plan → shortfall auto-highlighted on next day's production plan for that job |
| Waste Entry | Waste meters logged with reason (setup waste / edge trim / defect cut-out / paper misalignment). Waste % calculated per job |
| Excess Production Alert | If cumulative production exceeds ordered quantity → supervisor alerted to review before fusing stage continues |
| Production Summary Report | Daily view: all active jobs, all machines, all operators, total meters produced — one consolidated report |
| Order Completion Alert | When cumulative production = 100% of order quantity → KATA team and production supervisor automatically notified to expect the job |
| Production Plan vs Actual | Planned daily production target (from jobcard deadline back-calculation) vs actual entries. Gap analysis per job, per machine, per week |
| Monthly Production Report | Total meters by machine, by operator, by book type (A-Silk / A-Cotton / B1 / B2), by month. Key metric for capacity utilisation reporting |

---

## SUMMARY — 25 MODULES

| # | Module | Sub-Modules |
|---|---|---|
| 1 | Master Data | 18 |
| 2 | Order Management | 7 |
| 3 | Inventory / Store Management | 10 |
| 4 | Production / Job Management | 14 |
| 5 | Quality Control (QC) | 9 |
| 6 | KATA — Final QC & Measurement | 9 |
| 7 | Dispatch & Logistics | 8 |
| 8 | Purchase Management | 10 |
| 9 | Design Repository | 9 |
| 10 | Finance & Accounts | 15 |
| 11 | HR & Employee Management | 10 |
| 12 | Attendance | 9 |
| 13 | Live Order Tracking — Client Facing | 7 |
| 14 | Machine Maintenance | 9 |
| 15 | Reports & Analytics | 9 |
| 16 | Notifications & Alerts | 8 |
| 17 | User Roles & Permissions | 7 |
| 18 | Customer Portal | 12 |
| 19 | AI Design Search | 10 |
| 20 | Design Task Management | 13 |
| 21 | Employee Checklist System | 10 |
| 22 | Challan & Lot Management | 14 |
| 23 | Employee Hiring | 12 |
| 24 | Lead Generation | 12 |
| 25 | Production Entry Against Order | 12 |
| **Total** | | **262 Sub-Modules** |

---

*Document prepared by Linkd Prints Management Team — April 2026*  
*For developer team use — all modules and sub-modules subject to revision during development sprints*
