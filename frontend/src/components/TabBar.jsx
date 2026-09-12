const Tabs = ['overview', 'tasks', 'chat', 'documents'];

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="bg-white border-b border-slate-200 px-8 sticky top-17 z-10">
      <div className="flex space-x-8">
        {Tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`py-4 text-sm font-semibold capitalize transition-all border-b-2 ${
              activeTab === tab
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
