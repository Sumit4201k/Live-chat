# Live Chat Application

A full-stack real-time chat app with authentication, online presence, message history, image sharing, profile updates, and email notifications.

## What It Does

- User signup, login, logout, and auth persistence with JWT cookies
- Real-time online/offline status with Socket.io
- One-to-one chat history and contact lists
- Text and image message sending with Cloudinary uploads
- Profile picture updates for signed-in users
- Welcome emails for new users through Resend
- Route protection and rate limiting with Arcjet

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Zustand
- Socket.io client
- Axios
- Tailwind CSS + DaisyUI

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- Socket.io
- JWT + cookie-based auth
- bcryptjs for password hashing
- Cloudinary for uploads
- Resend for transactional email
- Arcjet for protection and rate limiting

## Project Structure

```
.
├── Frontend/
│   ├── src/
│   │   ├── Pages/
│   │   ├── components/
│   │   ├── store/
│   │   └── lib/
│   └── public/
└── Backend/
	├── src/
	│   ├── controllers/
	│   ├── routes/
	│   ├── models/
	│   ├── middleware/
	│   └── lib/
	└── src/server.js
```

## Key Features

- Authentication endpoints for signup, login, logout, and auth checks
- Protected profile picture update endpoint
- Contact list that excludes the currently logged-in user
- Message history between two users
- Image attachments in messages
- Socket-powered online user tracking
- Production-ready static frontend serving from the backend server

## Getting Started

### Prerequisites
- Node.js
- npm
- MongoDB connection string

### Install Dependencies

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### Environment Variables

Create a `.env` file in `Backend/` with values for:

- `PORT`
- `MONGODB_URL`
- `JWT_SECRET`
- `NODE_ENV`
- `CLIENT_URL`
- `RESEND_API`
- `EMAIL_FROM`
- `EMAIL_FROM_NAME`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ARCJET_API_KEY`
- `ARCJET_ENV`

### Run in Development

Start the backend:

```bash
cd Backend
npm run dev
```

Start the frontend:

```bash
cd Frontend
npm run dev
```

### Production Build

From the repository root:

```bash
npm run build
npm start
```

The root `build` script installs dependencies, builds the frontend, and prepares the backend to serve the compiled frontend.

## API Overview

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `PUT /api/auth/update-profile-picture`
- `GET /api/auth/check`

### Messages
- `GET /api/message/contacts`
- `GET /api/message/chatPartners`
- `GET /api/message/:id`
- `POST /api/message/send/:id`

## Real-Time Flow

This project uses REST for most data access and Socket.io for presence plus instant delivery.

1. The backend tracks connected users in a `userSocketMap`.
2. When a user connects or disconnects, the server broadcasts `getOnlineUsers`.
3. Sending a message stores it in MongoDB and emits `newMessage` to the receiver if they are online.
4. The frontend updates chat state and contact presence from those socket events.

## Notes

- In production, the backend serves the built frontend from `Frontend/dist`.
- Message and profile image uploads are handled through Cloudinary.
- Signup sends a welcome email after the user is created.

## License

ISC
