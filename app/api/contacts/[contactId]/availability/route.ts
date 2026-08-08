import { NextRequest, NextResponse } from "next/server";
import { checkContactAvailability } from "@/lib/queries/conflicts";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ contactId: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contactId } = await params;
  const { searchParams } = request.nextUrl;
  const startAt = searchParams.get("startAt");
  const endAt = searchParams.get("endAt");
  const excludeJobId = searchParams.get("excludeJobId") || undefined;

  if (!startAt || !endAt) {
    return NextResponse.json({ error: "startAt and endAt are required" }, { status: 400 });
  }

  const result = await checkContactAvailability(contactId, startAt, endAt, excludeJobId);

  return NextResponse.json(result);
}
