# Postman testing — Chiikawa Shop API

## Setup

1. Start the API: `cd server && npm run dev` (port **5000**).
2. In Postman: **Import** → `postman/Chiikawa-Shop.postman_collection.json`.
3. Collection variables (already set):
   - `baseUrl` = `http://localhost:5000/api`

## Auth (required for almost everything)

1. Run **Auth → Login (customer)** / **Login (admin)** / **Login (shipping)**.
2. The **Tests** tab on those requests saves `token` into the collection.
3. Other requests use **Authorization → Bearer Token** → `{{token}}`.

| Role | Body |
|------|------|
| Customer | `testuser@gmail.com` / `test1234` |
| Admin | `admin@chiikawa.shop` / `admin123` |
| Shipping | `shipping@chiikawa.shop` / `ship1234` |

## Manual request (no import)

| Method | URL | Notes |
|--------|-----|--------|
| GET | `http://localhost:5000/api/health` | No auth (use `http://localhost:5000/api/../health` only in collection; direct: see below) |

Health is mounted at **`GET http://localhost:5000/api/health`** — in Express it's `/api/health` via `app.get('/api/health')`.

## Typical flows

**Customer checkout**

1. Login (customer)  
2. GET `/api/products` → copy `_id` into `productId` (or use collection auto-set)  
3. POST `/api/cart/add` `{ "productId": "..." }`  
4. POST `/api/orders/checkout` `{ "paymentMethod": "gcash" }`

**Admin fulfill**

1. Login (admin)  
2. GET `/api/admin/orders`  
3. PATCH `/api/admin/orders/:orderId/ship`

**Shipping complete**

1. Login (shipping)  
2. GET `/api/shipping/deliveries`  
3. PATCH `/api/shipping/orders/:orderId/complete` (order must already be shipped)

## Headers

```
Content-Type: application/json
Authorization: Bearer <paste token from login response>
```

## Common errors

| Code | Meaning |
|------|---------|
| 401 | Missing/invalid token — login again |
| 403 | Wrong role (e.g. customer calling `/api/admin/...`) |
| ECONNREFUSED | Server not running |