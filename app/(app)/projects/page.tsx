export default function ProjectsPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Project Testing</h1>
          <p className="text-sm text-gray-500">
            Add a URL, run automated tests, and review findings.
          </p>
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + New Project
        </button>
      </div>
      {/* Project list + detail — wired in feature build */}
      <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-400">
        Project list &amp; testing interface — coming in feature build
      </div>
    </div>
  );
}
