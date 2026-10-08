# AI Specialist Capstone — Online Bookstore Project Plan

## 1. Project Overview

This project implements the capstone online bookstore / e-commerce experience described in the IBM AI Specialist Capstone instructions.

The source requirements cover a customer journey that includes authentication, browsing categories and brands, product selection, related products, cart/basket, delivery address selection, payment, gift points, purchase confirmation, order history with **Buy It Again**, recommendations based on order history, and cancellation within 48 hours.

The capstone also expects PostgreSQL, AI-assisted UI/backend development, API specification, test generation, responsive frontend development, local validation, and a GitHub pull-request workflow. The final submission includes a short video explaining how an Agentic IDE such as IBM BOB/Kiro was used and a GitHub repository link.

Source reference: IBM AI Specialist Capstone instructions, especially the use case, features, PostgreSQL requirement, Agentic IDE workflow, testing, and Git workflow. fileciteturn0file0L131-L153 fileciteturn0file0L305-L314

> **Implementation note:** The capstone material specifies the product experience and PostgreSQL, but does not mandate an exact backend framework or payment provider. The stack below is therefore a practical implementation proposal for completing the project.

---

# 2. Recommended Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| React + Vite | Frontend application and development server |
| TypeScript | Type-safe frontend code |
| Tailwind CSS | Responsive styling and design system |
| React Router | Client-side routing |
| TanStack Query | API fetching, caching, loading/error states |
| React Hook Form | Form management |
| Zod | Client-side validation |
| Axios | HTTP client |
| Lucide React | Consistent icons |
| Vitest + React Testing Library | Unit/component testing |

## Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API server |
| JavaScript |  backend code |
| Prisma ORM | PostgreSQL access, schema and migrations |
| PostgreSQL | Primary relational database |
| Zod | Request/response validation |
| JWT + bcrypt | Authentication and password hashing |
| Helmet + CORS + rate limiting | API security basics |
| Pino | Structured application logging |
| Jest + Supertest | API/integration testing |

## Development / DevOps

- Git + GitHub
- Feature branches + pull requests
- ESLint + Prettier
- `.env` for environment-specific configuration

## Payment

For the capstone demo, implement a **mock payment flow** first so the full journey works without depending on a real payment account. A real provider such as Stripe can be integrated later without changing the core order schema.

---

# 3. High-Level Architecture

```text
                   ┌───────────────────────────────┐
                   │         User / Browser        │
                   │ Desktop / Tablet / Mobile     │
                   └──────────────┬────────────────┘
                                  │ HTTPS / JSON
                                  ▼
                   ┌───────────────────────────────┐
                   │       React + Tailwind        │
                   │                               │
                   │ Pages                         │
                   │ Reusable UI Components        │
                   │ React Router                  │
                   │ TanStack Query                │
                   │ Auth / Cart / UI State        │
                   └──────────────┬────────────────┘
                                  │ REST API
                                  ▼
                   ┌───────────────────────────────┐
                   │      Node.js + Express        │
                   │                               │
                   │ Auth Middleware               │
                   │ Product / Category APIs       │
                   │ Cart APIs                     │
                   │ Order / Payment APIs          │
                   │ Recommendation Service        │
                   │ Validation / Error Handler    │
                   └──────────────┬────────────────┘
                                  │ Prisma
                                  ▼
                   ┌───────────────────────────────┐
                   │          PostgreSQL           │
                   │                               │
                   │ users                         │
                   │ categories / brands           │
                   │ products                      │
                   │ carts / cart_items            │
                   │ addresses                     │
                   │ orders / order_items          │
                   │ payments                      │
                   │ gift_points                   │
                   │ wishlist / recommendations   │
                   └───────────────────────────────┘
```

## Architectural Style

Use a **modular monolith** for the capstone. It is easier to develop, test, explain in the demo video, and deploy locally than a microservice architecture while still keeping responsibilities separated.

### Frontend layers

```text
Pages
  ↓
Feature Components
  ↓
Shared Components
  ↓
Hooks / Query Layer
  ↓
API Client
  ↓
Backend REST API
```

### Backend layers

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories / Prisma
  ↓
PostgreSQL
```

---

# 4. Recommended Project File Structure

```text
online-bookstore/
│
├── README.md
├── PROJECT_PLAN.md
├── .gitignore
├── .env.example
├── package.json
│
├── docs/
│   ├── architecture.md
│   ├── api-spec.yaml
│   ├── database-schema.md
│   └── capstone-demo-script.md
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── jsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       │
│       ├── assets/
│       │   ├── images/
│       │   └── icons/
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   ├── Footer.jsx
│       │   │   ├── PageContainer.jsx
│       │   │   └── MobileBottomNav.jsx
│       │   │
│       │   ├── common/
│       │   │   ├── Button.jsx
│       │   │   ├── Input.jsx
│       │   │   ├── Select.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── Badge.jsx
│       │   │   ├── Spinner.jsx
│       │   │   ├── EmptyState.jsx
│       │   │   ├── ErrorState.jsx
│       │   │   ├── Skeleton.jsx
│       │   │   └── Price.jsx
│       │   │
│       │   ├── product/
│       │   │   ├── ProductCard.jsx
│       │   │   ├── ProductGrid.jsx
│       │   │   ├── ProductImage.jsx
│       │   │   ├── ProductRating.jsx
│       │   │   ├── DeliveryBadge.jsx
│       │   │   ├── RelatedProducts.jsx
│       │   │   └── ProductFilters.jsx
│       │   │
│       │   ├── cart/
│       │   │   ├── CartItem.jsx
│       │   │   ├── CartSummary.jsx
│       │   │   └── QuantityControl.jsx
│       │   │
│       │   ├── checkout/
│       │   │   ├── AddressCard.jsx
│       │   │   ├── AddressForm.jsx
│       │   │   ├── GiftPointsCard.jsx
│       │   │   ├── CheckoutStepper.jsx
│       │   │   └── OrderSummary.jsx
│       │   │
│       │   └── order/
│       │       ├── OrderCard.jsx
│       │       ├── OrderStatusBadge.jsx
│       │       ├── BuyAgainButton.jsx
│       │       └── CancelOrderButton.jsx
│       │
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── CataloguePage.jsx
│       │   ├── CategoryPage.jsx
│       │   ├── BrandPage.jsx
│       │   ├── ProductDetailsPage.jsx
│       │   ├── CartPage.jsx
│       │   ├── CheckoutAddressPage.jsx
│       │   ├── CheckoutPaymentPage.jsx
│       │   ├── PaymentResultPage.jsx
│       │   ├── OrderConfirmationPage.jsx
│       │   ├── OrderHistoryPage.jsx
│       │   ├── ProfilePage.jsx
│       │   └── NotFoundPage.jsx
│       │
│       ├── features/
│       │   ├── auth/
│       │   │   ├── auth.api.js
│       │   │   ├── auth.hooks.js
│       │   │   └── auth.store.js
│       │   ├── products/
│       │   │   ├── products.api.js
│       │   │   └── products.hooks.js
│       │   ├── cart/
│       │   │   ├── cart.api.js
│       │   │   └── cart.hooks.js
│       │   ├── checkout/
│       │   │   ├── checkout.api.js
│       │   │   └── checkout.hooks.js
│       │   └── orders/
│       │       ├── orders.api.js
│       │       └── orders.hooks.js
│       │
│       ├── lib/
│       │   ├── api.js
│       │   ├── queryClient.js
│       │   ├── validators.js
│       │   └── utils.js
│       │
│       ├── routes/
│       │   └── AppRoutes.jsx
│       │
│       └── types/
│           ├── auth.js
│           ├── product.js
│           ├── cart.js
│           └── order.js
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js
│   │
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/
│       │   ├── env.js
│       │   └── database.js
│       │
│       ├── middleware/
│       │   ├── auth.middleware.js
│       │   ├── error.middleware.js
│       │   └── validation.middleware.js
│       │
│       ├── modules/
│       │   ├── auth/
│       │   │   ├── auth.routes.js
│       │   │   ├── auth.controller.js
│       │   │   └── auth.service.js
│       │   ├── products/
│       │   │   ├── products.routes.js
│       │   │   ├── products.controller.js
│       │   │   └── products.service.js
│       │   ├── categories/
│       │   ├── brands/
│       │   ├── cart/
│       │   ├── addresses/
│       │   ├── checkout/
│       │   ├── payments/
│       │   ├── orders/
│       │   └── recommendations/
│       │
│       ├── shared/
│       │   ├── constants/
│       │   ├── types/
│       │   └── utils/
│       │
│       └── tests/
│           ├── auth.test.js
│           ├── products.test.js
│           ├── cart.test.js
│           ├── checkout.test.js
│           └── orders.test.js
│
└── scripts/
    ├── seed.sql
    └── generate-demo-data.js
