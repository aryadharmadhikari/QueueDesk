# QueueDesk

QueueDesk is a small virtual queue application. Visitors join a queue with a shared code and track their ticket. Staff call and serve tickets in order.

The project uses React, Node.js, Express, MongoDB, and Mongoose. The pages refresh queue data every five seconds.

## Requirements

- Node.js 20.19 or later
- MongoDB running locally, or a MongoDB connection string

## Start the project

1. Run `npm install` in the project folder.
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI` and `QUEUE_CODE` in `.env`. The code must contain 4 or 6 digits.
4. Start MongoDB.
5. Run `npm run dev:server` in one terminal.
6. Run `npm run dev:client` in another terminal.
7. Open the URL shown by Vite. The default is `http://localhost:5173`.

The Vite development server sends API requests to the port set in `.env`. Restart Vite after you change `PORT`.

For a single-server build, run `npm run build` and then `npm start`. Open `http://localhost:5000` or the port in `.env`.

## Use the queue

1. Open the app, enter the shared queue code, and select **Join**.
2. Check your position. The same browser remembers your ticket when you return.
3. Open `http://localhost:5173/staff` in another tab and select **Call next**. For a built app, use `/staff` on its server URL.
4. Select **Mark served** after the visitor is served.

Staff can select **Add walk-in ticket** to add a visitor who does not have a phone. This is also a quick way to fill the queue during a demo. Select **Cancel** next to a waiting ticket to remove it from the queue.

The staff desk is open to anyone who can access this demo. Add authentication before using it in a public setting.

## Project structure

- `client/src`: React pages, API helper, and styles
- `server/src/queue.js`: queue API routes
- `server/src/models.js`: MongoDB ticket and counter models
- `server/src/server.js`: server setup and database connection

Ticket numbers are assigned in order. A ticket is **waiting**, **called**, **served**, or **cancelled**. The server allows only one called ticket at a time.
