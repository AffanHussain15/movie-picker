import { NextResponse } from 'next/server';
import { saveGroupSession, getAllGroups } from '../../../lib/db/dbHelper';
import { Group, Member } from '../../../lib/db/models';

export async function GET() {
  try {
    const groups = await getAllGroups();
    return NextResponse.json({ success: true, groups });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, memberCount, memberNames } = body;

    if (!name || !memberCount || !memberNames || !Array.isArray(memberNames)) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: name, memberCount, memberNames' },
        { status: 400 }
      );
    }

    // Generate unique Group ID
    const groupId = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Map names to member objects
    const members: Member[] = memberNames.map((mName: string, index: number) => ({
      id: `mem-${index + 1}-${Math.random().toString(36).substring(2, 6)}`,
      name: mName.trim(),
      swipes: {},
    }));

    const newGroup: Group = {
      id: groupId,
      name: name.trim(),
      memberCount: Number(memberCount),
      members,
      watchlist: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveGroupSession(newGroup);

    return NextResponse.json({ success: true, group: newGroup });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
