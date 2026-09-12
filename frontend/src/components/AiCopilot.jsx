import RoleGuard from './RoleGuard';

// AiCopilot: AI task generation panel.
// Clients cannot use AI planning — they see a message instead.
// Only admin and developer roles get the actual prompt input.

export default function AiCopilot({ aiPrompt, setAiPrompt, isAiLoading, onSubmit }) {
  return (
    <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm">
      <h3 className="text-xl font-bold mb-1 text-slate-900 flex items-center gap-2">✦ Nexis AI Copilot</h3>

      <RoleGuard
        allow={['admin', 'developer']}
        fallback={
          <p className="text-slate-500 text-sm italic mt-2">AI Planning is managed by your development team.</p>
        }
      >
        <p className="text-slate-500 mb-6 text-sm">Type a goal, and our AI will break it down into technical tasks instantly.</p>
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. Build a secure authentication system..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            required
            className="flex-1 px-4 py-2 rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            disabled={isAiLoading}
          />
          <button
            type="submit"
            disabled={isAiLoading}
            className="px-6 py-2 bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {isAiLoading ? 'Planning...' : 'Auto-Plan'}
          </button>
        </form>
      </RoleGuard>
    </div>
  );
}
