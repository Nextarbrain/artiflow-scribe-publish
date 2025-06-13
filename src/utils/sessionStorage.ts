
export interface UserSession {
  selectedPublishers?: any[];
  currentRoute?: string;
  fromHomepage?: boolean;
  formData?: {
    title?: string;
    content?: string;
    excerpt?: string;
    metaDescription?: string;
    tags?: string;
  };
  timestamp: number;
}

const SESSION_KEY = 'userSession';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export const saveUserSession = (session: Partial<UserSession>) => {
  try {
    const existingSession = getUserSession();
    const updatedSession: UserSession = {
      ...existingSession,
      ...session,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    console.log('Session saved successfully:', updatedSession);
  } catch (error) {
    console.error('Error saving user session:', error);
    // Fallback to localStorage if sessionStorage fails
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        ...session,
        timestamp: Date.now()
      }));
    } catch (fallbackError) {
      console.error('Fallback storage also failed:', fallbackError);
    }
  }
};

export const getUserSession = (): UserSession | null => {
  try {
    // Try sessionStorage first
    let sessionData = sessionStorage.getItem(SESSION_KEY);
    
    // Fallback to localStorage if sessionStorage is empty
    if (!sessionData) {
      sessionData = localStorage.getItem(SESSION_KEY);
    }
    
    if (!sessionData) {
      console.log('No session data found');
      return null;
    }
    
    const session = JSON.parse(sessionData);
    console.log('Retrieved session:', session);
    
    // Check if session is expired
    if (Date.now() - session.timestamp > SESSION_TIMEOUT) {
      console.log('Session expired, clearing');
      clearUserSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting user session:', error);
    clearUserSession(); // Clear corrupted session
    return null;
  }
};

export const clearUserSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('selectedPublishers'); // Legacy cleanup
    console.log('User session cleared successfully');
  } catch (error) {
    console.error('Error clearing user session:', error);
  }
};

export const hasUserSession = (): boolean => {
  const session = getUserSession();
  const hasSession = session !== null && session.selectedPublishers && session.selectedPublishers.length > 0;
  console.log('Has user session:', hasSession);
  return hasSession;
};
