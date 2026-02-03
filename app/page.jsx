import Link from "next/link";
import { Card, SectionTitle } from "../components/ui";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <SectionTitle
        title="Start Your Job Search With Confidence"
        subtitle="Professional support. Targeted applications. Real results."
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-tr from-sky-500/20 via-indigo-400/10 to-emerald-400/10" />
          <div className="relative">
            <div className="badge border-sky-300/40 text-sky-200 bg-sky-400/10">
              Cloud UI • Smooth gestures
            </div>

            <h2 className="mt-3 text-white text-xl font-extrabold">
              HOPE_IRL Career Consultancy
            </h2>

            <p className="mt-2 text-white/70">
              Choose a service, share your CV or LinkedIn profile, and submit your request through the portal.
              Our team will review your details and contact you with the next steps.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="badge border-white/15 text-white/70 bg-white/5">ATS Resume</span>
              <span className="badge border-white/15 text-white/70 bg-white/5">LinkedIn Optimisation</span>
              <span className="badge border-white/15 text-white/70 bg-white/5">Job Applications</span>
              <span className="badge border-white/15 text-white/70 bg-white/5">Support</span>
            </div>

            <div className="mt-6 flex gap-3">
              <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
              <Link href="/auth/signup" className="btn-secondary">Create Account</Link>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-white font-extrabold text-lg">Contact</h3>
          <p className="text-white/70 mt-2">
            WhatsApp and call support are available during 24/7 hours.
          </p>

          <div className="mt-4 space-y-2 text-white">
            <div className="glass rounded-xl p-4">
              <div className="text-white/70 text-sm">WhatsApp</div>
              <div className="text-xl font-extrabold">+353 874 786 869</div>
            </div>

            <div className="glass rounded-xl p-4">
              <div className="text-white/70 text-sm">Call & Watsup</div>
              <div className="text-xl font-extrabold">+353 83 168 3090</div>
            </div>
          </div>

          <div className="mt-5">
            <Link
              href={
                process.env.NEXT_PUBLIC_WHATSAPP_LINK ||
                "https://api.whatsapp.com/send?phone=353000000000&text=Hi%20HOPE_IRL%20I%20need%20help"
              }
              className="btn-primary w-full"
              target="_blank"
            >
              Open WhatsApp Support
            </Link>
            <p className="text-white/50 text-xs mt-2">
              Call us or do a whatsapp message we will reach you out.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
