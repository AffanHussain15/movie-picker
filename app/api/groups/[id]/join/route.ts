import { NextResponse } from 'next/server';
import { getGroupById, saveGroupSession } from '../../../../../lib/db/dbHelper';
import { Member } from '../../../../../lib/db/models';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const group = await getGroupById(id);
    if (!group) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    const trimmedName = name.trim();

    // Check if member already exists
    let existingMember = group.members.find(
      (m) => m.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingMember) {
      return NextResponse.json({
        success: true,
        message: 'Reconnected to existing session',
        memberId: existingMember.id,
        group,
      });
    }

    // Check if we have exceeded the group memberCount capacity
    if (group.members.length >= group.memberCount) {
      return NextResponse.json(
        { success: false, error: 'Group is full' },
        { status: 400 }
      );
    }

    // Add new member
    const newMember: Member = {
      id: `mem-${group.members.length + 1}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmedName,
      swipes: {},
    };

    group.members.push(newMember);
    await saveGroupSession(group);

    return NextResponse.json({
      success: true,
      message: 'Joined group successfully',
      memberId: newMember.id,
      group,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
