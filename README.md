# 🌍 Sarthi — Travel Booking Platform & NaviBand Smart Band Ecosystem

A modern, full-stack travel booking platform inspired by Booking.com, MakeMyTrip, and Airbnb — featuring an integrated **NaviBand** smart band simulator for real-time tour guidance and navigation.

> **Live backend** deployed on [Vercel](https://vercel.com) · **Frontend** built with React 19 + TypeScript + Vite + Tailwind CSS · **Backend** powered by Express.js + MongoDB Atlas

---

## 📑 Table of Contents

- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Scripts Reference](#-scripts-reference)
- [API Endpoints](#-api-endpoints)
- [Database Models](#-database-models)
- [Frontend Pages & Features](#-frontend-pages--features)
- [NaviBand Simulator](#-naviband-simulator)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Author](#-author)

---

## 🏗️ Architecture

The repository is organized into three clean, self-contained modules:

```text
sarthi-travel-platform/
├── frontend/        → React 19 SPA (TypeScript + Vite + Tailwind CSS)
├── backend/         → Express.js REST API + MongoDB (Mongoose ODM)
├── navi/            → NaviBand Smart Band Simulator (Express + OpenRouteService)
├── server.js        → Root entry — forwards to backend/server.js (Vercel adapter)
├── vercel.json      → Vercel serverless deployment config
└── package.json     → Root orchestration scripts (concurrently runs all services)
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript 7** | Type-safe development |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **Leaflet / React-Leaflet** | Interactive maps |
| **Framer Motion** | Animations & transitions |
| **Recharts** | Dashboard charts & analytics |
| **Lucide React** | Icon library |
| **Canvas Confetti** | Celebration effects |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 4** | REST API server |
| **MongoDB Atlas + Mongoose 9** | Database & ODM |
| **JWT (jsonwebtoken)** | Authentication & authorization |
| **bcryptjs** | Password hashing |
| **Stripe** | Payment processing |
| **Multer + Sharp** | Image upload & processing |
| **Nodemailer** | Transactional emails |
| **Helmet** | HTTP security headers |
| **express-rate-limit** | Rate limiting |
| **express-mongo-sanitize** | NoSQL injection prevention |
| **xss-clean** | XSS protection |
| **hpp** | HTTP parameter pollution protection |
| **Morgan** | Request logging |
| **Compression** | Gzip response compression |

### NaviBand Simulator
| Technology | Purpose |
|---|---|
| **Express.js** | Navigation API server |
| **OpenRouteService** | Geocoding & turn-by-turn routing |
| **Axios** | External API calls |
| **CORS** | Cross-origin resource sharing |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB Atlas** account (or local MongoDB instance)
- **OpenRouteService API key** (free — [sign up here](https://openrouteservice.org/dev/#/signup))

### 1. Clone & Install

```bash
git clone https://github.com/riteshrts2k4757-star/BookYourTour.git
cd BookYourTour

# Install root + backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install NaviBand dependencies
cd navi && npm install && cd ..
```

### 2. Configure Environment Variables

See the [Environment Variables](#-environment-variables) section below for the required `.env` files.

### 3. Run the Frontend (Sarthi Travel Platform)

```bash
npm run dev
# or
npm run dev:frontend
```

> Opens at **http://localhost:5173** — Includes interactive search tabs for Tours, Hotels, Flights, Trains, Buses, and Road Trips, complete booking flow with demo payments, and role switching between Traveller, Guide, and Admin.

### 4. Run the Backend API

```bash
npm run dev:backend
```

> Starts the Express API server at **http://localhost:3000/api/v1**.

### 5. Run the NaviBand Smart Band Simulator

```bash
npm run dev:navi
```

> Runs the NaviBand navigation server on **http://localhost:5001**.

### 6. Run Everything Concurrently

```bash
npm run dev:all
```

> Concurrently boots the Backend API, the Sarthi Frontend, and the NaviBand Simulator without port collisions.

---

## 📜 Scripts Reference

| Script | Description |
|---|---|
| `npm run dev` | Start frontend dev server (Vite) |
| `npm run dev:frontend` | Same as above |
| `npm run dev:backend` | Start backend API server |
| `npm run dev:navi` | Start NaviBand navigation server |
| `npm run dev:all` | Run all three services concurrently |
| `npm run build` | Build frontend for production |
| `npm run build:frontend` | Same as above |
| `npm run build:all` | Build all applications |
| `npm start` | Start backend in production mode |
| `npm run preview` | Preview the frontend production build |

---

## 📡 API Endpoints

Base URL: `/api/v1`

### Tours (`/api/v1/tours`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | Get all tours (with filtering, sorting, pagination) |
| `GET` | `/:id` | Public | Get a single tour (with reviews & guides populated) |
| `POST` | `/` | Admin, Lead Guide | Create a new tour (with image upload) |
| `PATCH` | `/:id` | Admin, Lead Guide | Update a tour |
| `DELETE` | `/:id` | Admin, Lead Guide | Delete a tour |
| `GET` | `/top-5-cheap` | Public | Aliased query for top 5 cheapest tours |
| `GET` | `/tour-stats` | Public | Aggregation pipeline — tour statistics |
| `GET` | `/monthly-plan/:year` | Admin, Guide | Monthly plan for a given year |
| `GET` | `/tours-within/:distance/center/:latlng/unit/:unit` | Public | Geospatial query — tours within radius |
| `GET` | `/assigned` | Guide | Get tours assigned to the logged-in guide |
| `GET` | `/manage` | Admin | Get all tours for admin management |

### Users (`/api/v1/users`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | Public | Register a new user (rate-limited) |
| `POST` | `/login` | Public | Log in (rate-limited) |
| `POST` | `/logout` | Authenticated | Log out (invalidates JWT cookie) |
| `POST` | `/forgotPassword` | Public | Send password reset email |
| `PATCH` | `/resetPassword/:token` | Public | Reset password with token |
| `PATCH` | `/updateMyPassword` | Authenticated | Update current password |
| `GET` | `/me` | Authenticated | Get current user profile |
| `PATCH` | `/updateMe` | Authenticated | Update profile (name, email, photo) |
| `DELETE` | `/deleteMe` | Authenticated | Deactivate account (soft delete) |
| `GET` | `/wishlist` | Authenticated | Get user's tour wishlist |
| `POST` | `/wishlist/:tourId` | Authenticated | Add tour to wishlist |
| `DELETE` | `/wishlist/:tourId` | Authenticated | Remove tour from wishlist |
| `PATCH` | `/guide/availability` | Guide | Update guide availability windows |
| `GET` | `/` | Admin | Get all users |
| `POST` | `/` | Admin | Create a user |
| `GET` | `/:id` | Admin | Get a specific user |
| `PATCH` | `/:id` | Admin | Update a user |
| `DELETE` | `/:id` | Admin | Delete a user |

### Bookings (`/api/v1/bookings`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/mine` | Authenticated | Get current user's bookings |
| `POST` | `/checkout-session` | User | Create a Stripe checkout session |
| `POST` | `/demo-checkout` | User | Create a demo booking (no real payment) |
| `PATCH` | `/:id/cancel` | User | Cancel own booking |
| `GET` | `/assigned` | Guide | Get bookings for assigned tours |
| `PATCH` | `/:id/progress` | Guide | Update trip progress (scheduled → in_progress → completed) |
| `POST` | `/:id/refund` | Admin | Process a refund |
| `GET` | `/` | Admin | Get all bookings |
| `GET` | `/:id` | Admin | Get a specific booking |
| `PATCH` | `/:id` | Admin | Update a booking |
| `DELETE` | `/:id` | Admin | Delete a booking |
| `POST` | `/webhook` | Stripe | Stripe webhook for payment confirmation |

### Reviews (`/api/v1/reviews`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | Get all reviews (or for a specific tour via nested route) |
| `POST` | `/` | User | Create a review for a tour |
| `GET` | `/:id` | Public | Get a specific review |
| `PATCH` | `/:id` | User, Admin | Update a review |
| `DELETE` | `/:id` | User, Admin | Delete a review |
| `GET` | `/assigned` | Guide | Get reviews for guide's assigned tours |
| `PATCH` | `/:id/guide-response` | Guide | Add a guide response to a review |

> **Nested route**: `GET /api/v1/tours/:tourId/reviews` — retrieves reviews for a specific tour.

### Admin (`/api/v1/admin`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/stats` | Admin | Dashboard statistics (totals, revenue, etc.) |

### Transport (`/api/v1/transport`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/trains/search` | Public | Search trains (QRail API integration) |
| `GET` | `/trains` | Public | Search trains (alias) |
| `GET` | `/flights/search` | Public | Search flights (AviationStack API integration) |
| `GET` | `/flights` | Public | Search flights (alias) |

### NaviBand API (`navi/` — Port 5001)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & ORS status |
| `GET` | `/api/geocoding/search` | Geocode a place name to coordinates |
| `GET` | `/api/geocoding/reverse` | Reverse geocode coordinates to address |
| `POST` | `/api/directions/route` | Get turn-by-turn route between points |

---

## 🗄️ Database Models

### Tour
Fields: `name` (unique), `slug`, `duration`, `maxGroupSize`, `difficulty` (easy/medium/difficult), `ratingsAverage`, `ratingsQuantity`, `price`, `priceDiscount`, `summary`, `description`, `imageCover`, `images[]`, `category`, `featured`, `itinerary[]` (day/title/description/activities), `included[]`, `excluded[]`, `highlights[]`, `startDates[]`, `startLocation` (GeoJSON Point), `locations[]` (GeoJSON), `guides[]` (ref → User), `secretTour`.

- **Indexes**: `price + ratingsAverage`, `slug`, `startLocation (2dsphere)`, `guides`
- **Virtuals**: `durationWeeks`, `reviews` (populated from Review model)

### User
Fields: `name`, `email` (unique), `phone`, `photo`, `role` (user/guide/lead-guide/admin), `password` (hashed with bcrypt, cost 12), `passwordConfirm`, `passwordChangedAt`, `tokenVersion`, `passwordResetToken`, `passwordResetExpires`, `active` (soft delete), `wishlist[]` (ref → Tour), `guideAvailability[]` (startDate/endDate).

### Booking
Fields: `tour` (ref → Tour), `user` (ref → User), `price`, `startDate`, `numGuests`, `travellers[]` (name/age), `bookingReference` (unique), `status` (pending/confirmed/cancelled/refunded), `tripProgress` (scheduled/in_progress/completed), `paymentStatus` (pending/paid/demo_paid/failed/refund_pending/partially_refunded/refunded), `paymentProvider` (stripe/demo), `demoTransactionId`, `refundStatus`, `stripePaymentIntentId`, `stripeSessionId`, `paid`.

### Review
Fields: `review` (text), `rating` (1–5), `createdAt`, `tour` (ref → Tour), `user` (ref → User), `guideResponse` (text/responder/updatedAt).

- **Unique compound index**: One review per user per tour
- **Static method**: `calcAverageRatings` — auto-updates tour's `ratingsAverage` and `ratingsQuantity`

---

## 🎨 Frontend Pages & Features

### Pages (14 route groups, 20+ pages)

| Page | Route | Description |
|---|---|---|
| **Home** | `/` | Hero carousel, 6-tab search panel (Tours, Hotels, Flights, Trains, Buses, Road Trips), curated sections |
| **Tours** | `/tours` | Tour catalogue with filters, sorting, and grid/list views |
| **Tour Detail** | `/tours/:id` | Day-by-day itinerary, inclusions/exclusions, pricing calculator, map, reviews, booking CTA |
| **Hotels** | `/hotels` | Multi-property search with amenity badges |
| **Hotel Detail** | `/hotels/:id` | Room selection, guest forms, instant confirmation |
| **Flights** | `/flights` | Flight search with airline filters |
| **Trains** | `/trains` | Train search & booking |
| **Buses** | `/buses` | Bus route search |
| **Road Trips** | `/road-trips` | Road trip planner |
| **Destinations** | `/destinations` | Destination explorer with detail pages |
| **NaviBand** | `/naviband` | Promotional showcase of NaviBand smart band |
| **NaviBand Tour** | `/tours/:tourId/naviband` | Live turn-by-turn navigation for a booked tour |
| **Login / Register** | `/login`, `/register` | Authentication pages (guest-guarded) |
| **Forgot Password** | `/forgot-password` | Password reset request |

### Role-Based Dashboards

| Dashboard | Access | Features |
|---|---|---|
| **Traveller** | `/account`, `/dashboard` | Active trips, vouchers, profile management, booking history, wishlist |
| **Tour Guide** | `/guide/*` | Assigned tours, tourist roster, SOS alerts, NaviBand sync, review responses |
| **Admin** | `/admin/*` | Platform metrics, bookings management, revenue tracking, user management, tour CRUD, analytics |

### Key Frontend Features

- 🌓 **Dark / Light Theme** — `ThemeContext` with system preference detection
- 🔄 **1-Click Role Switcher** — Test Traveller, Guide, and Admin flows without login friction
- 📊 **Demo Data System** — Full mock data with `localStorage` persistence and one-click reset
- 🗺️ **Interactive Maps** — Leaflet-based maps for tour locations and destinations
- 🛡️ **Route Guards** — `ProtectedRoute`, `AdminRoute`, `GuideRoute`, `GuestRoute`
- 🎯 **Error Boundary** — Graceful error handling across all pages
- 🔔 **Toast Notifications** — Global toast system via `ToastContext`

---

## ⌚ NaviBand Simulator

The **NaviBand** module (`navi/`) is a standalone Express server + React frontend simulating a smart wearable band for tour navigation.

### Features
- 🧭 **Turn-by-turn navigation** via OpenRouteService directions API
- 📍 **Geocoding & reverse geocoding** for checkpoint discovery
- ❤️ **Simulated biometrics** — heart rate, step counter, compass heading
- ⌚ **Watch face UI** — digital/analog display with tour progress overlay
- 🆘 **SOS alerts** — emergency notification system
- 🔗 **Tour sync** — connects to booked tours for checkpoint-by-checkpoint guidance

### NaviBand Server Architecture
```
navi/
├── server/
│   ├── server.js                → Express app (port 5001)
│   ├── controllers/orsController.js  → OpenRouteService API controller
│   ├── services/openRouteService.js  → ORS geocoding & directions service
│   ├── routes/geocoding.js           → Geocoding API routes
│   ├── routes/directions.js          → Directions API routes
│   └── middleware/errorHandler.js    → Centralized error handler
├── tests/                       → Navigation integration tests
├── .env.example                 → Environment template
└── package.json
```

---

## 🔐 Environment Variables

### Backend (`backend/config.env`)

```env
NODE_ENV=development
PORT=3000

# MongoDB Atlas
DATABASE=mongodb+srv://<user>:<PASSWORD>@cluster0.xxxxx.mongodb.net/<dbname>
DATABASE_PASSWORD=your_db_password

# JWT
JWT_SECRET=your-ultra-secure-secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email (Mailtrap for dev, SendGrid for prod)
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_USERNAME=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
EMAIL_PORT=587
EMAIL_FROM=noreply@sarthi.com

# Stripe (optional — demo checkout works without it)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Demo payment mode
DEMO_PAYMENT_ENABLED=true

# Transport APIs
QRAIL_API_KEY=your_qrail_key
QRAIL_API_BASE_URL=https://api.qrail.in
AVIATIONSTACK_API_KEY=your_aviationstack_key
AVIATIONSTACK_API_BASE_URL=https://api.aviationstack.com
```

### NaviBand (`navi/.env`)

```env
# Get a free key at https://openrouteservice.org/dev/#/signup
OPEN_ROUTE_SERVICES=your_openrouteservice_api_key
PORT=5000
```

> **Note**: If Stripe is not configured, authenticated travellers can use the demo checkout which stores a `demo_paid` booking without real payment. For production, `DEMO_PAYMENT_ENABLED=true` is required (already set in `vercel.json`).

---

## 🚢 Deployment

### Vercel (Current Setup)

The backend is configured for **Vercel Serverless Functions**:

- `server.js` at root forwards to `backend/server.js`
- `vercel.json` defines the build and routing configuration
- The serverless handler lazy-connects to MongoDB on each cold start
- Frontend `dist/` is served as static assets in production

```bash
# Build the frontend
npm run build:frontend

# Deploy (via Vercel CLI or GitHub integration)
vercel --prod
```

### Manual / VPS

```bash
# Build frontend
npm run build

# Start backend in production
NODE_ENV=production npm start
# → serves frontend/dist at / and API at /api/v1
```

---

## 📂 Project Structure

```text
BookYourTour/
│
├── frontend/                          # React 19 + TypeScript + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── cards/                 # TourCard, HotelCard, etc.
│   │   │   ├── common/               # ErrorBoundary, shared UI
│   │   │   ├── forms/                # Search & booking forms
│   │   │   ├── layout/               # Navbar, Footer
│   │   │   ├── modals/               # Booking, confirmation modals
│   │   │   ├── naviband/             # NaviBand watch face & controls
│   │   │   └── navigation/           # Navigation UI components
│   │   ├── pages/
│   │   │   ├── home/                 # HomePage
│   │   │   ├── tours/                # ToursPage, TourDetailPage
│   │   │   ├── hotels/               # HotelsPage, HotelDetailPage
│   │   │   ├── flights/              # FlightsPage
│   │   │   ├── trains/               # TrainsPage
│   │   │   ├── buses/                # BusesPage
│   │   │   ├── road-trips/           # RoadTripsPage
│   │   │   ├── destinations/         # DestinationsPage, DestinationDetailPage
│   │   │   ├── naviband/             # NaviBandPage, NaviBandTourPage
│   │   │   ├── checkout/             # Checkout flow
│   │   │   ├── user/                 # UserDashboardPage
│   │   │   ├── admin/                # AdminDashboardPage
│   │   │   ├── guide/                # GuideDashboardPage
│   │   │   └── auth/                 # Login, Register, ForgotPassword
│   │   ├── context/                  # AuthContext, ThemeContext, ToastContext
│   │   ├── routes/                   # ProtectedRoute, AdminRoute, GuideRoute, GuestRoute
│   │   ├── services/                 # API client, mock services, NaviBand service
│   │   ├── data/                     # Mock data (tours, hotels, flights, trains, buses, etc.)
│   │   ├── types/                    # TypeScript domain models
│   │   ├── styles/                   # Global CSS
│   │   └── utils/                    # Helper utilities
│   ├── public/                       # Static assets
│   ├── dist/                         # Production build output
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                           # Express.js REST API
│   ├── controllers/
│   │   ├── authController.js          # Signup, login, logout, password reset, JWT
│   │   ├── tourController.js          # Tour CRUD, image upload, geospatial queries
│   │   ├── userController.js          # User CRUD, profile, wishlist, photo upload
│   │   ├── bookingController.js       # Stripe checkout, demo booking, refunds
│   │   ├── reviewController.js        # Review CRUD, guide responses
│   │   ├── adminController.js         # Dashboard statistics aggregation
│   │   ├── transportController.js     # Train & flight search (3rd-party APIs)
│   │   ├── errorController.js         # Global error handler
│   │   └── handlerFactory.js          # Generic CRUD factory (getAll, getOne, create, update, delete)
│   ├── models/
│   │   ├── tourModel.js               # Tour schema (GeoJSON, itinerary, guides)
│   │   ├── userModel.js               # User schema (bcrypt, JWT, wishlist)
│   │   ├── bookingModel.js            # Booking schema (Stripe + demo payments)
│   │   └── reviewModel.js             # Review schema (auto-calc average ratings)
│   ├── routes/
│   │   ├── tourRoutes.js              # Tour endpoints + nested review routes
│   │   ├── userRoutes.js              # Auth + user endpoints
│   │   ├── bookingRoutes.js           # Booking + payment endpoints
│   │   ├── reviewRoutes.js            # Review endpoints + guide response
│   │   ├── adminRoutes.js             # Admin dashboard endpoint
│   │   └── transportRoutes.js         # Train & flight search endpoints
│   ├── utils/
│   │   ├── apiFeatures.js             # Query filtering, sorting, field limiting, pagination
│   │   ├── appError.js                # Custom AppError class
│   │   ├── catchAsync.js              # Async error wrapper
│   │   └── email.js                   # Nodemailer email utility
│   ├── dev-data/                      # Seed data, sample images, Pug templates
│   ├── public/                        # Static files served by Express
│   ├── server.js                      # DB connection + Vercel serverless export
│   ├── test.js                        # Express app configuration (middleware, routes, CSP)
│   ├── config.env                     # Environment variables
│   └── package.json
│
├── navi/                              # NaviBand Smart Band Simulator
│   ├── server/
│   │   ├── server.js                  # Express server (port 5001)
│   │   ├── controllers/               # ORS controller
│   │   ├── services/                  # OpenRouteService integration
│   │   ├── routes/                    # Geocoding & directions routes
│   │   └── middleware/                # Error handler
│   ├── tests/                         # Navigation integration tests
│   ├── .env.example                   # Environment template
│   └── package.json
│
├── server.js                          # Root entry point → backend/server.js
├── vercel.json                        # Vercel serverless config
├── package.json                       # Root orchestration scripts
├── .gitignore
├── .eslintrc.json                     # ESLint config (Airbnb + Prettier)
└── .prettierrc                        # Prettier config
```

---

## 🔒 Security

The backend implements multiple layers of security:

- **Helmet** — Sets secure HTTP headers with strict Content Security Policy
- **Rate Limiting** — 1000 requests/hour on `/api` routes; 10 attempts/15 min on auth endpoints
- **JWT Authentication** — HTTP-only secure cookies with token versioning for instant logout
- **bcrypt** — Password hashing with cost factor 12
- **express-mongo-sanitize** — Prevents NoSQL injection attacks
- **xss-clean** — Sanitizes user input against XSS
- **hpp** — Prevents HTTP parameter pollution
- **Input Validation** — Mongoose schema validators + express body size limits (10kb)
- **Soft Deletes** — User accounts are deactivated, not permanently deleted

---

## 👨‍💻 Author

**Ritesh Kumar**

- GitHub: [@riteshrts2k4757-star](https://github.com/riteshrts2k4757-star)

---

## 📄 License

ISC
