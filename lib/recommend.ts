import { Movie, MOCK_MOVIES } from './mockMovies';
import { Group, Preference, Member } from './db/models';
import { fetchTrendingMovies } from './tmdb';

export interface RecommendedMovie extends Movie {
  matchScore: number;
  aiExplanation: string;
}

export interface CompatibilityResult {
  member1: string;
  member2: string;
  score: number;
}

/**
 * Calculates compatibility scores between all pairs of group members who have preferences.
 */
export function calculateCompatibility(members: Member[]): CompatibilityResult[] {
  const activeMembers = members.filter((m) => m.preferences);
  if (activeMembers.length < 2) return [];

  const results: CompatibilityResult[] = [];

  for (let i = 0; i < activeMembers.length; i++) {
    for (let j = i + 1; j < activeMembers.length; j++) {
      const m1 = activeMembers[i];
      const m2 = activeMembers[j];
      const p1 = m1.preferences!;
      const p2 = m2.preferences!;

      // 1. Genre Similarity (Jaccard Index)
      const gUnion = new Set([...p1.genres, ...p2.genres]);
      const gIntersect = p1.genres.filter((g) => p2.genres.includes(g));
      const genreSim = gUnion.size > 0 ? gIntersect.length / gUnion.size : 1.0;

      // 2. Mood Similarity
      const moodSim = p1.mood === p2.mood ? 1.0 : 0.0;

      // 3. Runtime Similarity
      let runtimeSim = 0.0;
      if (p1.runtime === p2.runtime) runtimeSim = 1.0;
      else if (p1.runtime === 'any' || p2.runtime === 'any') runtimeSim = 0.6;
      else runtimeSim = 0.1;

      // 4. Language Similarity
      let langSim = 0.0;
      if (p1.language === p2.language) langSim = 1.0;
      else if (p1.language === 'any' || p2.language === 'any') langSim = 0.6;
      else langSim = 0.1;

      // 5. Year Range Similarity (Intersection over Union)
      const min1 = p1.yearRange[0];
      const max1 = p1.yearRange[1];
      const min2 = p2.yearRange[0];
      const max2 = p2.yearRange[1];

      const overlapMin = Math.max(min1, min2);
      const overlapMax = Math.min(max1, max2);
      const unionMin = Math.min(min1, min2);
      const unionMax = Math.max(max1, max2);

      let yearSim = 0.0;
      if (overlapMax >= overlapMin) {
        yearSim = (overlapMax - overlapMin + 1) / (unionMax - unionMin + 1);
      }

      // Weights: Genres (40%), Mood (20%), Runtime (15%), Language (15%), Year (10%)
      const totalScore = (
        genreSim * 0.4 +
        moodSim * 0.2 +
        runtimeSim * 0.15 +
        langSim * 0.15 +
        yearSim * 0.1
      ) * 100;

      results.push({
        member1: m1.name,
        member2: m2.name,
        score: Math.round(totalScore),
      });
    }
  }

  return results;
}

/**
 * Checks if a movie runtime matches a member's runtime preference.
 */
function matchesRuntime(runtime: number, preference: string): boolean {
  if (preference === 'any') return true;
  if (preference === 'under-90') return runtime < 90;
  if (preference === '90-120') return runtime >= 90 && runtime <= 120;
  if (preference === '120+') return runtime > 120;
  return true;
}

/**
 * Checks if a movie language matches a member's language preference.
 */
function matchesLanguage(movieLang: string, prefLang: string): boolean {
  if (prefLang === 'any') return true;
  return movieLang.toLowerCase() === prefLang.toLowerCase();
}

/**
 * Recommends movies for a group based on member preferences.
 */