```

---

# 5. Application Pages and Customer Journeys

The following pages cover the capstone customer journey while keeping repeated UI in reusable components.

## 5.1 Home Page — `/`

### Purpose
Entry page for the bookstore with available books, categories, popular products, brands, and personalized recommendations.

### Main sections
- Navbar
- Hero / bookstore introduction
- Category shortcuts
- Featured books
- Popular brands
- Recommended products
- Recently viewed / order-history-based recommendations
- Footer

### Reusable components
`Navbar`, `PageContainer`, `ProductCard`, `ProductGrid`, `Badge`, `Footer`.

---

## 5.2 Login Page — `/login`

### Purpose
Authenticate an existing customer.

### Components
- `AuthForm`
- `Input`
- `Button`
- Validation messages
- Loading state

### API
`POST /api/auth/login`

---

## 5.3 Registration Page — `/register`

### Purpose
Create a customer account.

### Components
- Name input
- Email input
- Password / confirm-password input
- Terms checkbox
- Reusable validation components

### API
`POST /api/auth/register`

---

## 5.4 Catalogue Page — `/catalogue`

### Purpose
Browse the full product catalogue.

### Requirements covered
- Browse books
- Select category
- Browse brands
- Filter and sort products
- Product delivery date/tag

### Components
- `ProductFilters`
- `ProductGrid`
- `ProductCard`
- `DeliveryBadge`
- `Pagination`
- `Skeleton`

### API
`GET /api/products`

Example query:

```text
GET /api/products?category=fiction&brand=penguin&page=1&limit=12&sort=price_asc
```

---

## 5.5 Category Page — `/categories/:slug`

### Purpose
Display the product catalogue for a specific category.

### Components
`ProductGrid`, `ProductCard`, `ProductFilters`, `DeliveryBadge`.

### API
`GET /api/categories/:slug/products`

---

## 5.6 Brand Page — `/brands/:slug`

### Purpose
Browse books belonging to a selected brand/publisher.

### Components
`ProductGrid`, `ProductCard`, `ProductFilters`.

### API
`GET /api/brands/:slug/products`

---

## 5.7 Product Details Page — `/products/:id`

### Purpose
Show the selected book and allow the customer to add it to the basket.

### Requirements covered
- Select a product
- Show tentative delivery date
- Related products
- Add to basket

### Components
- `ProductImage`
- `ProductRating`
- `DeliveryBadge`
- `QuantityControl`
- `RelatedProducts`
- `Button`

### API
`GET /api/products/:id`

---

## 5.8 Cart Page — `/cart`

### Purpose
Review basket contents before purchase.

### Requirements covered
- Add/remove products
- Change quantity
- Show totals
- Show recommended items

### Components
- `CartItem`
- `QuantityControl`
- `CartSummary`
- `ProductGrid`
- `ProductCard`

### APIs
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:id`
- `DELETE /api/cart/items/:id`

---

## 5.9 Checkout Address Page — `/checkout/address`

### Purpose
Select or add a delivery address.

### Requirements covered
- Select address for delivery
- Add new address

### Components
- `CheckoutStepper`
- `AddressCard`
- `AddressForm`
- `OrderSummary`
- `Button`

### APIs
- `GET /api/addresses`
- `POST /api/addresses`
- `POST /api/checkout/validate`

---

## 5.10 Checkout Payment Page — `/checkout/payment`

### Purpose
Choose payment option and redeem gift points.

### Requirements covered
- Initiate payment with the right option
- Redeem gift points
- Review purchase summary

### Components
- `CheckoutStepper`
- Payment method selector
- `GiftPointsCard`
- `OrderSummary`
- `Button`

### APIs
- `POST /api/checkout/order`
- `POST /api/checkout/apply-points`
- `POST /api/payments/create`

---

## 5.11 Payment Result Page — `/payment/result`

### Purpose
Handle success/failure/cancel outcomes from the payment process.

### Components
- Payment status icon
- Status message
- Retry payment button
- Continue shopping button

---

## 5.12 Order Confirmation Page — `/orders/:id/confirmation`

### Purpose
Confirm successful purchase.

### Requirements covered
- Purchase completion confirmation
- Order details
- Delivery estimate

### Components
- `OrderStatusBadge`
- Order summary
- Delivery summary
- Continue shopping button

### API
`GET /api/orders/:id`

---

## 5.13 Order History Page — `/orders`

### Purpose
Allow the user to review previous purchases.

### Requirements covered
- Browse order history
- Buy Again
- Cancel order within 48 hours
- Recommendation signals from order history

### Components
- `OrderCard`
- `OrderStatusBadge`
- `BuyAgainButton`
- `CancelOrderButton`
- Empty/error/loading states

### APIs
- `GET /api/orders`
- `POST /api/orders/:id/buy-again`
- `POST /api/orders/:id/cancel`

### Cancellation rule
The backend must validate the order creation time before allowing cancellation:

```text
current_time - order.created_at <= 48 hours
```

The server, not the browser, is the final authority for this rule.

---

## 5.14 Profile Page — `/profile`

### Purpose
Manage account details, addresses and gift points.

### Components
`AddressCard`, `AddressForm`, `GiftPointsCard`, profile form.

---

## 5.15 Not Found Page — `*`

Reusable fallback page for invalid routes.

