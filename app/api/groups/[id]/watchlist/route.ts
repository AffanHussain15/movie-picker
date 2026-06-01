import { NextResponse } from 'next/server';
import { getGroupById, saveGroupSession } from '../../../../../lib/db/dbHelper';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { movieId } = body;

    if (!movieId) {
      return NextResponse.json({ success: false, error: 'movieId is required' }, { status: 400 });
    }

    const group = await getGroupById(id);
    if (!group) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    if (!group.watchlist) {
      group.watchlist = [];
    }

    if (!group.watchlist.includes(movieId)) {
      group.watchlist.push(movieId);
      await saveGroupSession(group);
    }

    return NextResponse.json({ success: true, watchlist: group.watchlist });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');

    if (!movieId) {
      return NextResponse.json({ success: false, error: 'movieId is required' }, { status: 400 });
    }

    const group = await getGroupById(id);
    if (!group) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    if (group.watchlist) {
      group.watchlist = group.watchlist.filter((id) => id !== movieId);
      await saveGroupSession(group);
    }

    return NextResponse.json({ success: true, watchlist: group.watchlist });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
