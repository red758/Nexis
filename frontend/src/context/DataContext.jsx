import {createContext, useState, useEffect, useMemo, useCallback} from 'react';
import axios from 'axios';

// Attach JWT token to every outgoing axios request automatically.
// This means we never manually add Authorization headers in individual API calls.
axios.interceptors.request.use((config) => {
  console.log("Intercepting the request")
  
  const token = localStorage.getItem('nexis_token');
  
  if (token) {
    console.log("Token found")
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  const activeOrgId=localStorage.getItem('nexis_active_org');
  
  if(activeOrgId){
    console.log("Active org found");
    config.headers['X-Organization-Id']=activeOrgId;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export const UserContext=createContext();
export const ActionsContext=createContext();
export const OrgContext=createContext();

export const DataContext=({children})=>{
    const [currentUser, setCurrentUser]=useState(null);
    const [loading, setLoading]=useState(true);
    const [myOrg, setMyOrg]=useState([]);

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

    const login=useCallback((userData, token)=>{
        localStorage.setItem('nexis_token', token);
        setCurrentUser(userData);
    },[]);

    const logout=useCallback(()=>{
        localStorage.removeItem('nexis_token');
        setCurrentUser(null);
    },[]);

    const userPackage=useMemo(()=>{
        return{currentUser, loading};    
    }, [currentUser, loading]);

    const orgPackage=useMemo(()=>{
        return{myOrg, setMyOrg};
    }, [myOrg]);

    const actionsPackage = useMemo(() => {
        return { login, logout };
    }, [login, logout]);

    return (
        <ActionsContext.Provider value={actionsPackage}>
            <UserContext.Provider value={userPackage}>
                <OrgContext.Provider value={orgPackage}>
                    {children}
                </OrgContext.Provider>
            </UserContext.Provider>
        </ActionsContext.Provider>
    );
};