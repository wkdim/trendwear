# TrendWear GH

A MERN e-commerce app: Express/Mongoose API in `trendwear-backend/`, Create React App storefront + admin panel in `trendwear-frontend/`, payments via Paystack, image hosting via Cloudinary.

## Local setup

### Backend

```
cd trendwear-backend
cp .env.example .env   # fill in real values
npm install
npm run dev             # nodemon, http://localhost:5000
```

Required env vars (see `.env.example`): `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PAYSTACK_SECRET_KEY`/`PAYSTACK_PUBLIC_KEY`, `CLOUDINARY_*`, `FRONTEND_URL` (used for CORS and for the Paystack payment `callback_url`).

Run tests with `npm test`. Most tests are self-contained; the small DB-dependent subset only runs with:

```
RUN_DB_TESTS=true MONGO_URI=mongodb://127.0.0.1:27017/trendwear_test npm test
```

**Promoting a user to admin.** There's no self-service admin signup (registration always creates a `customer`, on purpose). After a user registers normally, promote them directly in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

### Frontend

```
cd trendwear-frontend
cp .env.example .env   # REACT_APP_API_URL, defaults to http://localhost:5000/api
npm install
npm start                # http://localhost:3000
```

`npm run build` produces the production bundle; `npm test` runs the React Testing Library suite.

## Architecture notes

- **Auth**: JWT bearer tokens. `protect` middleware loads the user from the DB on every request (not just the JWT payload), so `req.user._id`/`req.user.role` are always fresh.
- **Cart**: guest carts live in `localStorage`; on login they're merged into the backend `/api/cart` and the app switches to server-backed state for the session.
- **Checkout/payment**: placing an order (`POST /api/orders`) snapshots the cart and decrements stock; `POST /api/payments/initiate` starts a Paystack transaction; Paystack redirects to `/checkout/callback`, which calls `POST /api/payments/verify`. The `/api/payments/webhook` route is the source of truth for marking orders paid and verifies Paystack's `x-paystack-signature` HMAC before trusting anything in the body.
- **Admin**: `/admin` is gated client-side by role and server-side by the `admin` middleware on every admin/product-write/category-write/order-status route.

## Known follow-ups (out of scope for this pass)

- The Contact page is client-only (no `/api/contact` endpoint yet) — `nodemailer`/`EMAIL_*` config exists in the backend for this but isn't wired up.
- Create React App's toolchain is in maintenance mode with known-vulnerable transitive dev dependencies (build-time only, not runtime). Consider migrating to Vite when there's room for it.
