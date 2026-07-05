"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      if (error) {
        console.error("OAuth error:", error);
        router.push("/claim?error=auth_failed");
        return;
      }

      if (!code || !state) {
        router.push("/claim?error=missing_params");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/auth/twitter/callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code, state }),
        });

        if (res.ok) {
          router.push("/claim");
        } else {
          const data = await res.json();
          console.error("Callback error:", data);
          router.push("/claim?error=callback_failed");
        }
      } catch (err) {
        console.error("Callback error:", err);
        router.push("/claim?error=network_error");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-payx-primary animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Completing sign in...</p>
      </div>
    </main>
  );
}

export default function TwitterCallbackPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-payx-primary animate-spin" />
      </main>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
