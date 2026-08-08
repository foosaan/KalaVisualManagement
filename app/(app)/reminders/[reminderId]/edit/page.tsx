import { redirect } from "next/navigation";

type ReminderEditRedirectPageProps = {
  params: Promise<{
    reminderId: string;
  }>;
};

export default async function ReminderEditRedirectPage({ params }: ReminderEditRedirectPageProps) {
  await params;
  redirect("/reminders");
}