---

# 6. Reusable Component Strategy

## Global layout components

- `Navbar`
- `Footer`
- `PageContainer`
- `MobileBottomNav`

## Form components

- `Input`
- `Select`
- `Checkbox`
- `RadioGroup`
- `Button`
- `FormField`
- `ErrorMessage`

## Feedback components

- `Spinner`
- `Skeleton`
- `EmptyState`
- `ErrorState`
- `Toast`
- `Modal`

## Product components

- `ProductCard`
- `ProductGrid`
- `ProductRating`
- `DeliveryBadge`
- `ProductFilters`
- `RelatedProducts`

## Commerce components

- `CartItem`
- `CartSummary`
- `QuantityControl`
- `CheckoutStepper`
- `AddressCard`
- `AddressForm`
- `GiftPointsCard`
- `OrderSummary`
- `OrderCard`
- `OrderStatusBadge`
- `BuyAgainButton`
- `CancelOrderButton`

## Reusability rules

1. Do not duplicate button, input, card, modal, badge, loading or error styles.
2. Product display should come from one `ProductCard` component with props for context.
3. Order status rendering should come from one `OrderStatusBadge` component.
4. Price formatting should be centralized in `Price.jsx` / `utils.js`.
5. API access must not be written directly inside JSX pages.
6. Pages should orchestrate features; feature components should implement UI behavior.
7. Tailwind classes should favor shared component variants over long repeated class strings.

---

# 7. Responsive Design Strategy with Tailwind CSS

The capstone requires the frontend to be responsive and tested on desktop and mobile. fileciteturn0file0L453-L519

## Breakpoint approach

Use mobile-first Tailwind classes:

```text
Default  → mobile
sm       → large phone / small tablet
md       → tablet
lg       → laptop / desktop
xl       → wide desktop
```

## Responsive rules

### Navbar
- Desktop: full navigation + search + account + cart.
- Mobile: compact header + hamburger/menu + cart.

### Catalogue
- Mobile: 2-column product grid.
- Tablet: 3-column grid.
- Desktop: 4-column grid.

### Product page
- Mobile: image above details.
- Desktop: two-column image/details layout.

### Cart / checkout
- Mobile: single-column stacked cards.
- Desktop: content + sticky order summary.

### Forms
- Use full-width controls on mobile.
- Use grid layouts for multi-field address forms on larger screens.

### Accessibility
- Keyboard-accessible controls.
- Visible focus states.
- Labels for form controls.
- Meaningful `alt` text on images.
- Semantic headings and landmark elements.
- Sufficient color contrast.

---

# 8. Frontend Application Workflow

```text
User opens Home
      ↓
Browse Categories / Brands / Search
      ↓
Open Product Details
      ↓
Add Product to Cart
      ↓
Open Cart
      ↓
Checkout
      ↓
Select Delivery Address
      ↓
Redeem Gift Points (optional)
      ↓
Select Payment Method
      ↓
Create Payment
      ↓
Payment Success
      ↓
Create / Confirm Order
      ↓
Order Confirmation
      ↓
Order History
      ├── Buy Again
      ├── View Order
      └── Cancel within 48 hours
```

---

# 9. Backend API Design

Base URL:

```text
/api
```

## Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Authenticate user |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |

## Categories and brands

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/categories` | List categories |
| GET | `/categories/:slug` | Category details |
| GET | `/categories/:slug/products` | Products in category |
| GET | `/brands` | List brands |
| GET | `/brands/:slug/products` | Products in brand |

## Products

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/products` | Search/filter/sort products |
| GET | `/products/:id` | Product details |
| GET | `/products/:id/related` | Related products |

## Cart

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/cart` | Get current cart |
| POST | `/cart/items` | Add product |
| PATCH | `/cart/items/:id` | Update quantity |
| DELETE | `/cart/items/:id` | Remove item |
| DELETE | `/cart` | Clear cart |

## Addresses

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/addresses` | List addresses |
| POST | `/addresses` | Create address |
| PATCH | `/addresses/:id` | Update address |
| DELETE | `/addresses/:id` | Delete address |

## Checkout / payment

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/checkout/validate` | Validate cart and totals |
| POST | `/checkout/apply-points` | Apply gift points |
| POST | `/checkout/order` | Create pending order |
| POST | `/payments/create` | Start payment |
| POST | `/payments/confirm` | Confirm mock/real payment |

## Orders

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/orders` | Order history |
| GET | `/orders/:id` | Get order details |
| POST | `/orders/:id/buy-again` | Add past items to cart |
| POST | `/orders/:id/cancel` | Cancel order within 48 hours |

## Recommendations

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/recommendations` | Personalized recommendations |
| GET | `/products/:id/related` | Product-based recommendations |

---

# 10. Recommendation Logic

The capstone requires recommendations based on order history.

For the initial version, use a deterministic database-backed recommendation algorithm instead of a machine-learning model:

1. Find categories and brands purchased by the current user.
2. Find products in those same categories/brands.
3. Exclude products already in the current cart.
4. Exclude unavailable/out-of-stock books.
5. Rank by:
   - purchase frequency in related category
   - product popularity
   - rating
   - inventory availability
6. Return the top 6–10 products.

This can later be replaced by an AI/ML recommender without changing the frontend contract.

---

# 11. PostgreSQL Database Design

## Main entities

```text
users
  │
  ├────────< addresses
  │
  ├────────< carts ────────< cart_items >──────── products
  │
  ├────────< orders ───────< order_items >─────── products
  │
  └──────── gift_points_transactions

categories ────────< products
brands ────────────< products

products ──────────< product_relations >──────── products

orders ────────────< payments
```

---

# 12. PostgreSQL Schema

The following schema is intentionally normalized but remains simple enough for a capstone project.

## SQL schema

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN');
CREATE TYPE order_status AS ENUM (
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED'
);
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
CREATE TYPE payment_method AS ENUM ('CARD', 'UPI', 'NET_BANKING', 'COD', 'MOCK');
CREATE TYPE address_type AS ENUM ('HOME', 'OFFICE', 'OTHER');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  gift_points INTEGER NOT NULL DEFAULT 0 CHECK (gift_points >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(160) UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(180) NOT NULL,
  description TEXT,
  isbn VARCHAR(30) UNIQUE,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  cover_image_url TEXT,
  tentative_delivery_date DATE,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  category_id UUID NOT NULL REFERENCES categories(id),
  brand_id UUID NOT NULL REFERENCES brands(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_relations (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  related_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, related_product_id),
  CHECK (product_id <> related_product_id)
);

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label address_type NOT NULL DEFAULT 'HOME',
  recipient_name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(15) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_id)
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  address_id UUID NOT NULL REFERENCES addresses(id),
  status order_status NOT NULL DEFAULT 'PENDING',
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  gift_points_used INTEGER NOT NULL DEFAULT 0 CHECK (gift_points_used >= 0),
  shipping_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_title VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  line_total NUMERIC(10,2) NOT NULL CHECK (line_total >= 0)
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'PENDING',
  transaction_reference VARCHAR(120),
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE gift_points_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  reason VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_title ON products USING GIN (to_tsvector('english', title));
CREATE INDEX idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);
```

