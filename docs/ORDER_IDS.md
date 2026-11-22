# Order & delivery ID reference

Use this when renaming IDs to something easier to read (e.g. in **MongoDB Compass** or in code).

## What customers and admins see in the app

| Meaning | Field name | Where it lives |
|--------|------------|----------------|
| **Order number** (e.g. `CW-DEMO001`, `CW-MWP92M5D`) | `orderNumber` | `server/models/Order.js` (schema field) |
| **Tracking number** on delivery (e.g. `CHK-…`) | `trackingNumber` | `server/models/Delivery.js` |

## Where new order numbers are created

| Source | File | Symbol |
|--------|------|--------|
| Checkout (live orders) | `server/routes/orders.js` | `generateOrderNumber()` → template ``CW-${Date.now().toString(36).toUpperCase()}`` |
| Sample / seed data | `server/seed.js` | each object’s `orderNumber: 'CW-DEMO001'`, etc. |
| Delivery tracking on checkout | `server/models/Delivery.js` | `createForOrder()` → ``CHK-${Date.now().toString(36).toUpperCase()}`` |

## MongoDB internal IDs (usually not shown in the UI)

| Meaning | Field name | Notes |
|--------|------------|--------|
| Order document | `_id` | `orders` collection |
| Delivery document | `_id` | `deliveries` collection |
| Link delivery → order | `order` | `Delivery` schema (ObjectId ref) |

## UI labels

- Admin **Orders** table column **Order** → `o.orderNumber` in `client/src/pages/admin/OrdersDeliveryPage.jsx`
- Delivery table **ORDER NO.** → `d.order?.orderNumber`

To change the **format** for new orders, edit `generateOrderNumber()` in `server/routes/orders.js`.  
To change **demo** order numbers, edit `orderNumber` in `server/seed.js` (re-seed or edit in Compass).