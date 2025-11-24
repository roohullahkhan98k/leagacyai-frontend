# 🚀 Legacy AI Prototype - Complete System Documentation

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Tech Stack](#tech-stack)
3. [Features & Modules](#features--modules)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Database Schema](#database-schema)
6. [Frontend Architecture](#frontend-architecture)
7. [File Structure](#file-structure)
8. [Authentication & Security](#authentication--security)
9. [Third-Party Integrations](#third-party-integrations)

---

## 🎯 System Overview

Legacy AI Prototype is a comprehensive AI platform featuring:
- Real-time AI interviews with transcription
- Semantic memory graph with relationship visualization
- Voice cloning and speech generation
- 3D avatar creation and animation
- Multimedia management with intelligent linking

**Architecture:** Full-stack TypeScript application
- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + PostgreSQL
- **Storage:** Hybrid (PostgreSQL + File System + ChromaDB)

---

## 💻 Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** React Context API + Local State
- **Styling:** Tailwind CSS
- **UI Libraries:**
  - Lucide React (icons)
  - React Flow (@xyflow/react) - Graph visualization
  - React Toastify - Toast notifications
- **3D Rendering:** Three.js (for avatar viewer)
- **HTTP Client:** Native Fetch API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL with Sequelize ORM
- **Vector Database:** ChromaDB (for semantic search)
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer
- **WebSocket:** ws library (for real-time features)

### External Services
- **AI/LLM:** OpenAI GPT-4
- **Voice Cloning:** ElevenLabs API
- **3D Avatars:** Ready Player Me + Custom pipeline
- **Lipsync:** Rhubarb Lip Sync

---

## 🎭 Features & Modules

### 1. AI Interview Engine

**Purpose:** Real-time AI-powered interview assistant with transcription and Q&A generation

**Key Features:**
- Real-time audio transcription
- WebSocket connection for live updates
- GPT-4 powered answer suggestions
- Interview session management
- Q&A pair storage and retrieval
- Interview history 
- Session persistence in PostgreSQL

**User Flow:**
1. Start interview → WebSocket connects
2. Speak → Audio transcribed in real-time
3. AI generates answer suggestions
4. Q&A pairs saved to database
5. End interview with custom title
6. View past interviews with full transcript
7. Search similar Q&A pairs
8. Delete old interviews

---

### 2. Memory Graph Service

**Purpose:** Semantic memory management with visual graph relationships

**Key Features:**
- PostgreSQL + ChromaDB hybrid storage
- Node types: Memory, Person, Event, Media
- Tag aggregation (combined tags node)
- Semantic search with embeddings
- Graph visualization with React Flow
- Professional gradient styling
- Interactive zoom and pan controls
- Dark mode support

**Node Types:**
- **Memory:** Purple gradient rectangles - Main memory content
- **Person:** Blue circles - People in memories
- **Event:** Green rounded rectangles - Events/occasions
- **Media:** Pink squares - Images/videos with thumbnails
- **Tags:** Amber pill - All tags comma-separated in one node

**User Flow:**
1. Create memory with text content
2. Add tags (auto-aggregated in graph)
3. Link to people and events
4. Attach media files
5. Visualize relationships in graph
6. Search memories semantically
7. Edit and delete memories
8. View memory details

---

### 3. Voice Cloning & Playback

**Purpose:** Clone voices and generate speech using ElevenLabs

**Key Features:**
- Voice recording with microphone
- Voice cloning with custom samples
- Text-to-speech generation
- Custom voice management (user-specific)
- Audio history tracking
- Default voice library
- Voice deletion (custom voices only)
- PostgreSQL storage for user voices and history

**User Flow:**
1. Record voice sample (30+ seconds)
2. Clone voice → Stored in PostgreSQL + ElevenLabs
3. Manage custom voices in dedicated tab
4. Generate speech from text using any voice
5. View audio generation history
6. Download generated audio
7. Delete custom voices
8. Use default voices (Adam, Bella, etc.)

---

### 4. Avatar Service

**Purpose:** 3D avatar creation, management, and lipsync animation

**Key Features:**
- Photo → 3D model pipeline (Ready Player Me)
- Direct 3D model upload (.glb, .gltf, .fbx)
- Audio → Lipsync generation (Rhubarb)
- Audio recording in-browser
- 3D model viewer with Three.js
- Animation history tracking
- Avatar metadata management
- Lipsync playback with audio sync
- PostgreSQL storage for avatars and animations

**User Flow:**
1. Upload photo → Backend generates rigged 3D avatar
2. OR upload existing 3D model directly
3. View avatar in 3D viewer
4. Record audio or upload audio file
5. Generate lipsync animation
6. View animated avatar with lipsync
7. Manage multiple avatars
8. Track animation history
9. Delete avatars/animations

**Tab Organization:**
- **Create:** Photo/model upload pipeline
- **My Avatars:** Grid view, click to open modal
- **History:** All animations with playback

---

### 5. Multimedia Management

**Purpose:** Upload, organize, and link media files to memory nodes

**Key Features:**
- Drag-and-drop file upload
- Multi-file batch upload
- Auto metadata extraction (EXIF, GPS, device info)
- Memory node creation (Events, People, Timelines)
- Media-to-node linking system
- Relationship types (primary, associated, reference)
- Bulk operations (link/unlink multiple files)
- Advanced search and filtering
- Connection status tracking
- Analytics dashboard
- PostgreSQL storage for metadata

**Metadata Auto-Extraction:**
- **Images:** EXIF data, GPS coordinates, camera settings, dimensions, date taken
- **Videos:** Duration, resolution, codec, bitrate, FPS
- **Audio:** Duration, bitrate, sample rate, artist, album

**User Flow:**
1. Upload media files (drag & drop)
2. Auto-extract metadata
3. Create memory nodes (events, people, timelines)
4. Link media to nodes with relationship types
5. View gallery with filters
6. Search by date, location, device, tags
7. Manage links (view, edit, delete)
8. View analytics dashboard
9. Bulk operations on multiple files

**Tab Organization:**
- **Dashboard:** Overview stats and quick actions
- **Upload:** File upload with validation
- **Gallery:** Media grid with filters
- **Nodes:** Memory node management
- **Linking:** Connect media to nodes
- **Links:** Manage existing connections
- **Insights:** Analytics and trends

---

## 🔌 API Endpoints Reference

### AI Interview API

**Base:** `/api/ai-interview`

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/start` | Start new interview session | ✅ |
| POST | `/qa` | Add Q&A pair to session | ✅ |
| POST | `/end` | End interview with title | ✅ |
| GET | `/interview/:sessionId` | Get full interview details | ✅ |
| GET | `/user/:userId/interviews` | Get user's interviews | ✅ |
| GET | `/search/similar` | Search similar Q&A pairs | ✅ |
| DELETE | `/interview/:sessionId` | Delete interview | ✅ |

**WebSocket:** `ws://backend/ai-interview` (real-time transcription)

---

### Memory Graph API

**Base:** `/api/memory-graph`

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/memories` | Create memory with embeddings | ✅ |
| POST | `/memories/:id/tags` | Add tags to memory | ✅ |
| PUT | `/memories/:id` | Update memory | ✅ |
| DELETE | `/memories/:id` | Delete memory | ✅ |
| POST | `/memories/bulk-delete` | Delete multiple memories | ✅ |
| GET | `/search` | Semantic search memories | ✅ |
| GET | `/graph` | Get full graph data | ✅ |
| POST | `/upload-media` | Upload media for memory | ✅ |

**Storage:** PostgreSQL (structured) + ChromaDB (embeddings)

---

### Voice Cloning API

**Base:** `/api/voice-cloning`

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/health` | Check ElevenLabs connection | ❌ |
| POST | `/clone` | Clone voice from sample | ✅ |
| POST | `/generate-speech` | Generate speech from text | ✅ |
| GET | `/voices` | Get all voices (default + custom) | ✅ |
| GET | `/voices/:voiceId` | Get voice details | ✅ |
| DELETE | `/voices/:voiceId` | Delete custom voice | ✅ |
| GET | `/user/audio-history` | Get user's audio history | ✅ |
| GET | `/user/custom-voices` | Get user's custom voices | ✅ |

**Storage:** PostgreSQL (user voices, history) + ElevenLabs (voice models)

---

### Avatar Service API

**Base:** `/api/avatar`

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/model` | Upload 3D model | ✅ |
| GET | `/` | List user's avatars | ✅ |
| GET | `/:id` | Get avatar details | ✅ |
| POST | `/:id/metadata` | Update name/description | ✅ |
| POST | `/:id/lipsync` | Add lipsync (JSON) | ✅ |
| POST | `/:id/lipsync/upload` | Upload lipsync file | ✅ |
| DELETE | `/:id` | Delete avatar | ✅ |
| GET | `/user/:userId/history` | Get animation history | ✅ |
| DELETE | `/animation/:id` | Delete animation | ✅ |
| POST | `/:id/prepare-playback` | Prepare for playback | ✅ |
| POST | `/pipeline/image-to-model` | Photo → 3D pipeline | ✅ |
| POST | `/pipeline/:id/audio-to-lipsync` | Audio → Lipsync pipeline | ✅ |
| GET | `/pipeline/job/:jobId` | Check pipeline status | ✅ |

**Storage:** PostgreSQL (metadata) + File System (models, audio, lipsync)

---

### Multimedia API

**Base:** `/api/multimedia`

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/upload/single` | Upload single file | ✅ |
| POST | `/upload/multiple` | Upload multiple files | ✅ |
| GET | `/media` | Get all user's media | ✅ |
| GET | `/media/:id` | Get media details | ✅ |
| GET | `/media/:id/download` | Download media file | ✅ |
| PUT | `/media/:id` | Update media metadata | ✅ |
| DELETE | `/media/:id` | Delete media | ✅ |
| POST | `/nodes` | Create memory node | ✅ |
| GET | `/nodes` | Get all nodes | ✅ |
| GET | `/nodes/:id` | Get node details | ✅ |
| PUT | `/nodes/:id` | Update node | ✅ |
| DELETE | `/nodes/:id` | Delete node | ✅ |
| POST | `/link/:mediaId/to/:nodeId` | Link media to node | ✅ |
| DELETE | `/link/:mediaId/from/:nodeId` | Unlink media from node | ✅ |
| POST | `/link/bulk/to/:nodeId` | Bulk link media | ✅ |
| POST | `/unlink/bulk/from/:nodeId` | Bulk unlink media | ✅ |
| GET | `/nodes/:nodeId/media` | Get node's media | ✅ |
| GET | `/media/:mediaId/nodes` | Get media's nodes | ✅ |
| GET | `/search/media` | Search media files | ✅ |
| GET | `/search/nodes` | Search memory nodes | ✅ |
| GET | `/analytics/dashboard` | Get analytics data | ✅ |
| GET | `/management/media` | Media management view | ✅ |
| GET | `/management/links` | Links management view | ✅ |
| GET | `/connection-status/:mediaId/:nodeId` | Check link status | ✅ |

**Storage:** PostgreSQL (metadata, relationships) + File System (files)

---

## 🗄️ Database Schema

### PostgreSQL Tables

#### Interview System
- **`interviews`** - Interview sessions with metadata
- **`qa_pairs`** - Question-answer pairs for each session

#### Memory Graph System
- **`memories`** - Memory content with ChromaDB embeddings
- **`memory_tags`** - Tags for memories
- **`memory_media`** - Media attachments for memories
- **`memory_people`** - People linked to memories
- **`memory_events`** - Events linked to memories

#### Voice Cloning System
- **`user_voices`** - Custom voice clones per user
- **`generated_audio`** - Audio generation history

#### Avatar Service
- **`user_avatars`** - 3D avatar models per user
- **`avatar_animations`** - Lipsync animations with status tracking

#### Multimedia System
- **`multimedia_files`** - All uploaded media with metadata
- **`multimedia_memory_nodes`** - Memory nodes (events, people, timelines)
- **`multimedia_links`** - Relationships between media and nodes

#### User Management
- **`users`** - User accounts with authentication

### ChromaDB Collections
- **`memories_collection`** - Vector embeddings for semantic search

---

## 🏗️ Frontend Architecture

### Page Structure

**Public Pages:**
- `/` - HomePage (features overview)
- `/login` - Login page
- `/register` - Registration page

**Protected Pages (require login):**
- `/interview` - AI Interview feature
- `/memory-graph` - Memory Graph visualization
- `/voice-cloning` - Voice cloning & playback
- `/avatar-service` - 3D avatar management
- `/multimedia` - Multimedia management

### Component Organization

**Layout Components:**
- `Header` - Navigation and user menu
- `PageContainer` - Consistent page wrapper
- `ProtectedRoute` - Auth guard wrapper

**Shared UI Components:**
- `Button` - Reusable button component
- `Card` - Card container with variants
- `FileUpload` - Drag-and-drop file uploader
- `ThemeToggle` - Dark/light mode switcher
- `AvatarViewer` - 3D model viewer (Three.js)
- `LipSyncModal` - Lipsync playback modal

### Context Providers

**AuthContext:**
- Manages user authentication state
- Stores JWT token in localStorage
- Provides login/logout/register functions
- Exposes current user data

**ToastProvider:**
- Wraps react-toastify
- Provides consistent toast notifications

---

## 📁 File Structure

### Frontend Structure

```
frontend/
├── src/
│   ├── App.tsx                          # Main app with routing
│   ├── main.tsx                         # App entry point
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx       # Route protection wrapper
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx               # Top navigation bar
│   │   │   └── PageContainer.tsx        # Page wrapper
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.tsx               # Reusable button
│   │   │   ├── Card.tsx                 # Card component
│   │   │   ├── FileUpload.tsx           # File uploader
│   │   │   ├── Toast.tsx                # Toast provider
│   │   │   ├── ThemeToggle.tsx          # Dark mode toggle
│   │   │   ├── AvatarViewer.tsx         # 3D model viewer
│   │   │   └── LipSyncModal.tsx         # Lipsync playback
│   │   │
│   │   ├── interview/
│   │   │   ├── LiveTranscription.tsx    # Real-time transcription
│   │   │   ├── InterviewHistory.tsx     # Past interviews list
│   │   │   ├── InterviewDetail.tsx      # Full interview view
│   │   │   ├── EndInterviewModal.tsx    # Save interview modal
│   │   │   └── DeleteInterviewModal.tsx # Delete confirmation
│   │   │
│   │   ├── voice-cloning/
│   │   │   ├── VoiceRecorder.tsx        # Audio recording
│   │   │   ├── VoiceCloner.tsx          # Voice cloning UI
│   │   │   ├── VoiceList.tsx            # Voice selection
│   │   │   ├── TextToSpeech.tsx         # Speech generation
│   │   │   ├── AudioHistory.tsx         # Generated audio list
│   │   │   └── CustomVoiceManager.tsx   # Manage custom voices
│   │   │
│   │   ├── avatar/
│   │   │   └── AvatarViewModal.tsx      # Avatar viewer & editor
│   │   │
│   │   └── multimedia/
│   │       ├── MediaUploader.tsx        # File upload component
│   │       ├── MediaGallery.tsx         # Media grid view
│   │       ├── MemoryNodeManager.tsx    # Node CRUD operations
│   │       ├── MemoryNodeDetail.tsx     # Node details view
│   │       ├── LinkingView.tsx          # Media-node linking
│   │       ├── LinksOverview.tsx        # Links management
│   │       ├── AnalyticsInsights.tsx    # Dashboard analytics
│   │       ├── ConnectionStatus.tsx     # Link status checker
│   │       ├── ProfessionalMemoryGraph.tsx  # React Flow graph
│   │       └── MemoryGraph.css          # Graph custom styles
│   │
│   ├── features/
│   │   ├── ai-interview/
│   │   │   └── index.tsx                # Interview main page (tabs)
│   │   │
│   │   ├── memory-graph/
│   │   │   └── index.tsx                # Memory Graph main page
│   │   │
│   │   ├── voice-cloning/
│   │   │   └── index.tsx                # Voice Cloning main page (tabs)
│   │   │
│   │   ├── avatar-service/
│   │   │   └── index.tsx                # Avatar Service main page (tabs)
│   │   │
│   │   └── multimedia/
│   │       └── index.tsx                # Multimedia main page (tabs)
│   │
│   ├── services/
│   │   ├── authService.ts               # Auth API (login, register, token)
│   │   ├── interviewApi.ts              # Interview API calls
│   │   ├── memoryGraphApi.ts            # Memory Graph API calls
│   │   ├── voiceCloningApi.ts           # Voice Cloning API calls
│   │   ├── avatarApi.ts                 # Avatar Service API calls
│   │   └── multimediaApi.ts             # Multimedia API calls
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx              # Authentication context
│   │
│   ├── pages/
│   │   ├── HomePage.tsx                 # Landing page
│   │   ├── LoginPage.tsx                # Login form
│   │   ├── RegisterPage.tsx             # Registration form
│   │   └── NotFoundPage.tsx             # 404 page
│   │
│   ├── types/
│   │   └── index.ts                     # TypeScript interfaces
│   │
│   └── index.css                        # Global styles (Tailwind)
│
├── public/                               # Static assets
├── package.json                          # Dependencies
├── vite.config.ts                        # Vite configuration
├── tailwind.config.js                    # Tailwind configuration
└── tsconfig.json                         # TypeScript configuration
```

---

## 🔐 Authentication & Security

### Authentication Flow

**Registration:**
1. User fills registration form
2. Frontend sends POST to `/api/auth/register`
3. Backend creates user in PostgreSQL
4. Returns JWT token
5. Frontend stores token in localStorage
6. User redirected to dashboard

**Login:**
1. User enters credentials
2. Frontend sends POST to `/api/auth/login`
3. Backend verifies credentials
4. Returns JWT token
5. Frontend stores token
6. User redirected to dashboard

**Protected Routes:**
1. User navigates to protected page
2. ProtectedRoute checks for token
3. If no token → Redirect to login
4. If token exists → Render page
5. All API calls include token in Authorization header

### JWT Token Structure

**Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Payload:**
- User ID
- Username
- Email
- Expiration time

**Token Storage:**
- Stored in browser localStorage
- Automatically included in all API requests
- Retrieved via `authService.getToken()`

### Security Features

- **User Isolation:** All data filtered by user_id
- **Ownership Verification:** Backend checks user owns resource before modifications
- **Password Hashing:** Bcrypt for secure password storage
- **Token Expiration:** JWTs expire after set time period
- **CORS Protection:** Proper CORS headers configured
- **File Validation:** File types and sizes validated
- **SQL Injection Prevention:** Sequelize ORM parameterized queries
- **XSS Protection:** React auto-escapes content

---

## 🎨 Frontend Features Detail

### AI Interview Page

**File:** `src/features/ai-interview/index.tsx`

**View Modes:**
- **Start View:** Button to begin interview
- **Active View:** Live transcription with Q&A display
- **History View:** List of past interviews
- **Detail View:** Full interview transcript

**Components Used:**
- LiveTranscription - Real-time audio capture
- InterviewHistory - Past sessions list
- InterviewDetail - Full transcript viewer
- EndInterviewModal - Save with title
- DeleteInterviewModal - Confirmation dialog

**State Management:**
- viewMode: Controls which view is shown
- isStreaming: Audio streaming status
- sessionId: Current interview session
- selectedInterview: Interview being viewed

---

### Memory Graph Page

**File:** `src/features/memory-graph/index.tsx`

**Features:**
- Create/edit/delete memories
- Add tags (aggregated in single node)
- Semantic search with ChromaDB
- Graph visualization with React Flow
- Media upload and attachment
- Bulk delete operations

**Graph Visualization:**
- Library: React Flow (@xyflow/react)
- Layout: Force-directed auto-layout
- Nodes: Memory, Person, Event, Media, Combined Tags
- Edges: Labeled connections with backgrounds
- Controls: Zoom, pan, fit view
- Styling: Professional gradients, no borders

**Components:**
- ProfessionalMemoryGraph - React Flow wrapper
- Memory form - Create/edit modal
- Search bar - Semantic search
- Tag input - Tag management
- Media upload - File attachment

---

### Voice Cloning Page

**File:** `src/features/voice-cloning/index.tsx`

**Tabs:**
1. **Record:** Audio recording interface
2. **Clone:** Voice cloning from sample
3. **Speak:** Text-to-speech generation
4. **Manage:** Browse default voices
5. **My Voices:** Custom voice management
6. **History:** Audio generation history

**Components:**
- VoiceRecorder - Microphone recording
- VoiceCloner - Upload sample & clone
- TextToSpeech - Generate speech UI
- VoiceList - Voice selection grid
- CustomVoiceManager - User voices with delete
- AudioHistory - Generated audio timeline

---

### Avatar Service Page

**File:** `src/features/avatar-service/index.tsx`

**Tabs:**
1. **Create:** Photo → 3D model pipeline
2. **My Avatars:** Grid view of all avatars
3. **History:** Animation timeline

**Modal:** AvatarViewModal (opens when viewing avatar)
- 3D model viewer (Three.js)
- Audio recording
- Audio file upload
- Lipsync generation with status tracking
- Metadata editing
- Animation list
- View lipsync playback
- Delete avatar

**Pipeline:**
- Photo upload → Ready Player Me → 3D model
- Audio upload → Rhubarb → Lipsync JSON
- Real-time job status polling

---

### Multimedia Page

**File:** `src/features/multimedia/index.tsx`

**Tabs:**
1. **Dashboard:** Stats overview & quick actions
2. **Upload:** File upload with drag & drop
3. **Gallery:** Media grid with search/filters
4. **Nodes:** Memory node management
5. **Linking:** Connect media to nodes
6. **Links:** Manage connections
7. **Insights:** Analytics dashboard

**Features:**
- Multi-file upload with progress
- Auto metadata extraction
- Advanced filtering (date, type, location, device)
- Relationship types (primary, associated, reference)
- Bulk operations
- Connection status tracking
- Analytics visualization

**Components:**
- MediaUploader - File upload
- MediaGallery - Grid view with filters
- MemoryNodeManager - Node CRUD with create modal
- LinkingView - Drag & drop linking
- LinksOverview - Manage connections
- AnalyticsInsights - Dashboard stats

---

## 🔄 Key User Workflows

### Complete Memory Creation Workflow

1. **Go to Memory Graph page**
2. **Click "Create Memory"**
3. **Fill form:**
   - Document text
   - Tags (comma-separated)
   - Select person (optional)
   - Select event (optional)
4. **Upload media** (optional)
5. **Click Save**
6. **Memory created with:**
   - Text stored in PostgreSQL
   - Embeddings generated in ChromaDB
   - Graph updated with new node
   - Tags aggregated in combined tags node
7. **View in graph:**
   - Purple memory node appears
   - Connected to person, event, media, tags
8. **Search semantically:**
   - Enter natural language query
   - ChromaDB finds similar memories
   - Results sorted by relevance

### Complete Voice Cloning Workflow

1. **Go to Voice Cloning page**
2. **Record Tab:**
   - Click "Start Recording"
   - Speak for 30+ seconds
   - Click "Stop Recording"
   - Preview audio
3. **Clone Tab:**
   - Upload recorded audio
   - Enter voice name
   - Click "Clone Voice"
   - Wait for processing (1-2 minutes)
4. **Voice saved to:**
   - PostgreSQL (user_voices table)
   - ElevenLabs (voice model)
5. **My Voices Tab:**
   - See all custom voices
   - Delete unwanted voices
6. **Speak Tab:**
   - Select voice (custom or default)
   - Enter text
   - Generate speech
7. **History Tab:**
   - View all generated audio
   - Download files
   - See metadata (duration, file size)

### Complete Avatar Workflow

1. **Create Tab:**
   - Upload photo OR 3D model
   - Wait for processing
2. **My Avatars Tab:**
   - See all avatars in grid
   - Click "View" on avatar
3. **Modal Opens:**
   - View 3D model
   - Edit name/description
   - Record audio OR upload file
   - Click "Generate Lipsync"
   - Wait for processing
4. **Animation Complete:**
   - Click "View Lipsync"
   - Watch animated 3D avatar
5. **History Tab:**
   - See all animations
   - Click "Play" to watch
   - Delete old animations

### Complete Multimedia Workflow

1. **Dashboard:**
   - View stats (total media, nodes, links)
   - Quick action buttons
2. **Upload Tab:**
   - Drag & drop files
   - Multi-select upload
   - Auto metadata extraction
   - View extracted EXIF, GPS, camera data
3. **Gallery Tab:**
   - Browse all media
   - Filter by type, date, location
   - Search by keywords
   - View media details
   - Delete media
4. **Nodes Tab:**
   - Click "Create Node"
   - Fill form (title, type, description, location, date)
   - Create Event, Person, or Timeline
5. **Linking Tab:**
   - Select media files
   - Select memory nodes
   - Choose relationship type
   - Bulk link operation
6. **Links Tab:**
   - View all connections
   - Filter by relationship
   - Unlink items
   - View connection status
7. **Insights Tab:**
   - View analytics
   - See trends
   - Storage usage

---

## 🔧 Service Layer Architecture

### API Service Files

Each feature has a dedicated service file that:
- Handles all API calls for that feature
- Manages authentication headers
- Provides TypeScript interfaces
- Handles error responses
- Formats request/response data

**Service Files:**

**authService.ts:**
- Login, register, logout
- Token storage and retrieval
- User data management
- Token validation

**interviewApi.ts:**
- Start/end interview sessions
- Add Q&A pairs
- Retrieve interview history
- Search similar questions
- Delete interviews

**memoryGraphApi.ts:**
- CRUD operations for memories
- Tag management
- Media upload
- Semantic search
- Graph data retrieval
- Bulk operations

**voiceCloningApi.ts:**
- Voice cloning from samples
- Speech generation
- Voice library management
- Custom voice CRUD
- Audio history retrieval

**avatarApi.ts:**
- Avatar creation (upload/pipeline)
- Lipsync generation
- Metadata management
- Animation history
- Playback preparation
- Pipeline job status

**multimediaApi.ts:**
- File upload (single/multiple)
- Media management
- Node CRUD operations
- Linking operations
- Search functionality
- Analytics data
- Connection status

---

## 🎨 UI/UX Features

### Consistent Design System

**Colors:**
- **Primary:** Blue (#3B82F6) - Actions, links
- **Secondary:** Purple (#8B5CF6) - Memory, special features
- **Success:** Green (#10B981) - Success states
- **Error:** Red (#EF4444) - Errors, delete actions
- **Warning:** Amber (#F59E0B) - Tags, warnings
- **Accent:** Pink (#EC4899) - Media, highlights

**Typography:**
- **Headings:** Inter font, bold weights
- **Body:** Inter font, regular weight
- **Code:** Monospace for IDs, technical data

**Spacing:**
- Consistent padding: 4px, 8px, 12px, 16px, 24px
- Card spacing: 24px gaps
- Section spacing: 32px-48px

### Component Patterns

**Cards:**
- Gradient headers for section headers
- Icon + title pattern
- Consistent padding and borders
- Hover effects on interactive cards

**Modals:**
- Dark backdrop with blur
- Centered, max-width containers
- Gradient headers
- Sticky footers for actions
- Close on backdrop click
- ESC key support

**Buttons:**
- Primary: Gradient background
- Outline: Border with hover fill
- Ghost: Transparent with hover background
- Loading states with spinners
- Disabled states

**Forms:**
- Labeled inputs
- Validation feedback
- Focus rings
- Consistent sizing
- Disabled during submission

**Lists & Grids:**
- Responsive layouts (1/2/3 columns)
- Hover effects
- Status badges
- Action buttons
- Empty states with helpful messages

**Toasts:**
- Position: top-right
- Auto-close: 3 seconds
- Icons for success/error/info
- Consistent messaging

---

## 🌐 Third-Party Integrations

### OpenAI (GPT-4)
- **Purpose:** AI Interview answer generation
- **Usage:** Q&A suggestions during interviews
- **API Key:** Required in backend env
- **Cost:** Pay per token

### ElevenLabs
- **Purpose:** Voice cloning and speech synthesis
- **Usage:** Clone user voices, generate speech
- **API Key:** Required in backend env
- **Features Used:**
  - Voice cloning from samples
  - Text-to-speech generation
  - Voice management
  - Custom voice deletion

### Ready Player Me
- **Purpose:** Photo to 3D avatar generation
- **Usage:** Avatar pipeline (photo → rigged model)
- **Integration:** API-based
- **Output:** GLB/GLTF 3D models

### Rhubarb Lip Sync
- **Purpose:** Audio to lipsync generation
- **Usage:** Generate mouth movements from audio
- **Integration:** Command-line tool
- **Output:** JSON with mouth cue timings

### ChromaDB
- **Purpose:** Vector database for semantic search
- **Usage:** Store memory embeddings
- **Features:**
  - Semantic similarity search
  - Natural language queries
  - Vector embeddings
- **Storage:** Local or cloud deployment

### Three.js
- **Purpose:** 3D model rendering
- **Usage:** Avatar viewer component
- **Features:**
  - GLB/GLTF loading
  - Camera controls
  - Lighting
  - Animations

### React Flow
- **Purpose:** Graph visualization
- **Usage:** Memory Graph display
- **Features:**
  - Node positioning
  - Edge rendering
  - Zoom controls
  - Auto-layout
  - Interactions

---

## 📊 Data Flow Examples

### AI Interview Data Flow

```
User speaks → Browser captures audio
    ↓
WebSocket sends audio to backend
    ↓
Backend transcribes (Whisper/STT)
    ↓
Transcript sent back via WebSocket
    ↓
Frontend displays in real-time
    ↓
User submits → GPT-4 generates answer
    ↓
Q&A pair saved to PostgreSQL
    ↓
WebSocket sends answer to frontend
    ↓
Answer displayed below question
    ↓
End interview → Save with title
    ↓
Session marked complete in database
```

### Memory Graph Data Flow

```
User creates memory
    ↓
Text + metadata sent to backend
    ↓
Backend generates embeddings (OpenAI)
    ↓
Stored in PostgreSQL + ChromaDB
    ↓
Tags aggregated
    ↓
Graph data returned to frontend
    ↓
React Flow renders graph
    ↓
User clicks node → Detail modal
    ↓
Edit → Update PostgreSQL + ChromaDB
    ↓
Graph refreshes with new data
```

### Voice Cloning Data Flow

```
User records voice sample
    ↓
Audio blob created in browser
    ↓
FormData sent to backend
    ↓
Backend sends to ElevenLabs
    ↓
ElevenLabs clones voice
    ↓
Voice ID + metadata saved to PostgreSQL
    ↓
User generates speech
    ↓
Text + voice ID sent to backend
    ↓
Backend calls ElevenLabs TTS
    ↓
Audio file saved to file system
    ↓
Audio history saved to PostgreSQL
    ↓
Audio URL returned to frontend
    ↓
User plays/downloads audio
```

### Avatar Animation Data Flow

```
User uploads photo
    ↓
Backend sends to Ready Player Me
    ↓
3D model generated
    ↓
Model saved to file system
    ↓
Metadata saved to PostgreSQL
    ↓
User records audio
    ↓
Audio sent to backend
    ↓
Rhubarb generates lipsync
    ↓
Lipsync JSON saved
    ↓
Animation record created in PostgreSQL
    ↓
User clicks "View Lipsync"
    ↓
Three.js loads model
    ↓
Lipsync data applied
    ↓
Audio plays synchronized
    ↓
Avatar mouth moves with speech
```

### Multimedia Linking Data Flow

```
User uploads media
    ↓
File saved to file system
    ↓
Metadata extracted (EXIF, GPS, etc.)
    ↓
Saved to PostgreSQL with user_id
    ↓
User creates memory node
    ↓
Node saved to PostgreSQL
    ↓
User links media to node
    ↓
Link relationship saved (primary/associated/reference)
    ↓
Connection status updated
    ↓
Analytics recalculated
    ↓
Dashboard stats refreshed
```

---

## 🚀 Performance Optimizations

### Frontend
- **Code Splitting:** Route-based lazy loading
- **Memoization:** useMemo for expensive calculations
- **Debouncing:** Search inputs debounced
- **Lazy Loading:** Images loaded on demand
- **Caching:** Media URLs cached
- **Optimistic Updates:** UI updates before API response

### Backend
- **Connection Pooling:** PostgreSQL connection pool
- **Caching:** Frequently accessed data cached
- **Pagination:** Large datasets paginated
- **Batch Operations:** Bulk inserts/updates
- **File Streaming:** Large files streamed
- **Index Optimization:** Database indexes on common queries

### Database
- **Indexes:** On user_id, created_at, type fields
- **Foreign Keys:** Proper relationships
- **Cascading Deletes:** Automatic cleanup
- **JSONB:** Efficient metadata storage
- **Vector Indexes:** ChromaDB optimized for similarity search

---

## 🐛 Common Issues & Solutions

### Issue: 401 Unauthorized
- **Cause:** Missing or expired JWT token
- **Solution:** Check token in localStorage, re-login if expired

### Issue: Upload fails
- **Cause:** File too large or wrong type
- **Solution:** Check file size limits and accepted types

### Issue: Graph not rendering
- **Cause:** Missing React Flow import or CSS
- **Solution:** Verify @xyflow/react installed and MemoryGraph.css imported

### Issue: WebSocket connection fails
- **Cause:** Backend not running or wrong URL
- **Solution:** Check backend is running and VITE_BACKEND_URL is correct

### Issue: Voice cloning fails
- **Cause:** ElevenLabs API key missing or invalid
- **Solution:** Check backend has valid ELEVENLABS_API_KEY

### Issue: Duplicate toasts
- **Cause:** Multiple toast calls for same action
- **Solution:** Remove toasts from child components, keep in parent

---

## 📈 Future Enhancements

### Planned Features
- Real-time collaboration on memory graphs
- Advanced analytics with charts
- Export memories to PDF/markdown
- Social sharing of memories
- Mobile app (React Native)
- Voice conversation mode
- AI-generated memory suggestions
- Timeline view for memories
- Map view for location-based memories
- OCR for text extraction from images

### Technical Improvements
- GraphQL API option
- Redis caching layer
- Elasticsearch for advanced search
- S3/cloud storage for files
- CDN for media delivery
- Real-time notifications
- Background job processing
- Automated backups
- Rate limiting
- API versioning

---

## 🎓 For Developers

### Getting Started
1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Start backend: `npm run dev`
5. Start frontend: `npm run dev`
6. Visit `http://localhost:5173`

### Environment Variables Required

**Frontend (.env):**
- `VITE_BACKEND_URL` - Backend API URL

**Backend (.env):**
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key
- `ELEVENLABS_API_KEY` - ElevenLabs API key
- `CHROMADB_HOST` - ChromaDB server URL
- `PORT` - Backend server port

### Development Commands

**Frontend:**
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build

**Backend:**
- `npm run dev` - Start with nodemon
- `npm start` - Production start
- `npm run migrate` - Run migrations

---

## 📞 Support & Resources

### Documentation
- API endpoints documented per feature
- TypeScript interfaces for all data structures
- Inline code comments
- README files per feature

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for formatting
- Consistent naming conventions
- Component composition patterns

---

## 🎉 Summary

**Legacy AI Prototype** is a production-ready, full-stack AI platform with:

- ✅ **5 Major Features:** Interviews, Memory Graph, Voice Cloning, Avatars, Multimedia
- ✅ **50+ API Endpoints:** All authenticated with JWT
- ✅ **10+ Database Tables:** PostgreSQL + ChromaDB hybrid
- ✅ **40+ React Components:** Modular and reusable
- ✅ **Professional UI:** Consistent design system
- ✅ **Real-time Features:** WebSocket for live updates
- ✅ **AI Integration:** GPT-4, ElevenLabs, Ready Player Me
- ✅ **Security:** JWT auth, user isolation, validation
- ✅ **Performance:** Optimized queries, caching, lazy loading

**Built with modern best practices for scalability and maintainability.** 🚀

