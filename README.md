# MockMate - Interview Practice Platform

A production-ready 1-on-1 interview practice platform connecting interviewees with experienced interviewers based on subject expertise and geographic proximity.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT
- **Video**: WebRTC (basic scaffolding)

## Project Structure

```
/
├── backend/          # Express.js API server
├── frontend/         # Next.js application
└── ARCHITECTURE.md   # System architecture documentation
```

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
PORT=5001
MONGODB_URI=mongodb://localhost:27017/mockmate
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

4. Start the server:
```bash
npm run dev
```

Backend will run on `http://localhost:5001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Features

### Authentication
- User registration with role selection (Interviewer/Interviewee)
- JWT-based authentication
- Protected routes

### Interviewer Profile
- Years of experience
- Multiple domain expertise
- Availability radius (geographic)
- Location-based matching

### Interviewee Profile
- Student or Professional status
- Subject selection per session
- Geographic search filters

### Matching System
- Geospatial queries (MongoDB 2dsphere)
- Radius-based search (5km, 10km, 50km)
- Subject/domain filtering

### Session Management
- Session request/accept/reject flow
- Session status tracking
- Start/end session controls
- Session history

### Interview Session
- WebRTC video call (basic setup)
- Real-time notes panel
- Auto-save notes functionality
- Session timer

### Dashboard
- Role-based views
- Upcoming sessions
- Past sessions
- Quick actions

## API Endpoints

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Matching
- `GET /api/match/interviewers` - Find interviewers (query: subject, radius, lat, lng)

### Sessions
- `POST /api/sessions` - Create session request
- `GET /api/sessions` - List sessions
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id/accept` - Accept session
- `PUT /api/sessions/:id/reject` - Reject session
- `PUT /api/sessions/:id/start` - Start session
- `PUT /api/sessions/:id/end` - End session

### Notes
- `POST /api/sessions/:sessionId` - Create/update note
- `GET /api/sessions/:sessionId` - Get notes for session

## WebRTC Implementation

**Current Status**: Basic scaffolding with placeholder implementation

The current WebRTC setup includes:
- Local video/audio capture
- Peer connection initialization
- Basic STUN server configuration

**Production Requirements** (not implemented):
- Signaling server (WebSocket/Socket.io)
- TURN servers for NAT traversal
- Offer/answer exchange mechanism
- ICE candidate exchange

## Security Notes

- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens for authentication
- Role-based access control
- Input validation on all endpoints
- CORS configured for frontend origin

## Development Notes

- All routes are protected except auth endpoints
- Geospatial queries require MongoDB 2dsphere index (auto-created)
- Location must be provided during registration
- Notes auto-save after 2 seconds of inactivity

## Future Enhancements

- Full WebRTC signaling infrastructure
- Session recording (metadata + actual video storage)
- Rating/feedback system
- Email notifications
- Calendar integration
- Payment system (if needed)

## License

MIT

