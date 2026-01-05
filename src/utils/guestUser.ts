// Guest User Utility Functions

export const isGuestUser = (): boolean => {
  return localStorage.getItem('guest') === 'true' && !localStorage.getItem('user');
};

export const setGuestUser = (): void => {
  // Clear ALL previous session data to ensure clean guest state
  localStorage.removeItem('user');
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('isAdminAuthenticated');
  localStorage.removeItem('adminEmail');
  localStorage.removeItem('isPermanentAdmin');
  
  // Set guest flag
  localStorage.setItem('guest', 'true');
};

export const removeGuestUser = (): void => {
  localStorage.removeItem('guest');
};

export const clearAllAuthState = (): void => {
  // Clear all authentication related data
  localStorage.removeItem('user');
  localStorage.removeItem('guest');
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('isAdminAuthenticated');
  localStorage.removeItem('adminEmail');
  localStorage.removeItem('isPermanentAdmin');
};

export const getUserStatus = (): { isGuest: boolean; isLoggedIn: boolean; isAdmin: boolean; isPermanentAdmin: boolean } => {
  const userStr = localStorage.getItem('user');
  const isGuest = isGuestUser();
  
  if (isGuest) {
    return { isGuest: true, isLoggedIn: false, isAdmin: false, isPermanentAdmin: false };
  }
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return { 
        isGuest: false, 
        isLoggedIn: true, 
        isAdmin: user.isAdmin || false,
        isPermanentAdmin: user.isPermanentAdmin || false
      };
    } catch {
      return { isGuest: false, isLoggedIn: false, isAdmin: false, isPermanentAdmin: false };
    }
  }
  
  return { isGuest: false, isLoggedIn: false, isAdmin: false, isPermanentAdmin: false };
};