---

# 13. Database Business Rules

## Product

- `price >= 0`
- `stock_quantity >= 0`
- `rating` must be between 0 and 5.
- A product belongs to exactly one category and one brand in this simplified model.

## Cart

- One active cart per user.
- A product appears only once in a cart; quantity is updated instead.

## Order

- Copy product title and unit price into `order_items` so historical orders remain stable even if the product later changes.
- Total must be calculated by the backend.
- A cancelled order should keep its history instead of being physically deleted.

## Cancellation

Allow cancellation only while:

```text
order.status IN ('PENDING', 'CONFIRMED', 'PROCESSING')
AND current_time <= order.created_at + INTERVAL '48 hours'
```

The exact final business rule should be enforced in the backend service inside a database transaction.

---

# 14. Random Sample Data for PostgreSQL

The following seed strategy creates realistic demo data for the capstone.

## Seed categories

```sql
INSERT INTO categories (name, slug, description) VALUES
('Fiction', 'fiction', 'Novels, stories and contemporary fiction'),
('Business', 'business', 'Business, management and entrepreneurship'),
('Technology', 'technology', 'Programming, software and computer science'),
('Self Help', 'self-help', 'Personal development and productivity'),
('Science', 'science', 'Popular science and academic reading');
```

## Seed brands / publishers

```sql
INSERT INTO brands (name, slug) VALUES
('Penguin Random House', 'penguin-random-house'),
('HarperCollins', 'harpercollins'),
('O''Reilly Media', 'oreilly-media'),
('Simon & Schuster', 'simon-schuster'),
('Oxford University Press', 'oxford-university-press');
```

## Seed users

```sql
INSERT INTO users (full_name, email, password_hash, gift_points) VALUES
('Priyanshu Demo', 'priyanshu@example.com', '$2b$10$DemoHashReplaceBeforeProduction', 850),
('Ananya Sharma', 'ananya@example.com', '$2b$10$DemoHashReplaceBeforeProduction', 420),
('Rahul Verma', 'rahul@example.com', '$2b$10$DemoHashReplaceBeforeProduction', 1250),
('Neha Gupta', 'neha@example.com', '$2b$10$DemoHashReplaceBeforeProduction', 300),
('Arjun Mehta', 'arjun@example.com', '$2b$10$DemoHashReplaceBeforeProduction', 675);
```

> For the real application, generate password hashes with bcrypt in `prisma/seed.js`. Do not use the demo hash string above for production credentials.

## Generate random books with SQL

Use this PostgreSQL block after categories and brands exist:

```sql
INSERT INTO products (
  title,
  author,
  description,
  isbn,
  price,
  discount_percent,
  stock_quantity,
  cover_image_url,
  tentative_delivery_date,
  rating,
  review_count,
  category_id,
  brand_id
)
SELECT
  'Demo Book ' || gs,
  CASE (gs % 10)
    WHEN 0 THEN 'Aarav Menon'
    WHEN 1 THEN 'Maya Sharma'
    WHEN 2 THEN 'Daniel Brooks'
    WHEN 3 THEN 'Riya Kapoor'
    WHEN 4 THEN 'Noah Wilson'
    WHEN 5 THEN 'Isha Patel'
    WHEN 6 THEN 'Kabir Singh'
    WHEN 7 THEN 'Sophia Martin'
    WHEN 8 THEN 'Ethan Thomas'
    ELSE 'Meera Nair'
  END,
  'Sample bookstore product created for capstone testing.',
  '978-' || LPAD((1000000000 + gs)::text, 10, '0'),
  ROUND((199 + RANDOM() * 1300)::numeric, 2),
  ROUND((RANDOM() * 35)::numeric, 2),
  FLOOR(10 + RANDOM() * 90),
  'https://images.example.com/books/book-' || gs || '.jpg',
  CURRENT_DATE + ((2 + FLOOR(RANDOM() * 8))::integer),
  ROUND((3 + RANDOM() * 2)::numeric, 1),
  FLOOR(RANDOM() * 500),
  (SELECT id FROM categories ORDER BY RANDOM() LIMIT 1),
  (SELECT id FROM brands ORDER BY RANDOM() LIMIT 1)
FROM generate_series(1, 40) AS gs;
```

This creates **40 random sample books** with:
- random category
- random brand
- random price
- random discount
- random stock
- random rating
- random review count
- random tentative delivery date

## Seed addresses

```sql
INSERT INTO addresses (
  user_id, label, recipient_name, phone, line1, line2,
  city, state, postal_code, country, is_default
)
SELECT
  u.id,
  'HOME',
  u.full_name,
  '+91' || (9000000000 + FLOOR(RANDOM() * 999999999))::bigint,
  CASE u.email
    WHEN 'priyanshu@example.com' THEN '12 MG Road'
    WHEN 'ananya@example.com' THEN '45 Lake View Road'
    WHEN 'rahul@example.com' THEN '78 Residency Road'
    WHEN 'neha@example.com' THEN '19 Anna Salai'
    ELSE '24 Park Street'
  END,
  'Apartment / Floor 2',
  CASE
    WHEN RANDOM() < 0.6 THEN 'Bengaluru'
    ELSE 'Chennai'
  END,
  CASE
    WHEN RANDOM() < 0.6 THEN 'Karnataka'
    ELSE 'Tamil Nadu'
  END,
  LPAD((560001 + FLOOR(RANDOM() * 9000))::text, 6, '0'),
  'India',
  TRUE
FROM users u;
```

---

# 15. Prisma Model Strategy

Keep `backend/prisma/schema.prisma` synchronized with the SQL design.

Recommended commands:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

For a resettable demo environment:

```bash
npx prisma migrate reset
```

Use Prisma migrations instead of manually changing production tables.

---

# 16. Authentication Workflow

```text
Register
  ↓
Validate email + password
  ↓
Hash password with bcrypt
  ↓
Create user
  ↓
Create empty cart
  ↓
Issue JWT
  ↓
Frontend stores authenticated session
```

Login:

```text
Email + password
  ↓
Find user
  ↓
Compare bcrypt hash
  ↓
Issue JWT
  ↓
Return user + token
```

Protected endpoints use an authentication middleware that loads the current user before the controller executes.

---

# 17. Checkout Workflow in Detail

```text
1. User opens Cart
2. Backend recalculates current prices and availability
3. User selects delivery address
4. User optionally applies gift points
5. Backend validates maximum redeemable points
6. Backend calculates subtotal + shipping - discount - points
7. Backend creates PENDING order
8. Backend reserves/decrements stock in a transaction
9. Payment is initiated
10. Payment succeeds
11. Payment record becomes SUCCESS
12. Order becomes CONFIRMED
13. Cart is cleared
14. Confirmation page displays order
```

### Important backend rule

Do not trust the subtotal, discount, stock or total sent from the browser. The backend must load current product data from PostgreSQL and calculate the final amount.

---

# 18. Buy Again Workflow

