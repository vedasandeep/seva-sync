# TDD Guide for SevaSync Backend

## 🎯 Test-Driven Development Workflow

This project follows **strict TDD methodology**. All code MUST be written test-first.

### The RED-GREEN-REFACTOR Cycle

```
┌─────────────────────────────────────────────┐
│                                             │
│  1. RED: Write failing test                │
│     ↓                                       │
│  2. GREEN: Write minimal code to pass      │
│     ↓                                       │
│  3. REFACTOR: Improve code quality         │
│     ↓                                       │
│  4. REPEAT: Continue until feature done    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📋 TDD Checklist (MANDATORY)

Before writing ANY production code:

- [ ] Write interface/type definitions
- [ ] Write failing test (RED)
- [ ] Run test - verify it FAILS
- [ ] Write minimal implementation (GREEN)
- [ ] Run test - verify it PASSES
- [ ] Refactor for quality
- [ ] Run test - verify still PASSES
- [ ] Check coverage (80%+ required)

---

## 🧪 Test Structure

### Directory Layout

```
backend/
├── src/
│   ├── services/
│   │   └── matching.service.ts       # Implementation
│   ├── controllers/
│   ├── routes/
│   └── utils/
├── tests/
│   ├── setup.ts                       # Jest setup
│   ├── helpers/
│   │   ├── fixtures.ts                # Test data factories
│   │   └── integration.ts             # API test helpers
│   ├── unit/
│   │   └── services/
│   │       └── matching.service.test.ts
│   └── integration/
│       └── api/
│           └── tasks.test.ts
└── jest.config.js
```

---

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# CI mode (for GitHub Actions)
npm run test:ci

# Debug mode
npm run test:debug
```

### Coverage Thresholds

| Code Type                  | Required Coverage |
|----------------------------|-------------------|
| Standard code              | 80%               |
| Business logic services    | 100%              |
| Authentication/Security    | 100%              |
| Financial calculations     | 100%              |

---

## 📝 TDD Example Walkthrough

Let's implement a feature: **Task Matching Algorithm**

### Step 1: Define Interface (SCAFFOLD)

```typescript
// src/services/matching.service.ts
export class TaskMatchingService {
  async findBestMatch(task: Task, volunteers: Volunteer[]): Promise<Volunteer | null> {
    throw new Error('Not implemented');
  }
}
```

### Step 2: Write Failing Test (RED)

```typescript
// tests/unit/services/matching.service.test.ts
describe('TaskMatchingService', () => {
  it('should return volunteer with matching skills', async () => {
    const service = new TaskMatchingService();
    const task = createMockTask({ requiredSkills: ['first-aid'] });
    const volunteers = [
      createMockVolunteer({ skills: ['first-aid'] })
    ];

    const result = await service.findBestMatch(task, volunteers);

    expect(result).toBeDefined();
    expect(result?.skills).toContain('first-aid');
  });
});
```

**Run test:** `npm test`  
**Expected:** ❌ FAIL - "Not implemented"

### Step 3: Write Minimal Code (GREEN)

```typescript
// src/services/matching.service.ts
export class TaskMatchingService {
  async findBestMatch(task: Task, volunteers: Volunteer[]): Promise<Volunteer | null> {
    // Minimal implementation to pass test
    const match = volunteers.find(v => 
      v.skills.some(skill => task.requiredSkills.includes(skill))
    );
    return match || null;
  }
}
```

**Run test:** `npm test`  
**Expected:** ✅ PASS

### Step 4: Refactor (IMPROVE)

```typescript
export class TaskMatchingService {
  async findBestMatch(task: Task, volunteers: Volunteer[]): Promise<Volunteer | null> {
    const scoredVolunteers = volunteers
      .filter(v => this.hasRequiredSkills(v, task))
      .map(v => ({
        volunteer: v,
        score: this.calculateMatchScore(v, task)
      }))
      .sort((a, b) => b.score - a.score);

    return scoredVolunteers[0]?.volunteer || null;
  }

  private hasRequiredSkills(volunteer: Volunteer, task: Task): boolean {
    return task.requiredSkills.every(skill => 
      volunteer.skills.includes(skill)
    );
  }
}
```

