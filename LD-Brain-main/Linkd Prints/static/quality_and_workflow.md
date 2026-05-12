# Linkd Prints — Quality Standards & Production Workflow
**Last Updated: 2026-04-20**

---

## 8-Stage Production Workflow

### Order Intake Requirements

**Client registration info needed:**
- Business/client name, office/factory address, GST number, phone, email, delivery address

**Per-order info needed:**
- Fabric quality name | GSM & width if custom
- Quantity in meters | Design/artwork file (TIFF, PSD, JPEG, PDF)
- Finishing requirements (soft finish, calendaring, fusing, rolling, etc.)
- Delivery deadline

### Production Stages

| Stage | Title | What Happens |
|---|---|---|
| 1 | **Order Receipt** | Design numbers, quantity per design, total designs collected via WhatsApp or direct |
| 2 | **Challan Verification** | Verify client fabric challan: lump count, total meters, fabric condition, labeling |
| 3 | **Fabric Stock Entry** | Logged in IMS: fabric type, GSM, width, total meters received per client |
| 4 | **Order Assignment** | Assigned to MDO; MDO organises design files, prepares for print alignment |
| 5 | **Design Extraction** | MDO retrieves approved files from LINKD Design Database; transfers to machine terminal |
| 6 | **Design Setup** | MDO aligns design to fabric width (36", 58", 64", 72") with repeat control |
| 7 | **Jobcard & Challan** | ERP generates Jobcard/Production Challan — master reference for entire production cycle |
| 8 | **Record & Tracking Entry** | Order logged in Google Sheet; unique Order ID + WhatsApp tracking link sent to client |
| 9 | **Printing (paper)** | Design printed onto sublimation transfer paper on printing machines |
| 10 | **Fusing — MANDATORY** | Printed paper + grey fabric fed together through fusing machine at 185–230°C. Sublimation transfer happens here. Design embeds into polyester permanently. Paper discarded. |
| 11 | **Calendering** | Fabric passed through calendar machine for surface smoothing and lustre finish |
| 12 | **KATA — Measurement + QC** | Fabric measured on inspection machine; visual QC; defects photographed; report generated |
| 13 | **Rolling + Packing** | Fabric wound onto rolls, tagged, and packed per customer spec |
| 14 | **Invoice + Challan** | SAB raises GST invoice; delivery challan generated; both available on tracking link |
| 15 | **Dispatch** | Fabric handed to transporter; signed POD collected; tracking link updated to Dispatched |

**MDO (Machine/Design Operator)**: Key role between sales and machine. Owns design file management, print alignment, and setup. Not in principal ownership chart — Nandu Bhai likely supervises.

---

## Real-Time Order Tracking System

| Element | Detail |
|---|---|
| Trigger | Order entry (Stage 8) |
| Unique Order ID | Generated per job |
| Client notification | WhatsApp tracking link sent immediately |
| Live view | Client sees: Printing → Fusing → Calendar → Finishing → Dispatch |
| Documents | Client can download digital Delivery Challan and Invoice from the tracking link |

*This is a competitive differentiator — most competitors run on WhatsApp notes and verbal updates.*

---

## Quality Standards

### Pre-Production QC
- Full sample approval before production run on every new job or new customer
- Customer-approved reference color/print kept on physical file
- No production without written job spec
- **Rule**: Every new job and every new customer must pass sample approval before bulk production starts. No exceptions.

### During Production
- Per-batch color monitoring with delta-E checks
- Banding check at start of every new paper roll change
- Pressure consistency check at press setup

### Post-Production
- 100% visual inspection on critical/large jobs
- Random AQL sampling on standard repeat jobs
- Defect photography — build library so quality standards don't drift with staff turnover

### Shade / Color Consistency
- Batch-to-batch variation = #1 customer complaint in print jobwork
- Shade continuity card maintained per design/customer
- Any delta above tolerance = hold + customer conversation before dispatch

---

## KATA Department — Measurement & Final QC

| Spec | Detail |
|---|---|
| Purpose | Accurate fabric length measurement + final visual quality verification before dispatch |
| Equipment | Fabric measuring/inspection machines with digital counters (±1 mm/m); top + bottom illumination |
| Meter accuracy | ±0.5% or ±1 m per 200 m |
| Defect detection | Stains, holes, streaks, misprints — zero tolerance |
| Edge integrity | Clean and aligned edges |
| Roll hardness | Even winding; no telescoping |
| Documentation | Inspection report + photos attached to every job record |

---

## Sampling Department

| Spec | Detail |
|---|---|
| Purpose | Test + validate designs for colour, quality, fabric compatibility before bulk production |
| Sample types | 9×9", 11×11", 4×6" swatches; Yardage; Booklet |
| Sample size | 1.5–2 meters for client sampling; 1–1.5 meters for in-house designer sampling |
| Dispatch | Courier / Salesperson / Client pickup |
| QC parameters | Colour match accuracy, fabric surface smoothness, design sharpness, no streaks/banding/ghosting |

---

## Design Team Capabilities (Naushi-led, 10+ designers)

**Software stack**: Adobe Illustrator, Photoshop, CorelDRAW, CLO3D
**Supported file formats**: TIFF, PSD, JPEG

| Design Specialisation | Primary Software |
|---|---|
| Floral Designs | Illustrator, Photoshop |
| Abstract Art | CorelDRAW, Photoshop |
| Geometrical Patterns | Illustrator, CorelDRAW |
| Ethnic & Traditional (mandalas, block prints) | Photoshop, Illustrator |
| Typography & Graphic Mix | Illustrator, Photoshop |
| Kids & Cartoon Prints | CorelDRAW, Illustrator |
| Geometric & Optical Art (3D illusion) | Photoshop, Illustrator |

**Design services offered:**
- Custom design from client brief (theme, colour palette, fabric type)
- Theme-based seasonal/concept collection development
- Design modification — colour, motif, scale, repeat adjustment with version control
- Colorway creation — expand designs into multiple colorways using Pantone + ICC profiles
- Mockup & visualization on apparel/upholstery
- Trend forecasting via WGSN, Pinterest, fashion shows
- Design archiving — stored in **LINKD Design Repository** with metadata

*The design team + LINKD Design Repository is an underused sales asset. Can be pitched to Book B2 brands as full-service design-to-print capability.*
