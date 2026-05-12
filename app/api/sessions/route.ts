import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const role = body.role as string;
    const respondentName = (body.respondentName || '').toString().trim() || null;

    if (!role) {
      return NextResponse.json({ error: 'role is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('interview_sessions')
      .insert({ role, respondent_name: respondentName, metadata: body.metadata || {} })
      .select('id, role, respondent_name')
      .single();

    if (error) throw error;

    return NextResponse.json({ session: data });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create session' }, { status: 500 });
  }
}
