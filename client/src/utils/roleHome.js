export function homePathForRole(role) {
  if (role === 'admin') return '/admin/inventory';
  if (role === 'shipping') return '/shipping/deliveries';
  return '/shop';
}