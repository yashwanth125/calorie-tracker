'use client';

import { supabase } from '@/lib/supabase';

export function AuthButtons() {
  async function login() {
    await supabase.auth.signInWithOAuth({
      provider: 'google'
    });
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="flex gap-3 justify-center mb-4">
      <button
        onClick={login}
        className="bg-red-500 text-white px-4 py-2 rounded-lg"
      >
        Sign in with Google
      </button>

    </div>
  );
}
