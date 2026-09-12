import useRole from '../hooks/useRole';

// RoleGuard: only renders children if the current user has an allowed role.
//
// Usage:
//   <RoleGuard allow={['admin', 'developer']}>
//     <button>This is hidden from clients</button>
//   </RoleGuard>
//
//   <RoleGuard allow={['client']} fallback={<span>In Progress</span>}>
//     <select>...</select>   // only team members see the dropdown
//   </RoleGuard>
//
// Props:
//   allow    — array of role strings that CAN see the children
//   fallback — optional JSX to show when access is denied (default: nothing)
//   children — the content to protect

export default function RoleGuard({ allow, fallback = null, children }) {
  const { role } = useRole();

  // Check if the current user role is in the allowed list
  if (!allow.includes(role)) {
    return fallback; // show fallback or render nothing
  }

  return children;
}
