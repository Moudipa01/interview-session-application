# MockMate - System Architecture

## Overview
MockMate is a 1-on-1 interview practice platform connecting interviewees with interviewers based on subject expertise and geographic proximity.

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (access tokens)
- **Video**: WebRTC (peer-to-peer, basic setup)
- **Geospatial**: MongoDB 2dsphere indexes

## System Architecture

```
┌─────────────────┐
│   Next.js App   │ (Frontend - App Router)
│   (React + TS)  │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│  Express API    │ (Backend - RESTful)
│  (Node.js)      │
└────────┬────────┘
         │
┌────────▼────────┐
│   MongoDB       │ (Database)
│   (Mongoose)    │
└─────────────────┘
```

## Data Models

### 1. User Collection
**Purpose**: Store user accounts (both interviewers and interviewees)

**Schema**:
```javascript
{
  email: String (unique, required)
  password: String (hashed, required)
  role: String (enum: ['interviewer', 'interviewee'], required)
  
  // Common profile
  fullName: String (required)
  location: {
    type: 'Point',
    coordinates: [lng, lat] // GeoJSON format
  }
  
  // Interviewer-specific
  yearsOfExperience: Number (required if role === 'interviewer')
  domains: [String] (required if role === 'interviewer')
  availabilityRadius: Number (default: 5, km)
  
  // Interviewee-specific
  currentStatus: String (enum: ['student', 'professional'], required if role === 'interviewee')
  yearOfStudy: Number (required if currentStatus === 'student')
  domain: String (required if currentStatus === 'professional')
  
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**:
- `email`: unique
- `location`: 2dsphere (for geospatial queries)
- `role`: standard

### 2. Session Collection
**Purpose**: Track interview sessions between users

**Schema**:
```javascript
{
  intervieweeId: ObjectId (ref: 'User', required)
  interviewerId: ObjectId (ref: 'User', required)
  subject: String (required)
  
  status: String (enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'], default: 'pending')
  
  scheduledAt: Date (optional, for future scheduling)
  startedAt: Date (when session actually begins)
  endedAt: Date (when session ends)
  
  recordingEnabled: Boolean (default: false)
  
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**:
- `intervieweeId`: standard
- `interviewerId`: standard
- `status`: standard
- Compound: `{ intervieweeId: 1, status: 1 }`
- Compound: `{ interviewerId: 1, status: 1 }`

### 3. Notes Collection
**Purpose**: Store session notes (markdown/text)

**Schema**:
```javascript
{
  sessionId: ObjectId (ref: 'Session', required)
  authorId: ObjectId (ref: 'User', required)
  content: String (markdown/text, required)
  
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**:
- `sessionId`: standard
- `authorId`: standard
- Compound: `{ sessionId: 1, authorId: 1 }`

## Relationships

1. **User ↔ Session**: One-to-Many
   - One user (as interviewer) can have many sessions
   - One user (as interviewee) can have many sessions
   - Relationship: `User._id` → `Session.interviewerId` / `Session.intervieweeId`

2. **Session ↔ Notes**: One-to-Many
   - One session can have multiple notes (from different authors)
   - Relationship: `Session._id` → `Notes.sessionId`

3. **User ↔ Notes**: One-to-Many
   - One user can write multiple notes across sessions
   - Relationship: `User._id` → `Notes.authorId`

## API Endpoints Structure

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Matching
- `GET /api/match/interviewers` - Find interviewers (query: subject, radius, location)

### Sessions
- `POST /api/sessions` - Create session request
- `GET /api/sessions` - List sessions (role-based filtering)
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id/accept` - Accept session (interviewer only)
- `PUT /api/sessions/:id/reject` - Reject session (interviewer only)
- `PUT /api/sessions/:id/start` - Start session
- `PUT /api/sessions/:id/end` - End session

### Notes
- `POST /api/sessions/:sessionId/notes` - Create/update note
- `GET /api/sessions/:sessionId/notes` - Get notes for session

## Security Considerations

1. **Authentication**: JWT tokens stored in httpOnly cookies or Authorization header
2. **Authorization**: Role-based middleware checks
3. **Password**: bcrypt hashing (salt rounds: 10)
4. **Input Validation**: Express-validator for request validation
5. **CORS**: Configured for Next.js frontend origin
6. **Rate Limiting**: Applied to auth endpoints

## File Structure

```
/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── jwt.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Session.js
│   │   └── Note.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roleGuard.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── match.js
│   │   ├── sessions.js
│   │   └── notes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── profileController.js
│   │   ├── matchController.js
│   │   ├── sessionController.js
│   │   └── noteController.js
│   ├── utils/
│   │   ├── validation.js
│   │   └── errors.js
│   └── server.js
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── match/
│   │   │   └── session/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── match/
│   │   └── session/
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useMatch.ts
│   │   └── useSession.ts
│   ├── lib/
│   │   └── api.ts
│   └── types/
│       └── index.ts
│
└── package.json (root)
```

