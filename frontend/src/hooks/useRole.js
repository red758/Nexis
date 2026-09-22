import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function useRole() {
  const { currentUser } = useContext(AuthContext);

  const role = currentUser?.role;

  return {
    role//,                              
    //isAdmin: role === 'admin',         
    //isDeveloper: role === 'collabortaor', 
    //isClient: role === 'client'
  };
}
