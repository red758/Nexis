export default function ProjectHealth({ queryType, queryResults, onQueryChange }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900">Project Health</h3>
        <select
          value={queryType}
          onChange={(e) => onQueryChange(e.target.value)}
          className="bg-white border border-slate-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-slate-900 font-medium cursor-pointer"
        >
          <option value="status">Group By Status</option>
          <option value="assignee">Group By Assignee</option>
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {queryResults.map((result, index) => (
          <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-center items-center text-center">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{result._id}</span>
            <strong className="text-2xl font-bold text-slate-900">{result.count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