```text
Order History
   ↓
Select previous order
    ↓
POST /orders/:id/buy-again
    ↓
Check every product is still available
    ↓
Add available products to active cart
    ↓
Return updated cart
    ↓
User reviews cart and checks out normally
```

Unavailable products should be reported to the user instead of failing the entire request.

---

# 19. Order Cancellation Workflow

```text
User opens Order History
      ↓
Clicks Cancel Order
      ↓
Backend checks order ownership
      ↓
Backend checks order status
      ↓
Backend checks created_at <= 48 hours ago
      ↓
Transaction begins
      ↓
Refund/payment reversal logic
      ↓
Restore stock if required
      ↓
Set status = CANCELLED
      ↓
Return updated order
```

The capstone explicitly includes cancellation within 48 hours as part of the customer journey. fileciteturn0file0L140-L155

---

# 20. API Error Response Standard

Use one predictable structure:

```json
{
  "success": false,
  "message": "Product not found",
  "code": "PRODUCT_NOT_FOUND",
  "errors": []
}
```

Successful response:

```json
{
  "success": true,
  "data": {}
}
```

Validation response:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

---

# 21. Frontend State Management

Use the following separation:

| State | Recommended solution |
|---|---|
| Server data | TanStack Query |
| Login/session | Auth context/store + secure session strategy |
| Cart | Backend as source of truth + TanStack Query |
| Form state | React Hook Form |
| UI-only state | React local state |
| Filters/sort | URL query parameters |

This avoids putting all application state into one large global store.

---

# 22. Tailwind Design System

Create a small set of shared Tailwind tokens and component variants.

## Example buttons

```tsx
<button className="rounded-lg px-4 py-2 text-sm font-semibold transition hover:opacity-90 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50">
  Add to Cart
</button>
```

## Example responsive product grid

```tsx
<div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

## Example responsive page shell

```tsx
<main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
  {children}
</main>
```

---

# 23. Testing Plan

The capstone asks for testing and validation of the generated frontend, including responsiveness, forms, buttons, navigation, cart and payment flows. fileciteturn0file0L602-L633

## Unit tests

Test:
- price calculations
- gift-point calculations
- 48-hour cancellation rule
- recommendation ranking helper
- validation schemas

## Component tests

Test:
- ProductCard
- CartItem
- CartSummary
- AddressForm
- OrderCard
- CheckoutStepper

## API integration tests

Test:
- register/login
- products list/details
- add/remove cart item
- create order
- payment success/failure
- buy again
- cancellation

## Manual test checklist

### Authentication
- [ ] Register works
- [ ] Invalid email shows error
- [ ] Wrong password shows error
- [ ] Protected routes require login

### Catalogue
- [ ] Categories load
- [ ] Brands load
- [ ] Product filtering works
- [ ] Search works
- [ ] Delivery date is visible

### Cart
- [ ] Add to cart
- [ ] Change quantity
- [ ] Remove product
- [ ] Correct subtotal and total

### Checkout
- [ ] Address selection works
- [ ] New address can be added
- [ ] Gift points can be applied
- [ ] Payment method can be selected

### Orders
- [ ] Confirmation page works
- [ ] Order history loads
- [ ] Buy Again works
- [ ] Cancellation within 48 hours works
- [ ] Cancellation after 48 hours is rejected

### Responsive
- [ ] Mobile layout
- [ ] Tablet layout
- [ ] Desktop layout
- [ ] No horizontal overflow
- [ ] Buttons and forms remain usable

---

# 24. AI / Agentic IDE Workflow for the Capstone

The capstone specifically describes using an Agentic IDE such as IBM BOB/Kiro to transform UI designs into working frontend code, review generated code, run and test it locally, refine it, and commit it through Git. fileciteturn0file0L337-L438

Recommended project workflow:

```text
UI Reference Screenshots
        ↓
IBM BOB / AWS Kiro
        ↓
Prompt with React + Tailwind + responsive requirements
        ↓
Generate pages/components
        ↓
Review generated component structure
        ↓
Refactor reusable components
        ↓
Connect backend APIs
        ↓
Run locally
        ↓
Test desktop + mobile
        ↓
Fix UI inconsistencies
        ↓
Generate / improve test cases
        ↓
Commit to feature branch
        ↓
Push to GitHub
        ↓
Create Pull Request
```

## Suggested Agentic IDE prompts

### Initial project prompt

```text
Build a responsive online bookstore frontend using React, TypeScript and Tailwind CSS.
Create reusable components for the navbar, footer, product cards, product grid,
cart items, checkout forms, order cards and shared form controls.
Use a mobile-first responsive layout and React Router.
Keep pages and reusable components separated.
```

### Product page prompt

```text
Create a responsive bookstore product details page in React + Tailwind.
Show book image, title, author, price, rating, tentative delivery date,
quantity controls, add-to-cart CTA and related products.
Reuse existing ProductCard, Button and DeliveryBadge components.
```

### Checkout prompt

```text
Build a multi-step checkout using reusable React components.
Step 1: select or add delivery address.
Step 2: select payment method and optionally redeem gift points.
Step 3: show confirmation.
Use accessible forms, loading states and validation.
```

### Review/refactor prompt

```text
Review this React + Tailwind bookstore implementation.
Identify duplicated markup, unnecessary CSS classes, non-reusable components,
accessibility issues, responsive layout problems and inconsistent naming.
Refactor without changing the expected UI or behavior.
```

---

# 25. Git Workflow

The capstone explicitly expects a feature-branch, commit, push and pull-request workflow. fileciteturn0file0L432-L438

Recommended branches:

```text
main
├── feature/frontend-home
├── feature/frontend-catalogue
├── feature/frontend-cart
├── feature/frontend-checkout
├── feature/backend-auth
├── feature/backend-products
├── feature/backend-orders
└── feature/database-schema
```

Example:

```bash
git checkout -b feature/frontend-catalogue

git add .
git commit -m "feat: build responsive catalogue page"
git push -u origin feature/frontend-catalogue
```

Then open a pull request and request review.

---

# 26. Local Development Setup

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL 16+ or Docker
- Git
- IBM BOB / AWS Kiro (for the AI-assisted development workflow)

## Start PostgreSQL with Docker

```bash
docker compose up -d postgres
```

## Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 27. Environment Variables

## Backend `.env`

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bookstore
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:5173
```

## Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit actual secrets to GitHub.

---

# 29. MVP Delivery Order

Build in this order so every stage remains runnable:

## Phase 1 — Foundation

- [ ] React + Vite + javaScript
- [ ] Tailwind CSS
- [ ] Express + javaScript
- [ ] PostgreSQL + Prisma
- [ ] ESLint / Prettier

## Phase 2 — Database

- [ ] Create Prisma schema
- [ ] Run migration
- [ ] Seed categories
- [ ] Seed brands
- [ ] Seed products
- [ ] Seed demo users

## Phase 3 — Authentication

- [ ] Register
- [ ] Login
- [ ] Logout
- [ ] Protected routes

## Phase 4 — Catalogue

