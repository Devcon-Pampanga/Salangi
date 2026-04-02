import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, LogOut, MapPin, Clock } from 'lucide-react';

interface Listing {
  id: number;
  name: string;
  category: string;
  location: string;
  description: string;
  hours: string;
  verified: boolean;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (!auth) {
      navigate('/admin');
      return;
    }
    fetchUnverified();
  }, []);

  const fetchUnverified = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('verified', false)
      .order('created_at', { ascending: false });

    if (!error && data) setListings(data);
    setLoading(false);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    const { error } = await supabase
      .from('listings')
      .update({ verified: true })
      .eq('id', id);

    if (error) {
      showToast('Failed to approve listing.', 'error');
    } else {
      showToast('Listing approved!', 'success');
      setListings(prev => prev.filter(l => l.id !== id));
    }
    setActionLoading(null);
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('Failed to reject listing.', 'error');
    } else {
      showToast('Listing rejected and removed.', 'success');
      setListings(prev => prev.filter(l => l.id !== id));
    }
    setActionLoading(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#FFE2A0]">
            Salangi Admin
          </h1>
          <p className="text-gray-400 text-sm">Listing Approval Dashboard</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            Pending Listings
            <span className="ml-3 bg-[#FFE2A0] text-[#222] text-sm font-bold px-2 py-0.5 rounded-full">
              {listings.length}
            </span>
          </h2>
          <button
            onClick={fetchUnverified}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-400">
            Loading listings...
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <CheckCircle size={48} className="mb-4 text-green-500 opacity-50" />
            <p className="text-lg">All listings are verified!</p>
            <p className="text-sm mt-1">No pending approvals at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {listings.map(listing => (
              <div
                key={listing.id}
                className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 flex items-start justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold">{listing.name}</h3>
                    <span className="text-xs bg-[#2E2E2E] text-gray-300 px-2 py-0.5 rounded-full">
                      {listing.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
                    <MapPin size={13} />
                    {listing.location}
                  </div>

                  {listing.hours && (
                    <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
                      <Clock size={13} />
                      {listing.hours}
                    </div>
                  )}

                  <p className="text-gray-400 text-sm line-clamp-2">{listing.description}</p>
                </div>

                <div className="flex flex-col gap-2 min-w-32.5">
                  <button
                    onClick={() => handleApprove(listing.id)}
                    disabled={actionLoading === listing.id}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    <CheckCircle size={15} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(listing.id)}
                    disabled={actionLoading === listing.id}
                    className="flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    <XCircle size={15} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg text-sm font-medium shadow-lg transition-all ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;