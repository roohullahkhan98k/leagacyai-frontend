# 🧪 Frontend Test Suite - Quick Start Guide

## 📋 Overview

Complete test suite for the AI Prototype Frontend with **68 automated tests** covering:
- ✅ All 5 features (Interview, Memory Graph, Voice, Avatar, Multimedia)
- ✅ Service layer (6 API services)
- ✅ Authentication flow
- ✅ Component structure (19 components)
- ✅ UI/UX features (10 tests)
- ✅ Data flow & state management (8 tests)

**Generates Excel report with detailed results!**

---

## 🚀 Running Tests

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- `axios` - For API calls
- `exceljs` - For Excel report generation

### Step 2: Start Backend

**⚠️ IMPORTANT: Backend must be running before tests!**

```bash
# In your backend directory
cd ../backend
npm start

# Wait for: "Server running on port 3000"
```

### Step 3: Run Frontend Tests

```bash
# In frontend directory
npm run test:frontend
```

**OR run directly:**

```bash
node tests/run-tests.js
```

---

## 📊 What Happens During Tests

1. **Creates test user** - `testuser_fe_[timestamp]`
2. **Runs 68 tests** across 9 categories
3. **Color-coded output** in console (green=pass, red=fail, yellow=skip)
4. **Generates Excel report** - `frontend-test-results-[timestamp].xlsx`
5. **Prints summary** - Total, passed, failed, skipped, pass rate

---

## 📁 Test Report

After running, you'll find:

### `frontend-test-results-[timestamp].xlsx`

**Sheet 1: Frontend Test Results**
| Feature | Test Name | Status | Message | Response Time | Status Code | Timestamp |
|---------|-----------|--------|---------|---------------|-------------|-----------|
| Auth Service | authService.register() | PASS | User registered | 125ms | 201 | 2025-10-12... |
| ... | ... | ... | ... | ... | ... | ... |

**Sheet 2: Summary**
- Total Tests: 68
- Passed: 65 ✅
- Failed: 0 ❌
- Skipped: 3 ⏭️
- Pass Rate: 95.59%
- Test Date
- Backend URL
- Frontend URL

---

## 🧩 What's Tested

### 1. Auth Service (4 tests)
```
✅ authService.register() - Create user
✅ authService.login() - Authenticate
✅ authService.getToken() - Token format
✅ ProtectedRoute - Access with token
```

### 2. Interview API (7 tests)
```
✅ interviewApi.startInterview() - Start session
✅ interviewApi.addQAPair() - Add Q&A
✅ interviewApi.getInterview() - Retrieve data
✅ interviewApi.getUserInterviews() - Get history
✅ interviewApi.endInterview() - End with title
✅ interviewApi.searchSimilarQA() - Semantic search
✅ interviewApi.deleteInterview() - Delete session
```

### 3. Memory Graph API (5 tests)
```
✅ memoryGraphApi.createMemory() - Create with embeddings
✅ memoryGraphApi.searchMemories() - Semantic search
✅ memoryGraphApi.getGraph() - Get graph data
✅ memoryGraphApi.addTags() - Update tags
✅ memoryGraphApi.deleteMemory() - Delete memory
```

### 4. Voice Cloning API (4 tests)
```
✅ voiceCloningApi.getVoices() - Get voice library
✅ voiceCloningApi.getAudioHistory() - Get history
✅ voiceCloningApi.getCustomVoices() - Get custom voices
✅ Authentication headers included
```

### 5. Avatar API (4 tests)
```
✅ avatarApi.getUserAvatars() - Get avatars
✅ avatarApi.getAnimationHistory() - Get animations
✅ Authentication headers included
✅ Pipeline URL structure
```

### 6. Multimedia API (7 tests)
```
✅ multimediaApi.getAllMedia() - Get all media
✅ multimediaApi.createNode() - Create memory node
✅ multimediaApi.getAllNodes() - Get all nodes
✅ multimediaApi.getDashboardAnalytics() - Get stats
✅ multimediaApi.searchMedia() - Search files
✅ multimediaApi.deleteNode() - Delete node
✅ All 29 API calls include JWT auth
```

