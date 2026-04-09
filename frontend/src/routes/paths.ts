export const ROUTES = {
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  LIST_YOUR_BUSINESS: '/list-your-business',
  BUSINESS_REGISTER: '/business-register',
  BUSINESS_SIGNIN: '/business-signin',
  LIST_BUSINESS: '/list-business',
  
  DASHBOARD: '/dashboard',
  DASHBOARD_OVERVIEW: '/dashboard/overview',
  DASHBOARD_MY_BUSINESS: '/dashboard/mybusiness',
  DASHBOARD_EVENTS: '/dashboard/events',
  DASHBOARD_REVIEWS: '/dashboard/reviews',
  DASHBOARD_ANALYTICS: '/dashboard/analytics',
  DASHBOARD_GALLERY: '/dashboard/gallery',
  DASHBOARD_SETTINGS: '/dashboard/settings',

  // Relative paths for dashboard children (used in App.tsx)
  DASHBOARD_REL: {
    OVERVIEW: 'overview',
    MY_BUSINESS: 'mybusiness',
    EVENTS: 'events',
    REVIEWS: 'reviews',
    ANALYTICS: 'analytics',
    GALLERY: 'gallery',
    SETTINGS: 'settings',
  },

  HOME: '/home-page',
  HOME_PAGE: '/home-page',
  LOCATION: '/location-page',
  SAVE: '/save-page',
  MAP: '/map-page',
  SIGN_IN: '/sign-in',
  NOTIFICATIONS: '/notifications',
} as const;