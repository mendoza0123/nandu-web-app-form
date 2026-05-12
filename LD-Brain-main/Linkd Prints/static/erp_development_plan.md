# Linkd Prints ERP — Detailed Module & Flow Plan
**Target file**: `Linkd Prints/static/erp_development_plan.md` (replace/expand existing)

---

## Context

The existing ERP plan (v1.0) defines 11 modules at a high level. This plan expands every module into its complete sub-systems, all entities/fields within each sub-system, and the exact flow cycle showing how data enters, moves, and exits each module. The goal is a spec detailed enough for the UI design team to start wireframing module by module without ambiguity.

---

## MODULE 1 — MASTER DATA MANAGEMENT
**Role**: Foundation layer. Every other module references masters. Build 100% before anything else.

### 1.1 Customer Master
**Sub-systems**: Registration → Verification → Book Assignment → Rate Override → Status Management

**Entities & Fields**:
| Field | Type | Notes |
|---|---|---|
| Customer ID | Auto (CUST-NNNN) | System-generated |
| Legal Name | Text | As per GST registration |
| Trade Name | Text | Daily-use name (e.g. "Rajendra Kumar") |
| GST Number | Text (15-char) | Validated format; mandatory |
| PAN | Text | Optional |
| Book Type | Dropdown | Book A–Silk / Book A–Cotton / Book B1–Trader / Book B2–Brand |
| Contact Person | Text | Primary contact name |
| Phone | Number | WhatsApp-enabled preferred |
| Email | Text | Optional |
| Office Address | Text | Full address with PIN |
| Delivery Address(es) | Multi-entry | Multiple delivery locations allowed |
| Credit Days | Number | 0 = cash; 30/45/60 = credit terms |
| Rate Override | Y/N + rate | If customer has negotiated custom rate (e.g. MARU AND SONS ₹40/62") |
| Fusing-Only Customer | Y/N | e.g. KAIVALYA DIGIHOUSE — separate fusing rate applies |
| Assigned SP | Link → Employee Master | |
| Status | Dropdown | Active / Inactive / Blacklisted |
| Blacklist Reason | Text | Filled only if Blacklisted |
| Created Date | Date | Auto |
| Created By | Link → Employee | Auto |

**Flow Cycle**:
```
New customer enquiry arrives
  → Sales/Admin opens New Customer form
  → Fills mandatory fields (Legal Name, GST, Phone, Book Type)
  → GST format auto-validated
  → Book Type selected → rate card auto-assigned (or override flagged)
  → Customer ID generated
  → Customer active and available for Order module
  → On blacklist: all new orders blocked; existing orders flagged
```

---

### 1.2 Printing Machine Master
**Sub-systems**: Machine Registration → Capability Specs → Status Management → Maintenance Log

**Entities & Fields**:
| Field | Type | Notes |
|---|---|---|
| Machine ID | Auto (PM-NN) | PM = Printing Machine |
| Machine Name | Text | e.g. PANTONE L1916 |
| Model | Text | e.g. L1916, L1912, XENONS |
| Print Heads | Number | e.g. 16, 12, 8, 3 |
| Max Width (inches) | Number | All current = 72" |
| Rated Capacity (mtrs/day) | Number | e.g. 4,800 |
| Practical Capacity (mtrs/day) | Number | At ~50% efficiency |
| Status | Dropdown | Active / Idle / Under Maintenance / Retired |
| Activation Date | Date | When machine first went live |
| Last Maintenance Date | Date | |
| Next Scheduled Maintenance | Date | |
| Compatible Paper Widths | Multi-select | 36" / 64" / 72" |
| Notes | Text | e.g. "handles fine-detail jobs best" |

**Pre-loaded machines** (from brain):
- PM-03: L1916, 16-head, 4,800/day — Active
- PM-04: XENONS, 8-head, 1,200/day — Active
- PM-08: XENONS, 8-head, 3,000/day — Active
- PM-09: L1912, 12-head, 4,000/day — Active
- PM-10: L1916, 16-head, 4,800/day — Active
- PM-01/02/05/06/07: 3-head, 1,200/day each — Idle

**Flow Cycle**:
```
Machine added/updated in master
  → Available in Jobcard module for MDO assignment (Active only)
  → Idle machines hidden from Jobcard dropdown (until status changed to Active)
  → Maintenance log entry → status auto-set to "Under Maintenance"
  → Maintenance closed → status returns to Active
  → Capacity dashboard reads live from Machine Master
```

---

### 1.3 Fusing Machine Master
**Sub-systems**: Machine Registration → Capacity Specs → Temperature Profile → Status Management

**Entities & Fields**:
| Field | Type | Notes |
|---|---|---|
| Machine ID | Auto (FM-NN) | FM = Fusing Machine |
| Machine Name | Text | e.g. Mahaveer Engineer #1 |
| Manufacturer | Text | Mahaveer Engineer |
| Rated Capacity (mtrs/day) | Number | FM-01: 5,000 / FM-02: 14,000 |
| Speed Range (m/hr) | Text | 60–90 m/hr |
| Temperature Range (°C) | Text | 185–230°C |
| Max Fabric Width (inches) | Number | |
| Status | Dropdown | Active / Under Maintenance / Retired |
| Last Maintenance Date | Date | |
| Notes | Text | |

**Pre-loaded**: FM-01 (5,000/day, Active), FM-02 (14,000/day, Active)

**Flow Cycle**:
```
Every job MUST pass through a fusing machine (mandatory, no bypass)
  → Jobcard → fusing machine assigned (FM-01 or FM-02)
  → FM-02 preferred for high-volume jobs (14,000/day vs 5,000/day)
  → MES module logs: machine ID, temp setting, speed, start time, end time, meters fused
  → Fusing capacity dashboard: FM-01 + FM-02 combined = 19,000 mtrs/day theoretical
  → Fusing is never the bottleneck (printing at 17,800/day is the constraint)
```

---

### 1.4 Calendar Machine Master
**Sub-systems**: Machine Registration → Technical Specs → Status

**Entities & Fields**:
| Field | Type | Notes |
|---|---|---|
| Machine ID | Auto (CM-NN) | CM = Calendar Machine |
| Machine Name | Text | |
| Max Width (mm) | Number | 1,829 mm (72") |
| Temperature Range (°C) | Text | 100°C – 220°C |
| Pressure Range (tons) | Text | 5–50 tons (variable hydraulic) |
| Speed Range (m/min) | Text | 30–80 m/min |
| Roller Type | Text | Polished steel + cotton-composite |
| Status | Dropdown | Active / Under Maintenance |

**Flow Cycle**:
```
Calendering is optional per job (customer can request skip for "soft finish")
  → Jobcard: calender Y/N checkbox (default Y)
  → If Y: job routed to calendar after fusing
  → Calendar operator scans Job ID QR → logs settings → confirms meters
  → Billing: +₹1/mtr for calendering (auto-applied if Y)
```

---

### 1.5 Rate Card Master
**Sub-systems**: Width-based Rate Table → Service Add-ons → Fusing-Only Rate → Override Management

**Entities & Fields (Width Rate Table)**:
| Width | Base Printing | + Calender | + Rolling | All Three |
|---|---|---|---|---|
| 36" | ₹17 | ₹1 | ₹1 | ₹19 |
| 44" | ₹21 | ₹1 | ₹1 | ₹23 |
| 54" | ₹26 | ₹1 | ₹1 | ₹28 |
| 58" | ₹27 | ₹1 | ₹1 | ₹29 |
| 62" | ₹27 | ₹1 | ₹1 | ₹29 |
| 64" | ₹27 | ₹1 | ₹1 | ₹29 |
| 72" | ₹44 | ₹1 | ₹1 | ₹46 |

**Fusing-Only Rate** (separate service):
- Standard fusing-only: ₹9/mtr (e.g. KAIVALYA DIGIHOUSE)
- Separate rate card entry, not mixed with printing rates

**Rate Override Rules** (stored per customer):
| Customer | Width | Override Rate |
|---|---|---|
| MARU AND SONS | 62" | ₹40 |
| KRSNAFAB PVT LTD | 58" | ₹35 |
| BHAGWAN TEXTILES | 58" | ₹33 |
| BALAJI TEXTILES | 58" | ₹32 |
| NOVELLA FASHION FABRIC | 58" | ₹30 |
| SAVAYAVAS & CO. | 58" | ₹30 |
| L.D COTTON MILLS | 62" | ₹35–40 (inter-company — pending review) |

**Flow Cycle**:
```
Order created → system reads customer's rate
  → If customer has override rate: applies automatically
  → If no override: applies standard rate card by width
  → Rate shown on quote before customer confirms
  → Rate locked at order confirmation — cannot change after
  → At invoice stage: system compares invoice rate vs rate card floor
  → If below floor: HARD WARNING → Raghav override required with reason
```

---

### 1.6 Fabric Type Master
**Role**: Defines categories of fabric — what can and cannot be printed.

**Entities & Fields**:
| Field | Type | Notes |
|---|---|---|
| Fabric Type ID | Auto | FT-NNN |
| Fabric Category | Dropdown | Woven / Knit / Non-woven |
| Fabric Name | Text | e.g. Nokia 58, Satin Slub, Waffle Lycra, Blackout 54 |
| Width (inches) | Number | Standard width this fabric comes in |
| GSM Range | Text | e.g. 110–130 GSM |
| Composition | Text | e.g. 100% Polyester, 80% Poly 20% Cotton |
| Poly % | Number | Critical field |
| Sublimation Suitable | Auto-flag | YES if poly ≥ 65%; CONDITIONAL if 50–64%; NO if <50% |
| Common Use | Text | e.g. Dress material, Activewear, Lining |
| Status | Active / Discontinued | |

**Sublimation Suitability Rules (hard-coded)**:
- Poly ≥ 65% → Green (suitable)
- Poly 50–64% → Yellow (conditional — sample required, output muted)
- Poly < 50% → Red (NOT suitable — job blocked at order stage)
- Natural fibers (cotton, linen, silk) → Red (hard block, reason shown to customer)

**Flow Cycle**:
```
Order intake → customer specifies fabric type
  → System looks up Fabric Type Master
  → If Red: order creation BLOCKED, message shown: "Sublimation not suitable for this fabric"
  → If Yellow: warning shown, sample mandatory, customer must sign acknowledgement
  → If Green: proceeds normally
  → Fabric type linked to Jobcard → determines temperature settings on fusing machine
```

---

### 1.7 Item Master (Fabric Quality / SKU Master)
**Role**: Specific named fabric qualities that Linkd handles regularly. More granular than Fabric Type.

**Entities & Fields**:
| Field | Type | Notes |
|---|---|---|
| Item ID | Auto | ITM-NNN |
| Item Name | Text | e.g. "Nokia 58", "Satin Slub", "Waffle Lycra", "Blackout 54", "Fiesta 58" |
| Linked Fabric Type | Link → Fabric Type Master | |
| Width | Number | inches |
| GSM | Number | |
| Composition | Text | |
| Typical Customer(s) | Text | Who commonly sends this fabric |
| Special Handling Notes | Text | e.g. "heavier, use higher temp", "tension-sensitive" |
| Recommended Fusing Temp | Number | °C — specific to this item |
| Recommended Fusing Speed | Number | m/hr |
| Status | Active / Discontinued | |

**Flow Cycle**:
```
Fabric arrives at factory gate
  → Receiving staff selects Item from Item Master (or creates new if unknown)
  → Item record populates: width, GSM, composition, sublimation flag
  → At Jobcard stage: Item selected → fusing temp and speed auto-suggested for MDO
  → MDO can override but must log reason for deviation from recommended settings
```

---

### 1.8 Employee / Staff Master
**Sub-systems**: Staff Registration → Role Assignment → Department → MDO Capability

**Entities & Fields**:
| Field | Type | Notes |
|---|---|---|
| Employee ID | Auto (EMP-NNN) | |
| Full Name | Text | |
| Role | Dropdown | See roles below |
| Department | Dropdown | See departments below |
| Phone | Number | WhatsApp-enabled |
| Join Date | Date | |
| Status | Active / Inactive | |
| MDO Certified | Y/N | Can this employee operate as MDO? |
| Machines Certified For | Multi-select → Machine Master | Which printing machines certified on |
| Shift | Dropdown | Morning / Evening / Night / General |

**Roles**: MDO / QC Inspector / KATA Operator / Receiving Staff / Design Artist / Dispatch Staff / Finance/Billing / Production Manager / Admin / Supervisor

**Departments**: Production / Design / KATA / Dispatch / Finance / Management / Admin

**Key staff from brain** (pre-load):
- Anand: Finance/Billing (SAB operator)
- Mahesh: Management/ERP
- Aditya: Management/ERP
- Nandu Bhai: Production Supervisor (CRITICAL — see nandu_bhai_protocol.md)
- Naushi: Design Head
- 10+ designers in Design department

**Flow Cycle**:
```
Employee added to master
  → Available for assignment in: Jobcard (MDO), QC module, KATA, Dispatch
  → MDO assignment restricted to MDO-Certified employees only
  → Machine assignment restricted to machines employee is certified on
  → Inactive status: removed from all dropdowns automatically
```

---

### 1.9 Supplier / Vendor Master
**Role**: Tracks all external suppliers (paper, ink, consumables, utilities).

**Entities & Fields**:
| Field | Type | Notes |
|---|---|---|
| Vendor ID | Auto (VND-NNN) | |
| Vendor Name | Text | |
| Category | Dropdown | Paper / Ink / Consumables / Maintenance / Utility |
| GST Number | Text | |
| Contact Person | Text | |
| Phone | Number | |
| Payment Terms | Text | |
| Status | Active / Inactive | |

**Key vendors to pre-load**:
- Korean Paper supplier (36", 64", 72" rolls — 1,000m/roll)
- PANTONE ink supplier (Royal Splash Series — CMYK)

---

### 1.10 Paper Master (Consumables)
**Role**: Tracks sublimation transfer paper inventory and specifications.

**Entities & Fields**:
| Field | Type | Notes |
|---|---|---|
| Paper ID | Auto | PAP-NNN |
| Paper Type | Dropdown | Korean (primary) / Chinese (not used — record only) |
| Width | Dropdown | 36" / 63" / 64" / 72" |
| GSM | Number | 38 or 45 |
| Roll Length | Number | 1,000 m/roll |
| Vendor | Link → Vendor Master | |
| Current Stock (rolls) | Number | Live from inventory transactions |
| Reorder Level (rolls) | Number | Alert triggers when stock hits this level |
| Reorder Quantity | Number | Standard purchase quantity |
| Storage Requirements | Text | 21–25°C, 45–60% humidity |
| Status | Active / Discontinued | |

---

### 1.11 Ink Master
**Role**: Tracks sublimation ink by colour and batch.

**Entities & Fields**:
| Field | Type | Notes |
|---|---|---|
| Ink ID | Auto | INK-NNN |
| Brand | Text | PANTONE Royal Splash Series |
| Colour | Dropdown | Black (Z) / Yellow / Magenta / Cyan |
| Type | Text | Water-based dye sublimation |
| Shelf Life | Number | 12 months |
| Storage Temp | Text | 15–25°C |
| Unit | Dropdown | Litre / Cartridge |
| Current Stock | Number | Litres — live from transactions |
| Reorder Level | Number | Alert when stock hits this |
| Compatible Machines | Multi-select → Machine Master | |
| Batch Number | Text | Per purchase — for calibration tracking |

---

### 1.12 Stationery & Consumables Master
**Role**: All non-fabric, non-paper consumables used in production and admin.

**Sub-categories**:
| Category | Items |
|---|---|
| Packaging | Polybags (per size), brown paper rolls, strapping tape, labels |
| Production | Cleaning cloths, rubber gloves, felt pads (for calendar rollers) |
| Admin | Invoice paper, receipt rolls, printer cartridges |
| Safety | Gloves, goggles, aprons |

**Entities & Fields** (per item):
- Item ID, Name, Category, Unit (piece/roll/box), Current Stock, Reorder Level, Vendor

---

### 1.13 Design Category Master
**Role**: Standardises design classification for the design repository.

**Pre-loaded categories**:
- Floral Designs
- Abstract Art
- Geometrical Patterns
- Ethnic & Traditional (mandalas, block prints)
- Typography & Graphic Mix
- Kids & Cartoon Prints
- Geometric & Optical Art (3D illusion)
- Solid with Texture
- Licensed / Character Prints

---

### 1.14 Defect Type Master
**Role**: Standardises defect classification for QC and KATA modules.

**Pre-loaded defect types**:
| Defect Code | Name | Cause |
|---|---|---|
| DEF-01 | Banding | Printhead issue — horizontal stripes |
| DEF-02 | Ghosting | Fabric shift during press — double image |
| DEF-03 | Color Drift | Ink/profile inconsistency — hue change across batch |
| DEF-04 | Fading Edges | Uneven heat press pressure |
| DEF-05 | Spotting | Ink splatter or paper defect transfer |
| DEF-06 | Sharpness Loss | Low DPI, paper quality, or temperature issues |
| DEF-07 | Staining | Foreign matter on fabric |
| DEF-08 | Tear/Hole | Physical fabric damage |
| DEF-09 | Streak | Printing streak from paper crease or roll tension |
| DEF-10 | Misalignment | Design shifted from intended position |

---

### 1.15 Transporter Master
**Entities**: Transporter ID, Name, Contact Person, Phone, Vehicle Number, Typical Routes, Status

---

### 1.16 UOM (Unit of Measure) Master
**Pre-loaded**: Meters (MTR), Roll (ROL), Piece (PCS), Litre (LTR), Kilogram (KG), Box (BOX)

---

### 1.17 Tax / GST Master
**Entities**: Tax Code, Description, CGST %, SGST %, IGST %, Applicable on (fabric jobwork / goods)
- Jobwork on fabrics: 5% GST (CGST 2.5% + SGST 2.5%)
- Verify exact HSN code with CA before ERP goes live

---

### 1.18 Book Type Master
**Pre-loaded**:
| Code | Name | Description |
|---|---|---|
| A-SILK | Book A — Silk Captive | LD Silk Mills jobwork, break-even rate |
| A-COTTON | Book A — Cotton Captive | LD Cotton Mills jobwork, break-even rate |
| B1 | Book B1 — Traders | External traders, standard rate card |
| B2 | Book B2 — Direct Brands | Target: apparel brands, D2C labels, premium margin |

---

## MODULE 2 — ORDER MANAGEMENT
**Role**: Captures all customer orders from enquiry to confirmed jobcard trigger.

### Sub-Systems

#### 2.1 Enquiry / Lead
**Fields**: Enquiry ID (ENQ-NNN), Date, Customer (existing or new), Source (WhatsApp/Walk-in/Phone/Referral/Outreach), Fabric Type → auto-checks sublimation suitability, Width, Quantity (mtrs), Design (file upload or brief), Finishing required (Fusing: always Y; Calender: Y/N; Rolling: Y/N), Deadline, Notes

#### 2.2 Quote Generation
**Flow**:
```
Enquiry confirmed → Quote auto-generated
  → Rate pulled from Rate Card Master (customer override if exists)
  → Line items: Printing (qty × rate), Calender (if Y: qty × ₹1), Rolling (if Y: qty × ₹1)
  → GST calculated
  → Quote PDF generated → sent via WhatsApp
  → Status: Draft / Sent / Accepted / Rejected / Expired (7-day expiry)
  → If below rate floor: system blocks quote, requires Raghav override
```

#### 2.3 Sample Request (Auto-triggered)
**Trigger conditions**:
- First order from this customer (ever)
- First time this design is being produced
- First time this fabric type is being used

**Flow**:
```
Sample flag auto-set → Sample Request created
  → Sample type: 9×9" swatch / 11×11" swatch / 1.5–2 mtr yardage
  → Assigned to Sampling Department
  → Sample produced (on actual customer fabric, not substitute)
  → Dispatched: courier / salesperson / client pickup
  → Client response: Approved / Rejected / Revision requested
  → If Approved → Production allowed. Approved reference sample logged (physical location).
  → If Rejected → revision cycle; new version in Design Repo; re-sample
  → Hard rule: NO jobcard created until sample is Approved (override by Raghav with logged reason only)
```

#### 2.4 Order Confirmation
**Fields**: Order ID (ORD-YYYY-MM-NNNN), Linked Enquiry ID, Customer, Fabric (link to IMS or "pending receipt"), Design ID + version, Quantity confirmed, Rate locked, Finishing locked, Deadline, Priority (Normal/Urgent/Express), Special instructions

**Flow**:
```
Customer confirms quote
  → Order created and locked (rate, qty, specs frozen)
  → System checks: Is fabric in IMS? 
      → YES: fabric linked to order
      → NO: order status = "Awaiting Fabric Receipt" (IMS module notified)
  → Is design available in Design Repo?
      → YES: linked
      → NO: "Awaiting Design" flag; Design team notified
  → Once fabric IN and design LINKED: order status = "Ready for Jobcard"
  → Jobcard module notified automatically
```

#### 2.5 Order Modification & Cancellation
- Modifications allowed only on: Deadline (always), Quantity (before printing starts), Special instructions
- Rate CANNOT be modified after confirmation
- Cancellation before printing: allowed with cancellation reason logged
- Cancellation after printing starts: requires Raghav approval; partial billing may apply

#### 2.6 Order Status View (Dashboard)
**Columns**: Order ID, Customer, Book Type, Meters, Deadline, Current Stage, Days to Deadline, SP Assigned
**Colour coding**: Green (>3 days), Orange (1–3 days), Red (<1 day / overdue)
**Filters**: Book Type, Customer, MDO, Machine, Stage, Date range

---

## MODULE 3 — INVENTORY MANAGEMENT SYSTEM (IMS)
**Role**: Tracks all physical items in Linkd's custody: client fabric, paper, ink, consumables.

### Sub-Systems

#### 3.1 Incoming Fabric Challan
**Trigger**: Customer delivers fabric to factory gate

**Fields**: Stock Receipt ID (STK-RCV-NNN), Date, Customer ID, Customer's own challan number, Delivery mode, Transporter (if applicable)

**Line items per fabric piece**:
- Piece number
- Item (link to Item Master)
- Width, GSM
- Expected meters (from customer challan)
- Actual meters (physically measured at gate)
- Condition: Good / Damaged / Short
- If Damaged: photo captured, reason noted
- If Short: discrepancy amount, discrepancy note generated

**Flow**:
```
Fabric arrives at gate
  → Receiving staff opens New Challan in system (on mobile/tablet)
  → Scans or enters customer details
  → Enters each fabric piece: expected vs actual meters
  → System auto-flags: if actual < expected → Discrepancy Note generated
      → Customer must acknowledge discrepancy (WhatsApp message sent)
      → Job creation BLOCKED until customer acknowledgement logged
  → Fabric condition: if Damaged → customer informed, decision: accept with note / return
  → On acceptance: Stock IDs assigned per piece (STK-NNNN)
  → Customer fabric holding view updated
  → Linked order (if exists) updated: "Fabric Received"
```

#### 3.2 Fabric Stock View (Live)
**Per Stock ID**: Customer, Item, Width, GSM, Meters received, Meters consumed in production, Meters remaining, Status (In Store / Assigned / In Production / Dispatched / Returned)

**Client-wise holding**: All fabric per customer, total meters, ageing (days in store)
- Ageing alert: fabric in store > 30 days → flag for follow-up (customer may have forgotten to place order)

#### 3.3 Fabric Assignment to Job
**Flow**:
```
Jobcard created
  → System shows: available Stock IDs for this customer
  → MDO/Production manager links specific Stock ID(s) to Job
  → Meters committed: deducted from available stock
  → If required meters > available meters: warning shown before production starts
  → On completion: actual meters consumed vs committed compared (waste tracked)
```

#### 3.4 Paper Inventory
**Fields per transaction**: Date, Paper ID (from Paper Master), Rolls received / consumed, Machine used, Job ID (if specific roll to job), Remaining stock auto-calculated

**Reorder alert**: When stock < reorder level → system alert to Mahesh + Aditya
**Usage tracking**: Rolls consumed per job → paper cost per job calculable

#### 3.5 Ink Inventory
**Fields per transaction**: Date, Ink ID, Quantity in/out (litres), Machine used, Batch number, Remaining stock

**Reorder alert**: When stock < reorder level
**Calibration tracking**: When new ink batch received → calibration check required before production (linked to QC module)

#### 3.6 Stationery & Consumables Stock
Standard stock management: receive, consume, reorder alerts per item from Consumables Master

#### 3.7 Stock Reports
- Client-wise fabric holding (all fabric in store by customer)
- Ageing report (fabric in store > 30 days)
- Paper consumption per machine per month
- Ink consumption per colour per month
- Waste fabric report (meters committed vs actually produced — delta = waste)

---

## MODULE 4 — DESIGN REPOSITORY
**Role**: Central archive for all design files. Every design ever produced is stored, versioned, and retrievable.

### Sub-Systems

#### 4.1 Design Upload
**Mandatory fields on upload**:
- Design ID (auto: DSN-YYYY-NNNN)
- Design Name / Reference code
- Owner: Customer-owned / Linkd Library
- If customer-owned: Customer ID linked
- Category (from Design Category Master)
- Target width (36" / 58" / 64" / 72")
- File format validation: TIFF, PSD, JPEG accepted; PDF accepted with warning
- Resolution check: < 150 DPI → hard warning; < 72 DPI → upload blocked
- Color mode: RGB or CMYK (noted)
- Designer name (link to Employee Master)
- Upload date (auto)
- Version: v1 (first upload always v1)
- Status: Draft / Awaiting Approval / Approved / In Production / Archived

#### 4.2 Version Control
**Rule**: Every modification = new version. Old versions never deleted.
- v1 → v2 on any design change (colour, scale, repeat, element)
- Production always runs on the client-Approved version (system enforces)
- Version history view: all versions, who changed what, when, and why

#### 4.3 Colorway Management
- Each design can have unlimited colorways (same design, different colour palette)
- Each colorway: Colorway ID, Name, ICC profile file attached, PANTONE references, Client approval status
- Production links to specific design + version + colorway

#### 4.4 Client Design Vault
- Each customer has a private folder: all their designs, all versions, all colorways
- Future: customer portal gives client read-only access to their own vault
- Linkd Library: designs created by Linkd's design team available for Book B2 customers as value-add

#### 4.5 Design-to-Job Linking
```
Jobcard creation → MDO must link: Design ID + Version + Colorway
  → System shows only Approved versions
  → If no Approved version exists → job blocked until approval cycle complete
  → Once linked → design parameters (DPI, color mode, width) auto-fill into Jobcard
```

---

## MODULE 5 — JOBCARD & PRODUCTION ORDER
**Role**: The master reference for every job. Everything downstream reads from the Jobcard.

### Sub-Systems

#### 5.1 Jobcard Creation
**Trigger**: Order status = "Ready for Jobcard" (Fabric IN + Design linked + Sample approved)

**Auto-filled fields**:
- Job ID (JOB-YYYY-MM-NNNN)
- Linked Order ID
- Customer name + Book Type
- Fabric: Stock ID, Item name, Width, GSM, Meters
- Design: ID, Name, Version, Colorway
- Rate: per mtr + finishing add-ons
- Deadline, Priority

**Manually filled by MDO/Production**:
- Printing Machine assigned (Active only, from Machine Master)
- Fusing Machine assigned (FM-01 or FM-02; mandatory)
- Calender assigned (if required)
- MDO assigned (MDO-certified staff only)
- Print parameters: speed, DPI, temperature, paper width, paper type, ICC profile

**Pre-press checklist (MDO fills)**:
- [ ] Print room temperature: ___°C (should be 21–25°C)
- [ ] Print room humidity: ___% (should be 45–60%)
- [ ] Paper roll loaded: ID ___
- [ ] Ink levels checked: Black / Yellow / Magenta / Cyan — OK/Low
- [ ] ICC profile loaded: ___
- [ ] Test swatch printed and compared to approved sample: Pass/Fail
- If any pre-press item Fail → Jobcard cannot proceed to production

#### 5.2 Jobcard QR Code
- QR code auto-generated and printed on Jobcard PDF
- QR encodes: Job ID
- Scanning QR at any production stage → opens that job's stage screen on mobile
- Physical Jobcard attached to fabric bundle throughout production

#### 5.3 WhatsApp Tracking Link
- On Jobcard creation: unique tracking URL generated (LINKD-JOB-NNNN)
- Auto-sent to customer's WhatsApp number via WhatsApp Business API
- Tracking page shows: Order Confirmed → Sample Approved → Printing → Fusing → Calender → KATA → Packing → Dispatched (live updates at each scan)
- Client can download: Delivery Challan, Invoice (once generated)

#### 5.4 Production Queue
- All active Jobcards shown in priority order (Express > Urgent > Normal)
- Within same priority: sorted by deadline
- Machine-wise queue: which jobs are queued for which machine
- MDO-wise queue: how many jobs each MDO is currently handling

---

## MODULE 6 — MANUFACTURING EXECUTION SYSTEM (MES)
**Role**: Logs every production stage in real-time. Every scan updates job status, machine utilization, and client tracking.

### Sub-Systems

#### 6.1 PRINTING STAGE
**Operator**: MDO (on mobile/tablet at machine)

**On scan (start)**:
- QR scan → Job screen opens
- System shows: Design thumbnail, fabric specs, print parameters, MDO assigned, machine assigned
- MDO confirms machine ready: temp reached, paper loaded
- Start time auto-logged

**During production logging**:
- Per-batch color check entry: Delta-E value
  - < 2: Green (acceptable)
  - 2–5: Yellow (log, continue, monitor)
  - > 5: Red → Production Hold auto-created → Mahesh + Nandu notified
- Paper roll change event: roll ID logged, banding check checkbox (must tick before continuing)
- Running meter counter: MDO enters meters printed after each design segment

**On scan (complete)**:
- Total meters printed
- Waste meters (with reason: defect/edge trim/setup waste)
- End time logged
- Machine utilization auto-calculated: (meters printed ÷ machine rated capacity) × (time used ÷ shift hours)
- Status: "Printing Complete → Awaiting Fusing"

#### 6.2 FUSING STAGE (MANDATORY)
**Operator**: Fusing machine operator

**Process**: Printed paper + grey fabric fed together through fusing machine. Heat causes sublimation transfer. This is the step where design physically enters the fabric.

**On scan (start)**:
- QR scan → shows: fabric type, weight, meters to fuse, recommended temperature + speed (from Item Master)
- Operator confirms fusing machine (FM-01 or FM-02) and settings
- Temperature set: 185–230°C (higher temp for heavier fabric — referenced from Item Master)
- Speed set: 60–90 m/hr
- Start time logged

**During production**:
- Ghosting check: if fabric shifts on paper during entry → defect logged (DEF-02)
- Alignment check: periodic check that paper and fabric are feeding together cleanly

**On scan (complete)**:
- Meters fused
- Any issues: ghosting events, alignment corrections
- End time
- Status: "Fusing Complete → Awaiting Calender" (or → KATA if no calender)
- Fusing machine utilization calculated

#### 6.3 CALENDERING STAGE
**Operator**: Calendar machine operator

**Flow** (if Jobcard has Calender = Y):
```
QR scan at calendar machine
  → System shows: fabric specs, recommended temp/pressure/speed
  → Operator sets: temperature (100–220°C), pressure (5–50 tons), speed (30–80 m/min)
  → Settings logged
  → Meters calendered logged
  → End time → Status: "Calender Complete → Awaiting KATA"
```

#### 6.4 LIVE CAPACITY DASHBOARD
**Refreshes every**: 15 minutes (or on each scan)

| Machine | Meters Today | Capacity/Day | Utilization % | Jobs in Queue | Status |
|---|---|---|---|---|---|
| PM-03 (L1916) | live | 4,800 | live | live | Active |
| PM-04 (XENONS) | live | 1,200 | live | live | Active |
| PM-08 (XENONS) | live | 3,000 | live | live | Active |
| PM-09 (L1912) | live | 4,000 | live | live | Active |
| PM-10 (L1916) | live | 4,800 | live | live | Active |
| FM-01 (Fusing) | live | 5,000 | live | live | Active |
| FM-02 (Fusing) | live | 14,000 | live | live | Active |
| **TOTAL Printing** | live | **17,800** | live | live | |
| **TOTAL Fusing** | live | **19,000** | live | live | |

---

## MODULE 7 — QC MANAGEMENT
**Role**: Full quality control chain from sample to dispatch clearance.

### Sub-Systems

#### 7.1 Sample Management
**Flow**:
```
Sample Request created (by Order module)
  → Sampling dept receives notification
  → Sample printed: MDO logs sample job (linked to main Order ID)
  → Physical sample: type, meters, roll/swatch
  → Dispatch: courier / salesperson / client pickup → logged
  → Client response captured:
      → APPROVED: reference sample physical location logged; shade continuity card created
      → REJECTED: rejection reason; design revision instructions; Design Repo notified for new version; re-sample loop starts
      → REVISION: same as rejected + specific change instructions
  → Approval history kept forever (all samples, all responses per design)
```

#### 7.2 Shade Continuity Card
**Created**: On first sample approval for each design + customer + colorway combination

**Fields**: Design ID, Customer, Colorway, Approval date, MDO who produced approved sample, Machine used, Print settings at approval (temp, speed, DPI, ICC profile, paper batch), Approved Delta-E reference values (per colour)

**Usage on repeat orders**:
```
Repeat order for same design → MDO pulls shade continuity card
  → Produces test swatch using same settings
  → Compares Delta-E against card reference values
  → If within tolerance: proceed to production
  → If Delta-E exceeds tolerance: Production Hold → customer conversation before dispatch
```

#### 7.3 In-Production QC Log
- All Delta-E entries from MES (Module 6) linked here
- Banding check results per paper roll change
- Defect events: Type (from Defect Master), location in roll (meters from start), photo uploaded, severity, action taken (corrected / cut out / reprint / accepted)
- Production hold log: reason, duration, resolution

#### 7.4 Defect Photography Library
- Every defect entry requires a photo
- Photos stored per: Job ID > Defect Type > Date
- Analytics reads this: most common defect types by machine, by MDO, by fabric type, by month

#### 7.5 Production Hold Management
**Conditions that auto-create a hold**:
- Delta-E > 5 (color drift)
- Banding check failed and not cleared
- KATA fails (from Module 8)

**Hold record**: Job ID, Stage at hold, Reason, Created by (system/manual), Resolved by, Resolution action, Hold duration

---

## MODULE 8 — KATA (MEASUREMENT + FINAL QC)
**Role**: Last gate before dispatch. Nothing dispatches without KATA clearance.

### Sub-Systems

#### 8.1 Roll-by-Roll Measurement
**Operator**: KATA team (on KATA inspection machine with digital counter)

**On scan (job received at KATA)**:
- QR scan → Job details: customer, design, ordered meters, all production stage completions confirmed

**Per roll entry**:
- Roll number (R01, R02...)
- Measured meters (from digital counter: ±0.5% accuracy)
- Roll condition: Full Accept / Partial Accept (defect section cut out) / Reject
- If Partial: meters cut out, reason, defect type (from Defect Master), photo uploaded
- If Reject: full reason + photo; reprint decision (Y/N)

**Auto-calculation**:
- Accepted meters per roll
- Total accepted meters for job
- Shortage vs ordered: if short → reason logged → customer notified via WhatsApp
- Overage vs ordered: billed for actual meters

#### 8.2 Visual QC Checklist
| Check | Result | Photo Required if Fail |
|---|---|---|
| Surface stains | Pass / Fail | Yes |
| Holes or tears | Pass / Fail | Yes |
| Print streaks | Pass / Fail | Yes |
| Banding (naked eye) | Pass / Fail | Yes |
| Edge alignment clean | Pass / Fail | Yes |
| Roll winding even (no telescoping) | Pass / Fail | Yes |
| Roll hardness consistent | Pass / Fail | Yes |
| Colour vs approved sample (D65 light box) | Pass / Fail | Yes |

**If any Fail**: Job held; issue logged; decision: reprint / credit to customer / accept with customer consent

#### 8.3 KATA Clearance Certificate
- Auto-generated when all rolls accepted and QC checklist passed
- Contains: Job ID, Customer, Roll-wise meter breakdown, Total Verified Meters, QC checklist results, KATA Operator ID, Date + Time, Digital signature/stamp
- KATA Certificate ID: KAT-YYYY-MM-NNNN
- This certificate is the **hard gate** — Dispatch module CANNOT generate a delivery challan without a valid KATA Certificate for the same Job ID

#### 8.4 Inspection Report
- Full report auto-generated: all roll measurements, QC results, defect photos, any holds during KATA
- Permanently attached to Job record
- Available for customer download from WhatsApp tracking link

---

## MODULE 9 — DISPATCH MANAGEMENT
**Role**: Controls physical fabric exit from factory. Creates legal documents for every dispatch.

### Sub-Systems

#### 9.1 Pre-Dispatch System Check (Enforced — Cannot Bypass)
Before Delivery Challan can be generated, system verifies:
- [ ] KATA Clearance Certificate exists for this Job ID
- [ ] All production stages marked complete in MES
- [ ] Invoice generated (OR Raghav override: "dispatch before invoice" for trusted accounts)
- [ ] Delivery address confirmed
- [ ] Transporter details entered

Any unchecked item = Dispatch BLOCKED with reason shown.

#### 9.2 Delivery Challan Generation
**Fields (auto-filled)**:
- Challan ID: DC-YYYY-MM-NNNN
- Date
- Customer legal name + address + GST
- Linked Job ID, Order ID, KATA Certificate ID
- Roll-wise details: Roll no., Item description, Width, GSM, Meters per roll
- Total meters
- Fabric description

**Challan PDF**: printable, two copies (one dispatched with goods, one signed + returned as POD)
**Digital copy**: auto-available on customer's WhatsApp tracking link

#### 9.3 Transporter Assignment
- Select from Transporter Master or add ad-hoc
- Vehicle number logged
- Expected delivery date logged
- Tracking: WhatsApp tracking link status updates to "Dispatched"

#### 9.4 POD (Proof of Delivery) Collection
- System flags job as "Dispatch Pending POD" after dispatch
- POD collected: date, received by (transporter/customer), condition noted
- If POD not received within 3 days → system alert to dispatch team
- POD received → job status = "Delivered + Closed"

#### 9.5 Dispatch Register
- Daily register: all dispatches today, customer, meters, challan number, transporter
- Monthly register: filterable by customer, book type, date range
- Outstanding PODs report: all dispatches without POD

---

## MODULE 10 — BILLING & FINANCE
**Role**: Generates GST invoices. Tags every rupee to a Book. This is where ₹ meets meters in one system for the first time.

### Sub-Systems

#### 10.1 Invoice Generation
**Trigger**: KATA Clearance Certificate + Dispatch Challan generated

**Auto-filled**:
- Invoice ID: INV-YYYY-MM-NNNN
- Date
- Customer legal name + GST + address
- Line items:
  - Printing service: KATA Verified Meters × Rate/mtr
  - Calendering: KATA Verified Meters × ₹1 (if applicable)
  - Rolling: KATA Verified Meters × ₹1 (if applicable)
  - Any special charges
- Subtotal, CGST (2.5%), SGST (2.5%) or IGST (5%), Total
- Book Type tagged (auto from Customer Master): A-Silk / A-Cotton / B1 / B2
- Due date (based on customer credit terms)
- Linked Job ID, Order ID, KATA ID, Challan ID

**Rate floor check**: if any line item rate < rate card floor → hard warning → Raghav override required

#### 10.2 Book-Wise Revenue Split (Core Reporting)
```
Every invoice tagged with Book Type (auto from Customer Master)
  → Monthly P&L available by Book:
      Book A-Silk: ₹X, Y mtrs, ₹Z avg rate/mtr
      Book A-Cotton: ₹X, Y mtrs, ₹Z avg rate/mtr
      Book B1: ₹X, Y mtrs, ₹Z avg rate/mtr, Z% margin
      Book B2: ₹X, Y mtrs, ₹Z avg rate/mtr, Z% margin
  → This split was impossible before. Now automatic.
```

#### 10.3 Payment Tracking
- Invoice status: Raised / Partial / Paid / Overdue
- Payment entry: date, amount, mode (NEFT/RTGS/cheque/cash), reference number
- Auto-status update: Partial or Paid based on amount received
- Overdue: auto-flag when due date passes with no full payment

#### 10.4 Overdue Management
- Overdue dashboard: all overdue invoices, customer, amount, days overdue
- Ageing buckets: 0–30 / 30–60 / 60–90 / 90+ days
- WhatsApp reminder: system can generate payment reminder message to customer
- Total outstanding by customer

#### 10.5 Inter-Company Billing Rules
| Route | Rate | Document Type | Note |
|---|---|---|---|
| Silk → Linkd (Book A) | ~₹36.75/mtr (break-even) | Inter-company challan | Pending rate review by Dilip |
| Cotton → Linkd (Book A) | ₹35–40/mtr | Inter-company challan | ⚠️ Above market (₹28) — pending rate correction |
| Standard external | Per rate card | GST Tax Invoice | |

#### 10.6 SAB Transition Plan (Reconciliation Bridge)
- Phase 1 (Months 1-6): New ERP runs parallel with SAB. Challan number (common field) links both. Mahesh runs monthly reconciliation report.
- Phase 2 (Months 7-9): New ERP primary for invoicing. SAB = read-only archive.
- Phase 3 (Month 10+): SAB retired. New ERP is single source of truth.

---

## MODULE 11 — ANALYTICS DASHBOARD
**Role**: Business intelligence layer. Reads from all 10 modules. No data entry here — only reporting and alerts.

### Sub-Systems

#### 11.1 Operations Dashboard (Daily — Nandu/Mahesh/Raghav)
- Total meters printed today (vs daily capacity)
- Per-machine utilization % (live)
- Jobs at each stage right now (Printing / Fusing / Calender / KATA / Packing / Dispatched)
- Production Holds active (reason, duration)
- Jobs overdue (count and list)
- Paper stock: days remaining per width
- Ink stock: litres remaining per colour

#### 11.2 Revenue Dashboard (Weekly — Raghav/Dilip)
- Revenue MTD: total + Book A/B1/B2 split
- Revenue vs last month, last year
- Avg rate/mtr by book
- Outstanding payments total + top 5 overdue customers
- New orders this week vs target

#### 11.3 QC Dashboard (Weekly — Nandu/Mahesh)
- Defect rate %: meters rejected ÷ meters produced
- Defects by type (bar chart from Defect Master)
- Defect rate by machine (which machine producing most defects)
- Defect rate by MDO (which operator)
- Defect rate by fabric type
- Production holds: count, avg duration, recurring reasons
- Customer complaints this month

#### 11.4 Customer Analytics (Monthly — Raghav)
- Revenue by customer (Book B ranked)
- Avg order size per customer
- Order frequency per customer
- Customers not ordered in 60+ days (reactivation trigger)
- Book B2 pipeline: prospects, stage, expected close

#### 11.5 Machine Performance (Monthly — Mahesh)
- Utilization % per machine per month (trend)
- Meters per machine per month
- Downtime events (maintenance log)
- Idle machine reactivation signal: when total production > 300K mtrs/month consistently → flag to reactivate 3-head idle machines

---

## Complete Data Flow (End-to-End)

```
MASTER DATA SETUP (one-time, maintained ongoing)
  Customers | Machines | Rate Cards | Fabric Types | Items | Staff | Paper | Ink | Stationery

CUSTOMER ENQUIRY
  ↓
MODULE 2: Enquiry → Quote → Sample Request (if new job/customer) → Order Confirmation
  Order ID generated. Fabric status checked (in IMS or pending).
  ↓
MODULE 3: Fabric arrives at gate → Challan verified → Stock ID assigned → IMS updated
  (Parallel: paper + ink stock maintained)
  ↓
MODULE 4: Design linked to order (existing from repo, or new upload + approval cycle)
  ↓
MODULE 5: Jobcard created (JOB-ID)
  Order + Stock ID + Design ID + Machine + MDO all linked
  Pre-press checklist completed
  WhatsApp tracking link sent to customer
  ↓
MODULE 6: PRINTING
  MDO scans QR → logs print run → Delta-E per batch → meters printed → waste
  Machine utilization logged
  ↓
MODULE 6: FUSING (MANDATORY — NO BYPASS)
  Operator scans QR → logs machine, temp, speed → meters fused → design now in fabric
  ↓
MODULE 6: CALENDERING (if required)
  Operator scans QR → logs settings → meters calendered
  ↓
MODULE 7: QC throughout all stages (defects, holds, shade continuity)
  ↓
MODULE 8: KATA
  Roll-by-roll measurement → QC checklist → Defect photos if any
  KATA Clearance Certificate issued → Final Verified Meters confirmed
  ↓
MODULE 9: DISPATCH
  Pre-dispatch system check (KATA cert required) → Delivery Challan generated
  Transporter assigned → Fabric leaves factory
  Customer tracking link updates to "Dispatched"
  POD collected within 3 days
  ↓
MODULE 10: BILLING
  Invoice on Final Verified Meters × Rate
  Book Type tagged (A-Silk / A-Cotton / B1 / B2)
  Payment tracked → Overdue alerted
  ↓
MODULE 11: ANALYTICS
  All data feeds dashboards → Operations, Revenue, QC, Customer, Machine performance
```

---

## Build Sequence for Design Team

| Sprint | Module | What Goes Live | Can Start When |
|---|---|---|---|
| 1 | 1 — Master Data | All masters: Customer, Machines, Rate Cards, Fabric Types, Items, Staff, Paper, Ink, Stationery, etc. | Day 1 — no dependencies |
| 2 | 2 — Order Management | Enquiry → Quote → Sample → Order Confirmation; Order status dashboard | After Customer Master live |
| 3 | 3 — IMS | Fabric receipt, challan verification, stock management, paper & ink tracking | After Customer + Item Masters live |
| 4 | 5 — Jobcard | Jobcard generation, QR code, WhatsApp tracking link | After Orders + IMS + Design Repo basic version |
| 4 | 4 — Design Repo | Design upload, versioning, colorway, client vault | Parallel with IMS (Sprint 3) |
| 5 | 6 — MES | Printing + Fusing + Calender stage tracking; live capacity dashboard | After Jobcard live |
| 6 | 7 — QC | Sample workflow, shade continuity card, defect photography, production holds | After MES live |
| 7 | 8 — KATA | Roll measurement, QC checklist, KATA Clearance Certificate | After QC module live |
| 8 | 9 — Dispatch | Pre-dispatch check, delivery challan, POD, dispatch register | After KATA live |
| 9 | 10 — Billing | Invoice generation, book-wise tagging, payment tracking, SAB bridge | After Dispatch live |
| 10 | 11 — Analytics | All dashboards | After all modules live (reads from everything) |

---

## Hard System Rules (Enforced by ERP — No Bypass Without Override Log)

1. **Sublimation block**: Fabric with poly < 50% → order creation BLOCKED
2. **Sample gate**: No Jobcard without approved sample for new job/customer (Raghav override only)
3. **Fusing mandatory**: MES workflow enforces Print → Fuse → [Calender] sequence. Fusing cannot be skipped
4. **KATA gate**: No delivery challan without KATA Clearance Certificate for same Job ID
5. **Rate floor**: Invoice line below rate card floor → billing blocked, Raghav override required with reason
6. **Discrepancy hold**: Fabric meters short at gate → job creation blocked until customer acknowledgement
7. **Production hold**: Delta-E > 5 → auto-hold created, production stops, Mahesh + Nandu notified

---

## Verification / Testing Checklist

- [ ] Create a test customer (Book B1), confirm rate card auto-applies
- [ ] Create an order for cotton fabric → verify sublimation block fires
- [ ] Create a new-customer order → verify sample request auto-creates
- [ ] Receive fabric with short meters → verify discrepancy note and job block
- [ ] Create jobcard → verify QR code generates, WhatsApp link sends
- [ ] Scan QR at printing stage → verify stage opens and meters log
- [ ] Scan QR at fusing stage → verify mandatory stage cannot be bypassed
- [ ] Log Delta-E > 5 → verify production hold auto-creates
- [ ] Complete KATA with one failed roll → verify partial acceptance, meter adjustment
- [ ] Try to generate dispatch challan without KATA cert → verify hard block
- [ ] Generate invoice → verify Book B1 tag, rate matches rate card
- [ ] Enter invoice line below rate floor → verify Raghav override prompt
- [ ] Check analytics dashboard → verify all modules feeding correctly

---

## MODULE 18 — CUSTOMER PORTAL
*Give customers their own login — they browse designs, place orders, track jobs, all without calling.*

| Sub-Module | What It Does |
|---|---|
| Customer Login & Account | Separate login for each customer — username + password, linked to their Customer Master record |
| New Design Catalogue | Customers browse designs uploaded by Linkd's design team — weekly or fortnightly uploads visible here |
| Design Favourites | Customer can shortlist / heart designs they like — saved to their account |
| Sample Request from Portal | Customer sees a design they like → clicks "Request Sample" → sample request auto-created in Order module |
| Customer Design Upload | Customer uploads their own design file directly from the portal — triggers Design Development Request |
| Design Development Request | Customer briefs a custom design — describes theme, colours, size, fabric — Linkd design team picks it up |
| Direct Order Placement | Customer selects a design, enters fabric details and quantity → order placed directly into ERP |
| Order History | Customer sees all their past and current orders — status, dates, invoices |
| Invoice & Challan Download | Customer downloads their own invoices and delivery challans from portal |
| Tracking Link Access | Customer sees live job status directly inside portal (same data as WhatsApp tracking link) |
| Messages / Communication | Customer can send messages to Linkd team directly from portal — logged and replied within ERP |
| Portal Access Control | Admin decides what each customer can see — some get full access, some get view-only |

---

## MODULE 19 — AI DESIGN SEARCH
*Find any design in seconds — by number, by description, or by uploading a reference image.*

| Sub-Module | What It Does |
|---|---|
| Search by Design Number | Type a design code or name → system finds exact match instantly |
| Search by Reference Image | Upload any image (photo, screenshot, competitor sample) → AI scans the design library and returns visually similar designs |
| Similar Design Suggestions | Along with the exact match, AI shows 5–10 visually similar designs the customer might also like |
| AI Auto-Tagging | When a new design is uploaded, AI automatically tags it — colours present, pattern type, style, motifs — makes future search more accurate |
| Colour-based Search | Search by dominant colour — "show all designs with blue and gold" |
| Category Filter + AI | Combine category filter (floral, geometric) with AI visual search for refined results |
| Search History | Every search is logged — customer-wise and operator-wise — helps understand what clients are looking for |
| Search Results Thumbnail View | Results shown as image grid — not just file names |
| AI Model Improvement | Designers can mark search results as "correct" or "wrong match" — AI learns and improves over time |
| Bulk Design Indexing | When new designs are uploaded in batch (weekly/fortnightly), AI auto-indexes all of them overnight |

---

## MODULE 20 — DESIGN DEPARTMENT TASK MANAGEMENT
*Every designer knows exactly what they are working on — nothing falls through the cracks.*

| Sub-Module | What It Does |
|---|---|
| Task Creation | Create a task — type (new design / modification / colorway / client brief / internal project), description, deadline, priority |
| Task Assignment | Assign task to a specific designer — or let design head assign from unassigned pool |
| Task Types | New Design Creation / Design Modification / Colorway Development / Client Sample / Customer Development Request / Internal Library |
| Task Priority | Urgent / High / Normal / Low — colour coded |
| Task Status | To Do → In Progress → Under Review → Revision Requested → Completed |
| Designer Workload View | See all tasks per designer — how many open, how many overdue, total active load |
| Design File Attachment | Designer attaches completed design file directly to the task — links to Design Repository |
| Task Comments | Designer and design head can comment on a task — feedback, revision notes, approvals |
| Revision Tracking | If a task goes back for revision — revision count tracked, reason logged |
| Task Deadline Alerts | Designer and design head notified when a task is approaching deadline or overdue |
| Design Head Dashboard | Full view — all tasks across all designers, status, deadlines, bottlenecks |
| Task Completion & Approval | Design head reviews and approves completed task — file moves to Design Repository |
| Performance Report | Tasks completed per designer per month, revision rate, on-time delivery rate |

---

## MODULE 21 — EMPLOYEE CHECKLIST SYSTEM
*Every employee follows their checklist. Every task gets done. Nothing missed.*

| Sub-Module | What It Does |
|---|---|
| Checklist Template Creation | Admin creates checklist templates — list of tasks/checks an employee must complete |
| Frequency Setting | Set how often each checklist must be completed — daily / per shift / weekly / monthly / per job |
| Employee Assignment | Assign a checklist template to a specific employee or role |
| Checklist Execution | Employee opens their checklist, ticks off each item as done — with timestamp |
| Photo Proof (optional) | For certain items, employee must upload a photo as proof of completion |
| Missed Checklist Alert | If an employee did not complete their checklist by the required time → supervisor notified |
| Supervisor View | See all employees' checklist completion status for the day/week |
| Compliance Report | Which checklists are being completed vs missed — by employee, by department, by period |
| Checklist History | Full log of every checklist ever submitted — who, when, what was ticked |
| Checklist Edit Log | If a checklist template is changed — version history maintained |

**Example checklists**:
- MDO daily: Machine warm-up, paper check, ink levels, test swatch, room humidity log
- KATA operator: Machine calibration, light box check, counter reset
- Dispatch: POD pending list reviewed, packing material stock checked
- Fusing operator: Machine temperature pre-check, roller condition, alignment test

---

## MODULE 22 — CHALLAN & LOT MANAGEMENT
*Every movement of fabric — in, out, or inside the factory — has a challan and lot number.*

| Sub-Module | What It Does |
|---|---|
| Lot Creation | Group fabric pieces/rolls under one Lot Number — one lot = one batch from one customer for one job |
| Lot Number Assignment | Auto-generated lot number assigned at fabric receipt — LOT-YYYY-MM-NNNN |
| Lot Tracking | Real-time location of every lot — In Store / In Production / At KATA / In Packing / Dispatched |
| Inward Challan | When fabric comes in from customer — inward challan created with lot number, meters, condition |
| Outward / Delivery Challan | When printed fabric goes out to customer — outward challan with lot reference, roll-wise meter breakdown |
| Internal Transfer Challan | When material moves within factory (store → production → KATA → dispatch) — internal challan created at each movement |
| Job / Production Challan | Challan created when lot is assigned to a jobcard — links lot to job permanently |
| Purchase Challan | When goods come in from vendor (paper, ink) — purchase inward challan |
| Return Challan | Fabric returned to customer or vendor — return challan with reason |
| Challan Number Series | Define separate number series per challan type — inward, outward, internal, job, return |
| Challan Amendment | If challan details need correction — amendment record created (original preserved) |
| Challan Cancellation | Cancel a challan with reason — cancelled challan preserved in records, not deleted |
| Challan Register | Full register of all challans — searchable by type, customer, lot, date, status |
| Lot vs Challan Report | Show all challans linked to a specific lot — full movement history from receipt to dispatch |

---

## MODULE 23 — EMPLOYEE HIRING
*Manage recruitment from job opening to first day — all in one place.*

| Sub-Module | What It Does |
|---|---|
| Job Requisition | Department raises a hiring request — role needed, number of positions, reason, urgency |
| Requisition Approval | HR and management approve or reject the requisition before posting |
| Job Posting Management | Create job description — role, skills needed, experience, salary range |
| Candidate Database | Store all CVs received — from job portals, WhatsApp, referrals, walk-ins |
| Application Tracking | Track each candidate — Applied → Shortlisted → Interview Scheduled → Selected → Offer Made → Joined / Rejected |
| Interview Scheduling | Set interview date, time, interviewer — auto-notify candidate and interviewer |
| Interview Feedback | Interviewer fills feedback form — rating on skills, attitude, fit — recommendation |
| Offer Letter Generation | Auto-generate offer letter from template — designation, salary, joining date |
| Pre-Joining Document Checklist | Documents to collect before joining — Aadhar, PAN, bank details, previous experience letter |
| Onboarding Checklist | First day checklist — ID card, system access, machine training, induction |
| Probation Tracking | Set probation period — alert when probation ends for confirmation decision |
| Recruitment Reports | Open positions, applications received, time-to-hire, source-wise (referral vs portal vs walk-in) |

---

## MODULE 24 — LEAD GENERATION
*Capture every potential customer — make sure no lead is ever lost or forgotten.*

| Sub-Module | What It Does |
|---|---|
| Lead Capture | Log leads from any source — WhatsApp inquiry, trade show, referral, website, cold call |
| Lead Source Tracking | Tag every lead with source — helps understand which channel brings best quality leads |
| Lead Database | Searchable list of all leads — name, company, fabric type interest, location, source |
| Lead Qualification | Mark lead as Hot / Warm / Cold based on urgency and fit |
| Lead Assignment | Assign lead to a specific sales person or team member for follow-up |
| Follow-up Reminder | Set next follow-up date — system reminds assigned person before the date |
| Lead Status | New → Contacted → Interested → Sample Requested → Negotiation → Converted → Lost |
| Lead-to-Customer Conversion | When lead is won — one click to create Customer Master record, no re-entry |
| Lost Reason Tracking | If lead is lost — log reason (price, quality, capacity, competitor, no response) |
| Sample Request from Lead | Before converting to customer — lead can request a sample directly from lead record |
| Conversion Report | How many leads converted to customers, by source, by sales person, by month |
| Lead Funnel View | Visual pipeline showing how many leads are at each stage |

---

## MODULE 25 — PRODUCTION ENTRY AGAINST ORDER
*Log actual production quantities daily against each order — know exactly how far along every job is.*

| Sub-Module | What It Does |
|---|---|
| Daily Production Entry | Operator enters: order number, machine, meters completed today, waste meters, shift |
| Machine-wise Entry | Same order can be split across multiple machines — each machine's production logged separately |
| Operator-wise Entry | Each MDO logs their own production — accountability at individual level |
| Shift-wise Entry | Morning / evening / night shift production logged separately — full day visibility |
| Production vs Order Target | System shows: order quantity vs total produced so far vs remaining — live completion % |
| Carry-Forward Tracking | If today's production is short of target — shortfall auto-carried to next day's plan |
| Waste Entry | Waste meters logged against each production entry — waste reason selected from master list |
| Excess Production | If more meters produced than ordered — flagged for review (billing / quality check) |
| Production Summary | Daily summary — all orders, all machines, all operators, total meters produced |
| Order Completion Alert | When cumulative production reaches 100% of order quantity → supervisor and KATA team notified |
| Production Plan vs Actual | Planned daily target vs what actually happened — gap analysis per order, per machine |
| Monthly Production Report | Total meters by machine, by operator, by book type, by month |
