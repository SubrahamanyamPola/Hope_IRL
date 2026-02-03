import { requireUser } from "../../lib/requireAuth";
import { Card, SectionTitle } from "../../components/ui";

export default async function AccountPage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <SectionTitle title="Account & Privacy" subtitle="Download your data or request account deletion (GDPR-friendly)." />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-white font-extrabold text-lg">Download my data</h3>
          <p className="text-white/70 mt-2">
            Exports your profile, orders, services, and resume history as JSON.
          </p>
          <a className="btn-primary w-full mt-4" href="/api/gdpr/export" target="_blank">
            Download JSON
          </a>
        </Card>

        <Card>
          <h3 className="text-white font-extrabold text-lg">Request account deletion</h3>
          <p className="text-white/70 mt-2">
            This creates a deletion request for the admin team to process.
          </p>
          <form action="/api/gdpr/delete-request" method="POST" className="mt-4 space-y-3">
            <div>
              <div className="label mb-1">Reason (optional)</div>
              <input className="input" name="reason" placeholder="Tell us why (optional)" />
            </div>
            <button className="btn-secondary w-full" type="submit">
              Request deletion
            </button>
          </form>
          <p className="text-white/50 text-xs mt-2">
            After processing, your account and data can be deleted/removed.
          </p>
        </Card>
      </div>
    </div>
  );
}
