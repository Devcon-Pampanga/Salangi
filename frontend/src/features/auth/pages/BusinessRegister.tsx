import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '@/services/api';
import { ROUTES } from '../../../routes/paths';

function BusinessRegiter(){

     const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await registerUser(formData);
      setSuccess(res.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    return(
        <div>
            <div className = "absolute px-10 py-10">
                <button
                    onClick={() => navigate(ROUTES.LIST_YOUR_BUSINESS)}
                    className="flex items-center gap-2 text-[#FBFAF8]/50 hover:text-[#FBFAF8] text-sm mb-8 cursor-pointer transition-colors"
                    >
                    ← Go Back.
                </button>
            </div>

            <div className="bg-[#1a1a1a] flex items-center justify-center px-16 min-h-screen">
                <div className="w-full max-w-md">
                    <div
                        className="absolute top-2 left-170 rounded-full blur-3xl opacity-60 pointer-events-none"
                        style={{
                        width: '760px',
                        height: '680px',
                        transform: 'translate(-400px, -440px)',
                        background: 'radial-gradient(circle, rgba(255,226,160,0.8) 0%, rgba(255,226,160,0.2) 50%, transparent 70%)',
                        }}
                    />

                    <div className = "absolute -left-70">
                        <button
                        onClick={() => navigate(ROUTES.LIST_YOUR_BUSINESS)}
                        className="flex items-center gap-2 text-[#FBFAF8]/50 hover:text-[#FBFAF8] text-sm mb-8 cursor-pointer transition-colors"
                        >
                        ← Back to Homepage
                        </button>
                    </div>

                    <h2 className="font-['Playfair_Display'] text-white text-4xl font-bold mb-2">
                        Register now.
                    </h2>
                    <p className="text-gray-400 text-sm mb-8">
                        Create your account to get started.
                    </p>

                    {/* First Name & Last Name */}
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                        <label className="text-gray-300 text-sm mb-1 block">First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="eg. Juan"
                            className="w-full bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-[#FFE2A0]"
                        />
                        </div>
                        <div className="flex-1">
                        <label className="text-gray-300 text-sm mb-1 block">Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="eg. Dela Cruz"
                            className="w-full bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-[#FFE2A0]"
                        />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <label className="text-gray-300 text-sm mb-1 block">Email</label>
                        <input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="eg. juan.dc@gmail.com"
                        className="w-full bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-[#FFE2A0]"
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-6">
                        <label className="text-gray-300 text-sm mb-1 block">Password</label>
                        <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="*************"
                            className="w-full bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-[#FFE2A0]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        </div>
                    </div>

                    {/* Sign Up Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-[#FFE2A0] hover:bg-[#fcd789] text-[#222222] font-semibold py-3 rounded-lg transition-colors cursor-pointer"
                    >
                        {loading ? 'Signing up...' : 'SIGN UP'}
                    </button>

                    {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}
                    {success && <p className="text-green-400 text-sm text-center mt-3">{success}</p>}

                    {/* Already have account */}
                    <p className="text-gray-400 text-sm text-center mt-4">
                        Already have an account?{' '}
                        <Link to={ROUTES.BUSINESS_SIGNIN} className="text-[#FFE2A0] hover:underline">
                        Sign in.
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default BusinessRegiter;