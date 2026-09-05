import {createContext, useState, useEffect} from 'react';
import axios from 'axios';

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