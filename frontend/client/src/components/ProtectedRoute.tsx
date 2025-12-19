import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallbackPath?: string;
}

export function ProtectedRoute({ allowedRoles, children, fallbackPath = '/dashboard' }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (!allowedRoles.includes(user.role)) {
          setLocation(fallbackPath);
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        setLocation(fallbackPath);
      }
    } else {
      setLocation('/');
    }
  }, [allowedRoles, fallbackPath, setLocation]);

  return <>{children}</>;
}
