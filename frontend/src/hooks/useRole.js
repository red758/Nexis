import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Custom hook to get clean role-based boolean flags.
// Instead of writing currentUser.role === 'admin' everywhere,
// you just call useRole() and get isAdmin, isClient, isDeveloper.
export default function useRole() {
  const { currentUser } = useContext(AuthContext);

  const role = currentUser?.role;

  return {
    role,                              // the raw role string e.g. 'admin'
    isAdmin: role === 'admin',         // true only for admins
    isDeveloper: role === 'developer', // true only for developers
    isClient: role === 'client',       // true only for clients
    isTeamMember: role === 'admin' || role === 'developer', // admins + devs (not clients)
  };
}
