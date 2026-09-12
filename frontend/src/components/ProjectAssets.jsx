import RoleGuard from './RoleGuard';

export default function ProjectAssets() {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Project Assets</h3>

        {/* Upload area — only visible to team members and admin */}
        <RoleGuard allow={['admin', 'developer']}>
          <div className="mb-6 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer transition-colors">
            <p className="text-sm font-medium text-slate-700">Click to upload docs</p>
            <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (Max 10MB)</p>
          </div>
        </RoleGuard>

        {/* File list — everyone can see and download */}
        <ul className="space-y-3">
          <li className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg group">
            <div className="flex items-center gap-3">
              <span>Docs</span>
              <div>
                <p className="text-sm font-medium text-slate-800">system_architecture.pdf</p>
                <p className="text-xs text-slate-500">2.4 MB • Uploaded by Admin</p>
              </div>
            </div>
            <button className="text-blue-600 text-sm font-medium hover:underline">Download</button>
          </li>
          <li className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg group">
            <div className="flex items-center gap-3">
              <span className="text-xl">photo</span>
              <div>
                <p className="text-sm font-medium text-slate-800">figma_mockup_ve.png</p>
                <p className="text-sm font-medium text-slate-500">1.1 MB • Uploaded by Admin</p>
              </div>
            </div>
            <button className="text-blue-600 text-sm font-medium hover:underline">Download</button>
          </li>
        </ul>
      </div>
    </div>
  );
}
