import { Camera, CircleDollarSign, Clock3, Users2 } from "lucide-react";

import { LoginForm } from "@/components/forms/login-form";

const features = [
  {
    icon: Clock3,
    title: "Never miss a shoot",
    description: "Upcoming jobs and reminders in one dashboard."
  },
  {
    icon: Users2,
    title: "Connected contacts",
    description: "Clients, FG/model, crew, vendors on every job."
  },
  {
    icon: CircleDollarSign,
    title: "Real profit tracking",
    description: "DP, payments, expenses, and net income."
  }
] as const;

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[hsl(var(--sidebar-bg))] px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_420px]">
        {/* Left — branding */}
        <section className="hidden flex-col justify-between lg:flex">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              <Camera className="h-4 w-4 text-emerald-400" />
              KalaVisual Management
            </div>
            <div className="space-y-4">
              <h1 className="max-w-lg text-4xl font-semibold leading-[1.15] text-white">
                A workspace built for
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> schedule clarity </span>
                and job profit.
              </h1>
              <p className="max-w-md text-base text-white/50">
                Manage freelance photography operations from inquiry to payment closeout.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5" key={feature.title}>
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10">
                    <Icon className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h2 className="text-sm font-semibold text-white/85">{feature.title}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-white/40">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right — form */}
        <section className="flex items-center">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
