import { useContext } from 'react';
import { UserContext } from '../context/DataContext';

export default function useRole() {
  const { currentUser } = useContext(UserContext);

  const role = currentUser?.role;

  return {
    role//,                              
    //isAdmin: role === 'admin',         
    //isDeveloper: role === 'collabortaor', 
    //isClient: role === 'client'
  };
}
