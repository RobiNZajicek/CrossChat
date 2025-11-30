import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { StreamDashboard } from "@/components/stream-dashboard";

export default function DashboardPage() {
  const session = cookies().get("streamer_session");
  
  if (!session) {
    redirect("/login");
  }

  const user = JSON.parse(session.value);

  return (
    <div className="min-h-screen bg-black p-4 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Stream Dashboard</h1>
            <p className="text-white/50">Welcome back, <span className="text-indigo-400">{user.username}</span></p>
          </div>
          <form action="/api/auth/logout" method="POST">
             <button className="text-sm text-red-400 hover:text-red-300 transition">Logout</button>
          </form>
        </header>
        <StreamDashboard streamerId={user.id} />
      </div>
    </div>
  );
}
