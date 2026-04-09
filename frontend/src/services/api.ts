import { supabase } from '@/lib/supabase';

// ── Authentication (Supabase) ────────────────────────────────────────────────
export async function registerUser(data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}) {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        role: 'business', 
      },
    },
  });
  if (error) throw new Error(error.message);
  return {
    message: 'Account created! Please check your email to verify your account before signing in.',
    user: authData.user,
  };
}

const BASE_URL = 'http://localhost:8000';

// ── Get live Supabase session token ──────────────────────────────────────────
async function getToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error('Not authenticated. Please sign in again.');
  }
  return data.session.access_token;
}

// ── Shared fetch helper ───────────────────────────────────────────────────────
async function authFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed (${res.status})`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── Profile (backend) ─────────────────────────────────────────────────────────
export async function updateProfile(data: {
  first_name?: string;
  last_name?: string;
  email?: string;
}) {
  return authFetch('/api/auth/update-profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Password (Supabase directly — no backend needed) ─────────────────────────
export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
  return { message: 'Password updated successfully.' };
}

// ── Delete account (backend removes DB row, Supabase handles auth deletion) ──
export async function deleteAccount() {
  return authFetch('/api/auth/delete-account', { method: 'DELETE' });
}