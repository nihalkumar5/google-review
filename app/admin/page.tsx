import { AdminDashboard } from "@/components/admin-dashboard";
import { listBusinesses } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const businesses = await listBusinesses();

  return <AdminDashboard initialBusinesses={businesses} />;
}
