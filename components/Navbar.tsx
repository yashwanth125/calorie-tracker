'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `window.location.origin`
      }
    });
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <nav className="w-full p-4 bg-white shadow flex justify-between items-center">
      <h1 className="text-xl font-bold text-indigo-600">AI Calorie Tracker</h1>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-gray-700 font-medium">
            Hi, {user.user_metadata?.full_name || user.email}
          </span>
        )}

        {!user ? (
          <button
            onClick={login}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2"
          >
            Sign In
          </button>
        ) : (
          <button
            onClick={logout}
            className="bg-red-500 text-white rounded-lg px-4 py-2"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
