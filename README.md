# ✦ STYLE / SWITCH — Haute Circularity & Designer Rental Marketplace

> **"Wear luxury. Switch anytime. Own nothing."**  
> StyleSwitch is a full-stack, peer-to-peer (C2C) luxury fashion rental platform that makes high-end designer garments, occasion wear, wedding sherwanis, and cocktail gowns accessible, circular, and sustainable.

---

## 🏛️ Brand & UI/UX Design System

Inspired by the physical craftsmanship of **Relevo & Vinco** (Awwwards-recognized inkless packaging atelier):
* **Tactile Material Metaphor:** The digital interface mimics heavy pressed paperboard, blind-debossed letterpress typography, fine scorelines, and die-cut sleeves.
* **Curated Palette:**
  * **Signature Red (`#E11D48`):** Reserved for focal action buttons, live prices, and concentric wax-seal badges.
  * **Deep Obsidian & Charcoal (`#0B0C0E` / `#111215`):** Creates couture contrast, luxury cards, and velvet image backdrops.
  * **Moonlit Silver & Silk White (`#F4F5F8` / `#FFFFFF`):** High-grade background with subtle specular sheen and inner rim lighting.
* **Editorial Typography:**
  * *Headings:* **Cinzel** & **Cormorant Garamond** (Haute couture display serifs)
  * *Body:* **Plus Jakarta Sans** (Ultra-clean modern geometry)
  * *Archival Tags & Specs:* **DM Mono** (Specimen numbers, serial codes, timestamps)

---

## ⚡ Core Features

### 1. Interactive Availability Calendar (`ClothCalendar`)
* Custom-built interactive calendar embedded directly into each garment.
* Real-time booked date detection via `GET /api/bookings/availability/:clothId`.
* **Zero Double-Bookings:** Past dates and existing reservations are disabled and displayed with strikethroughs and red indicator dots. Only remaining available dates are selectable.
* Simple two-click range selection: Click **Start Date** &rarr; Click **Return Date**.
* Instant price breakdown: $\text{Rental Total} = (\text{Days} \times \text{PricePerDay}) + \text{Refundable Deposit}$.

### 2. Haute Clothes Detail Page
* Modeled on high-fashion atelier specification sheets.
* **Full-Height Portrait Showcase:** High-resolution model photography with multi-angle thumbnails.
* **Feature Badges:** Custom Fitting, 100% Refundable Deposit, Doorstep Delivery & Retrieval.
* **Atelier Measurement Matrix:** Dynamic tailored measurement charts for Lehengas, Sherwanis, Tuxedos, Blazers, and Gowns.
* **Embedded Availability Calendar:** Located in the center for seamless date selection before booking.
* **Direct Reservation:** Instant booking creation sent directly to `POST /api/bookings`.

### 3. Aligned Catalog Grid & Single Action CTA
* Clean, symmetric catalog grid where all garment cards maintain an **exact horizontal baseline**:
  * Uniform 3:4 portrait image ratios.
  * 2-line clamped titles preventing uneven card heights.
  * Baseline-locked price display and single primary button: **`RENT NOW ↗`**.
* Clicking **"RENT NOW"** routes directly to the garment's detail page for date selection and reservation.

### 4. Comprehensive User Dashboard (`DashboardPage`)
* **My Rentals (Renter View):** Track all reserved garments, dates, live approval status (`PENDING`, `CONFIRMED`, `COMPLETED`), and payment summaries.
* **My Wardrobe (Lender View):** Manage listed items, rental rates, availability switches, and earnings.
* **Incoming Requests (Lender View):** Review renter booking requests with one-click **Approve**, **Decline**, or **Mark Returned/Completed** actions.

### 5. Multi-Image Upload & Server-Side Cloudinary
* Supports multi-image listings from the "List a Piece" portal.
* Automatically streams Base64 strings to **Cloudinary** server-side, with graceful fallback to local storage if API credentials are mock values.

### 6. High-Performance Architecture & Load Verified
* Stress-tested with **10 concurrent users** using Autocannon:
  * `GET /api/cloth`: **2,483 requests** in 15s (100% 2xx, **0 errors**, avg latency **59.9 ms**).
  * `GET /api/cloth/search`: **3,274 requests** in 15s (**0 errors**, avg latency **45.3 ms**).

