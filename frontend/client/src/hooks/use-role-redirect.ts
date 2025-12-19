import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface RoleRedirectConfig {
  allowedRoles: string[];
  fallbackPath: string;
}

export function useRoleRedirect(config: RoleRedirectConfig) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (!config.allowedRoles.includes(user.role)) {
          setLocation(config.fallbackPath);
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }, [config.allowedRoles, config.fallbackPath, setLocation]);
}
