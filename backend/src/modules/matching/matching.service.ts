import { prisma } from '../../infrastructure/database';
import { TaskStatus, TaskUrgency } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';

/**
 * AI Matching Service
 * 
 * Matches volunteers to tasks using weighted scoring:
 * - Skill similarity (Jaccard index): 40%
 * - Geographic proximity: 30%
 * - Availability & burnout: 20%
 * - Language match: 10%
 */

export interface VolunteerCandidate {
  id: string;
  name: string;
  skills: string[];
  currentLat: number | null;
  currentLng: number | null;
  isActive: boolean;
  burnoutScore: number;
  language: string;
}

export interface TaskRequirements {
  id: string;
  title: string;
  requiredSkills: string[];
  latitude: number | null;
  longitude: number | null;
  urgency: TaskUrgency;
  estimatedHours: number | null;
  preferredLanguages?: string[];
}

interface MatchResult {
  volunteer: VolunteerCandidate;
  score: number;
  breakdown: {
    skillScore: number;
    distanceScore: number;
    availabilityScore: number;
    languageScore: number;
  };
  distanceKm: number | null;
  warnings: string[];
}

// Scoring weights
const WEIGHTS = {
  skill: 0.40,
  distance: 0.30,
  availability: 0.20,
  language: 0.10,
};

// Burnout thresholds
const BURNOUT_WARNING_THRESHOLD = 5;
const BURNOUT_CRITICAL_THRESHOLD = 7;

/**
 * Calculate Jaccard similarity between two skill sets
 * Jaccard = |A ∩ B| / |A ∪ B|
 */
export function calculateSkillSimilarity(volunteerSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 1; // No skills required = perfect match
  if (volunteerSkills.length === 0) return 0;

  const volunteerSet = new Set(volunteerSkills.map(s => s.toLowerCase()));
  const requiredSet = new Set(requiredSkills.map(s => s.toLowerCase()));

  let intersection = 0;
  for (const skill of requiredSet) {
    if (volunteerSet.has(skill)) intersection++;
  }

  const union = new Set([...volunteerSet, ...requiredSet]).size;
  return intersection / union;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert distance to a 0-100 score
 * 0km = 100, 50km+ = 0 (linear decay)
 */
function distanceToScore(distanceKm: number, maxDistanceKm: number = 50): number {
  if (distanceKm <= 0) return 100;
  if (distanceKm >= maxDistanceKm) return 0;
  return 100 * (1 - distanceKm / maxDistanceKm);
}

/**
 * Calculate availability score based on burnout and active status
 */
function calculateAvailabilityScore(
  isActive: boolean,
  burnoutScore: number
): { score: number; warnings: string[] } {
  const warnings: string[] = [];
  
  if (!isActive) {
    return { score: 0, warnings: ['Volunteer is not active'] };
  }

  let score = 100;

  // Burnout penalty
  if (burnoutScore >= BURNOUT_CRITICAL_THRESHOLD) {
    score -= 60;
    warnings.push('Critical burnout level - recommend rest');
  } else if (burnoutScore >= BURNOUT_WARNING_THRESHOLD) {
    score -= 30;
    warnings.push('Elevated burnout score');
  } else {
    // Small penalty for any burnout
    score -= burnoutScore * 3;
  }

  return { score: Math.max(0, score), warnings };
}

/**
 * Calculate language match score
 */
function calculateLanguageScore(
  volunteerLanguage: string,
  preferredLanguages: string[] = []
): number {
  if (preferredLanguages.length === 0) return 100;
  
  const volLang = volunteerLanguage.toLowerCase();
  for (const lang of preferredLanguages) {
    if (volLang === lang.toLowerCase()) return 100;
  }
  return 30; // Some penalty but not zero
}

/**
 * Convert Prisma Decimal to number
 */
function decimalToNumber(value: Decimal | null): number | null {
  if (value === null) return null;
  return Number(value);
}

/**
 * Calculate composite match score for a volunteer-task pair
 */
export function calculateMatchScore(
  volunteer: VolunteerCandidate,
  task: TaskRequirements
): MatchResult {
  const warnings: string[] = [];

  // 1. Skill similarity
  const skillSimilarity = calculateSkillSimilarity(
    volunteer.skills,
    task.requiredSkills
  );
  const skillScore = skillSimilarity * 100;

  // 2. Distance score
  let distanceKm: number | null = null;
  let distanceScore = 50; // Default if no location
  
  if (volunteer.currentLat && volunteer.currentLng && task.latitude && task.longitude) {
    distanceKm = calculateDistance(
      volunteer.currentLat,
      volunteer.currentLng,
      task.latitude,
      task.longitude
    );
    distanceScore = distanceToScore(distanceKm);
  } else {
    warnings.push('Location data unavailable');
  }

  // 3. Availability score
  const availability = calculateAvailabilityScore(
    volunteer.isActive,
    volunteer.burnoutScore
  );
  warnings.push(...availability.warnings);

  // 4. Language score
  const languageScore = calculateLanguageScore(
    volunteer.language,
    task.preferredLanguages
  );

  // Weighted composite score
  const compositeScore =
    skillScore * WEIGHTS.skill +
    distanceScore * WEIGHTS.distance +
    availability.score * WEIGHTS.availability +
    languageScore * WEIGHTS.language;

  // Urgency boost for CRITICAL tasks
  let finalScore = compositeScore;
  if (task.urgency === 'CRITICAL' && skillSimilarity >= 0.5) {
    finalScore = Math.min(100, compositeScore * 1.1); // 10% boost
  }

  return {
    volunteer,
    score: Math.round(finalScore * 100) / 100,
    breakdown: {
      skillScore: Math.round(skillScore),
      distanceScore: Math.round(distanceScore),
      availabilityScore: Math.round(availability.score),
      languageScore: Math.round(languageScore),
    },
    distanceKm: distanceKm !== null ? Math.round(distanceKm * 10) / 10 : null,
    warnings,
  };
}

/**
 * Transform Prisma volunteer to VolunteerCandidate
 */
function toVolunteerCandidate(volunteer: {
  id: string;
  name: string;
  skills: unknown;
  currentLat: Decimal | null;
  currentLng: Decimal | null;
  isActive: boolean;
  burnoutScore: Decimal;
  language: string;
}): VolunteerCandidate {
  return {
    id: volunteer.id,
    name: volunteer.name,
    skills: Array.isArray(volunteer.skills) ? volunteer.skills : [],
    currentLat: decimalToNumber(volunteer.currentLat),
    currentLng: decimalToNumber(volunteer.currentLng),
    isActive: volunteer.isActive,
    burnoutScore: Number(volunteer.burnoutScore),
    language: volunteer.language,
  };
}

/**
 * Transform Prisma task to TaskRequirements
 */
function toTaskRequirements(task: {
  id: string;
  title: string;
  requiredSkills: unknown;
  latitude: Decimal;
  longitude: Decimal;
  urgency: TaskUrgency;
  estimatedHours: number | null;
}): TaskRequirements {
  return {
    id: task.id,
    title: task.title,
    requiredSkills: Array.isArray(task.requiredSkills) ? task.requiredSkills : [],
    latitude: decimalToNumber(task.latitude),
    longitude: decimalToNumber(task.longitude),
    urgency: task.urgency,
    estimatedHours: task.estimatedHours,
  };
}

/**
 * Find best matching volunteers for a task
 */
export async function findMatchesForTask(
  taskId: string,
  limit: number = 5
): Promise<MatchResult[]> {
  // Get task details
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      title: true,
      requiredSkills: true,
      latitude: true,
      longitude: true,
      urgency: true,
      estimatedHours: true,
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  // Get active volunteers
  const volunteers = await prisma.volunteer.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      skills: true,
      currentLat: true,
      currentLng: true,
      isActive: true,
      burnoutScore: true,
      language: true,
    },
  });

  const taskReqs = toTaskRequirements(task);

  // Score all volunteers
  const results: MatchResult[] = volunteers.map((volunteer) =>
    calculateMatchScore(toVolunteerCandidate(volunteer), taskReqs)
  );

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  // Return top matches
  return results.slice(0, limit);
}

