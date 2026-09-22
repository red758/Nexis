import useRole from '../hooks/useRole';

export default function RoleGuard({ allow, fallback = null, children }) {
  const { role } = useRole();

  // Check if the current user role is in the allowed list
  if (!allow.includes(role)) {
    return fallback; // show fallback or render nothing
  }

  return children;
}
