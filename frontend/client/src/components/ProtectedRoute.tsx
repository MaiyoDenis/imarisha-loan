import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallbackPath?: string;
}

function normalizeRole(role: string | undefined): string {
  if (!role) return '';
  // Replace dashes and spaces with underscores, and lowercase
  return role.toLowerCase().replace(/[\s-]+/g, '_').trim();
}

export function ProtectedRoute({ allowedRoles, children, fallbackPath = '/dashboard' }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        setIsAuthorized(false);
        setIsChecking(false);
        setTimeout(() => setLocation('/'), 100);
        return;
      }
      
      try {
        const user = JSON.parse(userStr);
        const userRole = user.role;
        
        // 1. Direct match check
        if (allowedRoles.includes(userRole)) {
          setIsAuthorized(true);
          setIsChecking(false);
          return;
        }

        // 2. Normalized match check
        const normalizedUserRole = normalizeRole(userRole);
        const normalizedAllowedRoles = allowedRoles.map(r => normalizeRole(r));
        
        const isAllowed = normalizedAllowedRoles.includes(normalizedUserRole);
        
        if (!isAllowed) {
          console.warn(`Access denied for role: ${userRole} (normalized: ${normalizedUserRole}). Allowed: ${allowedRoles.join(', ')}`);
          setIsAuthorized(false);
          setIsChecking(false);
          setTimeout(() => setLocation(fallbackPath), 100);
        } else {
          setIsAuthorized(true);
          setIsChecking(false);
        }
      } catch (e) {
        console.error('Failed to parse user:', e);
        setIsAuthorized(false);
        setIsChecking(false);
        setTimeout(() => setLocation(fallbackPath), 100);
      }
    };
    
    checkAuth();
  }, [allowedRoles, fallbackPath, setLocation]);

  if (isChecking) {
    return null;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
