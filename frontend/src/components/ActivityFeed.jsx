export default function ActivityFeed({ notifications }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="bg-slate-50 border-b border-slate-200 p-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
          </span>
          Activity Feed
        </h3>
      </div>
      <div className="p-4 h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-slate-400 text-xs text-center mt-10">No recent activity.</p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((note, index) => (
              <li key={index} className="bg-white border border-slate-200 border-l-2 border-l-slate-900 p-3 rounded-md shadow-sm text-xs text-slate-700">
                {note}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
