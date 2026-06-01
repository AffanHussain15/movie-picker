import { NextResponse } from 'next/server';
import { getGroupById, saveGroupSession } from '../../../../../lib/db/dbHelper';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { memberId, preferences } = body;

    if (!memberId || !preferences) {
      return NextResponse.json(
        { success: false, error: 'Missing memberId or preferences' },
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

    // Save preferences
    group.members[memberIndex].preferences = {
      genres: preferences.genres || [],
      mood: preferences.mood || '',
      runtime: preferences.runtime || 'any',
      language: preferences.language || 'any',
      yearRange: preferences.yearRange || [1980, 2026],
    };

    await saveGroupSession(group);

    return NextResponse.json({ success: true, group });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