### 7. Component Structure (19 tests)
```
✅ LiveTranscription component exists
✅ InterviewHistory component exists
✅ InterviewDetail component exists
✅ EndInterviewModal component exists
✅ DeleteInterviewModal component exists
✅ ProfessionalMemoryGraph component exists
✅ VoiceRecorder component exists
✅ VoiceCloner component exists
✅ VoiceList component exists
✅ TextToSpeech component exists
✅ AudioHistory component exists
✅ CustomVoiceManager component exists
✅ AvatarViewModal component exists
✅ MediaUploader component exists
✅ MediaGallery component exists
✅ MemoryNodeManager component exists
✅ LinkingView component exists
✅ LinksOverview component exists
✅ AnalyticsInsights component exists
```

### 8. UI/UX Features (10 tests)
```
✅ Toast notifications (react-toastify)
✅ Modal system (custom + reusable)
✅ Delete confirmations (custom modals)
✅ Loading states with spinners
✅ Dark mode support (Tailwind)
✅ Responsive layout
✅ Tab navigation
✅ React Flow graph visualization
✅ File upload (drag & drop)
✅ Protected route wrapper
```

### 9. Data Flow (8 tests)
```
✅ AuthContext - User state management
✅ React hooks (useState, useEffect, useCallback)
✅ useCallback for memoized functions
✅ Modal state management
✅ API error handling
✅ Optimistic UI updates
✅ WebSocket (AI Interview real-time)
✅ Session ID tracking
```

---

## 📈 Example Console Output

```
============================================================
🧪 AI Prototype Frontend - Comprehensive Test Suite
============================================================
📡 Backend URL: http://localhost:3000
🌐 Frontend URL: http://localhost:5173
⏰ Start Time: 10/12/2025, 2:30:45 PM
============================================================

============================================================
🔐 Testing: Auth Service (Frontend)
============================================================

[PASS] Auth Service - authService.register() - Create user (125ms)
  → User registered successfully
[PASS] Auth Service - authService.login() - Authenticate (98ms)
  → Token received and stored
[PASS] Auth Service - authService.getToken() - Token format
  → JWT token format valid
[PASS] Auth Service - ProtectedRoute - Access with token (87ms)
  → Protected route accessible

============================================================
🎙️ Testing: Interview API Service (Frontend)
============================================================

[PASS] Interview API - interviewApi.startInterview() (156ms)
  → Session started: test-fe-1697123845678
[PASS] Interview API - interviewApi.addQAPair() (92ms)
  → Q&A pair added successfully
...

============================================================
📊 Generating Excel Report...
============================================================
✅ Excel report generated: frontend-test-results-1697123845678.xlsx
📁 Location: C:\Users\...\frontend\frontend-test-results-1697123845678.xlsx

============================================================
📊 FRONTEND TEST SUMMARY
============================================================
✅ Passed: 65
❌ Failed: 0
⏭️  Skipped: 3
📈 Total: 68
📊 Pass Rate: 95.59%
============================================================
✅ Report saved: frontend-test-results-1697123845678.xlsx
============================================================
```

---

## 🔧 Environment Configuration

Tests read from environment variables:

```bash
# Default values
VITE_BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

To change:

```bash
# Windows
set VITE_BACKEND_URL=http://your-backend-url:3000
npm run test:frontend

# Linux/Mac
export VITE_BACKEND_URL=http://your-backend-url:3000
npm run test:frontend
```

---

## 🚨 Troubleshooting

### ❌ Error: "Connection refused"

**Problem:** Backend is not running

**Solution:**
```bash
cd ../backend
npm start
# Wait for "Server running on port 3000"
```

---

### ❌ Error: "Cannot find module 'axios'"

**Problem:** Dependencies not installed

**Solution:**
```bash
npm install
```

---

### ❌ Error: "Authentication failed"

**Problem:** Backend auth endpoints not working

**Solution:** Test backend manually:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Test123"}'
```

---

### ⚠️ Many tests skipped

**Problem:** Authentication failed, so dependent tests are skipped

**Solution:** 
1. Check backend is running
2. Check backend logs for errors
3. Verify auth endpoints are working

---

### ❌ Error: "Excel file not created"

