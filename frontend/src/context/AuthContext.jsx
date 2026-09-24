import {createContext, useState, useEffect} from 'react';
import axios from 'axios';

// Attach JWT token to every outgoing axios request automatically.
// This means we never manually add Authorization headers in individual API calls.
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexis_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const AuthContext=createContext();

export const AuthProvider=({children})=>{
    const [currentUser, setCurrentUser]=useState(null);
    const[loading, setLoading]=useState(true);

    useEffect(()=>{
        const checkLoggedIn=async ()=>{
            const token=localStorage.getItem('nexis_token');
            if(!token){
                setLoading(false);
                return;
            }
            try{
                const response=await axios.get('http://localhost:5000/api/users/me');
                setCurrentUser(response.data);
            }catch(error){
                console.error("token is invalid or expired");
                localStorage.removeItem('nexis_token');
            }finally{
                setLoading(false);
            }
        };
        checkLoggedIn();
    }, []);

    const login=(userData, token)=>{
        localStorage.setItem('nexis_token', token);
        setCurrentUser(userData);
    };

    const logout=()=>{
        localStorage.removeItem('nexis_token');
        setCurrentUser(null);
    };

    return(
        <AuthContext.Provider value={{currentUser, login, logout, loading}}>
            {children}
        </AuthContext.Provider>
    );
};