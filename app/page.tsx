"use client";

import { useState } from "react";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import FooterBar from "@/components/FooterBar";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [mode, setMode] = useState<"login" | "register" | "recover">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // 🧠 Manejo de login/registro/recuperación
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          setMessage("❌ Passwords do not match");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          setMessage(data.error || "Registration failed ❌");
          setLoading(false);
          return;
        }

        setMessage("🎉 Account created successfully! You can now log in.");
        setMode("login");
        setLoading(false);
        return;
      }

      if (mode === "recover") {
        setMessage(`🔑 Password recovery link sent to ${email}`);
        setLoading(false);
        return;
      }

      if (mode === "login") {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          setMessage("❌ Invalid email or password");
        } else {
          setMessage("✅ Login successful! Redirecting...");
          router.push("/dashboard");
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <Head>
        <title>Wanderwise | Plan Smart. Travel Wiser.</title>
        <meta
          name="description"
          content="Wanderwise is your intelligent travel planner. Create, organize, and enjoy your trips — itineraries, budgets, checklists, and more — all in one place."
        />
      </Head>

      <main className="flex flex-col min-h-screen bg-gradient-to-b from-[#DCC9A3] to-[#fffaf3] text-[#0c454a]">
        {/* 🏞️ HERO + STORYTELLING */}
        <section className="flex flex-col items-center justify-center flex-grow text-center px-6 py-16 md:px-20">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Plan Smart. Travel Wiser. ✈️
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mb-8">
            Welcome to <strong>Wanderwise</strong> — your smart travel companion that helps you
            plan unforgettable adventures with ease. Whether you’re organizing a solo escape or a group
            trip, Wanderwise takes care of every detail.
          </p>

          {/* Storytelling estilo guía */}
          <div className="max-w-3xl text-left bg-white/70 p-6 rounded-2xl shadow-lg mb-12">
            <h2 className="text-2xl font-semibold mb-4">🧭 Your Journey with Wanderwise</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-800">
              <li>Start by creating your travel profile and saving your dream destinations.</li>
              <li>Plan your itinerary and sync reservations effortlessly.</li>
              <li>Collaborate with friends — track expenses, share tasks, and stay organized.</li>
              <li>Enjoy peace of mind with real-time trip updates and checklist reminders.</li>
            </ol>
          </div>

          {/* 🔐 Login / Register / Recover */}
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-3xl font-bold text-center mb-6 text-[#0c454a]">
              {mode === "login"
                ? "🌍 Login to Wanderwise"
                : mode === "register"
                ? "🧭 Create Your Account"
                : "🔒 Recover Password"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
                required
              />

              {mode !== "recover" && (
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  required
                />
              )}

              {mode === "register" && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  required
                />
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0c454a] text-white py-2 rounded-lg hover:bg-[#13636a] transition"
              >
                {loading
                  ? "Processing..."
                  : mode === "login"
                  ? "Login"
                  : mode === "register"
                  ? "Create Account"
                  : "Send Recovery Email"}
              </button>
            </form>

            {message && (
              <p className="text-center text-sm mt-4 text-[#0c454a] font-medium">{message}</p>
            )}

            {/* Links de cambio de modo */}
            <div className="mt-6 text-center text-sm text-gray-700 space-y-2">
              {mode === "login" && (
                <>
                  <p>
                    Don’t have an account?{" "}
                    <button
                      onClick={() => setMode("register")}
                      className="text-[#0c454a] font-semibold hover:text-[#13636a]"
                    >
                      Sign up
                    </button>
                  </p>
                  <p>
                    Forgot password?{" "}
                    <button
                      onClick={() => setMode("recover")}
                      className="text-[#0c454a] font-semibold hover:text-[#13636a]"
                    >
                      Recover here
                    </button>
                  </p>
                </>
              )}
              {mode === "register" && (
                <p>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-[#0c454a] font-semibold hover:text-[#13636a]"
                  >
                    Login
                  </button>
                </p>
              )}
              {mode === "recover" && (
                <p>
                  Remembered your password?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-[#0c454a] font-semibold hover:text-[#13636a]"
                  >
                    Back to login
                  </button>
                </p>
              )}
            </div>
          </div>
        </section>

              
      </main>
    </>
  );
}