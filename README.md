# KrishiSetu 🌾

**Smart Agricultural Procurement & Marketplace Platform**

Connecting Farmers with Verified Buyers through Transparent Pricing and Direct Procurement.

KrishiSetu is a digital marketplace designed to eliminate middlemen by directly connecting verified small and medium-scale farmers with verified business buyers (traders, retailers, kirana stores, restaurants, and wholesalers). It also acts as an aggregator linking to other reliable Farmer-to-Consumer (F2C) brands, and integrates direct logistics through a rated Transporter system.

```text
Discover  ──►  Compare  ──►  Negotiate  ──►  Purchase  ──►  Transport  ──►  Pickup
```


---

## 📌 Problem Statement

Small and medium-scale agricultural producers face recurring systemic challenges:

* **Intermediary Dependency:** Heavy reliance on local commission agents and traders leads to diminished profit margins for farmers.
* **Logistics Fragmentation:** Buyers and farmers struggle to find reliable, transparent transportation to move purchased produce.
* **Price Opacity:** Absence of accessible, real-time market price benchmarks (APMC/MSP) leads to exploitation.
* **Uncertain Demand:** Farmers struggle to connect directly with bulk commercial buyers prior to harvest.
* **Platform Fragmentation:** Farmers have limited visibility on where to sell directly to consumers across various F2C brands.

---

## 💡 Solution

KrishiSetu provides an end-to-end digital procurement ecosystem featuring:

* **Direct Marketplace:** Primary direct farmer-to-buyer trade ecosystem without commission agents.
* **Partner Platforms Hub:** A directory linking farmers to other reliable F2C platforms for additional direct-selling opportunities.
* **Verified Logistics Directory:** A dedicated hub linking to verified third-party freight and agri-logistics platforms (like Kisan Rath, KisanSabha) to solve transportation needs.
* **Verified Profiles:** Identity and credential verification for farmers and commercial buyers.
* **Structured Crop Listings:** Clear specifications of quantity, quality grade, asking price, harvest dates, and pickup locations.
* **Smart Price Benchmarking:** Instant visibility of local APMC rates alongside farmer asking prices.
* **Flexible Purchase Options:** Support for instant purchase (**Buy Now**) and price negotiations (**Make Offer**).
* **Trust & Reputation System:** Transparent ratings and reviews for Buyers and Farmers following order completion.

---

## 🎯 Objectives

* **Direct Trade Access:** Establish a reliable digital venue for direct farmer-to-buyer transactions.
* **Enhanced Price Transparency:** Integrate official APMC market rates and MSP references to empower informed trade.
* **Reduce Intermediaries:** Eliminate unnecessary layers in the supply chain to maximize farmer returns and reduce buyer costs.
* **Verified Ecosystem:** Build trust using administrative verification for marketplace participants.
* **Digital Record-Keeping:** Digitize procurement transactions, negotiations, and historical sales records.

---

## ✨ Key Features

### 🚜 Farmer Capabilities
* **Account Management:** User registration, profile setup, and identity verification submission.
* **Listing Creation:** Post crop listings specifying category, quantity, quality grade, asking price, location, and photos.
* **Offer Negotiation:** Receive, review, accept, or reject custom price and quantity offers submitted by buyers.
* **Order Tracking:** Manage order statuses from confirmation to buyer pickup.
* **Sales Analytics & History:** View completed sales, revenue records, and buyer feedback.

### 🛍️ Buyer Capabilities
* **Browse & Search:** Search agricultural listings with filters for crop type, location, quantity, price range, and seller rating.
* **Market Price Reference:** View relevant APMC rates and Minimum Support Prices (MSP) directly on listing detail pages.
* **Instant Procurement (Buy Now):** Place direct orders at the farmer's asking price.
* **Negotiation (Make Offer):** Propose custom unit price and quantity offers to farmers.
* **Order Lifecycle Management:** Track confirmed orders, coordinate self-arranged transport, and confirm produce pickup.
* **Seller Reviews:** Submit ratings and qualitative feedback upon order completion.

### 🚚 Logistics & Partner Integrations
* **Logistics Directory:** Access links to verified third-party agricultural freight services (e.g., Kisan Rath, TruckSuvidha).
* **F2C Partner Hub:** Discover and navigate to other verified Farmer-to-Consumer retail platforms.

### 🛡️ Admin Capabilities
* **User Verification:** Review and approve farmer and buyer registration credentials.
* **Content Moderation:** Monitor and approve crop listings to ensure marketplace quality standards.
* **Partner Hub Management:** Add and verify links to trusted external F2C platforms and logistics providers.
* **Market Rate Updates:** Maintain and update benchmark APMC reference rates and MSP values.
* **Dispute & Order Oversight:** Monitor transactions and assist in dispute resolution.
* **Marketplace Overview:** Access basic system analytics (active users, total listings, completed orders).

---

## 🏷️ Pricing System

KrishiSetu equips buyers and farmers with a **Smart Price Indicator** that dynamically evaluates listing prices against market benchmarks using rule-based metrics:

| Indicator | Classification | Description |
| :--- | :--- | :--- |
| 🟢 **Fair Price** | Market Aligned | Farmer asking price closely matches prevailing APMC market rates. |
| 🟡 **Below Market** | High Value | Farmer asking price is below prevailing APMC market rates. |
| 🔴 **Above Market** | Premium Pricing | Farmer asking price exceeds prevailing APMC market rates (often reflecting premium quality). |

> ℹ️ *Note: The current MVP utilizes rule-based numerical comparisons against static/updated APMC database records.*

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
* `orders` — Confirmed purchase transactions (`status`: `pending`, `confirmed`, `picked_up`, `completed`).
* `market_prices` — APMC mandi reference prices and Government Minimum Support Prices (MSP).
* `partner_platforms` — Directory listings for verified external F2C platforms and logistics providers.




## 🎓 Academic Context

KrishiSetu was developed as a **BSc Computer Science Final Year Project** focusing on full-stack web architecture, relational database design, and direct digital procurement in agricultural supply chains.
