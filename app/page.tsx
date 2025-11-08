"use client";

import { useState } from "react";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import FooterBar from "@/components/FooterBar";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";


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
        const res = await fetch("/api/recover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (!res.ok) {
          setMessage(`❌ ${data.error || "Error sending recovery email"}`);
        } else {
          setMessage(`✅ Recovery email sent to ${email}. Check your inbox!`);
        }
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
      <Head>
        <title>WanderWisely | Plan Smarter. Travel Freely.</title>
        <meta
          name="description"
          content="WanderWisely — The minimalist travel planner to design, organize, and live your best trips effortlessly."
        />
      </Head>

    

      <main className="flex flex-col bg-gradient-to-b from-white to-[#f9f9f9] ">
        {/* 🏞️ HERO SECTION */}
        <section className="flex flex-col items-center justify-center flex-grow bg-[#001e42] text-center px-6 py-20 md:px-12">
           <Image
    src="/icon.png"            // o el nombre del archivo real
    alt="WanderWisely logo"
    width={120}
    height={120}
    className="mb-6"
    priority
  />
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
            WanderWisely
          </h1>
          <p className="text-4xl font-bold mb-6 leading-tight text-[#025fd1]">
            Wander Smart. Travel Wisely
          </p>
          <p className="text-lg md:text-xl text-white max-w-2xl mb-10 leading-relaxed">
            The intelligent way to plan your adventures. <br />
            From dream to destination — effortless, organized, and inspiring.
          </p>
</section>
          <section className="flex flex-col items-center justify-center flex-grow text-center px-6 py-20 md:px-12">

          {/* LOGIN / REGISTER / RECOVER CARD */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
            <h2 className="text-2xl font-semibold mb-6 text-center text-[#001e42]">
              {mode === "login"
                ? "Sign in to your account"
                : mode === "register"
                ? "Create your WanderWisely account"
                : "Recover your password"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2  outline-none"
                required
              />

              {mode !== "recover" && (
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 outline-none"
                  required
                />
              )}

              {mode === "register" && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2  outline-none"
                  required
                />
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#001e42] text-white py-2 rounded-lg font-medium hover:bg-[#DCC9A3] transition-all"
              >
                {loading
                  ? "Processing..."
                  : mode === "login"
                  ? "Login"
                  : mode === "register"
                  ? "Sign Up"
                  : "Send Recovery Email"}
              </button>
            </form>

            {message && (
              <p className="text-center text-sm mt-4 text-[#001e42] font-medium">
                {message}
              </p>
            )}

            {/* LINKS DE CAMBIO */}
            <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
              {mode === "login" && (
                <>
                  <p>
                    Don’t have an account?{" "}
                    <button
                      onClick={() => setMode("register")}
                      className="text-[#001e42] font-semibold hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                  <p>
                    Forgot password?{" "}
                    <button
                      onClick={() => setMode("recover")}
                      className="text-[#001e42] font-semibold hover:underline"
                    >
                      Recover it
                    </button>
                  </p>
                </>
              )}
              {mode === "register" && (
                <p>
                  Already registered?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-[#001e42] font-semibold hover:underline"
                  >
                    Log in
                  </button>
                </p>
              )}
              {mode === "recover" && (
                <p>
                  Remembered your password?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-[#001e42] font-semibold hover:underline"
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
