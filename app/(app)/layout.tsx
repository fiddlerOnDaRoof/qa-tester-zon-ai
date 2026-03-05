import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <nav className="border-b border-gray-200 bg-white px-6 py-3 flex items-center gap-6">
        <span className="font-bold text-blue-700 text-lg">QA Tester Zon AI</span>
        <Link href="/home" className="text-sm text-gray-600 hover:text-blue-600">
          Home
        </Link>
        <Link href="/projects" className="text-sm text-gray-600 hover:text-blue-600">
          Projects
        </Link>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}
