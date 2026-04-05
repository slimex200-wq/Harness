"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth-actions";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/landing");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
    >
      Logout
    </button>
  );
}