export async function getRecommendations(group: Group): Promise<RecommendedMovie[]> {
  const activeMembers = group.members.filter((m) => m.preferences);
  if (activeMembers.length === 0) {
    // If no one has submitted preferences, return standard popular mock movies with 100% match
    return MOCK_MOVIES.slice(0, 10).map((m) => ({
      ...m,
      matchScore: 100,
      aiExplanation: "Submit preferences to see personalized match scores!",
    }));
  }

  // 1. Fetch Candidates (Mock movies + Live TMDB if available)
  let candidates = [...MOCK_MOVIES];
  try {
    const tmdbTrending = await fetchTrendingMovies();
    if (tmdbTrending.length > 0) {
      // De-duplicate by title
      const existingTitles = new Set(candidates.map(c => c.title.toLowerCase()));
      for (const movie of tmdbTrending) {
        if (!existingTitles.has(movie.title.toLowerCase())) {
          candidates.push(movie);
        }
      }
    }
  } catch (error) {
    console.error('Failed to merge TMDB candidates', error);
  }

  // 2. Count preference votes
  const totalGenreVotes: Record<string, number> = {};
  const moodVotes: Record<string, number> = {};
  const runtimeVotes: Record<string, number> = {};
  const langVotes: Record<string, number> = {};

  activeMembers.forEach((member) => {
    const p = member.preferences!;
    p.genres.forEach((g) => {
      totalGenreVotes[g] = (totalGenreVotes[g] || 0) + 1;
    });
    moodVotes[p.mood] = (moodVotes[p.mood] || 0) + 1;
    runtimeVotes[p.runtime] = (runtimeVotes[p.runtime] || 0) + 1;
    langVotes[p.language] = (langVotes[p.language] || 0) + 1;
  });

  // Find top mood
  let topMood = '';
  let maxMoodVotes = 0;
  Object.entries(moodVotes).forEach(([mood, count]) => {
    if (count > maxMoodVotes) {
      maxMoodVotes = count;
      topMood = mood;
    }
  });

  const memberCount = activeMembers.length;

  // 3. Score each candidate
  const scoredMovies: RecommendedMovie[] = candidates.map((movie) => {
    let genreScore = 0; // max 40
    let moodScore = 0; // max 20
    let runtimeScore = 0; // max 15
    let languageScore = 0; // max 15
    let yearScore = 0; // max 10

    const matchedGenres: string[] = [];
    const genreMatchMembers: string[] = [];
    const moodMatchMembers: string[] = [];
    const runtimeMatchMembers: string[] = [];
    const languageMatchMembers: string[] = [];
    const yearMatchMembers: string[] = [];

    activeMembers.forEach((member) => {
      const p = member.preferences!;
      
      // Genre Check (at least one overlapping genre)
      const overlaps = movie.genres.filter((g) => p.genres.includes(g));
      if (overlaps.length > 0) {
        genreMatchMembers.push(member.name);
        overlaps.forEach((g) => {
          if (!matchedGenres.includes(g)) {
            matchedGenres.push(g);
          }
        });
      }

      // Mood Check
      if (movie.mood.toLowerCase() === p.mood.toLowerCase()) {
        moodMatchMembers.push(member.name);
      }

      // Runtime Check
      if (matchesRuntime(movie.runtime, p.runtime)) {
        runtimeMatchMembers.push(member.name);
      }

      // Language Check
      if (matchesLanguage(movie.language, p.language)) {
        languageMatchMembers.push(member.name);
      }

      // Year Check
      if (movie.year >= p.yearRange[0] && movie.year <= p.yearRange[1]) {
        yearMatchMembers.push(member.name);
      }
    });

    // Compute sub-scores normalized by group member count
    genreScore = (genreMatchMembers.length / memberCount) * 40;
    
    // For mood: if matches the group's overall top mood, boost, or if matches individual member's moods
    if (movie.mood.toLowerCase() === topMood.toLowerCase()) {
      moodScore = 20;
    } else {
      moodScore = (moodMatchMembers.length / memberCount) * 15;
    }

    runtimeScore = (runtimeMatchMembers.length / memberCount) * 15;
    languageScore = (languageMatchMembers.length / memberCount) * 15;
    yearScore = (yearMatchMembers.length / memberCount) * 10;

    const totalScore = Math.min(100, Math.round(genreScore + moodScore + runtimeScore + languageScore + yearScore));

    // Construct AI Explanation
    const bulletPoints: string[] = [];
    if (genreMatchMembers.length > 0) {
      const membersText = genreMatchMembers.length === memberCount ? "everyone" : genreMatchMembers.join(', ');
      bulletPoints.push(`🍿 Matches **${matchedGenres.join(', ')}** genres selected by **${membersText}**.`);
    }
    if (moodMatchMembers.length > 0) {
      bulletPoints.push(`🎭 Matches the **${movie.mood}** mood for **${moodMatchMembers.join(', ')}**.`);
    } else if (movie.mood.toLowerCase() === topMood.toLowerCase()) {
      bulletPoints.push(`🎭 Fits the group's top chosen mood: **${movie.mood}**.`);
    }
    if (runtimeMatchMembers.length > 0) {
      bulletPoints.push(`⏱️ Runtime of **${movie.runtime}m** fits preference for **${runtimeMatchMembers.join(', ')}**.`);
    }
    if (languageMatchMembers.length > 0) {
      bulletPoints.push(`🌐 In **${movie.language}**, matching language requirements for **${languageMatchMembers.join(', ')}**.`);
    }
    if (yearMatchMembers.length > 0) {
      bulletPoints.push(`📅 Released in **${movie.year}**, which falls in the year range for **${yearMatchMembers.join(', ')}**.`);
    }

    const aiExplanation = `We recommend **${movie.title}** because:\n\n` + 
      bulletPoints.map(bp => `• ${bp}`).join('\n');

    return {
      ...movie,
      matchScore: totalScore,
      aiExplanation,
    };
  });

  // Sort by match score (highest first) and tie-break on rating/popularity
  return scoredMovies.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return b.rating - a.rating; // secondary sort by Rating
  });
}