/**
 * Find best task matches for a volunteer
 */
export async function findMatchesForVolunteer(
  volunteerId: string,
  limit: number = 5
): Promise<{ task: TaskRequirements; score: number; distanceKm: number | null }[]> {
  // Get volunteer details
  const volunteer = await prisma.volunteer.findUnique({
    where: { id: volunteerId },
    select: {
      id: true,
      name: true,
      skills: true,
      currentLat: true,
      currentLng: true,
      isActive: true,
      burnoutScore: true,
      language: true,
    },
  });

  if (!volunteer) {
    throw new Error('Volunteer not found');
  }

  // Get open tasks
  const tasks = await prisma.task.findMany({
    where: {
      status: TaskStatus.OPEN,
      assignedVolunteerId: null,
    },
    select: {
      id: true,
      title: true,
      requiredSkills: true,
      latitude: true,
      longitude: true,
      urgency: true,
      estimatedHours: true,
    },
    orderBy: { urgency: 'desc' },
  });

  const volunteerCandidate = toVolunteerCandidate(volunteer);

  // Score all tasks
  const results = tasks.map((task) => {
    const taskReqs = toTaskRequirements(task);
    const match = calculateMatchScore(volunteerCandidate, taskReqs);
    return {
      task: taskReqs,
      score: match.score,
      distanceKm: match.distanceKm,
    };
  });

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

/**
 * Detect volunteers at risk of burnout
 */
export async function detectBurnoutRisks(): Promise<{
  critical: VolunteerCandidate[];
  warning: VolunteerCandidate[];
}> {
  const volunteers = await prisma.volunteer.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      skills: true,
      currentLat: true,
      currentLng: true,
      isActive: true,
      burnoutScore: true,
      language: true,
    },
    orderBy: { burnoutScore: 'desc' },
  });

  const candidates = volunteers.map(toVolunteerCandidate);

  const critical = candidates.filter(
    (v) => v.burnoutScore >= BURNOUT_CRITICAL_THRESHOLD
  );
  
  const warning = candidates.filter(
    (v) => v.burnoutScore >= BURNOUT_WARNING_THRESHOLD && v.burnoutScore < BURNOUT_CRITICAL_THRESHOLD
  );

  return { critical, warning };
}

/**
 * Auto-assign best volunteer to a task
 */
export async function autoAssignTask(taskId: string): Promise<MatchResult | null> {
  const matches = await findMatchesForTask(taskId, 1);
  
  if (matches.length === 0 || matches[0].score < 30) {
    return null; // No suitable match or score too low
  }

  const bestMatch = matches[0];

  // Skip if volunteer has critical warnings
  if (bestMatch.warnings.some(w => w.includes('Critical burnout'))) {
    return null;
  }

  // Assign the task
  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: {
        assignedVolunteerId: bestMatch.volunteer.id,
        assignedAt: new Date(),
        status: TaskStatus.ASSIGNED,
      },
    });
  });

  return bestMatch;
}
