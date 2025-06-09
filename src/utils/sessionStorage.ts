
export interface UserSession {
  selectedPublishers?: any[];
  currentRoute?: string;
  formData?: {
    title?: string;
    content?: string;
    excerpt?: string;
    metaDescription?: string;
    tags?: string;
  };
  timestamp: number;
}

export const saveUserSession = (session: Partial<UserSession>) => {
  try {
    const existingSession = getUserSession();
    const updatedSession: UserSession = {
      ...existingSession,
      ...session,
      timestamp: Date.now()
    };
    
    localStorage.setItem('userSession', JSON.stringify(updatedSession));
    console.log('Session saved:', updatedSession);
  } catch (error) {
    console.error('Error saving user session:', error);
  }
};

export const getUserSession = (): UserSession | null => {
  try {
    const sessionData = localStorage.getItem('userSession');
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    
    // Check if session is older than 24 hours
    if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
      clearUserSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
};

export const clearUserSession = () => {
  try {
    localStorage.removeItem('userSession');
    localStorage.removeItem('selectedPublishers'); // Legacy cleanup
    console.log('User session cleared');
  } catch (error) {
    console.error('Error clearing user session:', error);
  }
};

export const hasUserSession = (): boolean => {
  return getUserSession() !== null;
};