**Run test:** `npm test`  
**Expected:** ✅ PASS (still passes after refactor)

### Step 5: Add Edge Cases

```typescript
it('should return null when no volunteers available', async () => {
  const result = await service.findBestMatch(task, []);
  expect(result).toBeNull();
});

it('should exclude burned-out volunteers (40+ hours)', async () => {
  const volunteers = [
    createMockVolunteer({ hoursWorked: 45 }), // Excluded
    createMockVolunteer({ hoursWorked: 10 })  // Selected
  ];
  
  const result = await service.findBestMatch(task, volunteers);
  expect(result?.hoursWorked).toBeLessThan(40);
});
```

---

## 🎨 Test Quality Guidelines

### ✅ Good Tests

```typescript
// Clear test name describing behavior
it('should reject login with invalid credentials', async () => {
  // ARRANGE: Setup
  const credentials = { phone: '+911234567890', password: 'wrong' };
  
  // ACT: Execute
  const response = await api.post('/auth/login').send(credentials);
  
  // ASSERT: Verify
  expect(response.status).toBe(401);
  expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
});
```

### ❌ Bad Tests

```typescript
// Vague test name
it('should work', async () => {
  // Testing implementation details
  expect(component.state.internalCounter).toBe(5);
  
  // No arrange/act/assert structure
  const x = doSomething();
  expect(x).toBeDefined();
});
```

---

## 📊 Coverage Report

After running `npm run test:coverage`:

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   87.5  |   83.33  |   90.0  |   87.5  |
 services/            |   100   |   100    |   100   |   100   |
  matching.service.ts |   100   |   100    |   100   |   100   |
  auth.service.ts     |   100   |   100    |   100   |   100   |
 controllers/         |   75.0  |   66.67  |   80.0  |   75.0  |
  task.controller.ts  |   75.0  |   66.67  |   80.0  |   75.0  |
----------------------|---------|----------|---------|---------|
```

**Action Required:** Add tests for `task.controller.ts` to reach 80% threshold.

---

## 🛠️ Test Utilities

### Fixtures (Test Data Factories)

```typescript
import { createMockVolunteer, createMockTask } from '@tests/helpers/fixtures';

const volunteer = createMockVolunteer({ 
  skills: ['first-aid'],
  hoursWorked: 5 
});
```

### API Testing Helpers

```typescript
import { assertApiSuccess, assertApiError } from '@tests/helpers/integration';

const response = await api.get('/tasks');
assertApiSuccess(response, { tasks: expect.any(Array) });
```

### Mock Factories

```typescript
import { createMockPrismaClient } from '@tests/helpers/fixtures';

const mockDb = createMockPrismaClient();
mockDb.user.findUnique.mockResolvedValue({ id: '123', name: 'Test' });
```

---

## 🚨 Common TDD Mistakes

### 1. Writing Code Before Tests
```typescript
❌ Write service implementation first
✅ Write failing test first
```

### 2. Testing Implementation Details
```typescript
❌ expect(service.internalCache).toBeDefined()
✅ expect(service.findUser('123')).resolves.toEqual({ id: '123' })
```

### 3. Skipping Edge Cases
```typescript
✅ Test null, undefined, empty arrays
✅ Test boundary conditions (0, -1, MAX_INT)
✅ Test error conditions
```

### 4. Non-Deterministic Tests
```typescript
❌ Math.random(), Date.now(), setTimeout without mocking
✅ Mock external dependencies, use fixed dates
```

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [TDD by Example (Kent Beck)](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)

---

## 🎯 Next Steps

1. **Run existing tests:** `npm test`
2. **Check coverage:** `npm run test:coverage`
3. **Pick a feature to implement**
4. **Write failing tests first**
5. **Implement minimal code**
6. **Refactor and repeat**

**Remember:** No code without tests. Tests are not optional! 🚀
