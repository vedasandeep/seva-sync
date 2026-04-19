/**
 * Task Matching Service Unit Tests
 * 
 * Tests for the volunteer-task matching algorithm:
 * - Skill matching (Jaccard similarity)
 * - Distance calculation (Haversine)
 * - Availability scoring (burnout prevention)
 * - Composite scoring
 */

import {
  calculateSkillSimilarity,
  calculateDistance,
  calculateMatchScore,
  VolunteerCandidate,
  TaskRequirements,
} from '../../../src/services/matching.service';
import { TaskUrgency } from '@prisma/client';

// Helper to create mock volunteer
const createMockVolunteer = (overrides?: Partial<VolunteerCandidate>): VolunteerCandidate => ({
  id: 'vol-1',
  name: 'Test Volunteer',
  skills: ['first-aid', 'cooking'],
  currentLat: 17.385044,
  currentLng: 78.486671,
  isActive: true,
  burnoutScore: 0,
  language: 'en',
  ...overrides,
});

// Helper to create mock task
const createMockTask = (overrides?: Partial<TaskRequirements>): TaskRequirements => ({
  id: 'task-1',
  title: 'Test Task',
  requiredSkills: ['first-aid'],
  latitude: 17.385044,
  longitude: 78.486671,
  urgency: TaskUrgency.MEDIUM,
  estimatedHours: 2,
  ...overrides,
});

describe('Matching Service - Skill Similarity', () => {
  describe('calculateSkillSimilarity', () => {
    it('should return 1 when no skills are required', () => {
      const result = calculateSkillSimilarity(['first-aid', 'cooking'], []);
      expect(result).toBe(1);
    });

    it('should return 0 when volunteer has no skills', () => {
      const result = calculateSkillSimilarity([], ['first-aid']);
      expect(result).toBe(0);
    });

    it('should return 1 for perfect match', () => {
      const result = calculateSkillSimilarity(['first-aid'], ['first-aid']);
      expect(result).toBe(1);
    });

    it('should calculate Jaccard index correctly', () => {
      // Volunteer: {first-aid, cooking}
      // Required: {first-aid, driving}
      // Intersection: {first-aid} = 1
      // Union: {first-aid, cooking, driving} = 3
      // Jaccard = 1/3 = 0.333...
      const result = calculateSkillSimilarity(
        ['first-aid', 'cooking'],
        ['first-aid', 'driving']
      );
      expect(result).toBeCloseTo(1 / 3, 2);
    });

    it('should be case-insensitive', () => {
      const result = calculateSkillSimilarity(['First-Aid'], ['first-aid']);
      expect(result).toBe(1);
    });

    it('should return 0 when no skills match', () => {
      const result = calculateSkillSimilarity(['cooking', 'driving'], ['medical', 'translation']);
      expect(result).toBe(0);
    });
  });
});

describe('Matching Service - Distance Calculation', () => {
  describe('calculateDistance', () => {
    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(17.385044, 78.486671, 17.385044, 78.486671);
      expect(distance).toBe(0);
    });

    it('should calculate distance correctly (~10km)', () => {
      // Hyderabad to a point ~10km away
      const lat1 = 17.385044;
      const lon1 = 78.486671;
      const lat2 = 17.450000;
      const lon2 = 78.550000;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      
      // Should be approximately 9-11 km
      expect(distance).toBeGreaterThan(9);
      expect(distance).toBeLessThan(11);
    });

    it('should calculate longer distances correctly (~100km)', () => {
      // Hyderabad to Warangal (approx 150km)
      const distance = calculateDistance(17.385044, 78.486671, 18.000000, 79.588000);
      
      // Should be approximately 130-170 km
      expect(distance).toBeGreaterThan(100);
      expect(distance).toBeLessThan(200);
    });

    it('should be symmetric (A to B = B to A)', () => {
      const d1 = calculateDistance(17.385044, 78.486671, 18.0, 79.0);
      const d2 = calculateDistance(18.0, 79.0, 17.385044, 78.486671);
      
      expect(d1).toBeCloseTo(d2, 5);
    });
  });
});

