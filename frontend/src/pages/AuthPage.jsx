import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AuthBrand from '../components/AuthBrand';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

export default function AuthPage() {
  const { login } = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ userName: '', email: '', password: '', orgName: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', loginData);
      login(response.data.user, response.data.token);
    } catch (error) {
      alert(error.response?.data?.error || 'Invalid email or password');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users/register', registerData);
      alert('Registration successful');
      setIsLoginMode(true);
    } catch (error) {
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">

        <AuthBrand />

        <div className="flex bg-slate-100 p-1 rounded-lg mb-8">
          <button
            onClick={() => setIsLoginMode(true)}
            className={`flex-1 py-2 text-sm font-semibold rounded-md tranistino-all ${isLoginMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLoginMode(false)}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${!isLoginMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Register
          </button>
        </div>

        {isLoginMode
          ? <LoginForm loginData={loginData} setLoginData={setLoginData} onSubmit={handleLogin} />
          : <RegisterForm registerData={registerData} setRegisterData={setRegisterData} onSubmit={handleRegister} />
        }

      </div>
    </div>
  );
}
