import { NextRequest, NextResponse } from "next/server";
import { detectConflicts } from "@/lib/queries/conflicts";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await params;
  const { searchParams } = request.nextUrl;
  const startAt = searchParams.get("startAt");
  const endAt = searchParams.get("endAt");
  const photographers = searchParams.get("photographers");

  if (!startAt || !endAt) {
    return NextResponse.json({ error: "startAt and endAt are required" }, { status: 400 });
  }

  const photographerIds = photographers ? photographers.split(",").filter(Boolean) : [];
  const conflicts = await detectConflicts(jobId === "new" ? null : jobId, startAt, endAt, photographerIds);

  return NextResponse.json({ conflicts });
}
