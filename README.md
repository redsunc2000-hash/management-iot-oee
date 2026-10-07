# Kankyo IoT – Production Monitoring (OEE mock-up)

Interactive mock-up of an OEE (Overall Equipment Effectiveness) monitoring web app for **Kankyo Solutions**, a sample plant with an air filter line and a water filter line. Machine data is simulated in the browser and updates every second, so the app behaves like it is connected to real machines.

Built with plain **HTML, CSS and JavaScript**. There is no framework, no build step and no backend.

## Try it

| Username | Password | Access |
|---|---|---|
| `admin` | `admin` | All modes, all assets |
| `manager` | `manager` | View mode (edit), Operation and Admin (view only) |
| `operator` | `operator` | View and Operation, Air Filter Zone only |
| `maint.tech` | `maint.tech` | Maintenance technician: View, Operation, Machine Health and Spare Part |

After login, choose **Production Monitoring**.

> These are demo accounts for a mock-up. Passwords live in the client-side code. Do not reuse this login for anything real.

## Features

- **View mode**: Overview, Plant Layout, Availability, Performance, Quality, Benchmark, Job Tracking, Loss, Alarm, Machine Detail, Machine Health, Energy, SPC, Daily Report
- **Operation mode**: Work Order and Shift Log, turn machines on/off with a reason, count good/bad parts, edit availability/performance/quality history
- **Admin mode**: Asset (with CSV import), Role (menu + asset permissions), User, Plan Production (weekly shift + daily override), Reason, Job, Alarm rules, Sensor (limits + maintenance plan), Spare Part, Banner, Line Notify, Access Log
- **Machine Health**: sensors chosen per machine type (vibration, motor/oil/barrel/mold/oven temperature, current, hydraulic and air pressure, web tension, ultrasonic frequency, pressure decay, power) plus room temperature, humidity and PM2.5 per line; health score, sensor alarms, time-to-limit prediction, PM and tool-wear counters, energy per piece, maintenance log
- **Work Order (CMMS)**: create from an alarm, Machine Health or a failed checklist item; assign, start, complete with parts used; MTBF and MTTR per machine
- **Spare Part**: stock, minimum, reserved by open work orders, receive stock; low stock shows on wear warnings
- **Energy**: kWh, TOU cost, Wh per piece, energy used while stopped, CO₂, load profile (tariff is editable)
- **SPC**: X̄-R charts of process sensors, control rules, Cpk against the warning limit
- **Shift Log**: start-of-shift checklist per machine type and shift handover notes with an automatic shift summary
- Live alarms (ticker, toasts, sidebar warning icons), CSV export, print to PDF
- Neumorphic white/blue theme with dark mode (theme button in the top bar)

## OEE formulas

```
Availability = Run time / Planned production time
Performance  = Actual output / Target (run time × ideal rate × cavity)
Quality      = Good parts / Actual output
OEE          = Availability × Performance × Quality
```
Planned production time comes from **Admin → Plan Production**.

## Run locally

Open `index.html` in Chrome or Edge, or serve the folder:

```bash
npx http-server -p 8080 -c-1
# then open http://localhost:8080
```

## Deploy on Render

1. Push this folder to a GitHub repository (this folder is the repo root).
2. In Render choose **New → Static Site** and connect the repository.
3. Leave **Build Command** empty and set **Publish Directory** to `.`.
4. Deploy. Every push to the main branch redeploys automatically.

You can also use **New → Blueprint**, which reads `render.yaml`.

## Notes

- Each visitor gets independent data. Settings (assets, roles, jobs…) are saved in that browser's `localStorage`. Simulated history regenerates on every page load. Super Admin can restore the defaults from the user menu: **Reset demo data**.
- LINE Notify was discontinued on 31 March 2025. The LINE screens here are simulated. A production build should use the LINE Messaging API or another channel.
- Fonts load from Google Fonts. Without internet the app falls back to system fonts.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page shell |
| `style.css` | Theme and layout |
| `data.js` | Seed data, machine simulation, OEE calculations |
| `charts.js` | SVG charts (no library) |
| `health.js` | Sensor simulation, health score, prediction, maintenance counters |
| `maint.js` | Work orders, spare parts, energy, SPC and shift logic |
| `ops.js` | Work Order, Shift Log, Energy, SPC and Spare Part pages |
| `app.js` | Screens, permissions, forms, tables |
| `render.yaml` | Render static-site blueprint |
