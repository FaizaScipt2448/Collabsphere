# Collabsphere

Collabsphere is a MERN-based collaboration platform where users can share posts, manage tasks, publish products, and interact through comments and reactions. The project is designed as a student/community focused space for idea sharing, productivity, and learning-oriented collaboration.

## Features

- User registration and login with JWT authentication
- Role-based access for users and admins
- User profile dashboard with activity statistics
- Create and manage posts
- Public post detail page with comments and reactions
- Create and manage products
- Product detail page with seller information
- Drag-and-drop task management board
- Admin dashboard with user management
- Settings page with password update
- Subscription page

## Tech Stack

### Frontend

- React
- Vite
- Material UI
- React Router
- Axios
- React Hook Form

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer

## Project Structure

```text
Collabsphere/
  client/     React frontend
  server/     Express and MongoDB backend
```

## Getting Started

### Requirements

- Node.js
- npm
- MongoDB database

### Backend Setup

```bash
cd server
npm install
npm start
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

## Environment Variables

### Frontend

Create a `.env` file inside the `client` folder:

```env
VITE_SERVER_ENDPOINT=http://localhost:3000/api
VITE_TOKEN_KEY=collabsphere
VITE_USER_ROLE=role
VITE_COOKIE_EXPIRES=1
```

### Backend

Create a `.env` file inside the `server` folder:

```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/
DATABASE_NAME=collabsphere
BCRYPT_GEN_SALT_NUMBER=10
JWT_SECRET_KEY=your_jwt_secret
COOKIE_EXPIRES=5d
COOKIE_KEY=collabsphere
UPLOAD_DIRECTORY=uploads
```

## Future Improvements

- Community feed for all public posts
- Public user profiles
- Follow/connect system
- Assignment management
- Polls
- Resource sharing
- Product inquiry or selling flow
- Admin moderation for posts, products, and comments

## Author

Faiza
