import AuthForm from "@/components/AuthForm";

export default function HomePage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-[#DCC9A3]">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#0c454a]">
          🌍 Wanderwise Login
        </h1>
        <AuthForm />
      </div>
    </main>
  );
}