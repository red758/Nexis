export default function Navbar({ currentUser, onLogout }) {
  return (
    <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-3">
        
        <div className="h-10 w-9 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-lg"> 
          <svg className="w-9 h-10 text-white-900 fill-current" viewBox="0 0 320 400">
            <path className="logo-path" d="M160 20 L270 380 L220 380 L160 160 L100 380 L50 380 L160 20 Z" />
            <path className="logo-path" d="M 30 140 C 120 120, 180 140, 240 180 C 300 220, 320 280, 280 340 C 240 400, 180 360, 190 320 C 200 280, 260 260, 280 180 C 300 100, 150 80, 30 140 Z" />
          </svg>
        </div>
        
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
