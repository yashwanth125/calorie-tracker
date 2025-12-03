'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useUser() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Fetch current user on mount
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return user;
}