- [ ] Home page
- [ ] Catalogue page
- [ ] Category page
- [ ] Brand page
- [ ] Product details
- [ ] Related products

## Phase 5 — Cart

- [ ] Add to cart
- [ ] Quantity update
- [ ] Remove item
- [ ] Cart summary

## Phase 6 — Checkout

- [ ] Address selection
- [ ] Address form
- [ ] Gift points
- [ ] Payment selection
- [ ] Mock payment
- [ ] Order creation

## Phase 7 — Orders

- [ ] Confirmation page
- [ ] Order history
- [ ] Buy Again
- [ ] Cancel within 48 hours
- [ ] Recommendations

## Phase 8 — Quality

- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Form validation
- [ ] Mobile responsiveness
- [ ] Unit tests
- [ ] API tests
- [ ] Accessibility review

## Phase 9 — Git / Submission

- [ ] Feature branches
- [ ] Clean commit history
- [ ] Pull request
- [ ] README
- [ ] Architecture documentation
- [ ] 3-minute capstone video
- [ ] GitHub repository link

The capstone submission guidance asks for a roughly 3-minute video describing the responsive e-commerce development process using agentic tools, together with the GitHub repository link. fileciteturn0file0L554-L562

---

# 30. Definition of Done

The project can be considered complete when a new user can:

```text
Register
  → Login
  → Browse Home
  → Select Category
  → Browse Brand
  → Open Product
  → See Delivery Date
  → See Related Products
  → Add to Cart
  → Review Cart
  → Select Address
  → Redeem Gift Points
  → Select Payment Method
  → Complete Mock Payment
  → See Purchase Confirmation
  → Open Order History
  → Buy Again
  → Cancel a qualifying order within 48 hours
```

And the project also has:

- Responsive desktop/tablet/mobile UI
- Reusable React + Tailwind components
- REST backend
- PostgreSQL database
- Seed/demo data
- API validation
- Error/loading states
- Automated tests for important business rules
- GitHub repository with meaningful commits and PR workflow
- Capstone video demonstrating the Agentic IDE workflow

---

# 31. Final Recommended Repository Structure

For the final GitHub submission, keep the repository understandable to a reviewer:

```text
online-bookstore/
├── README.md                 # Setup + project overview
├── PROJECT_PLAN.md           # This document
├── .env.example
├── docs/
│   ├── architecture.md
│   ├── api-spec.yaml
│   └── database-schema.md
├── frontend/
├── backend/
└── scripts/
```

## README should contain

1. Project overview
2. Features
3. Screenshots
4. Tech stack
5. Architecture diagram
6. Local setup
7. Environment variables
8. Database setup
9. Seed instructions
10. API documentation
11. Testing instructions
12. Git workflow
13. AI-assisted development summary

---

# 32. Capstone Traceability Matrix

| Capstone requirement | Implementation |
|---|---|
| Login page | `/login` |
| User authentication | JWT + bcrypt |
| Category browsing | `/catalogue`, `/categories/:slug` |
| Brand browsing | `/brands/:slug` |
| Product selection | `/products/:id` |
| Tentative delivery date | `products.tentative_delivery_date` + `DeliveryBadge` |
| Related products | `product_relations` + related products API |
| Add to basket | Cart APIs + `CartItem` |
| Order history | `/orders` |
| Buy Again | `POST /orders/:id/buy-again` |
| Recommendations | `/recommendations` |
| Delivery address | `addresses` + checkout address page |
| Gift points | `users.gift_points` + `gift_points_transactions` |
| Payment | `payments` + mock payment flow |
| Payment confirmation | `/payment/result` |
| Purchase confirmation | `/orders/:id/confirmation` |
| Cancel within 48 hours | order cancellation service rule |
| PostgreSQL | PostgreSQL + Prisma |
| Responsive frontend | React + Tailwind CSS |
| AI-assisted development | IBM BOB / AWS Kiro workflow |
| API specification | `docs/api-spec.yaml` |
| Testing | frontend + backend tests |
| GitHub PR workflow | feature branches + pull requests |
| Submission video | 3-minute Agentic IDE walkthrough |

---

# 33. Important Implementation Notes

1. **Backend is included in this plan** even though the capstone document is heavily focused on frontend development. The capstone instructions explicitly mention backend services, PostgreSQL, API generation, and integration with backend APIs. fileciteturn0file0L305-L312
2. Use the backend as the source of truth for prices, inventory, totals, gift points and cancellation eligibility.
3. Use mock payment first; real payment integration should be treated as an extension.
4. Keep the frontend independent from database details. React should call APIs instead of accessing PostgreSQL directly.
5. Keep the project modular so the Agentic IDE can generate and refactor individual sections without destroying the whole application.
6. Do not let AI-generated code bypass review. The capstone itself expects review/refinement of generated code, responsiveness checks, loading states, validation and cleanup. fileciteturn0file0L453-L531


---

# 34. Final Cross-Validation & Success Metrics

Use this section as the **final project acceptance checklist** before creating the GitHub PR and recording the capstone video. The goal is to verify that the application is not only visually complete but that the frontend, backend, database, APIs, business rules, responsiveness, and customer journey all work together.

## 34.1 Critical End-to-End Success Criteria

The project should achieve all of the following before it is considered ready:

| Area | Success metric | Target | Status |
|---|---|---:|---|
| Customer journey | Complete browse-to-purchase flow works | 100% | [ ] |
| Authentication | Register/login/logout works | 100% | [ ] |
| Catalogue | Categories, brands and products load from PostgreSQL | 100% | [ ] |
| Product details | Delivery date + related products displayed | 100% | [ ] |
| Cart | Add/update/remove/total calculation works | 100% | [ ] |
| Checkout | Address + gift points + payment option work | 100% | [ ] |
| Payment | Successful and failed payment states handled | 100% | [ ] |
| Orders | Confirmation + history work | 100% | [ ] |
| Buy Again | Previous items can be added back to cart | 100% | [ ] |
| Cancellation | Only eligible orders can be cancelled | 100% | [ ] |
| Recommendations | Recommendation section renders useful products | 100% | [ ] |
| Database | All production-like data persists correctly | 100% | [ ] |
| API validation | Invalid requests return controlled errors | 100% | [ ] |
| Responsive UI | Mobile/tablet/desktop layouts usable | 100% | [ ] |
| Loading/error states | Important async screens have states | 100% | [ ] |
| Tests | Critical business rules covered | >= 80% | [ ] |
| Accessibility | Keyboard, labels, focus and semantic checks pass | 100% of critical flows | [ ] |
| Build | Frontend and backend production builds succeed | 100% | [ ] |
| Code quality | No blocking lint/type/build errors | 0 blocking errors | [ ] |
| Security basics | Secrets excluded and protected APIs enforced | 100% | [ ] |
| Documentation | README + API + architecture + DB docs complete | 100% | [ ] |
| Submission | GitHub PR + 3-minute demo/video ready | 100% | [ ] |

---

## 34.2 Frontend Cross-Validation Checklist

### Navigation

