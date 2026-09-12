export default function LoginForm({ loginData, setLoginData, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col-reverse relative">
        <input
          type="email"
          placeholder="name@company.com"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          required
          className="peer w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none tranistion-all"
        />
        <label className="block text-sm font-medium text-slate-700 mb-1 transition-all duration-200 peer-focus:text-slate-900">
          Email Address
        </label>
      </div>
      <div className="flex flex-col-reverse relative">
        <input
          type="password"
          placeholder="••••••••"
          value={loginData.password}
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          required
          className="peer w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
        <label className="block text-sm font-medium text-slate-700 mb-1 transition-all duration-200 peer-focus:text-slate-900">
          Password
        </label>
      </div>
      <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all">
        Secure Login
      </button>
    </form>
  );
}
