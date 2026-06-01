import { Movie } from './mockMovies';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// TMDB Genre Map (TMDB returns genre IDs, we map them to our string names)
const GENRE_MAP: Record<number, string> = {
  28: "Action",
  35: "Comedy",
  878: "Sci-Fi",
  53: "Thriller",
  12: "Adventure",
  18: "Drama",
  27: "Horror",
  1074: "Romance",
  9648: "Mystery",
  16: "Animation",
  10751: "Family",
  36: "History",
  99: "Documentary",
};

// Map of our custom moods to TMDB keywords or queries (approximate matching)
const MOOD_GENRE_BOOST: Record<string, string[]> = {
  "Funny": ["Comedy"],
  "Exciting": ["Action", "Adventure", "Thriller"],
  "Relaxing": ["Drama", "Animation"],
  "Emotional": ["Drama", "Romance"],
  "Mind-Bending": ["Sci-Fi", "Mystery"],
  "Dark": ["Horror", "Thriller"],
  "Feel Good": ["Comedy", "Family"],
  "Family Friendly": ["Family", "Animation"],
};

export async function fetchTrendingMovies(apiKey?: string): Promise<Movie[]> {
  const activeKey = apiKey || TMDB_API_KEY;
  if (!activeKey) {
    return [];
  }

  try {
    const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${activeKey}`);
    if (!res.ok) throw new Error('TMDB request failed');
    const data = await res.json();
    
    return mapTmdbResults(data.results);
  } catch (error) {
    console.error('Error fetching trending from TMDB', error);
    return [];
  }
}

export async function searchMovies(query: string, apiKey?: string): Promise<Movie[]> {
  const activeKey = apiKey || TMDB_API_KEY;
  if (!activeKey || !query) {
    return [];
  }

  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${activeKey}&query=${encodeURIComponent(query)}`
    );
    if (!res.ok) throw new Error('TMDB search request failed');
    const data = await res.json();
    return mapTmdbResults(data.results);
  } catch (error) {
    console.error('Error searching TMDB', error);
    return [];
  }
}

export async function fetchMovieDetails(movieId: string, apiKey?: string): Promise<Movie | null> {
  const activeKey = apiKey || TMDB_API_KEY;
  if (!activeKey) return null;

  try {
    const detailRes = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${activeKey}&append_to_response=videos`);
    if (!detailRes.ok) return null;
    const details = await detailRes.json();

    const video = details.videos?.results?.find(
      (v: { site: string; type: string; key: string }) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    );

    return {
      id: String(details.id),
      title: details.title,
      year: new Date(details.release_date).getFullYear() || 2000,
      genres: details.genres.map((g: { name: string }) => g.name),
      runtime: details.runtime || 100,
      rating: Number(details.vote_average.toFixed(1)),
      language: details.original_language === 'en' ? 'English' : details.original_language,
      mood: 'Exciting', // Fallback mood
      poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=60',
      trailer: video ? video.key : 'dQw4w9WgXcQ',
      overview: details.overview,
    };
  } catch (error) {
    console.error(`Error fetching movie details for ${movieId}`, error);
    return null;
  }
}

// Internal mapper
function mapTmdbResults(results: Array<Record<string, unknown>>): Movie[] {
  if (!results) return [];

  return results.slice(0, 20).map((movie: Record<string, unknown>) => {
    const genreIds = (movie.genre_ids as number[]) || [];
    const mappedGenres = genreIds.map((id) => GENRE_MAP[id] || 'Other').filter(g => g !== 'Other');
    
    // Deduce language
    const origLang = movie.original_language as string;
    let language = 'English';
    if (origLang === 'hi') language = 'Hindi';
    else if (origLang === 'ur') language = 'Urdu';
    else if (origLang === 'ko') language = 'Korean';
    else if (origLang === 'ja') language = 'Japanese';

    // Deduce mood from genres
    let mood = 'Exciting';
    for (const [m, gList] of Object.entries(MOOD_GENRE_BOOST)) {
      if (mappedGenres.some(mg => gList.includes(mg))) {
        mood = m;
        break;
      }
    }

    const releaseDate = (movie.release_date as string) || '';
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 2024;

    return {
      id: String(movie.id),
      title: (movie.title as string) || (movie.name as string) || 'Untitled Movie',
      year,
      genres: mappedGenres.length > 0 ? mappedGenres : ['Drama'],
      runtime: 120, // Default runtime since list doesn't include it; details endpoint needed for exact runtime
      rating: typeof movie.vote_average === 'number' ? Number(movie.vote_average.toFixed(1)) : 7.0,
      language,
      mood,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=60',
      trailer: 'dQw4w9WgXcQ', // Requires detailed fetch to get video key, will load when requested
      overview: (movie.overview as string) || '',
    };
  });
}
