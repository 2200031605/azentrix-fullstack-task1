# Personal Budget Tracker - TODO

- [x] Inspect/confirm current Express entry points
- [x] Update Express app to serve static frontend from `public/`

- [x] Create `public/index.html`
- [x] Create `public/styles.css`

- [x] Create `public/app.js` (initial single-page version)
- [x] Add multi-page UI:
  - [x] navigation.js
  - [x] api.js
  - [x] auth.js
  - [x] login.html
  - [x] register.html
  - [x] dashboard.html
  - [x] transactions.html
  - [x] reports.html

- [x] Backend (MongoDB + JWT) scaffolding:
  - [x] src/config.js
  - [x] src/db/mongoose.js
  - [x] src/middleware/auth.js
  - [x] src/models/transaction.js
  - [x] src/models/authUser.js
  - [x] src/routes/authRoutes.js
  - [x] src/routes/transactionRoutes.js
  - [x] src/routes/reportRoutes.js

- [x] Update frontend to use MongoDB-backed pages (multi-page)

- [ ] Run `npm install` and start server (ensure MongoDB running)
- [ ] Smoke test:
  - [ ] register/login
- [ ] add/edit/delete transactions (localStorage or Mongo-backed pages)
  - [ ] dashboard chart + reports pie
  - [ ] persistence in MongoDB

