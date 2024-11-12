// // hooks/useAuth.ts
// import { useEffect, useCallback, useMemo } from 'react';
// import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
// import { useNavigate } from 'react-router-dom';
// import { useToast } from '@chakra-ui/react';
// import { storage } from '../util/storage';
// import { analytics } from '../util/analytics';
// import type { User, StoredUserData } from '../util/types';

// import type { DynamicContext } from '@dynamic-labs/sdk-react-core';
// import { DynamicAuthProvider } from '../components/Auth/DynamicAuthProvider';

// export const useAuth = (): {
//   isAuthenticated: boolean;
//   user: User;
//   primaryWallet: any;
//   authToken: string | null;
//   login: () => void;
//   logout: () => Promise<void>;
//   requireAuth: (callback: () => void, options?: { redirect?: string }) => void;
// } => {
//   const {
//     user,
//     handleLogOut,
//     showAuthFlow,
//     primaryWallet,
//     authToken,
//   } = useDynamicContext();
  
//   const navigate = useNavigate();
//   const toast = useToast();

//   // Memoize user data
//   const userData = useMemo(() => {
//     if (!user) return null;
    
//     return {
//       address: user.userId,
//       primaryWallet: primaryWallet?.address,
//       lastLogin: Date.now()
//     } as StoredUserData;
//   }, [user, primaryWallet]);

//   // Handle authentication state changes
//   useEffect(() => {
//     if (userData) {
//       // Store user info
//       storage.set('user', userData);

//       // Track authentication
//       analytics.identify(userData.address, {
//         wallet: userData.primaryWallet,
//         authMethod: primaryWallet?.connector?.name,
//         lastLogin: userData.lastLogin
//       });

//       // Track successful login
//       analytics.track('login_success', {
//         wallet: userData.primaryWallet,
//         authMethod: primaryWallet?.connector?.name
//       });
//     }
//   }, [userData, primaryWallet]);

//   // Handle auth token changes
//   useEffect(() => {
//     if (authToken) {
//       storage.set('auth_token', authToken);
//     } else {
//       storage.remove('auth_token');
//     }
//   }, [authToken]);

//   const login = useCallback(() => {
//     try {
//       // showAuthFlow();
//       analytics.track('login_attempt');
//     } catch (error) {
//       console.error('Login failed:', error);
//       toast({
//         title: 'Login failed',
//         description: 'Please try again',
//         status: 'error',
//         duration: 3000,
//       });
//     }
//   }, [showAuthFlow, toast]);

//   const logout = useCallback(async () => {
//     try {
//       const userAddress = user?.userId;
//       await handleLogOut();
      
//       // Clear stored data
//       storage.remove('user');
//       storage.remove('auth_token');
      
//       // Track logout
//       if (userAddress) {
//         analytics.track('logout_success', { address: userAddress });
//       }

//       // Navigate to home
//       navigate('/');
      
//       toast({
//         title: 'Logged out successfully',
//         status: 'success',
//         duration: 2000,
//       });
//     } catch (error) {
//       console.error('Logout failed:', error);
//       toast({
//         title: 'Logout failed',
//         description: 'Please try again',
//         status: 'error',
//         duration: 3000,
//       });
//     }
//   }, [handleLogOut, navigate, user, toast]);

//   const requireAuth = useCallback((
//     callback: () => void,
//     options: { redirect?: string } = {}
//   ) => {
//     if (!user) {
//       analytics.track('auth_required', { redirect: options.redirect });
//       // showAuthFlow();
//       return;
//     }
//     callback();
//   }, [isAuthenticated, user, showAuthFlow]);

//   return {
//     isAuthenticated,
//     user,
//     primaryWallet,
//     authToken,
//     login,
//     logout,
//     requireAuth
//   };
// };

// // Usage example
// export const withAuth = (WrappedComponent: React.ComponentType<any>): React.FC<any> => {
//   return function WithAuthComponent(props: any) {
//     const { isAuthenticated, login } = useAuth();
    
//     useEffect(() => {
//       if (!isAuthenticated) {
//         login();
//       }
//     }, [isAuthenticated, login]);

//     if (!isAuthenticated) {
//       return null; // Or loading state
//     }

//     return <WrappedComponent {...props} />;
//   };
// };