---

## 🛠️ Tech Stack

### Frontend (`StyleSwitch-client`)
* **Framework:** React 19, TypeScript
* **Bundler & Tooling:** Vite 8, Oxlint
* **Styling:** Tailwind CSS v4, Custom CSS Design Tokens, KaTeX math
* **Animations:** Framer Motion (Kinetic springs, scroll-linked parallax, stagger effects)
* **Icons:** Lucide React

### Backend (`StyleSwitch-server`)
* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js 4
* **Database:** MongoDB & Mongoose 7
* **Authentication:** JWT (JSON Web Tokens), Bcrypt password hashing
* **Media Storage:** Cloudinary SDK
* **Testing:** Autocannon load testing suite

---

## 📁 Project Directory Structure

```
StyleSwitch/
├── StyleSwitch-client/                 # Frontend React Application
│   ├── src/
│   │   ├── api/
│   │   │   ├── apiClient.ts            # Centralized fetch wrapper with JWT injection
│   │   │   ├── clothService.ts         # Clothes CRUD & Search endpoints
│   │   │   └── bookingService.ts       # Booking & availability endpoints
│   │   ├── components/
│   │   │   ├── ClothCalendar.tsx       # Custom date availability calendar
│   │   │   ├── ClothCalendar.css
│   │   │   ├── ClothCard.tsx           # Uniform card with single RENT NOW action
│   │   │   ├── ClothCard.css
│   │   │   ├── BookingModal.tsx        # Quick booking modal
│   │   │   ├── Navbar.tsx              # Sticky glassmorphism nav with user dashboard
│   │   │   └── Footer.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx         # Global auth state & session verification
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx         # Relevo & Vinco inspired tactile atelier
│   │   │   ├── BrowsePage.tsx          # Filterable catalog with search
│   │   │   ├── ClothDetailPage.tsx     # High-fashion detail page with embedded calendar
│   │   │   ├── ClothDetailPage.css
│   │   │   ├── DashboardPage.tsx       # My Rentals, Wardrobe & Incoming Requests
│   │   │   ├── AddClothing.tsx         # List a new garment form
│   │   │   └── AuthPage.tsx            # Login & Registration
│   │   ├── App.tsx                     # Declarative state-based router
│   │   └── App.css                     # Global tactile design system
│   └── package.json
│
├── StyleSwitch-server/                 # Backend REST API Server
│   ├── config/
│   │   ├── db.js                       # MongoDB connection
│   │   └── cloudinary.js               # Cloudinary uploader with fallback
│   ├── controller/
│   │   ├── Auth.controller.js          # Register, Login, Me
│   │   ├── Booking.controller.js       # Bookings & Availability endpoints
│   │   ├── Cloth.controller.js         # Clothes listing & multi-image upload
│   │   └── Payment.controller.js       # Razorpay orders & webhook verification
│   ├── middleware/
│   │   └── Auth.middleware.js          # JWT protection middleware
│   ├── model/
│   │   ├── Booking.model.js            # Booking schema (tenant, lender, dates, status)
│   │   ├── Cloth.model.js              # Garment schema with availability
│   │   └── User.model.js               # User schema (roles: tenant, lender, admin)
│   ├── routes/
│   │   ├── Auth.route.js
│   │   ├── Booking.route.js            # Includes /availability/:clothId
│   │   ├── Cloth.route.js
│   │   └── User.route.js
│   ├── loadtest.js                     # 10-user concurrent load test script
│   ├── seed.js                         # Database seeder with 6 designer garments
│   ├── server.js                       # Express app entrypoint
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** v18+ (tested on Node v22)
* **MongoDB** installed and running locally on port `27017` (or MongoDB Atlas URI)

### 2. Environment Variables
Create a `.env` file in `StyleSwitch-server/`:

```env
PORT=5000
MONGO_URL=mongodb://localhost:27017/styleswitch
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Cloudinary (Optional - falls back to Base64 if placeholders)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay (Optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Backend Setup & Database Seeding
```powershell
cd StyleSwitch-server

# Install dependencies
npm install

# Seed the database with 6 authentic designer pieces & demo accounts
npm run seed

# Start the server (runs at http://localhost:5000)
npm run dev
```

### 4. Frontend Setup
```powershell
cd StyleSwitch-client

# Install dependencies
npm install

# Start the Vite development server
npm run dev
# Open http://localhost:5173/ or http://localhost:5174/ in your browser

# Run the automated unit test suite (calendar math, double-booking guard, single admin security)
npm test
```

### 5. Running the 10-User Concurrent Load Test
Make sure the backend server is running, then execute:
```powershell
cd StyleSwitch-server
node loadtest.js
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Demo Admin** | `admin.demo@styleswitch.com` | `AdminSwitch@123` | Platform oversight, user bans/roles, garment moderation & disputes |
| **Demo Lender** | `lender.demo@styleswitch.com` | `StyleSwitch@123` | Inspect incoming booking requests & listed wardrobe |
| **Demo Renter** | `testrenter@styleswitch.com` | `Pass1234!` | Browse, select calendar dates & place reservations |

---

## 📡 API Reference Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Create new account |
| `POST` | `/api/auth/login` | Public | Login & receive JWT |
| `GET` | `/api/auth/me` | Protected | Validate active session |
| `GET` | `/api/cloth` | Public | Retrieve all listed clothes |
| `GET` | `/api/cloth/search` | Public | Filter clothes by category, size, price, etc. |
| `GET` | `/api/cloth/:id` | Public | Get single garment details |
| `POST` | `/api/cloth` | Protected | List a new piece with images |
| `GET` | `/api/cloth/my` | Protected | Get logged-in lender's clothes |
| `GET` | `/api/bookings/availability/:clothId` | Public | **Get real-time booked date ranges for calendar** |
| `POST` | `/api/bookings` | Protected | Create a new rental reservation |
| `GET` | `/api/bookings/my` | Protected | Get renter's active & past bookings |
| `GET` | `/api/bookings/lender` | Protected | Get lender's incoming rental requests |
| `PUT` | `/api/bookings/:id` | Protected | Update booking status (`CONFIRMED`, `REJECTED`, `COMPLETED`) |
| `GET` | `/api/admin/overview` | Admin | High-level platform KPIs, gross revenue & recent activity |
| `GET` | `/api/admin/users` | Admin | Retrieve all registered users |
| `POST` | `/api/admin/users/:id/toggle-block` | Admin | Block or unblock fraudulent or abusive accounts |
| `PUT` | `/api/admin/users/:id/role` | Admin | Update user role (`admin`, `lender`, `tenant`) |
| `GET` | `/api/admin/clothes` | Admin | All garments across all lenders |
| `POST` | `/api/admin/clothes/:id/toggle-availability` | Admin | Archive/hide or publish garments |
| `DELETE` | `/api/admin/clothes/:id` | Admin | Permanent garment takedown |
| `GET` | `/api/admin/bookings` | Admin | Master ledger of all platform bookings |
| `PUT` | `/api/admin/bookings/:id/status` | Admin | Force update/override booking status |
| `GET` | `/api/admin/reports` | Admin | All dispute/incident reports |
| `PUT` | `/api/admin/reports/:id` | Admin | Update report status & attach admin notes |
| `POST` | `/api/payments/create-order` | Protected | Create payment order with refundable security deposit |
| `POST` | `/api/payments/:id/confirm` | Protected | Confirm payment & auto-dispatch in-app alerts |
| `POST` | `/api/payments/:id/refund-deposit` | Protected | Release deposit return to renter |
| `GET` | `/api/notifications` | Protected | Retrieve user notifications & booking alerts |
| `POST` | `/api/notifications/:id/read` | Protected | Mark notification as read |
| `GET` | `/api/wishlist` | Protected | Retrieve bookmarked outfits in Saved Vault |
| `POST` | `/api/wishlist` | Protected | Add piece to Saved Vault |
| `DELETE` | `/api/wishlist/:clothId` | Protected | Remove piece from Saved Vault |

---

## 🛡️ License
MIT &copy; 2026 StyleSwitch Team. All rights reserved.
