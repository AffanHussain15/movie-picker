import { NextResponse } from 'next/server';
import { fetchTrendingMovies, searchMovies } from '../../../lib/tmdb';
import { MOCK_MOVIES } from '../../../lib/mockMovies';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const apiKey = request.headers.get('x-tmdb-key') || '';

    let movies = [];
    if (query) {
      movies = await searchMovies(query, apiKey);
      if (movies.length === 0) {
        // Fallback: search local mock movies
        movies = MOCK_MOVIES.filter((m) =>
          m.title.toLowerCase().includes(query.toLowerCase()) ||
          m.genres.some((g) => g.toLowerCase().includes(query.toLowerCase()))
        );
      }
    } else {
      movies = await fetchTrendingMovies(apiKey);
      if (movies.length === 0) {
        // Fallback: return our popular mock movies
        movies = MOCK_MOVIES;
      }
    }

    return NextResponse.json({ success: true, movies });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