- [ ] Every navbar link points to the correct route.
- [ ] Browser back/forward navigation works.
- [ ] Refreshing a deep link does not break the application.
- [ ] Protected pages redirect unauthenticated users correctly.
- [ ] Logout clears the authenticated session and protected data.
- [ ] 404 page works for unknown routes.

### Responsive UI

Test at minimum:

```text
Mobile:   360 x 800
Mobile:   390 x 844
Tablet:   768 x 1024
Desktop:  1280 x 720
Desktop:  1440 x 900
```

For each viewport verify:

- [ ] No horizontal page overflow.
- [ ] Navbar remains usable.
- [ ] Product cards resize without broken content.
- [ ] Images keep correct aspect ratio.
- [ ] Buttons remain tappable.
- [ ] Forms remain readable and usable.
- [ ] Cart summary remains accessible.
- [ ] Checkout stepper adapts to small screens.
- [ ] Tables/lists do not overflow the viewport.
- [ ] Footer is readable and does not overlap content.

### UI States

Every important API-driven component should have:

```text
Loading → Success → Empty → Error
```

Validate:

- [ ] Skeleton/loading state exists where appropriate.
- [ ] Empty catalogue state works.
- [ ] Empty cart state works.
- [ ] Empty order history state works.
- [ ] API failure displays a user-friendly message.
- [ ] Retry action works where appropriate.
- [ ] Disabled/loading buttons prevent duplicate submissions.

---

## 34.3 Functional Cross-Validation

Run these scenarios manually using seeded demo accounts.

### Scenario A — New customer purchase

```text
Register
→ Login
→ Home
→ Catalogue
→ Category
→ Product Details
→ Add to Cart
→ Cart
→ Checkout
→ Select Address
→ Apply Gift Points
→ Select Payment
→ Complete Mock Payment
→ Confirmation
→ Order History
```

Expected result:

- [ ] User is created in PostgreSQL.
- [ ] Cart item is persisted.
- [ ] Stock/quantity rules are respected.
- [ ] Order is created exactly once.
- [ ] Order items contain the purchase snapshot.
- [ ] Payment record is linked to the order.
- [ ] Gift points are deducted only once.
- [ ] Confirmation displays the correct order.
- [ ] Order appears in order history.

### Scenario B — Buy Again

```text
Login
→ Order History
→ Buy Again
→ Cart
→ Checkout
```

Expected result:

- [ ] Previously purchased products are added to the current cart.
- [ ] Unavailable/out-of-stock products are handled gracefully.
- [ ] Current product prices are used for the new cart/order.
- [ ] A new order is created after checkout; the old order is unchanged.

### Scenario C — Cancellation within 48 hours

- [ ] Create/seed an eligible order.
- [ ] Cancellation button is visible.
- [ ] Cancel request succeeds.
- [ ] Order status changes to `CANCELLED`.
- [ ] Inventory/gift-point/payment reversal logic behaves as designed.
- [ ] UI refreshes with the new order status.

### Scenario D — Cancellation after 48 hours

- [ ] Use a test order older than 48 hours.
- [ ] Cancellation is blocked by the backend.
- [ ] Frontend displays a clear explanation.
- [ ] Direct API manipulation cannot bypass the rule.

### Scenario E — Payment failure

- [ ] Payment failure does not create a duplicate completed order.
- [ ] The user can retry payment.
- [ ] Failed payment status is stored correctly.
- [ ] Cart/order state remains recoverable.

---

## 34.4 API Cross-Validation Checklist

For every API endpoint validate three categories:

```text
Happy path
Invalid input
Unauthorized / forbidden access
```

Example matrix:

| API | Happy path | Invalid input | Auth/security | DB consistency |
|---|---|---|---|---|
| POST `/auth/register` | [ ] | [ ] | [ ] | [ ] |
| POST `/auth/login` | [ ] | [ ] | [ ] | [ ] |
| GET `/products` | [ ] | [ ] | [ ] | [ ] |
| GET `/products/:id` | [ ] | [ ] | [ ] | [ ] |
| POST `/cart/items` | [ ] | [ ] | [ ] | [ ] |
| PATCH `/cart/items/:id` | [ ] | [ ] | [ ] | [ ] |
| POST `/checkout/order` | [ ] | [ ] | [ ] | [ ] |
| POST `/payments/create` | [ ] | [ ] | [ ] | [ ] |
| GET `/orders` | [ ] | [ ] | [ ] | [ ] |
| POST `/orders/:id/buy-again` | [ ] | [ ] | [ ] | [ ] |
| POST `/orders/:id/cancel` | [ ] | [ ] | [ ] | [ ] |

Check that:

- [ ] HTTP status codes are meaningful.
- [ ] Validation errors return a consistent structure.
- [ ] Authentication middleware protects private endpoints.
- [ ] Users cannot access another user's cart/orders/addresses.
- [ ] Duplicate requests are handled safely for order/payment creation.
- [ ] Server-side validation is present even when frontend validation exists.

---

## 34.5 Database Cross-Validation Checklist

Run direct PostgreSQL checks after major flows.

### User and authentication

```sql
SELECT id, email, created_at FROM users;
```

- [ ] Email uniqueness enforced.
- [ ] Passwords are hashed, never stored as plain text.

### Cart

```sql
SELECT * FROM carts;
SELECT * FROM cart_items;
```

- [ ] One active cart per intended user/session model.
- [ ] No orphaned cart items.
- [ ] Quantity is positive.
- [ ] Product references are valid.

### Orders

```sql
SELECT id, user_id, status, total_amount, created_at
FROM orders
ORDER BY created_at DESC;
```

- [ ] Every order belongs to a valid user.
- [ ] Every order has at least one order item.
- [ ] Stored order totals match item totals and discounts.
- [ ] Order status changes are valid.

### Payments

- [ ] Each completed order has the expected payment record.
- [ ] Failed payments do not appear as successful payments.
- [ ] Payment status and order status cannot contradict each other.

### Gift points

- [ ] Balance never becomes negative.
- [ ] Every deduction is traceable through a transaction record.
- [ ] A failed checkout does not incorrectly consume points.

### Referential integrity

- [ ] Foreign keys are enforced.
- [ ] Delete/update behavior is intentional.
- [ ] No orphan rows exist after cart/order operations.

---

## 34.6 Business Rule Validation

These rules must be tested from the **backend**, not only from the frontend.

| Rule | Validation |
|---|---|
| Product quantity > 0 | [ ] |
| Product exists before cart insertion | [ ] |
| Stock cannot go below zero | [ ] |
| User owns the cart | [ ] |
| User owns the order | [ ] |
| Address belongs to user | [ ] |
| Gift points cannot exceed available balance | [ ] |
| Gift points cannot be reused after successful deduction | [ ] |
| Payment total matches checkout total | [ ] |
| Order cannot be cancelled after 48 hours | [ ] |
| Already cancelled order cannot be cancelled again | [ ] |
| Buy Again handles unavailable products | [ ] |
| Unauthenticated users cannot access protected resources | [ ] |

---

## 34.7 Reusable Component Validation

