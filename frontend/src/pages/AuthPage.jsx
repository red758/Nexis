import {useState, useContext} from 'react';
import axios from 'axios';
import {AuthContext} from '../context/AuthContext';

export default function AuthPage(){
    const {login}=useContext(AuthContext);
    const [isLoginMode, setIsLoginMode]=useState(true);
    const [loginData, setLoginData]=useState({email:'', password:''});
    const [registerData, setRegisterData]=useState({username:'', email:'', password:'', orgName:''});

    const handleLogin= async (e)=>{
        e.preventDefault();
        try{
            const response=await axios.post('http://localhost:5000/api/users/login',loginData);
            login(response.data.user, response.data.token);
        }catch(error){
            alert(error.response?.data?.error || "Invalid email or password");
        }
    };

    const handleRegister= async (e)=>{
        e.preventDefault();
        try{
            await axios.post('http://localhost:5000/api/users/register',registerData);
            alert('Registration successful');
            setIsLoginMode(true);
        }catch(error){
            alert(error.response?.data?.error || 'Registration failed');
        }
    };

    return(
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
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

                <div className="flex bg-slate-100 p-1 rounded-lg mb-8">
                    <button 
                        onClick={()=>setIsLoginMode(true)}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md tranistino-all ${isLoginMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Login
                    </button>
                    <button 
                        onClick={()=>setIsLoginMode(false)}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${!isLoginMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Register
                    </button>
                </div>

                {isLoginMode ? (
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div className="flex flex-col-reverse relative">
                            <input type="email" placeholder="name@company.com" value={loginData.email} onChange={e=>setLoginData({...loginData, email:e.target.value})}
                            required className="peer w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none tranistion-all"/>
                            <label className="block text-sm font-medium text-slate-700 mb-1 transition-all duration-200 peer-focus:text-slate-900">Email Address</label>
                        </div>
                        <div className="flex flex-col-reverse relative">
                            <input type="password" placeholder="••••••••" value={loginData.password} onChange={e=>setLoginData({...loginData, password:e.target.value})} required className="peer w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"/>
                            <label className="block text-sm font-medium text-slate-700 mb-1 transition-all duration-200 peer-focus:text-slate-900">Password</label>
                        </div>
                        <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all">
                            Secure Login
                        </button>
                    </form>
                ):(
                    <form onSubmit={handleRegister} className="flex flex-col gap-4">
                        <input type="text" placeholder="Full Name" value={registerData.userName} onChange={e=>setRegisterData({...registerData, userName:e.target.value})} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                        <input type="email" placeholder="Email" value={registerData.email} onChange={e=>setRegisterData({...registerData, email:e.target.value})} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                        <input type="password" placeholder="Create a Password" value={registerData.password} onChange={e=>setRegisterData({...registerData, password:e.target.value})} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                        <input type="text" placeholder="Organization Name" value={registerData.orgName} onChange={e=>setRegisterData({...registerData, orgName:e.target.value})} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                        <button type="submit" className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg shadow-md transition-all">
                            Create Account
                        </button>
                    </form>
            )}
            </div>
        </div>
    );
}