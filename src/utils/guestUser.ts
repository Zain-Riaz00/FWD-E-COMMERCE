// Guest User Utility Functions

export const isGuestUser = (): boolean => {
  return localStorage.getItem('guest') === 'true' && !localStorage.getItem('user');
};

export const setGuestUser = (): void => {
  localStorage.setItem('guest', 'true');
  localStorage.removeItem('user');
};

export const removeGuestUser = (): void => {
  localStorage.removeItem('guest');
};

export const getUserStatus = (): { isGuest: boolean; isLoggedIn: boolean; isAdmin: boolean } => {
  const userStr = localStorage.getItem('user');
  const isGuest = isGuestUser();
  
  if (isGuest) {
    return { isGuest: true, isLoggedIn: false, isAdmin: false };
  }
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return { isGuest: false, isLoggedIn: true, isAdmin: user.isAdmin || false };
    } catch {
      return { isGuest: false, isLoggedIn: false, isAdmin: false };
    }
  }
  
  return { isGuest: false, isLoggedIn: false, isAdmin: false };
};