The capstone emphasizes reusable frontend development. Review the application and ensure repeated UI has not been copied unnecessarily.

- [ ] One shared `Button` component is used for common button patterns.
- [ ] One shared input/form pattern is used where appropriate.
- [ ] Product cards use one reusable `ProductCard` component.
- [ ] Order cards use one reusable `OrderCard` component.
- [ ] Address cards are reusable across profile and checkout.
- [ ] Common loading/error/empty states are reusable.
- [ ] Layout components are shared between pages.
- [ ] Reusable components accept props instead of hard-coded business data.
- [ ] Tailwind classes are not duplicated unnecessarily for identical UI patterns.

---

## 34.8 Accessibility Validation

Perform a final accessibility pass:

- [ ] All meaningful images have `alt` text.
- [ ] Form controls have labels.
- [ ] Buttons contain understandable text or accessible labels.
- [ ] Keyboard navigation works for menus, modals and forms.
- [ ] Focus states are visible.
- [ ] Color is not the only indicator of status.
- [ ] Modal dialogs trap/restore focus appropriately.
- [ ] Heading hierarchy is logical.
- [ ] Error messages are associated with the relevant form controls.
- [ ] Touch targets are usable on mobile.

Recommended check:

```text
Run Lighthouse / browser accessibility audit
→ Fix critical issues
→ Re-run audit
```

---

## 34.9 Security Cross-Validation

Before the final PR:

- [ ] `.env` is not committed.
- [ ] `.env.example` contains placeholders only.
- [ ] JWT secret is never hard-coded.
- [ ] Passwords use a secure hashing algorithm.
- [ ] Protected endpoints verify authentication.
- [ ] User ownership is checked on private resources.
- [ ] Request payloads are validated.
- [ ] CORS is configured intentionally.
- [ ] Security headers are enabled.
- [ ] Rate limiting is applied to sensitive endpoints where appropriate.
- [ ] SQL injection is prevented by Prisma/parameterized queries.
- [ ] Sensitive payment information is not stored in logs.

---

## 34.10 Performance Success Metrics

The following are practical **project targets**, not requirements stated by the capstone source:

| Metric | Suggested target |
|---|---:|
| Initial page load on local production build | < 3 seconds on a normal broadband connection |
| API response for simple catalogue request | < 500 ms locally under normal demo load |
| Catalogue pagination | No unnecessary loading of all products at once |
| Images | Optimized and responsive; avoid oversized originals |
| Duplicate API requests | Avoid obvious duplicate requests |
| Client caching | Product/catalogue data cached where useful |
| Bundle/code quality | Remove unused dependencies and dead code |

For the final demo, performance should be **visibly smooth**, even if exact timings vary by machine.

---

## 34.11 Test Coverage Targets

Prioritize tests around business-critical behavior instead of chasing a large percentage without meaningful assertions.

### Recommended minimum coverage

```text
Authentication                  ≥ 80%
Cart calculations              ≥ 90%
Checkout/order creation       ≥ 90%
Gift point logic               ≥ 90%
48-hour cancellation rule     ≥ 95%
Buy Again logic                ≥ 90%
Critical UI components        ≥ 70%
```

### Required automated tests

- [ ] Registration validation
- [ ] Login success/failure
- [ ] Product listing
- [ ] Cart add/update/remove
- [ ] Cart total calculation
- [ ] Gift point calculation
- [ ] Order creation
- [ ] Payment success/failure
- [ ] Buy Again
- [ ] Cancellation within 48 hours
- [ ] Cancellation after 48 hours
- [ ] Unauthorized order access

---

# 35. Final Acceptance Scorecard

Use this scorecard immediately before submission.

| Category | Weight | Score (0–5) | Weighted result |
|---|---:|---:|---:|
| Customer journey completeness | 20% | ___ | ___ |
| UI quality + responsive design | 15% | ___ | ___ |
| Reusable component quality | 10% | ___ | ___ |
| Backend/API quality | 15% | ___ | ___ |
| PostgreSQL/schema quality | 10% | ___ | ___ |
| Business-rule correctness | 10% | ___ | ___ |
| Testing + validation | 10% | ___ | ___ |
| Accessibility + security basics | 5% | ___ | ___ |
| Documentation + Git workflow | 5% | ___ | ___ |
| **Total** | **100%** |  | **___ / 100** |

### Scoring guide

```text
5 = Excellent / production-like
4 = Complete with minor issues
3 = Working but needs refinement
2 = Partially working
1 = Major issues
0 = Not implemented
```

### Recommended acceptance threshold

```text
Overall score:             ≥ 80/100
Critical customer flows:  100% working
Blocking bugs:             0
Build errors:              0
Critical API/security bugs:0
Responsive layouts:        All primary pages verified
Database integrity issues: 0
```

Any item classified as **critical** should be fixed before the final GitHub PR and capstone video.

---

# 36. Final 30-Minute Pre-Submission Checklist

Use this as the final quick check on the day of submission:

```text
[ ] Fresh clone/setup works
[ ] PostgreSQL starts successfully
[ ] Prisma migrations run successfully
[ ] Seed data loads successfully
[ ] Frontend starts successfully
[ ] Backend starts successfully
[ ] Register works
[ ] Login works
[ ] Catalogue works
[ ] Category filter works
[ ] Brand browsing works
[ ] Product details works
[ ] Related products work
[ ] Add to cart works
[ ] Cart update/remove works
[ ] Checkout address works
[ ] Gift points work
[ ] Payment success works
[ ] Payment failure works
[ ] Order confirmation works
[ ] Order history works
[ ] Buy Again works
[ ] Cancellation within 48 hours works
[ ] Cancellation after 48 hours is blocked
[ ] Mobile layout checked
[ ] Tablet layout checked
[ ] Desktop layout checked
[ ] Loading states checked
[ ] Error states checked
[ ] Accessibility pass completed
[ ] Tests pass
[ ] Lint passes
[ ] Type-check passes
[ ] Production build passes
[ ] No secrets in Git
[ ] README updated
[ ] API documentation updated
[ ] Architecture diagram updated
[ ] Database schema documented
[ ] Git history is clean
[ ] Pull Request created
[ ] 3-minute demo video recorded
[ ] GitHub link ready for submission
```

This final checklist complements the capstone's own expectations around reviewing generated code, testing screens and components, checking responsiveness, adding loading/validation states, refactoring reusable components, and completing the Git/PR workflow. fileciteturn0file0L602-L641

---

## Source Alignment

This document is based on the uploaded IBM AI Specialist Capstone instructions. The source defines the online bookstore journeys and features, PostgreSQL, AI-assisted development, API/backend activities, responsive frontend workflow, testing/refinement, Git workflow, and final submission expectations. fileciteturn0file0L209-L225 fileciteturn0file0L235-L279 fileciteturn0file0L305-L314 fileciteturn0file0L602-L641

Where the source does not prescribe an exact implementation technology (for example, Node.js/Express, Prisma, React Router or a specific payment processor), this document uses a proposed stack chosen to make the capstone practical, maintainable, and easy to demonstrate.
