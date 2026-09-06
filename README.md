# KrishiSetu 🌾

**Smart Agricultural Procurement & Matchmaking Platform**

Connecting Farmers with Verified Buyers through Transparent Price Negotiation, Direct Settlement, and Ecosystem Aggregation.

KrishiSetu is a zero-commission digital marketplace designed to eliminate traditional middlemen. It directly connects verified small and medium-scale farmers with verified business buyers (traders, retailers, kirana stores, restaurants, and wholesalers). KrishiSetu facilitates the negotiation and matchmaking, while payments are settled directly between parties. It also serves as an agricultural hub, linking farmers to verified logistics providers and other Farmer-to-Consumer (F2C) platforms.

```text
Discover ──► Compare ──► Negotiate ──► Off-Platform Settlement ──► (Optional: Transport Ref) ──► Pickup
```

---

## 📌 Problem Statement

Small and medium-scale agricultural producers face recurring systemic challenges:

* **Intermediary Dependency:** Heavy reliance on local commission agents and traders leads to diminished profit margins for farmers.
* **Price Opacity:** Absence of accessible, real-time market price benchmarks (APMC/MSP) leads to exploitation during negotiations.
* **Fragmented Ecosystem:** Farmers lack a centralized hub to discover reliable buyers, third-party logistics, and alternative F2C platforms.
* **Procurement Inefficiencies:** Buyers struggle to locate consistent, reliable agricultural suppliers with verified quality produce.

---

## 💡 Solution & Core Philosophy

KrishiSetu provides an end-to-end digital matchmaking ecosystem. Our core philosophy is **facilitation without interference**—we provide the tools to negotiate and connect, but keep the transactions decentralized.

* **Direct Negotiation & Settlement:** KrishiSetu facilitates matchmaking and price negotiation. Payments are settled directly between the farmer and buyer based on the finalized offer. We charge zero commission.
* **Smart Price Benchmarking:** Instant visibility of local APMC rates and Government Minimum Support Prices (MSP) alongside farmer asking prices ensures fair negotiations.
* **Flexible Offer System:** Support for accepting the asking price (**Buy Now**) or proposing custom rates and quantities (**Make Offer**).
* **Verified Logistics References:** When transportation is required, the platform provides trusted references to verified third-party agricultural freight services (e.g., Kisan Rath, KisanSabha).
* **Partner Platforms Hub:** A curated directory linking farmers to other reliable F2C platforms, expanding their direct-selling opportunities.
* **Verified Profiles:** Identity and credential verification for both farmers and commercial buyers to ensure a safe trading environment.

---

## 🎯 Objectives

* **Zero-Commission Trade:** Establish a reliable digital venue for direct farmer-to-buyer negotiations without extracting margins.
* **Enhanced Price Transparency:** Integrate official APMC market rates and MSP references to empower informed trade.
* **Unified Agricultural Hub:** Serve as the central starting point for farmers by aggregating buyers, logistics providers, and partner platforms.
* **Verified Ecosystem:** Build trust using administrative verification for all marketplace participants.

---

## ✨ Key Features

### 🚜 Farmer Capabilities
* **Account Management:** User registration, profile setup, and identity verification submission.
* **Listing Creation:** Post crop listings specifying category, quantity, quality grade, asking price, location, and photos.
* **Offer Negotiation:** Receive, review, accept, or reject custom price and quantity offers submitted by buyers.
* **Direct Settlement Management:** Track accepted offers and mark them as completed once direct payment and pickup are settled.
* **Partner Hub Access:** Discover alternative F2C platforms and on-demand logistics references.

### 🛍️ Buyer Capabilities
* **Browse & Search:** Search agricultural listings with filters for crop type, location, quantity, price range, and seller rating.
* **Market Price Reference:** View relevant APMC rates and MSP directly on listing detail pages.
* **Accept & Negotiate:** Instantly accept a farmer's asking price or propose a custom unit price and quantity.
* **Logistics Assistance:** Access verified transporter references if assistance is needed to move purchased produce.
* **Seller Reviews:** Submit ratings and qualitative feedback upon successful settlement and pickup.

### 🛡️ Admin Capabilities
* **User Verification:** Review and approve farmer and buyer registration credentials.
* **Content Moderation:** Monitor and approve crop listings to ensure marketplace quality standards.
* **Ecosystem Management:** Add and update links to trusted external F2C platforms and logistics providers in the Partner Hub.
* **Market Rate Updates:** Maintain and update benchmark APMC reference rates and MSP values.

