import { NextResponse } from 'next/server';
import { getGroupById, saveGroupSession } from '../../../../../lib/db/dbHelper';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { memberId, movieId, vote } = body;

    if (!memberId || !movieId || !vote) {
      return NextResponse.json(
        { success: false, error: 'Missing memberId, movieId, or vote' },
        { status: 400 }
      );
    }

    if (vote !== 'like' && vote !== 'skip') {
      return NextResponse.json(
        { success: false, error: 'Invalid vote. Must be like or skip' },
        { status: 400 }
      );
    }

    const group = await getGroupById(id);
    if (!group) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    // Find member
    const memberIndex = group.members.findIndex((m) => m.id === memberId);
    if (memberIndex === -1) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    // Record swipe
    if (!group.members[memberIndex].swipes) {
      group.members[memberIndex].swipes = {};
    }
    group.members[memberIndex].swipes[movieId] = vote;

    await saveGroupSession(group);

    // Calculate if it's a perfect match
    // A movie is a perfect match if ALL group members have liked it.
    // If some members have not yet swiped on it, it's not a perfect match yet.
    let isPerfectMatch = false;
    if (vote === 'like') {
      isPerfectMatch = group.members.every((m) => m.swipes && m.swipes[movieId] === 'like');
    }

    return NextResponse.json({
      success: true,
      isPerfectMatch,
      group,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
