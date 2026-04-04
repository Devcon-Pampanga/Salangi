import { useState, useRef, useEffect } from 'react';
import { X, User, Check, AlertCircle, Loader2, Camera, Eye, EyeOff, Trash2, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { updateProfile, changePassword, deleteAccount } from '@/api';
import { useNavigate } from 'react-router-dom';

interface SettingsPageProps {
  onClose: () => void;
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-300 whitespace-nowrap ${
      type === 'success' ? 'bg-[#FFE2A0] text-[#1A1A1A]' : 'bg-red-500 text-white'
    }`}>
      {type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
      {message}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-bold mb-5 uppercase tracking-[0.15em] text-zinc-500">
      {children}
    </h3>
  );
}

function InputField({
  label, type = 'text', value, onChange, placeholder, rightElement,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-xs font-medium text-zinc-500">{label}</label>
      <div className="relative flex items-center">
        <input
          type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#1C1C1C] border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-[#FBFAF8] placeholder-zinc-600 outline-none focus:border-[#FFE2A0]/60 focus:ring-1 focus:ring-[#FFE2A0]/20 transition-all pr-10"
        />
        {rightElement && <div className="absolute right-3 text-zinc-500">{rightElement}</div>}
      </div>
    </div>
  );
}

const SettingsPage = ({ onClose }: SettingsPageProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/sign-in', { replace: true });
    });
  }, []);

  const getStoredUser = () => JSON.parse(localStorage.getItem('user') ?? '{}');
  const storedUser = getStoredUser();

  const [firstName,  setFirstName]  = useState<string>(storedUser.first_name ?? '');
  const [lastName,   setLastName]   = useState<string>(storedUser.last_name  ?? '');
  const [email,      setEmail]      = useState<string>(storedUser.email      ?? '');
  const [avatarUrl,  setAvatarUrl]  = useState<string | null>(storedUser.profile_pic ?? storedUser.avatar_url ?? null);

  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw,       setShowNewPw]       = useState(false);
  const [showConfirmPw,   setShowConfirmPw]   = useState(false);

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

  const handleError = (err: any, fallback: string) => {
    const msg = (err?.message ?? '').toLowerCase();
    if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('not authenticated')) {
      showToast('Session expired. Redirecting…', 'error');
      setTimeout(() => navigate('/sign-in', { replace: true }), 2000);
    } else {
      showToast(err?.message ?? fallback, 'error');
    }
  };

  // ── Save profile info ────────────────────────────────────────────────────
  const handleSaveInfo = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      showToast('All fields are required.', 'error'); return;
    }
    setSaving(true);
    try {
      const result = await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      });
      // Update localStorage with response from server
      const current = getStoredUser();
      localStorage.setItem('user', JSON.stringify({
        ...current,
        first_name: result.first_name,
        last_name: result.last_name,
        email: result.email,
      }));
      showToast('Account info saved!', 'success');
    } catch (err: any) {
      handleError(err, 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // ── Upload avatar ────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB.', 'error'); return; }
    setUploadingAvatar(true);
    try {
      const current = getStoredUser();
      const userId  = current.user_id ?? 'user';
      const ext     = file.name.split('.').pop();
      const path    = `avatars/${userId}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from('listings-images').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('listings-images').getPublicUrl(path);

      const { error: updateError } = await supabase.from('users').update({ profile_pic: publicUrl }).eq('user_id', userId);
      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      localStorage.setItem('user', JSON.stringify({ ...current, profile_pic: publicUrl, avatar_url: publicUrl }));
      showToast('Profile photo updated!', 'success');
    } catch (err: any) {
      handleError(err, 'Failed to upload photo.');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // ── Change password ──────────────────────────────────────────────────────
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
      await changePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully!', 'success');
    } catch (err: any) {
      handleError(err, 'Failed to change password.');
    } finally {
      setChangingPw(false);
    }
  };

  // ── Delete account ───────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') { showToast('Type DELETE to confirm.', 'error'); return; }
    setDeletingAcc(true);
    try {
      await deleteAccount();
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      navigate('/sign-in', { replace: true });
    } catch (err: any) {
      handleError(err, 'Failed to delete account.');
    } finally {
      setDeletingAcc(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10 bg-black/70 backdrop-blur-sm cursor-default animate-in fade-in duration-200">
        <div className="flex w-full max-w-4xl h-[90vh] md:h-[85vh] bg-[#222222] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 animate-in zoom-in-95 duration-200">

          {/* Sidebar */}
          <div className="w-16 md:w-60 bg-[#1A1A1A] border-r border-zinc-800/80 p-3 md:p-6 flex flex-col gap-6 shrink-0">
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer" aria-label="Close settings">
              <X size={18} className="text-zinc-400" />
            </button>
            <nav className="flex flex-col gap-1">
              <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-800 text-white cursor-default">
                <User size={16} className="text-[#FFE2A0] shrink-0" />
                <span className="text-sm font-medium hidden md:block">Account</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="p-6 md:p-10 max-w-lg">

              {/* Profile Picture */}
              <div className="mb-10">
                <SectionTitle>Profile Picture</SectionTitle>
                <div
                  onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
                  className="flex items-center gap-5 p-4 bg-[#1C1C1C] border border-zinc-700/50 rounded-2xl hover:border-zinc-600 transition-all cursor-pointer group"
                >
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-[#FFE2A0] flex items-center justify-center ring-2 ring-zinc-700 group-hover:ring-[#FFE2A0]/40 transition-all">
                      {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <User size={26} className="text-[#1A1A1A]" />}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FFE2A0] rounded-full flex items-center justify-center shadow">
                      <Camera size={11} className="text-[#1A1A1A]" />
                    </div>
                  </div>
                  <div>
                    {uploadingAvatar ? (
                      <div className="flex items-center gap-2 text-[#FFE2A0]">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-sm font-medium">Uploading…</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-zinc-200 group-hover:text-[#FFE2A0] transition-colors">{avatarUrl ? 'Change photo' : 'Upload a photo'}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">JPG, PNG · Max 5MB</p>
                      </>
                    )}
                  </div>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleAvatarChange} />
              </div>

              {/* Account Information */}
              <div className="mb-10">
                <SectionTitle>Account Information</SectionTitle>
                <div className="grid grid-cols-2 gap-x-3">
                  <InputField label="First Name" value={firstName} onChange={setFirstName} placeholder="John" />
                  <InputField label="Last Name"  value={lastName}  onChange={setLastName}  placeholder="Doe"  />
                </div>
                <InputField label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                <button
                  onClick={handleSaveInfo} disabled={saving}
                  className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-[#FFE2A0] text-[#1A1A1A] text-sm font-bold rounded-xl hover:bg-[#f5d880] active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>

              {/* Password & Security */}
              <div className="mb-10">
                <SectionTitle>Password &amp; Security</SectionTitle>
                <InputField
                  label="New Password" type={showNewPw ? 'text' : 'password'}
                  value={newPassword} onChange={setNewPassword} placeholder="Min. 6 characters"
                  rightElement={
                    <button type="button" onClick={() => setShowNewPw(v => !v)} className="hover:text-zinc-300 transition-colors cursor-pointer">
                      {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  }
                />
                <InputField
                  label="Confirm Password" type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat new password"
                  rightElement={
                    <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="hover:text-zinc-300 transition-colors cursor-pointer">
                      {showConfirmPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  }
                />
                {newPassword && confirmPassword && (
                  <p className={`text-xs mb-3 -mt-1 ${newPassword === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
                <button
                  onClick={handleChangePassword} disabled={changingPw || !newPassword || !confirmPassword}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#2A2A2A] border border-zinc-700 text-[#FBFAF8] text-sm font-bold rounded-xl hover:bg-zinc-700 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
                >
                  {changingPw && <Loader2 size={14} className="animate-spin" />}
                  {changingPw ? 'Updating…' : 'Update Password'}
                </button>
              </div>

              {/* Manage Account */}
              <div className="mb-6">
                <SectionTitle>Manage Account</SectionTitle>
                {!showDeleteConfirm ? (
                  <div className="flex items-center justify-between p-4 bg-red-950/10 border border-red-900/30 rounded-2xl gap-4">
                    <div>
                      <p className="text-sm font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Trash2 size={14} className="text-red-400" /> Delete account
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">Permanent and cannot be undone.</p>
                    </div>
                    <button onClick={() => setShowDeleteConfirm(true)} className="shrink-0 px-4 py-2 border border-red-800/60 text-red-400 text-xs font-semibold rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer">
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 p-5 bg-red-950/20 rounded-2xl border border-red-800/40">
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={16} className="text-red-400 shrink-0" />
                      <p className="text-sm font-bold text-red-400">Confirm account deletion</p>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Type <span className="font-bold text-white bg-zinc-800 px-1 rounded">DELETE</span> to confirm. This cannot be undone.
                    </p>
                    <input
                      type="text" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)}
                      placeholder="Type DELETE"
                      className="w-full bg-[#1C1C1C] border border-red-900/50 focus:border-red-500 text-sm text-white rounded-xl px-4 py-2.5 outline-none placeholder-zinc-600 transition-all"
                    />
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }} className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all cursor-pointer">
                        Cancel
                      </button>
                      <button onClick={handleDeleteAccount} disabled={deletingAcc || deleteInput !== 'DELETE'} className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-500 disabled:opacity-40 transition-all cursor-pointer">
                        {deletingAcc ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Deleting…</span> : 'Confirm Delete'}
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