describe('Matching Service - Composite Scoring', () => {
  describe('calculateMatchScore', () => {
    it('should return high score for perfect match', () => {
      const volunteer = createMockVolunteer({
        skills: ['first-aid'],
        currentLat: 17.385044,
        currentLng: 78.486671,
        isActive: true,
        burnoutScore: 0,
      });

      const task = createMockTask({
        requiredSkills: ['first-aid'],
        latitude: 17.385044,
        longitude: 78.486671,
      });

      const result = calculateMatchScore(volunteer, task);
      
      expect(result.score).toBeGreaterThan(90);
      expect(result.breakdown.skillScore).toBe(100);
      expect(result.breakdown.distanceScore).toBe(100);
      expect(result.breakdown.availabilityScore).toBe(100);
    });

    it('should return 0 availability score for inactive volunteer', () => {
      const volunteer = createMockVolunteer({
        isActive: false,
      });

      const task = createMockTask();
      const result = calculateMatchScore(volunteer, task);
      
      expect(result.breakdown.availabilityScore).toBe(0);
      expect(result.warnings).toContain('Volunteer is not active');
    });

    it('should penalize high burnout score', () => {
      const lowBurnout = createMockVolunteer({ burnoutScore: 1 });
      const highBurnout = createMockVolunteer({ burnoutScore: 8 });
      const task = createMockTask();

      const lowResult = calculateMatchScore(lowBurnout, task);
      const highResult = calculateMatchScore(highBurnout, task);

      expect(lowResult.score).toBeGreaterThan(highResult.score);
      expect(highResult.warnings).toContain('Critical burnout level - recommend rest');
    });

    it('should add warning for elevated burnout', () => {
      const volunteer = createMockVolunteer({ burnoutScore: 5 });
      const task = createMockTask();

      const result = calculateMatchScore(volunteer, task);

      expect(result.warnings).toContain('Elevated burnout score');
    });

    it('should calculate distance and include in result', () => {
      const volunteer = createMockVolunteer({
        currentLat: 17.500000,
        currentLng: 78.600000,
      });

      const task = createMockTask({
        latitude: 17.385044,
        longitude: 78.486671,
      });

      const result = calculateMatchScore(volunteer, task);

      expect(result.distanceKm).not.toBeNull();
      expect(result.distanceKm).toBeGreaterThan(10);
      expect(result.distanceKm).toBeLessThan(20);
    });

    it('should handle missing location gracefully', () => {
      const volunteer = createMockVolunteer({
        currentLat: null,
        currentLng: null,
      });

      const task = createMockTask({
        latitude: 17.385044,
        longitude: 78.486671,
      });

      const result = calculateMatchScore(volunteer, task);

      expect(result.distanceKm).toBeNull();
      expect(result.warnings).toContain('Location data unavailable');
      expect(result.breakdown.distanceScore).toBe(50); // Default score
    });

    it('should boost score for CRITICAL tasks with good skill match', () => {
      // Use a volunteer with some distance penalty so boost is visible
      const volunteer = createMockVolunteer({
        skills: ['first-aid'],
        currentLat: 17.450, // ~7km away
        currentLng: 78.550,
      });

      const normalTask = createMockTask({ urgency: TaskUrgency.MEDIUM });
      const criticalTask = createMockTask({ urgency: TaskUrgency.CRITICAL });

      const normalResult = calculateMatchScore(volunteer, normalTask);
      const criticalResult = calculateMatchScore(volunteer, criticalTask);

      // Critical task gets 10% boost when skill match >= 50%
      expect(criticalResult.score).toBeGreaterThan(normalResult.score);
    });

    it('should prefer closer volunteer when skills are equal', () => {
      const nearVolunteer = createMockVolunteer({
        id: 'near',
        currentLat: 17.386,
        currentLng: 78.487, // ~100m away
      });

      const farVolunteer = createMockVolunteer({
        id: 'far',
        currentLat: 17.500,
        currentLng: 78.600, // ~15km away
      });

      const task = createMockTask({
        latitude: 17.385044,
        longitude: 78.486671,
      });

      const nearResult = calculateMatchScore(nearVolunteer, task);
      const farResult = calculateMatchScore(farVolunteer, task);

      expect(nearResult.score).toBeGreaterThan(farResult.score);
      expect(nearResult.breakdown.distanceScore).toBeGreaterThan(farResult.breakdown.distanceScore);
    });

    it('should calculate language score correctly', () => {
      const volunteer = createMockVolunteer({ language: 'hi' });
      
      const matchingTask = createMockTask({ preferredLanguages: ['hi', 'en'] });
      const nonMatchingTask = createMockTask({ preferredLanguages: ['te', 'kn'] });

      const matchResult = calculateMatchScore(volunteer, matchingTask);
      const noMatchResult = calculateMatchScore(volunteer, nonMatchingTask);

      expect(matchResult.breakdown.languageScore).toBe(100);
      expect(noMatchResult.breakdown.languageScore).toBe(30);
    });

    it('should give full language score when no preference', () => {
      const volunteer = createMockVolunteer({ language: 'hi' });
      const task = createMockTask({ preferredLanguages: undefined });

      const result = calculateMatchScore(volunteer, task);

      expect(result.breakdown.languageScore).toBe(100);
    });
  });
});

describe('Matching Service - Edge Cases', () => {
  it('should handle volunteer with empty skills array', () => {
    const volunteer = createMockVolunteer({ skills: [] });
    const task = createMockTask({ requiredSkills: ['first-aid'] });

    const result = calculateMatchScore(volunteer, task);

    expect(result.breakdown.skillScore).toBe(0);
  });

  it('should handle task with empty required skills', () => {
    const volunteer = createMockVolunteer({ skills: ['first-aid', 'cooking'] });
    const task = createMockTask({ requiredSkills: [] });

    const result = calculateMatchScore(volunteer, task);

    expect(result.breakdown.skillScore).toBe(100);
  });

  it('should handle all null location coordinates', () => {
    const volunteer = createMockVolunteer({
      currentLat: null,
      currentLng: null,
    });

    const task = createMockTask({
      latitude: null,
      longitude: null,
    });

    const result = calculateMatchScore(volunteer, task);

    expect(result.distanceKm).toBeNull();
    expect(result.breakdown.distanceScore).toBe(50);
  });

  it('should cap score at 100', () => {
    // Perfect volunteer + critical task boost shouldn't exceed 100
    const volunteer = createMockVolunteer({
      skills: ['first-aid', 'medical-support'],
      currentLat: 17.385044,
      currentLng: 78.486671,
      isActive: true,
      burnoutScore: 0,
    });

    const task = createMockTask({
      requiredSkills: ['first-aid'],
      latitude: 17.385044,
      longitude: 78.486671,
      urgency: TaskUrgency.CRITICAL,
    });

    const result = calculateMatchScore(volunteer, task);

    expect(result.score).toBeLessThanOrEqual(100);
  });
});
