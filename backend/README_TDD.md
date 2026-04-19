# 🚀 TDD Setup - Start Here!

Welcome to the **SevaSync TDD Development Environment**! This file will guide you through the complete test-driven development setup.

---

## 📚 Documentation Index

### 🎯 Start Here (Priority Order)

1. **[TDD_QUICK_REF.md](./TDD_QUICK_REF.md)** ⚡
   - Quick reference card
   - Essential commands
   - Test patterns cheat sheet
   - **Read this first!** (5 minutes)

2. **[TDD_SETUP_COMPLETE.md](./TDD_SETUP_COMPLETE.md)** 📋
   - Complete setup instructions
   - Installation steps
   - Troubleshooting guide
   - Success criteria

3. **[TDD_VISUAL_GUIDE.md](./TDD_VISUAL_GUIDE.md)** 🎨
   - Visual workflow diagrams
   - File structure visualization
   - RED-GREEN-REFACTOR cycle explained
   - Current task overview

4. **[docs/TDD_GUIDE.md](./docs/TDD_GUIDE.md)** 📖
   - In-depth TDD methodology
   - Best practices
   - Common mistakes
   - Real-world examples

5. **[tests/TEST_TEMPLATE.ts](./tests/TEST_TEMPLATE.ts)** 📝
   - Copy-paste template for new tests
   - Patterns and conventions
   - Checklist for test quality

---

## 🎯 Quick Start (3 Steps)

```bash
# Step 1: Install dependencies
cd backend
npm install

# Step 2: Run tests (should FAIL - RED phase)
npm test

# Step 3: Implement service to make tests pass
code src/services/matching.service.ts
```

**Current Task:** Implement Task Matching Service  
**Status:** 🔴 RED (9 tests written, all failing)  
**Goal:** 🟢 Make all tests pass

---

## 📊 Project Status

### What's Ready ✅

- [x] Jest test runner configured
- [x] Coverage thresholds set (80% minimum)
- [x] Test utilities and helpers created
- [x] Example TDD test suite written (9 tests)
- [x] Service scaffold created
- [x] GitHub Actions CI/CD configured
- [x] VSCode integration setup
- [x] Complete documentation

### What's Next ⏳

- [ ] Install npm dependencies
- [ ] Run tests (verify RED phase)
- [ ] Implement matching service (GREEN phase)
- [ ] Refactor for quality (REFACTOR phase)
- [ ] Achieve 100% coverage
- [ ] Repeat for next feature

---

## 🧪 Test Commands

| Command | When to Use |
|---------|-------------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Development (auto-rerun on save) |
| `npm run test:coverage` | Check coverage percentage |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run API integration tests |
| `npm run test:debug` | Debug with breakpoints |

---

## 🎓 TDD Philosophy

> **"Write tests first, code second. Always."**

### The RED-GREEN-REFACTOR Cycle

```
┌─────────────────────────────────────────┐
│  1. 🔴 RED: Write failing test          │
│  2. 🟢 GREEN: Make test pass            │
│  3. 🔵 REFACTOR: Improve code           │
│  4. 🔁 REPEAT: Next feature             │
└─────────────────────────────────────────┘
```

### Why TDD?

- ✅ **Confidence:** Tests prove code works
- ✅ **Design:** Tests force good architecture
- ✅ **Documentation:** Tests show usage examples
- ✅ **Refactoring:** Tests enable fearless changes
- ✅ **Debugging:** Failing test = bug location
- ✅ **Speed:** Faster than manual testing

---

## 📁 File Structure

```
backend/
├── README.md                    ← You are here
├── TDD_QUICK_REF.md            ← Quick reference
├── TDD_SETUP_COMPLETE.md       ← Setup guide
├── TDD_VISUAL_GUIDE.md         ← Visual guide
├── jest.config.js              ← Test config
├── package.json                ← Test scripts
│
├── src/                         💻 Production Code
│   └── services/
│       └── matching.service.ts  🔴 RED: Not implemented
│
├── tests/                       🧪 Test Code
│   ├── setup.ts                 Global test setup
│   ├── TEST_TEMPLATE.ts         Copy this!
│   ├── helpers/
│   │   ├── fixtures.ts          Test data factories
│   │   └── integration.ts       API test helpers
│   └── unit/
│       └── services/
│           └── matching.service.test.ts  ✅ 9 tests written
│
└── docs/
    └── TDD_GUIDE.md            📚 Complete guide
```

