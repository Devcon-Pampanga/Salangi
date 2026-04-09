import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '../routes/paths';

export function useAdminGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate(ROUTES.SIGN_IN); return; }

      const { data } = await supabase
        .from('users')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      if (!data?.is_admin) navigate(ROUTES.HOME);
    };
    check();
  }, [navigate]);
}