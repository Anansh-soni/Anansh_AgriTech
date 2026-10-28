# AgriTech — Empowering Farmers Through Digital Technology

AgriTech is a MERN college project for farm and crop records, local weather, soil guidance, pest watch information, agricultural products, booking requests, and administrator tools.

## Technology

- React, Vite, JavaScript
- Node.js and Express
- MongoDB with Mongoose
- JWT authentication and bcrypt password hashing
- Open-Meteo forecast and geocoding APIs

## Run locally

1. Install Node.js and MongoDB Atlas or a local MongoDB server.
2. In `server`, create `.env` using `.env.example` as a guide. Set `MONGO_URI` and a private, long `JWT_SECRET`.
3. Install dependencies and start the backend:

   ```sh
   cd server
   npm install
   npm run dev
   ```

4. In another terminal, start the frontend:

   ```sh
   cd client
   npm install
   npm run dev
   ```

5. Open the local address printed by Vite, register a farmer account, and add farms and crops.

## Features

- Farmer registration and login. Passwords are hashed; protected API routes use JWTs.
- Personal farm records with add, view, edit and delete operations.
- Crop records linked to a farmer-owned farm, with progress updates and delete support.
- Five-day weather forecast for a searched location via Open-Meteo. Open-Meteo attribution is shown in the app.
- General soil-health guidance based on the soil type recorded for a farm. This is educational information, not a soil test.
- Common pest signs and prevention guidance. These are a general watchlist, not live or location-specific alerts.
- Product catalog, resource reservation requests, expert consultation requests, and booking status tracking.
- Admin overview, account-role management, marketplace product management, and booking status management.

## Enable an administrator

Public registration always creates a farmer account. To designate an administrator, first register the account, then use MongoDB Atlas (or another trusted MongoDB administration tool) to edit that user's document in the `users` collection and set `role` to `admin`. Sign in again afterward. The server checks the role on protected admin routes; hiding the admin panel in the browser is not the security control.

Never put a MongoDB URI or JWT secret in frontend code or commit `server/.env`. The repository ignore file excludes the local environment file.

## API outline

- `/api/users`: register, login, and current-user lookup
- `/api/farms`: farmer-owned farm records
- `/api/crops`: farmer-owned crop records and progress
- `/api/products`: public catalog; admin-only create, edit and delete
- `/api/bookings`: authenticated farmer booking requests
- `/api/admin`: admin-only statistics, users, and all bookings

Weather uses Open-Meteo's public geocoding and forecast services. A network connection is required for current forecasts. Soil and pest sections provide general static guidance.
