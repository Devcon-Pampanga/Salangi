import { useState, useRef } from 'react';
import { X, User, Check, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { updateProfile, changePassword, deleteAccount } from '@/api';
import { useNavigate } from 'react-router-dom';

interface SettingsPageProps {
  onClose: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-300 ${
      type === 'success' ? 'bg-[#FFE2A0] text-[#1A1A1A]' : 'bg-red-500/90 text-white'
    }`}>
      {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[#FBFAF8] text-xs font-semibold mb-4 uppercase tracking-widest opacity-50">
      {children}
    </h3>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-zinc-800/50 gap-4">
      <span className="text-sm text-zinc-400 shrink-0">{label}</span>
      {children}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const SettingsPage = ({ onClose }: SettingsPageProps) => {
  const navigate = useNavigate();

  // Read user from localStorage — set during loginUser()
  const storedUser = JSON.parse(localStorage.getItem('user') ?? '{}');

  const [firstName, setFirstName] = useState<string>(storedUser.first_name ?? '');
  const [lastName,  setLastName]  = useState<string>(storedUser.last_name  ?? '');
  const [email,     setEmail]     = useState<string>(storedUser.email      ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(storedUser.avatar_url ?? null);

  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving,          setSaving]          = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPw,      setChangingPw]      = useState(false);
  const [deletingAcc,     setDeletingAcc]     = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput,     setDeleteInput]     = useState('');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveInfo = async () => {
    setSaving(true);
    try {
      await updateProfile({ first_name: firstName, last_name: lastName, email });
      localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        first_name: firstName,
        last_name: lastName,
        email,
      }));
      showToast('Account info saved!', 'success');
    } catch (err: any) {
      showToast(err.message ?? 'Failed to save changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Upload avatar → Supabase Storage ─────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const userId = storedUser.user_id ?? 'user';
      const ext    = file.name.split('.').pop();
      const path   = `avatars/${userId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('listings-images')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('listings-images')
        .getPublicUrl(path);

      setAvatarUrl(publicUrl);
      localStorage.setItem('user', JSON.stringify({ ...storedUser, avatar_url: publicUrl }));
      showToast('Profile photo updated!', 'success');
    } catch (err: any) {
      showToast(err.message ?? 'Failed to upload photo.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      showToast('Please fill in both password fields.', 'error'); return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error'); return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error'); return;
    }
    setChangingPw(true);
    try {
      await changePassword({ new_password: newPassword });
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated!', 'success');
    } catch (err: any) {
      showToast(err.message ?? 'Failed to change password.', 'error');
    } finally {
      setChangingPw(false);
    }
  };

  // ── Delete account ────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') {
      showToast('Type DELETE to confirm.', 'error'); return;
    }
    setDeletingAcc(true);
    try {
      await deleteAccount();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/sign-in', { replace: true });
    } catch (err: any) {
      showToast(err.message ?? 'Failed to delete account.', 'error');
    } finally {
      setDeletingAcc(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-[#1A1A1A]/60 backdrop-blur-md cursor-default animate-in fade-in duration-300">
        <div className="flex w-full max-w-5xl h-[85vh] bg-[#222222] rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 animate-in zoom-in duration-300">

          {/* Sidebar */}
          <div className="w-64 bg-[#1C1C1C] border-r border-zinc-800 p-6 flex flex-col gap-8 shrink-0 text-white">
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center hover:bg-[#333333] rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} className="text-zinc-500" />
            </button>
            <nav className="flex flex-col gap-3">
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-[#333333] text-white border-zinc-700/50 cursor-default">
                <User size={18} />
                <span className="text-sm font-medium">Account</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-12 bg-[#222222]" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-xl animate-in fade-in slide-in-from-right-4 duration-300">

              {/* Profile Picture */}
              <div className="mb-10">
                <SectionTitle>Profile Picture</SectionTitle>
                <div
                  onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
                  className="w-full p-5 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center bg-[#1C1C1C]/50 gap-6 hover:border-[#FFE2A0]/40 transition-colors cursor-pointer group"
                >
                  <div className="flex-shrink-0 w-20 h-20 rounded-full overflow-hidden bg-[#FFE2A0] flex items-center justify-center shadow-lg">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} className="text-[#1A1A1A]" />
                    )}
                  </div>
                  <div>
                    {uploadingAvatar ? (
                      <div className="flex items-center gap-2 text-[#FFE2A0]">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-sm">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-[#FBFAF8] font-semibold text-sm group-hover:text-[#FFE2A0] transition-colors">
                          {avatarUrl ? 'Change photo' : 'Upload a photo'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">JPG, PNG · Max 5MB</p>
                      </>
                    )}
                  </div>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Account Information */}
              <div className="mb-10">
                <SectionTitle>Account Information</SectionTitle>
                <div className="flex flex-col">
                  <Row label="First Name">
                    <input
                      type="text" value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="text-sm text-[#FBFAF8] font-medium bg-transparent text-right outline-none focus:text-[#FFE2A0] transition-colors w-1/2"
                    />
                  </Row>
                  <Row label="Last Name">
                    <input
                      type="text" value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="text-sm text-[#FBFAF8] font-medium bg-transparent text-right outline-none focus:text-[#FFE2A0] transition-colors w-1/2"
                    />
                  </Row>
                  <Row label="Email Address">
                    <input
                      type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-sm text-[#FBFAF8] font-medium bg-transparent text-right outline-none focus:text-[#FFE2A0] transition-colors w-1/2"
                    />
                  </Row>
                </div>
                <button
                  onClick={handleSaveInfo}
                  disabled={saving}
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#FFE2A0] text-[#1A1A1A] text-sm font-bold rounded-xl hover:bg-[#f5d880] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {/* Password & Security */}
              <div className="mb-10">
                <SectionTitle>Password & Security</SectionTitle>
                <div className="flex flex-col">
                  <Row label="New Password">
                    <input
                      type="password" value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="text-sm text-[#FBFAF8] font-medium bg-transparent text-right outline-none focus:text-[#FFE2A0] transition-colors w-1/2 placeholder-zinc-600"
                    />
                  </Row>
                  <Row label="Confirm Password">
                    <input
                      type="password" value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="text-sm text-[#FBFAF8] font-medium bg-transparent text-right outline-none focus:text-[#FFE2A0] transition-colors w-1/2 placeholder-zinc-600"
                    />
                  </Row>
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPw || !newPassword || !confirmPassword}
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#2D2D2D] text-[#FBFAF8] text-sm font-bold rounded-xl hover:bg-[#373737] disabled:opacity-40 transition-all cursor-pointer border border-zinc-700"
                >
                  {changingPw && <Loader2 size={14} className="animate-spin" />}
                  {changingPw ? 'Updating...' : 'Update Password'}
                </button>
              </div>

              {/* Manage Account */}
              <div className="mb-6">
                <SectionTitle>Manage Account</SectionTitle>
                {!showDeleteConfirm ? (
                  <div className="flex justify-between items-center py-4 bg-[#1C1C1C]/50 rounded-2xl px-5 border border-zinc-800/30">
                    <div>
                      <p className="text-sm text-zinc-300 font-medium">Delete account</p>
                      <p className="text-xs text-zinc-500 mt-0.5">This action is permanent and cannot be undone.</p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-5 py-2 border border-red-900/50 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 p-5 bg-red-950/20 rounded-2xl border border-red-900/40">
                    <p className="text-sm text-red-400 font-semibold">⚠️ Are you sure?</p>
                    <p className="text-xs text-zinc-400">
                      Type <span className="font-bold text-white">DELETE</span> to confirm. This cannot be undone.
                    </p>
                    <input
                      type="text" value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value)}
                      placeholder="Type DELETE"
                      className="w-full bg-[#1C1C1C] text-sm text-white rounded-lg px-4 py-2.5 outline-none border border-red-900/40 focus:border-red-500 placeholder-zinc-600 transition-all"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-[#2D2D2D] text-zinc-400 hover:bg-[#373737] transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deletingAcc || deleteInput !== 'DELETE'}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-500 disabled:opacity-40 transition-all cursor-pointer"
                      >
                        {deletingAcc ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
};

export default SettingsPage;