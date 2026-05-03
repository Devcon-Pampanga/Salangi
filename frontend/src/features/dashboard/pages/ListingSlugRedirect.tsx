import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListingBySlug } from '../../Data/Listings';
import { ROUTES } from '../../../routes/paths';

export default function ListingSlugRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) {
      navigate(ROUTES.HOME, { replace: true });
      return;
    }

    getListingBySlug(slug).then((listing) => {
      if (listing) {
        // Pass the listing id in state so Homepage can auto-select it
        navigate(ROUTES.HOME, {
          replace: true,
          state: { autoSelectId: listing.id },
        });
      } else {
        // Slug not found — just go home
        navigate(ROUTES.HOME, { replace: true });
      }
    });
  }, [slug, navigate]);

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white/40 text-sm">
      Loading...
    </div>
  );
}