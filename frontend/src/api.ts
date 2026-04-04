import { supabase } from '@/lib/supabase';

const BASE_URL = "http://127.0.0.1:8000";

async function getToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");
  return token;
}

export async function registerUser(data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Registration failed");
  }
  return res.json();
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}

export async function updateProfile(data: {
  first_name: string;
  last_name: string;
  email: string;
}) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/api/auth/update-profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to update profile");
  }
  return res.json();
}

export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message || "Failed to change password");
  return { message: "Password updated successfully." };
}

export async function deleteAccount() {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to delete account");
  }
  return res.json();
}