**Problem:** Missing exceljs dependency

**Solution:**
```bash
npm install exceljs
```

---

## 📊 Understanding Status Codes

### HTTP Status Codes in Report

- **200** - OK (success)
- **201** - Created (resource created)
- **400** - Bad Request (invalid data)
- **401** - Unauthorized (no/invalid token)
- **403** - Forbidden (not allowed)
- **404** - Not Found (resource doesn't exist)
- **500** - Internal Server Error (backend error)
- **N/A** - Not Applicable (no HTTP request made)

### Why Some Tests Show "N/A" Status Codes

**Tests with Status Codes (Real API Calls):**
- Make actual HTTP requests to your backend
- Get real status codes: 200, 201, 404, etc.
- Examples: `authService.register()`, `interviewApi.startInterview()`

**Tests with "N/A" Status Codes (Frontend Logic Tests):**
- Do NOT make HTTP requests
- Test frontend code logic, component existence, UI behavior
- Examples: `Component Structure`, `UI/UX Features`, `Data Flow`

**This is NORMAL and CORRECT!** "N/A" just means "this test doesn't make an HTTP request."

### Test Status

- **PASS** ✅ - Test completed successfully
- **FAIL** ❌ - Test failed (check message column)
- **SKIP** ⏭️ - Test skipped (missing dependencies)

---

## 🎯 Pass Rate Goals

| Category | Target | Critical? |
|----------|--------|-----------|
| Auth Service | 100% | ✅ Yes |
| Interview API | 95%+ | ✅ Yes |
| Memory Graph API | 95%+ | ✅ Yes |
| Voice Cloning API | 95%+ | ⚠️ Maybe |
| Avatar API | 95%+ | ⚠️ Maybe |
| Multimedia API | 95%+ | ✅ Yes |
| Components | 100% | ✅ Yes |
| UI/UX Features | 100% | ⚠️ Optional |
| Data Flow | 100% | ✅ Yes |

**Overall Target:** 98%+ pass rate

---

## 📦 File Structure

```
frontend/
├── tests/
│   ├── run-tests.js          # Main test runner
│   └── README.md             # Detailed test docs
├── package.json              # Updated with test script
├── FRONTEND_TEST_GUIDE.md    # This file (quick start)
└── frontend-test-results-*.xlsx  # Generated reports
```

---

## 🔄 CI/CD Integration

### Add to GitHub Actions

```yaml
name: Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install backend dependencies
        run: |
          cd backend
          npm install
      
      - name: Start backend
        run: |
          cd backend
          npm start &
          sleep 10
      
      - name: Install frontend dependencies
        run: npm install
      
      - name: Run frontend tests
        run: npm run test:frontend
      
      - name: Upload test results
        uses: actions/upload-artifact@v2
        with:
          name: frontend-test-results
          path: frontend-test-results-*.xlsx
```

---

## 📞 Need Help?

1. **Check the Excel report** - Most detailed info
2. **Review console output** - Error messages
3. **Check backend logs** - API errors
4. **Read tests/README.md** - Comprehensive docs
5. **Check SYSTEM_DOCUMENTATION.md** - Full system guide

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] Backend is running
- [ ] Run `npm run test:frontend`
- [ ] Pass rate is 95%+
- [ ] No critical tests failed
- [ ] Excel report reviewed
- [ ] All FAIL statuses investigated
- [ ] Skipped tests are acceptable

---

## 🎓 What's Next?

After tests pass:

1. **Review Excel report** - Check for patterns
2. **Fix any failures** - Address issues immediately
3. **Deploy with confidence** - All features validated
4. **Run tests regularly** - Catch regressions early
5. **Update tests** - When adding new features

---

## 🎉 Success Criteria

**✅ Tests are successful when:**

- Pass rate ≥ 98%
- All Auth Service tests pass (4/4)
- All Component Structure tests pass (19/19)
- All Data Flow tests pass (8/8)
- No more than 2 API tests fail
- UI/UX tests mostly pass (8/10+)

**🚀 If all tests pass → Production Ready!**

---

**📖 For detailed documentation, see `tests/README.md`**

**📊 For system architecture, see `SYSTEM_DOCUMENTATION.md`**

