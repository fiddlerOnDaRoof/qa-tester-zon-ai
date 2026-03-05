interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { projectId } = await params;
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900">Project Detail</h1>
      <p className="text-sm text-gray-500">Project ID: {projectId}</p>
      {/* Detail view — wired in feature build */}
      <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-400">
        Test run details &amp; findings — coming in feature build
      </div>
    </div>
  );
}
