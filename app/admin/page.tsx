import { AdminDashboard } from "@/components/admin-dashboard";
import { listBusinesses, listPayments } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [businesses, payments] = await Promise.all([
    listBusinesses(),
    listPayments()
  ]);

  return <AdminDashboard initialBusinesses={businesses} initialPayments={payments} />;
}
