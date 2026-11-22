# Chiikawa Shop (MERN)

Full-stack Chiikawa-themed shop with user registration/login, cart & checkout, and admin CRUD for inventory, orders, and simulated delivery tracking.

## Stack

- **MongoDB** (local via [MongoDB Compass](https://www.mongodb.com/products/compass) or Atlas) + Mongoose
- **Express** REST API (`/server`)
- **React** (Vite) SPA (`/client`)

## Quick start

### 1. MongoDB (Compass on your PC)

**Option A — Local (Compass)** — recommended if you installed Compass:

1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) so the `mongod` service runs (default `mongodb://localhost:27017/`).
2. Open **MongoDB Compass** → connect with that URI.
3. The app uses database `chiikawa_shop` (created automatically on first run/seed).

**Option B — Atlas (cloud)**

1. Create a cluster and user at [MongoDB Atlas](https://cloud.mongodb.com).
2. **Network Access**: allow your IP.
3. URI: `mongodb+srv://USER:PASS@cluster.mongodb.net/chiikawa_shop`

> If you switch Atlas ↔ local, update `MONGODB_URI` in `server/.env` and re-seed if needed.

### 2. Server environment

Create `server/.env` (see `server/.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chiikawa_shop
JWT_SECRET=use_a_long_random_string
CLIENT_URL=http://localhost:5173
```

Seed products and admin user:

```bash
cd server
npm run seed
```

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@chiikawa.shop` | `admin123` |
| Shipping | `shipping@chiikawa.shop` | `ship1234` |
| Customer (demo) | `testuser@gmail.com` | `test1234` |

**Order number field names:** see [`docs/ORDER_IDS.md`](docs/ORDER_IDS.md) before editing IDs in Compass or code.

**PDFs / activity files:** drop them in `self paced activity templates/` at the project root.

### 3. Run

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

Open http://localhost:5173

## Features map

| Area | Routes |
|------|--------|
| Login / Register | Public only; each role goes to its home route |
| Shipping | `/shipping/deliveries` — delivery table, **COMPLETE** only (not admin) |
| Shop | Product grid, Grab-style +/- stepper, green cart badge |
| Cart | Receipt, payment method, edit profile (confirm dialog), checkout |
| Admin inventory | 8 products, restock modal, stock history |
| Admin orders | Search, status filter, date, ship (DELIVER) / cancel — **no complete** |
| Admin delivery | Read-only delivery table (progress) |

## Postman

Import **`postman/Chiikawa-Shop.postman_collection.json`** into Postman. See **[postman/POSTMAN.md](postman/POSTMAN.md)** for login flow and sample requests.

## API overview

- `POST /api/auth/register` · `POST /api/auth/login`
- `GET/PUT /api/auth/me`
- `GET /api/products` · `GET/POST/PATCH /api/cart`
- `POST /api/orders/checkout`
- `GET/POST /api/admin/inventory/*` · `GET /api/admin/orders` · `GET /api/admin/deliveries`
- `GET /api/shipping/deliveries` · `PATCH /api/shipping/orders/:id/complete`

## UI reference

Place design assets from your PDF in `client/public/` and wire `product.imageUrl` in the seed if you want exact visuals from the draft.