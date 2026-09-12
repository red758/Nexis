export default function AuthBrand() {
  return (
    <>
      <div className="flex items-center justify-center">
        <svg className="w-9 h-15 text-white-900 fill-current" viewBox="0 0 320 400">
          <path className="logo-path" d="M160 20 L270 380 L220 380 L160 160 L100 380 L50 380 L160 20 Z" />
          <path className="logo-path" d="M 30 140 C 120 120, 180 140, 240 180 C 300 220, 320 280, 280 340 C 240 400, 180 360, 190 320 C 200 280, 260 260, 280 180 C 300 100, 150 80, 30 140 Z" />
        </svg>
      </div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Nexis Workspace</h2>
        <p className="text-slate-500 mt-2 text-sm">Enterprise team collaboration</p>
      </div>
    </>
  );
}
