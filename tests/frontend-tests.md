# 🧪 Frontend Test Suite

Comprehensive test suite for the AI Prototype Frontend application.

## 📋 Overview

This test suite validates:
- ✅ **Service Layer** - All API service functions
- ✅ **Authentication** - Login, register, token management
- ✅ **AI Interview** - Interview API integration
- ✅ **Memory Graph** - Memory CRUD and search
- ✅ **Voice Cloning** - Voice management and history
- ✅ **Avatar Service** - Avatar and animation APIs
- ✅ **Multimedia** - Media upload and node management
- ✅ **Components** - Component structure validation
- ✅ **UI/UX** - Modals, toasts, loading states
- ✅ **Data Flow** - State management and hooks

## 🚀 Quick Start

### Prerequisites

1. **Backend must be running:**
   ```bash
   # In backend directory
   npm start
   ```

2. **Install dependencies:**
   ```bash
   # In frontend directory
   npm install
   ```

### Run Tests

```bash
# Run all frontend tests
npm run test:frontend

# Or run directly
node tests/run-tests.js
```

## 📊 Test Results

After running tests, you'll get:

1. **Console Output** - Color-coded test results in terminal
2. **Excel Report** - Detailed report saved as `frontend-test-results-[timestamp].xlsx`

### Excel Report Contents

**Sheet 1: Frontend Test Results**
- Feature column
- Test Name column
- Status (PASS/FAIL/SKIP)
- Message
- Response Time
- Status Code
- Timestamp

**Sheet 2: Summary**
- Total Tests
- Passed count (green)
- Failed count (red)
- Skipped count (yellow)
- Pass Rate percentage
- Test Date
- Backend URL
- Frontend URL

## 🧩 Test Categories

### 1. Auth Service Tests (4 tests)
- ✅ `authService.register()` - User registration
- ✅ `authService.login()` - User authentication
- ✅ `authService.getToken()` - JWT token validation
- ✅ `ProtectedRoute` - Token-based route protection

### 2. Interview API Tests (7 tests)
- ✅ `interviewApi.startInterview()` - Start new session
- ✅ `interviewApi.addQAPair()` - Add Q&A to session
- ✅ `interviewApi.getInterview()` - Retrieve interview data
- ✅ `interviewApi.getUserInterviews()` - Get user's interviews
- ✅ `interviewApi.endInterview()` - End with title
- ✅ `interviewApi.searchSimilarQA()` - Semantic search
- ✅ `interviewApi.deleteInterview()` - Delete session

### 3. Memory Graph API Tests (5 tests)
- ✅ `memoryGraphApi.createMemory()` - Create memory with embeddings
- ✅ `memoryGraphApi.searchMemories()` - Semantic search
- ✅ `memoryGraphApi.getGraph()` - Get graph data
- ✅ `memoryGraphApi.addTags()` - Update memory tags
- ✅ `memoryGraphApi.deleteMemory()` - Delete memory

### 4. Voice Cloning API Tests (4 tests)
- ✅ `voiceCloningApi.getVoices()` - Get voice library
- ✅ `voiceCloningApi.getAudioHistory()` - Get audio history
- ✅ `voiceCloningApi.getCustomVoices()` - Get custom voices
- ✅ Authentication headers validation

### 5. Avatar API Tests (4 tests)
- ✅ `avatarApi.getUserAvatars()` - Get user's avatars
- ✅ `avatarApi.getAnimationHistory()` - Get animations
- ✅ Authentication headers validation
- ✅ Pipeline URL structure validation

### 6. Multimedia API Tests (7 tests)
- ✅ `multimediaApi.getAllMedia()` - Get all media
- ✅ `multimediaApi.createNode()` - Create memory node
- ✅ `multimediaApi.getAllNodes()` - Get all nodes
- ✅ `multimediaApi.getDashboardAnalytics()` - Get dashboard stats
- ✅ `multimediaApi.searchMedia()` - Search media files
- ✅ `multimediaApi.deleteNode()` - Delete node
- ✅ Authentication on all 29 API calls

### 7. Component Structure Tests (19 tests)
Validates existence and structure of:
- AI Interview components (5)
- Memory Graph components (1)
- Voice Cloning components (6)
- Avatar Service components (1)
- Multimedia components (6)

### 8. UI/UX Feature Tests (10 tests)
- ✅ Toast notifications (react-toastify)
- ✅ Modal system (custom modals)
- ✅ Delete confirmations (no browser confirm)
- ✅ Loading states with spinners
- ✅ Dark mode support (Tailwind)
- ✅ Responsive layout
- ✅ Tab navigation
- ✅ React Flow graph visualization
- ✅ File upload (drag & drop)
- ✅ Protected route wrapper

### 9. Data Flow Tests (8 tests)
- ✅ AuthContext state management
- ✅ React hooks usage (useState, useEffect, useCallback)
- ✅ useCallback for memoization
- ✅ Modal state management
- ✅ API error handling
- ✅ Optimistic UI updates
- ✅ WebSocket connection (AI Interview)
- ✅ Session ID tracking

## 📁 Project Structure

