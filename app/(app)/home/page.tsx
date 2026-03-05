export default function HomePage() {
  return (
    <div className="flex h-[calc(100vh-53px)] flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-3">
        <h1 className="text-lg font-semibold text-gray-900">Chat with QA Tester AI</h1>
        <p className="text-xs text-gray-500">
          Describe features to test, ask questions, or manage projects through chat.
        </p>
      </div>
      {/* Chat UI — wired in feature build */}
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
        Chat interface — coming in feature build
      </div>
    </div>
  );
}
