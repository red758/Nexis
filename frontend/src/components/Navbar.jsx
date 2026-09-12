export default function Navbar({ currentUser, onLogout }) {
  return (
    <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-lg">N</div>
        <h2 className="text-lg font-bold text-slate-900">{currentUser.organization.name}</h2>
        <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold uppercase rounded-md border border-slate-200">
          {currentUser.role}
        </span>
      </div>
      <div className="flex items-center gap-6">
        <p className="text-sm font-medium text-slate-600">Welcome, <span className="text-slate-900 font-bold">{currentUser.name}</span></p>
        <button onClick={onLogout} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-md transition-colors">
          Logout
        </button>
      </div>
    </nav>
  );
}
