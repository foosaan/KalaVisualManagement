import { Camera, CircleDollarSign, Clock3, Users2 } from "lucide-react";

import { LoginForm } from "@/components/forms/login-form";
import { Card, CardContent } from "@/components/ui/card";

const highlights = [
  {
    icon: Clock3,
    title: "Auto reminders from shoot schedule",
    description: "H-7, H-3, H-1, and same-day reminders are generated for every job."
  },
  {
    icon: Users2,
    title: "Client, FG, crew in one workflow",
    description: "Attach people directly to each shoot and decide who gets reminders."
  },
  {
    icon: CircleDollarSign,
    title: "Know real net profit",
    description: "Track DP, final payments, job costs, and profit without spreadsheets."
  }
] as const;

export default function RegisterPage() {
  return (
    <main className="page-shell flex min-h-screen items-center py-10">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between rounded-[2rem] border border-white/70 bg-slate-950/90 p-8 text-white shadow-soft">
          <div className="space-y-8">
            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80">
              <Camera className="h-4 w-4" />
              KalaVisual Management
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white md:text-5xl">
                Build a calmer daily workflow for your photography business.
              </h1>
              <p className="max-w-xl text-base text-white/70">
                Create jobs, track client payments, manage crew, and keep reminders running automatically.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <Card className="border border-white/10 bg-white/5 text-white shadow-none" key={item.title}>
                  <CardContent className="space-y-3 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-base font-semibold text-white">{item.title}</h2>
                      <p className="text-sm text-white/65">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
        <section className="flex items-center">
          <LoginForm initialMode="signup" />
        </section>
      </div>
    </main>
  );
}
