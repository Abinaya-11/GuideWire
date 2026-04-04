# RiderShield (GuideWire) — Phase 2: Automation & Protection

Parametric protection for gig riders in Chennai: automated monitoring, zone-aware weekly pricing, and payout records created when objective triggers fire—no forms, no adjuster queue.

---

## 1. Project Persona

RiderShield is built for **Chennai delivery partners** across **food delivery**, **grocery / quick commerce**, and **e-commerce last-mile** segments. These riders depend on daily earnings; floods, heat, and severe air quality can make work unsafe or impossible with no income backstop. The product treats them as the primary user: a rider-facing portal for cover status and payout history, and an admin view for operational visibility—not a generic “insurance app” for consumers.

---

## 2. Weekly Pricing Model

Coverage is priced as a **small weekly premium** that reflects **zone-specific risk**, not a flat city-wide rate.

- **Band:** approximately **₹50–₹70 per week**, driven by a simple **dynamic risk engine** on the API.
- **Logic:** the backend exposes `GET /premium/calculate?zone=<name>`. Premium is chosen with **zone-based rules**—for example, **flood-prone Velachery** carries a **higher weekly rate** than lower-risk areas, matching the idea that expected parametric exposure is priced into the fee.
- **UI:** the rider dashboard loads this value from the API and surfaces it clearly as **“Your Weekly Premium”** so the price riders see always matches the server rule set.

This keeps pricing transparent and allows the product to evolve (more zones, finer tiers, or ML-informed risk scores) without rewriting the client.

---

## 3. Parametric Triggers

Phase 2 implements **three automated parametric triggers**. When conditions are met for a monitored zone, the system records a payout with a **`triggerType`**, human-readable **`trigger` text**, **`timestamp`**, and payout amount.

| Trigger | Condition | Payout (reference) |
|--------|-----------|---------------------|
| **Heavy rain** | Rainfall **> 15 mm** (1h, from OpenWeather) | ₹300 |
| **Extreme heat** | Temperature **> 42 °C** | ₹200 |
| **Severe air quality** | **AQI > 300** (derived from OpenWeather Air Pollution data / PM2.5 mapping) | ₹150 |

A scheduled **worker** evaluates Chennai service zones on a cron; each run can evaluate **rain**, **heat**, and **AQI** independently, so multiple triggers may apply when the environment is severe across dimensions.

---

## 4. Zero-Touch Claims

There is **no manual “file a claim” step** for the rider.

1. **Ingestion:** A Node worker calls **OpenWeather** (current weather + air pollution where configured) for fixed coordinates per zone.
2. **Evaluation:** Each response is compared to the three thresholds above.
3. **Action:** If a threshold is exceeded, the worker calls **`db.collection('payouts').add(...)`** on **Firebase / Firestore** with structured fields (`triggerType`, `timestamp`, zone metadata, amount, status, etc.).
4. **Visibility:** The **Express** API serves **`GET /payouts`** to the React app; riders and admins see history without anyone submitting paperwork.

The rider’s only interaction is using the app to see **active cover**, **weekly premium**, and **verified payout lines**—the pipeline from weather signal to ledger entry is fully automated.

---

## 5. Tech Stack Update

| Layer | Technology | Role in Phase 2 |
|-------|------------|-----------------|
| **API** | **Node.js** + **Express** | REST endpoints: health, premium calculation, payout list, admin payout creation; CORS for the React dev server. |
| **Data** | **Firebase Admin** + **Firestore** | System of record for payout documents; local/dev can use an in-memory fallback when a service account is not present. |
| **Automation** | **Node worker** (`node-cron`, **axios**) | Polls OpenWeather (and air pollution) on a schedule, applies trigger logic, writes payouts. |
| **Web** | **React** | Rider and admin UIs; fetches premium and payouts from the API; demo controls for simulating triggers. |
| **Dynamic risk engine** | **Express route + worker rules** | **Pricing:** zone → weekly premium via `/premium/calculate`. **Risk / payout:** threshold rules per trigger type and zone batch in the worker—extensible toward richer scoring or the **ML** experiment under `ml/` (e.g. zone risk labels) without changing the core claim automation pattern. |

Together, this stack delivers **Phase 2: Automation & Protection**—objective triggers, automatic Firestore records, and zone-aware weekly pricing for Chennai delivery partners.

---

*RiderShield — hard work shouldn’t depend on the clouds.*
