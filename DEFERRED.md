# AutoFix GH — Deferred Features

This file lists features that were **explicitly deferred** from Phase 1.  
They are not gaps or oversights — they are deliberate business decisions to ship a working product first.

When AutoFix GH reaches scale and Phase 1 is stable, pick these up in order of the phase they belong to.

---

## Phase 2 — Insurance (target: months 4–6)

These require NIC Ghana licensing, insurer relationships, and regulatory sign-off.  
Do not build before those are in place.

| Feature | Notes |
|---|---|
| Insurance claims portal (owner-facing) | Claim submission, photo upload, tracking |
| Claim state machine | SUBMITTED → UNDER_REVIEW → APPROVED / REJECTED → SETTLED |
| Insurer API integration — Level 1 | REST API for insurers who have one |
| Insurer API integration — Level 2 | Web portal scraping for insurers without an API |
| Insurer API integration — Level 3 | Email bridge for legacy insurers |
| NIC Ghana compliance module | Licensing requirements, regulated data fields |
| Claim photo upload | expo-image-picker + Supabase Storage |
| AI-assisted claim pre-assessment | Flag suspicious claims before sending to insurer |
| Settlement tracking | Push / SMS when claim is paid |

---

## Phase 3 — Intelligence (target: months 7+)

These depend on Phase 1 data accumulation. The data pipeline (job history, SOS history, all linked via `vehicle_id`) is being seeded from Day 1 precisely so these can be built.

| Feature | Notes |
|---|---|
| Vehicle Health Score dashboard | Score is computed from job + SOS history per vehicle |
| Predictive maintenance alerts | "Your Toyota Camry is due for service based on mileage + history" |
| AI claim assessment | Score a claim's legitimacy before human review |
| Parts marketplace | Owner can order parts; garage can fulfil |
| OEM dealer portal | OEMs list parts; connect to marketplace |
| B2B AI assessment API | Sell the assessment engine to other insurers as an API |
| Advanced garage analytics | Booking trends, revenue reports, peak hours |

---

## Post-MVP Enhancements (any phase, lowest priority)

These are improvements to Phase 1 features. Build when the core product has traction.

### Communication
| Feature | Notes |
|---|---|
| Push notifications (FCM / APNs) | Using SMS only for now (Supabase built-in) |
| In-app chat (owner ↔ technician) | Real-time via Supabase Realtime |
| Technician rating & review system | After each completed job |
| SMS provider: Arkesel | Replace Supabase/Twilio default with Arkesel for Ghana |

### Discovery
| Feature | Notes |
|---|---|
| Map view for garage list | Using list view only; expo-maps already installed |
| Garage search by location radius | Requires PostGIS extension on Supabase |
| Advanced filters | By service type, rating, price, availability |

### Payments
| Feature | Notes |
|---|---|
| Apple Pay / Google Pay | Adding Paystack card + MoMo first |
| Split payment (insurance + self-pay) | Phase 2 when insurance portal is live |
| Garage invoice PDF generation | React PDF or server-side |

### Fleet & Corporate
| Feature | Notes |
|---|---|
| Fleet management portal | Corporate clients with multiple vehicles |
| Fleet subscription tiers | Bulk pricing, fleet reporting |

### Localisation
| Feature | Notes |
|---|---|
| Twi language | Ghana's most spoken local language |
| Ewe language | Volta region |
| Ga language | Greater Accra |

---

## How to Bring a Deferred Feature Back

1. Move the row from this file into the relevant section of `05 - Roadmap.md` in Obsidian
2. Create a branch: `feat/<feature-slug>`
3. Follow the standard dev workflow: research → plan → TDD → review → commit

Do not remove a row from this file until the feature is fully merged and live.