```
tests/
├── run-tests.js          # Main test runner
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

The test suite reads from:
- `VITE_BACKEND_URL` - Backend API URL (default: http://localhost:3000)
- `FRONTEND_URL` - Frontend URL (default: http://localhost:5173)

### Test User

A unique test user is created for each test run:
- Username: `testuser_fe_[timestamp]`
- Email: `test_fe_[timestamp]@test.com`
- Password: `TestPassword123`

## 📊 Interpreting Results

### Status Codes

- **PASS** ✅ - Test completed successfully
- **FAIL** ❌ - Test failed (check message for details)
- **SKIP** ⏭️ - Test skipped (usually due to missing dependencies)

### Understanding "N/A" Status Codes

**Tests with HTTP Status Codes (Real API Calls):**
- Make actual HTTP requests to backend
- Get status codes: 200, 201, 404, 500, etc.
- Examples: `authService.register()`, `interviewApi.startInterview()`

**Tests with "N/A" Status Codes (Frontend Logic Tests):**
- Do NOT make HTTP requests
- Test frontend code logic, component existence, UI behavior
- Examples: `Component Structure`, `UI/UX Features`, `Data Flow`

**"N/A" is NORMAL and CORRECT** - it means "no HTTP request made"

### Common Failure Reasons

1. **Backend not running** - Start backend server first
2. **Invalid credentials** - Check test user creation
3. **Network timeout** - Check network connectivity
4. **API changes** - Update API endpoints if backend changed

## 🎯 What's Tested

### ✅ Service Layer
All API service files are tested:
- `authService.ts` - Authentication functions
- `interviewApi.ts` - Interview API calls
- `memoryGraphApi.ts` - Memory Graph API calls
- `voiceCloningApi.ts` - Voice Cloning API calls
- `avatarApi.ts` - Avatar API calls
- `multimediaApi.ts` - Multimedia API calls (all 29 endpoints)

### ✅ Authentication
- User registration flow
- User login flow
- JWT token storage and retrieval
- Protected route access
- Token validation

### ✅ API Integration
- All API endpoints called with correct parameters
- Authentication headers included
- Response validation
- Error handling

### ✅ Components
- Component existence verification
- Component structure validation
- Feature integration

### ✅ UI/UX
- Toast notification system
- Modal system (custom modals)
- Loading states
- Dark mode support
- Responsive design
- Tab navigation
- File upload

### ✅ Data Flow
- React Context (AuthContext)
- React Hooks (useState, useEffect, useCallback)
- State management patterns
- WebSocket connections
- Error handling

## 🚨 Troubleshooting

### Issue: "Connection refused"
**Solution:** Start the backend server first
```bash
cd backend
npm start
```

### Issue: "Authentication failed"
**Solution:** Check that the backend auth endpoints are working
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Test123"}'
```

### Issue: "Tests timing out"
**Solution:** Increase timeout in `run-tests.js`:
```javascript
timeout: 30000 // 30 seconds instead of 10
```

### Issue: "Excel report not generated"
**Solution:** Check that `exceljs` is installed:
```bash
npm install exceljs
```

## 📈 Test Coverage

| Category | Tests | Pass Rate Target |
|----------|-------|------------------|
| Auth Service | 4 | 100% |
| Interview API | 7 | 95%+ |
| Memory Graph API | 5 | 95%+ |
| Voice Cloning API | 4 | 95%+ |
| Avatar API | 4 | 95%+ |
| Multimedia API | 7 | 95%+ |
| Components | 19 | 100% |
| UI/UX Features | 10 | 100% |
| Data Flow | 8 | 100% |
| **Total** | **68** | **98%+** |

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Start backend
        run: |
          cd ../backend
          npm install
          npm start &
          sleep 10
      - name: Run frontend tests
        run: npm run test:frontend
      - name: Upload test results
        uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: frontend-test-results-*.xlsx
```

## 📝 Adding New Tests

To add new tests, edit `run-tests.js`:

```javascript
async function testYourNewFeature() {
  console.log(`\n${colors.blue}Testing: Your New Feature${colors.reset}\n`);
  
  const result = await apiCall('GET', '/api/your-endpoint', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    logTest('Your Feature', 'Test name', 'PASS', 'Success message', result.responseTime, result.statusCode);
  } else {
    logTest('Your Feature', 'Test name', 'FAIL', 'Error message', result.responseTime, result.statusCode);
  }
}

// Add to runTests() function
await testYourNewFeature();
```

## 🎓 Best Practices

1. **Always run tests before deployment**
2. **Check Excel report for detailed results**
3. **Fix failed tests immediately**
4. **Keep backend running during tests**
5. **Review skipped tests and resolve dependencies**
6. **Monitor pass rate (should be 95%+)**
7. **Update tests when API changes**

## 🔗 Related Documentation

- [System Documentation](../SYSTEM_DOCUMENTATION.md) - Complete system overview
- [Backend Test Suite](../backend/test-backend.js) - Backend tests
- [API Documentation](../SYSTEM_DOCUMENTATION.md#api-endpoints-reference) - API reference

## 📞 Support

If tests fail consistently:
1. Check backend is running and healthy
2. Verify environment variables are set
3. Review console output for error details
4. Check Excel report for patterns
5. Verify API endpoints haven't changed

---

**🎉 Happy Testing!** All tests passing = production ready! 🚀

