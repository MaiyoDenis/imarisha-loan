import { useEffect, useState } from 'react';

interface User {
  id: number;
  username: string;
  role: string;
  first_name?: string;
  last_name?: string;
  branch_id?: number;
  phone?: string;
  email?: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { user, isLoading };
}
