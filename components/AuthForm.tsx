"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (isRegistering) {
      // Registro de usuario nuevo
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        setMessage("User created successfully! You can now log in.");
        setIsRegistering(false);
      } else {
        const data = await res.json();
        setMessage(data.error || "Error creating user");
      }
    } else {
      // Login normal
      const result = await signIn("credentials", {
        redirect: true,
        email,
        password,
        callbackUrl: "/dashboard",
      });

      if (result?.error) setMessage("Invalid email or password.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border p-2 rounded-lg w-full"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border p-2 rounded-lg w-full"
      />
      <button
        type="submit"
        className="bg-[#0c454a] text-white py-2 rounded-lg hover:bg-[#13636a] transition"
      >
        {isRegistering ? "Create Account" : "Login"}
      </button>
      <p
        className="text-center text-sm text-blue-600 cursor-pointer hover:underline"
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering ? "Already have an account? Login" : "New here? Create account"}
      </p>

      {message && <p className="text-center text-red-500">{message}</p>}
    </form>
  );
}