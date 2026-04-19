# 🎯 TDD Quick Reference Card

## The Golden Rule
```
🔴 RED → 🟢 GREEN → 🔵 REFACTOR → 🔁 REPEAT
```

**NEVER write production code without a failing test first!**

---

## ⚡ Quick Commands

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:unit        # Unit tests only
```

---

## 📝 Writing a Test (AAA Pattern)

```typescript
it('should do something when condition', async () => {
  // ARRANGE: Setup test data
  const input = createMockData();
  
  // ACT: Execute function
  const result = await service.method(input);
  
  // ASSERT: Verify expectations
  expect(result).toBe(expected);
});
```

---

## 🎯 Test Types Checklist

For every feature, write tests for:

- [ ] ✅ Happy path (most common success case)
- [ ] ⚠️ Edge cases (empty, null, undefined, boundaries)
- [ ] ❌ Error cases (invalid input, failures)
- [ ] 🏢 Business logic (rules, calculations)
- [ ] 🔄 Integration (API endpoints, database)

---

## 📊 Coverage Targets

| Code Type | Target |
|-----------|--------|
| Standard | 80% |
| Business Logic | 100% |
| Auth/Security | 100% |
| Financial | 100% |

---

## 🛠️ Available Test Helpers

```typescript
// Test Data Factories
import { createMockVolunteer, createMockTask } from '@tests/helpers/fixtures';

// API Assertions
import { assertApiSuccess, assertApiError } from '@tests/helpers/integration';

// Mocks
import { createMockPrismaClient, createMockRedisClient } from '@tests/helpers/fixtures';
```

---

## 🚨 Common Mistakes

| ❌ DON'T | ✅ DO |
|----------|-------|
| Write code first | Write test first |
| Test implementation details | Test behavior |
| Share state between tests | Independent tests |
| Ignore edge cases | Test boundaries |
| Skip RED phase | Verify test fails |

---

## 🎓 Test Naming Convention

```typescript
// Pattern: should [expected behavior] when [condition]

✅ it('should return user when ID exists', ...)
✅ it('should throw error when ID is invalid', ...)
✅ it('should exclude volunteers working 40+ hours', ...)

❌ it('test1', ...)
❌ it('works', ...)
```

---

## 🔍 Jest Matchers Cheat Sheet

```typescript
// Equality
expect(value).toBe(4)                    // Strict equality (===)
expect(value).toEqual({ id: '123' })     // Deep equality

// Truthiness
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()
expect(value).toBeDefined()

// Numbers
expect(value).toBeGreaterThan(3)
expect(value).toBeGreaterThanOrEqual(3.5)
expect(value).toBeLessThan(5)
expect(value).toBeCloseTo(0.3)           // Floating point

// Strings
expect(string).toMatch(/pattern/)
expect(string).toContain('substring')

// Arrays
expect(array).toContain('item')
expect(array).toHaveLength(3)

// Objects
expect(obj).toHaveProperty('key')
expect(obj).toMatchObject({ subset: 'match' })

// Exceptions
expect(() => fn()).toThrow()
expect(() => fn()).toThrow('error message')
await expect(asyncFn()).rejects.toThrow()

// Async
await expect(promise).resolves.toBe(value)
await expect(promise).rejects.toThrow()
```

---

## 🏃 TDD Workflow Steps

1. **RED**
   ```bash
   # Write test
   code tests/unit/my-feature.test.ts
   
   # Verify it fails
   npm test
   ```

2. **GREEN**
   ```bash
   # Implement minimal code
   code src/my-feature.ts
   
   # Verify it passes
   npm test
   ```

3. **REFACTOR**
   ```bash
   # Improve code quality
   # Extract, rename, optimize
   
   # Verify still passes
   npm test
   ```

4. **REPEAT**
   ```bash
   # Add more tests, back to RED
   ```

---

## 📁 File Structure

```
tests/
├── setup.ts              # Global setup
├── TEST_TEMPLATE.ts      # Copy this!
├── helpers/
│   ├── fixtures.ts       # Test data
│   └── integration.ts    # API helpers
├── unit/                 # Unit tests
└── integration/          # API tests
```

---

## 🎯 Today's Task

**File:** `src/services/matching.service.ts`  
**Status:** 🔴 Not implemented  
**Tests:** 9 failing tests written  
**Goal:** Implement to make tests green

```bash
# 1. Run tests (verify RED)
npm test

# 2. Implement service
code src/services/matching.service.ts

# 3. Run tests (verify GREEN)
npm test

# 4. Check coverage
npm run test:coverage
```

---

## 📚 More Help

- **Full Guide:** `docs/TDD_GUIDE.md`
- **Visual Guide:** `TDD_VISUAL_GUIDE.md`
- **Setup Info:** `TDD_SETUP_COMPLETE.md`
- **Template:** `tests/TEST_TEMPLATE.ts`

---

**Print this card and keep it visible while coding! 🚀**
