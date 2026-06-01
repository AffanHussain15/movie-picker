import { NextResponse } from 'next/server';
import { getGroupById } from '../../../../lib/db/dbHelper';
import { getRecommendations, calculateCompatibility } from '../../../../lib/recommend';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const group = await getGroupById(id);

    if (!group) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    // Recalculate recommendations & compatibility dynamically based on the current group state
    const recommendations = await getRecommendations(group);
    const compatibility = calculateCompatibility(group.members);

    return NextResponse.json({
      success: true,
      group,
      recommendations,
      compatibility,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
