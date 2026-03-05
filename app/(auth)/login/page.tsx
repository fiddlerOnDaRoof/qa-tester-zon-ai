export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">QA Tester Zon AI</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to start automated QA testing
          </p>
        </div>
        {/* Auth form — wired in feature build */}
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
          Authentication UI — coming in feature build
        </div>
      </div>
    </div>
  );
}