---

## 🎯 Example: Task Matching Service

### Current Status

**File:** `src/services/matching.service.ts`  
**Phase:** 🔴 RED (Not implemented)  
**Tests:** 9 written, all failing  
**Coverage:** 0%

### Tests Written

1. ✅ Should return volunteer with matching skills
2. ✅ Should return null when no volunteers available
3. ✅ Should return null when volunteer list is empty
4. ✅ Should exclude volunteers working 40+ hours (burnout)
5. ✅ Should prefer closer volunteer when skills equal
6. ✅ Should throw error for task with missing coordinates
7. ✅ Should calculate match score correctly
8. ✅ Should calculate distance between coordinates
9. ✅ Should return 0 for same coordinates

### Your Mission

Implement the three methods in `matching.service.ts`:
- `findBestMatch(task, volunteers)`
- `calculateMatchScore(volunteer, task, distance)`
- `calculateDistance(lat1, lon1, lat2, lon2)`

**Goal:** Make all 9 tests pass with 100% coverage

---

## 💡 Pro Tips

### Before Writing Code

1. Read the test file to understand requirements
2. Run `npm test` to verify tests fail (RED)
3. Understand what each test expects

### While Writing Code

1. Write minimal code to pass ONE test at a time
2. Run `npm run test:watch` for instant feedback
3. Don't skip ahead - stay disciplined!

### After Tests Pass

1. Run `npm run test:coverage` to check coverage
2. Refactor for quality (tests should still pass)
3. Commit with descriptive message

---

## 🚨 Golden Rules

1. **NEVER write production code without a failing test first**
2. **ALWAYS verify tests fail before implementing** (RED phase)
3. **ONLY write enough code to make tests pass** (GREEN phase)
4. **REFACTOR only when tests are green**
5. **Keep coverage above 80%** (100% for critical code)

---

## 📖 Learning Path

### Beginner (Day 1)
1. Read `TDD_QUICK_REF.md`
2. Run `npm test` to see tests fail
3. Implement one method to make 3 tests pass
4. Run `npm run test:coverage`

### Intermediate (Day 2-3)
1. Complete the matching service implementation
2. Read `docs/TDD_GUIDE.md` for deeper understanding
3. Write tests for a new feature using `TEST_TEMPLATE.ts`

### Advanced (Week 1+)
1. Write integration tests for API endpoints
2. Set up E2E tests with Playwright
3. Contribute to test utilities
4. Review others' tests in PRs

---

## 🔧 Troubleshooting

### Tests Won't Run?

```bash
# Check installation
npm list jest

# Reinstall if needed
rm -rf node_modules package-lock.json
npm install
```

### Coverage Not Generated?

```bash
# Run with verbose output
npm run test:coverage -- --verbose
```

### VSCode Integration Not Working?

1. Install recommended extensions
2. Reload window: `Ctrl+Shift+P` → "Reload Window"
3. Check `.vscode/settings.json` is present

---

## 🎉 Success Checklist

Mark these off as you complete the setup:

- [ ] Dependencies installed (`npm install`)
- [ ] Tests run successfully (`npm test`)
- [ ] Tests currently failing (RED phase confirmed)
- [ ] Read `TDD_QUICK_REF.md`
- [ ] Understood the matching service requirements
- [ ] Implemented service methods
- [ ] All tests passing (GREEN phase)
- [ ] Code refactored for quality
- [ ] Coverage is 100%
- [ ] Committed changes

---

## 📞 Need Help?

- **Quick answers:** Check `TDD_QUICK_REF.md`
- **Setup issues:** See `TDD_SETUP_COMPLETE.md`
- **Workflow questions:** Read `TDD_VISUAL_GUIDE.md`
- **In-depth learning:** Study `docs/TDD_GUIDE.md`
- **New test patterns:** Copy `tests/TEST_TEMPLATE.ts`

---

## 🚀 Ready to Start?

1. **First time?** Read `TDD_QUICK_REF.md` (5 minutes)
2. **Install deps:** `npm install`
3. **Run tests:** `npm test`
4. **Start coding!**

---

**Remember: Tests first, code second. Always. No exceptions!** 🎯

Happy Test-Driven Development! 🚀

---

*Last updated: 2026-03-24*  
*Project: SevaSync Backend*  
*TDD Setup Version: 1.0*
