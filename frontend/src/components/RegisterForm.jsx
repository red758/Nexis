export default function RegisterForm({ registerData, setRegisterData, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Full Name"
        value={registerData.userName}
        onChange={(e) => setRegisterData({ ...registerData, userName: e.target.value })}
        required
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all"
      />
      <input
        type="email"
        placeholder="Email"
        value={registerData.email}
        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
        required
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all"
      />
      <input
        type="password"
        placeholder="Create a Password"
        value={registerData.password}
        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
        required
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all"
      />
      <input
        type="text"
        placeholder="Organization Name"
        value={registerData.orgName}
        onChange={(e) => setRegisterData({ ...registerData, orgName: e.target.value })}
        required
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all"
      />
      <button type="submit" className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg shadow-md transition-all">
        Create Account
      </button>
    </form>
  );
}
