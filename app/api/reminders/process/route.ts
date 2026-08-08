import { NextResponse } from "next/server";

import { sendDueReminders } from "@/lib/services/reminders";

export async function POST(request: Request) {
  const expectedSecret = process.env.REMINDER_CRON_SECRET;
  const providedSecret = request.headers.get("x-reminder-secret");

  if (expectedSecret && providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 20;

  try {
    const result = await sendDueReminders(Number.isFinite(limit) ? limit : 20);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Reminder processing failed."
      },
      { status: 500 }
    );
  }
}
