import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function HomePage() {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle clicking on an organization card
  const handleEnterOrganization = (orgId) => {
    // Save this as the "Active" org so our Axios Interceptor (Bouncer) knows where we are!
    localStorage.setItem('nexis_active_org', orgId);
    navigate(`/org/${orgId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* MINIMALIST HEADER */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-lg">N</div>
          <h2 className="text-lg font-bold text-slate-900">Nexis Global</h2>
        </div>
        <button onClick={logout} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-md transition-colors">
          Logout
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">
        <div className="text-center w-full max-w-2xl mx-auto mb-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Welcome, {currentUser.name}</h1>
          <p className="text-slate-500 text-sm mb-8">Select an organization to view its projects.</p>
        </div>

        {/* ORGANIZATIONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentUser.memberships.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-4xl mb-4 block">📭</span>
              <h3 className="text-lg font-bold">No Organizations</h3>
              <p className="text-slate-500 text-sm">You haven't joined any workspaces yet.</p>
            </div>
          ) : (
            currentUser.memberships.map((membership) => (
              <div 
                key={membership.organization._id} 
                onClick={() => handleEnterOrganization(membership.organization._id)} 
                className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between h-[200px] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-slate-300 group-hover:from-blue-500 group-hover:to-indigo-500 transition-all duration-300"></div>
                <div>
                  <div className="flex justify-between items-start mb-4 ">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1 line-clamp-2">
                      {membership.organization.name}
                    </h3>
                    <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-sm font-bold">
                      ➜
                    </span>
                  </div>
                  <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-md border border-slate-200">
                    Role: {membership.role}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}