---

## 🏷️ Pricing System

KrishiSetu equips buyers and farmers with a **Smart Price Indicator** that dynamically evaluates listing prices against market benchmarks using rule-based metrics:

| Indicator | Classification | Description |
| :--- | :--- | :--- |
| 🟢 **Fair Price** | Market Aligned | Farmer asking price closely matches prevailing APMC market rates. |
| 🟡 **Below Market** | High Value | Farmer asking price is below prevailing APMC market rates. |
| 🔴 **Above Market** | Premium Pricing | Farmer asking price exceeds prevailing APMC market rates (often reflecting premium quality). |

---

## 🏗️ Full-Stack Architecture & Directory Structure

KrishiSetu is built on **Next.js 14 App Router** paired with **Supabase** (PostgreSQL, Auth, RLS, and Storage).

```text
KrishiSetu/
├── app/                        # Next.js 14 App Router Pages & API Routes
│   ├── (auth)/                 # Authentication & KYC Verification routes
│   ├── (dashboard)/            # Role dashboards (Farmer, Buyer, Admin)
│   ├── (marketplace)/          # Crop produce listings & Mandi price pages
│   ├── api/                    # Server-side API endpoints & Webhooks
│   ├── globals.css             # Tailwind CSS & Design tokens
│   ├── layout.jsx              # Root Layout & Global Context Providers
│   └── page.jsx                # High-converting Landing Page
├── components/                 # React UI Component Library
│   ├── common/                 # Reusable Primitives (Buttons, Badges, Modals)
│   ├── marketplace/            # Hero, TrustBar, MarketPrices, ProductCard, CTAs
│   ├── index.js                # Barrel re-export file
├── lib/                        # Full-stack Utilities & Integrations
│   ├── supabase/               # Supabase JS Clients & Handlers
│   │   ├── client.js           # Browser Client Component Helper
│   │   ├── server.js           # Server Component / Action Helper
│   │   ├── admin.js            # Service Role Client for Admin tasks
│   │   └── middleware.js       # Session Refresh Middleware
│   ├── utils.js                # Helper functions (cn, price formatters)
│   └── homeData.mjs            # Fallback mock data & initial state
├── supabase/                   # Supabase Infrastructure & Database Migrations
│   ├── migrations/             # SQL Migration Files & RLS Policies
│   │   └── 20260815_init.sql   # Tables for Profiles, Listings, Offers, Orders, Prices
│   └── seed.sql                # APMC Mandi price benchmarks & MSP database
├── .env.example                # Template for environment configuration
├── .env.local                  # Local secrets (Supabase URL & Anon Key)
├── middleware.js               # Global Next.js Auth Session Refresh Middleware
├── next.config.mjs             # Next.js Application Config
├── package.json                # Project dependencies (@supabase/supabase-js, @supabase/ssr)
├── tailwind.config.js          # Tailwind CSS Configuration
└── README.md                   # Project Documentation
```

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 / React 18 | App Router, Server Actions, Client Components |
| **Styling & UI** | Tailwind CSS v4 / Lucide React | Utility-first styling with accessible icon set |
| **Backend Database** | Supabase PostgreSQL | Relational database with Row Level Security (RLS) |
| **Authentication** | Supabase Auth / SSR | Cookie-based session management and JWT authentication |
| **Database Migrations** | Supabase CLI / SQL | Version-controlled database schema migrations |
| **Team Workflow** | Git / GitHub | Mandatory Conventional Commits & Pull/Push protocol |

---

## 🗄️ Supabase Database Schema

The underlying Supabase PostgreSQL database consists of 6 core relational tables:

* `profiles` — User profile information, role assignments (`farmer`, `buyer`, `admin`), and verification status (`verified`, `pending`).
* `listings` — Crop produce listings (crop type, quantity, asking price, APMC rate ref, harvest date, location).
* `offers` — Price negotiations submitted by buyers (`offered_price`, `offered_quantity`, `status`).
* `orders` — Finalized match records awaiting direct settlement between parties.
* `market_prices` — APMC mandi reference prices and Government Minimum Support Prices (MSP).
* `partner_platforms` — Directory listings for verified external F2C platforms and logistics providers.

---

## 🎓 Academic Context

KrishiSetu was developed as a **BSc Computer Science Final Year Project** focusing on full-stack web architecture, relational database design, and direct digital procurement in agricultural supply chains.
