import RoleGuard from './RoleGuard';

// ProjectBrief: displays the project requirements document.
// Only admin and developer can edit. Clients see it as read-only.

export default function ProjectBrief({
  projectBrief,
  setProjectBrief,
  isEditingBrief,
  setIsEditingBrief,
  onSave,
}) {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
      <div className="flex justify-between items-end mb-6 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Project</h3>
          <p className="text-sm text-slate-500 mt-1">Core requirements, scope and technical notes</p>
        </div>

        {/* Only team members can edit the brief */}
        <RoleGuard allow={['admin', 'developer']}>
          <button
            onClick={() => {
              if (isEditingBrief) onSave();
              else setIsEditingBrief(true);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isEditingBrief ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isEditingBrief ? 'Save' : 'Edit'}
          </button>
        </RoleGuard>
      </div>

      {isEditingBrief ? (
        <textarea
          value={projectBrief}
          onChange={(e) => setProjectBrief(e.target.value)}
          className="w-full h-96 p-4 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
          placeholder="Write your project requirements here..."
        />
      ) : (
        <div className="prose max-w-none text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
          {projectBrief}
        </div>
      )}
    </div>
  );
}
