const AUTH_TOKEN_KEY = "auth_token";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const getAuthToken = () => {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    return token?.trim() ? token : null;
  } catch {
    return null;
  }
};

const setAuthToken = (token: string) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
};

const clearAuthToken = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
};

export { AUTH_TOKEN_KEY, clearAuthToken, getAuthToken, setAuthToken };
