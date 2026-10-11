import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// provider
export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
    const authVersionRef = useRef(0);
    const refreshPromiseRef = useRef(null);

// token helpers
    const decodeAccessToken = (token = accessToken) => {
        if (!token) return null;

        try {
            return jwtDecode(token);
        } catch (error) {
            return null;
        }
    };

    const isTokenExpired = (token = accessToken) => {
        try {
            if (!token) return true;

            const decoded = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            return true;
        }
    };

    const getValidAccessToken = async () => {
        if (!accessToken || isTokenExpired(accessToken)) {
            return await refreshAccessToken();
        }
        return accessToken;
    };

  // refresh token via httpOnly cookie
    const refreshAccessToken = async () => {
        if (refreshPromiseRef.current) return refreshPromiseRef.current;

        const authVersion = authVersionRef.current;
        const refreshPromise = (async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_ENDPOINT_URL}/api/auth/refresh`, {
                    method: "POST",
                    credentials: "include"
                });
                const data = await res.json().catch(() => ({}));

                if (!res.ok || !data.accessToken) return null;

                if (authVersionRef.current === authVersion) {
                    setAccessToken(data.accessToken);
                }
                return data.accessToken;
            } catch {
                return null;
            }
        })().finally(() => {
            if (refreshPromiseRef.current === refreshPromise) {
                refreshPromiseRef.current = null;
            }
        });

        refreshPromiseRef.current = refreshPromise;
        return refreshPromise;
    };

    useEffect(() => {
        if (!isLoggedIn) return undefined;

        const interval = setInterval(async () => {
            await refreshAccessToken();
        }, 14 * 60 * 1000); // 14 minutes

        return () => clearInterval(interval);
    }, [isLoggedIn]);

  // fetch the full user data here
    const fetchUser = async (token, authVersion = authVersionRef.current) => {
        try {
        if (!token) {
            return null;
        }

        const res = await fetch(`${import.meta.env.VITE_ENDPOINT_URL}/api/users/me`,{
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
            if (authVersionRef.current === authVersion) {
                setAuthError(data.message || "Unable to load your account");
            }
            return null;
        }
        if (authVersionRef.current === authVersion) {
            setUser(data.user);
            setProfile(data.user?.profile ?? null);
        }
        return data.user;

        } catch (error) {
            if (authVersionRef.current === authVersion) {
                setAuthError(error.message || "Unable to load your account");
            }
            return null;
        }
    };

    // login
    const loginUser = async (email, password) => {
        const authVersion = ++authVersionRef.current;
        setIsLoading(true);
        try {
            setAuthError(null);

            const res = await fetch(`${import.meta.env.VITE_ENDPOINT_URL}/api/auth/login`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Login failed");
            }

            setUser(data.user || null);
            setAccessToken(data.accessToken);
            setIsLoggedIn(true);

            await fetchUser(data.accessToken, authVersion);

            return { success: true };

        } catch (error) {
            setAuthError(error.message);
            return { success: false, error: error.message };
        } finally {
            if (authVersionRef.current === authVersion) {
                setIsLoading(false);
            }
        }
    };

    // logout
    const logout = async () => {
        authVersionRef.current += 1;
        try {
            setUser(null);
            setProfile(null);
            setAccessToken(null);
            setIsLoggedIn(false);

            await fetch(
                `${import.meta.env.VITE_ENDPOINT_URL}/api/auth/logout`,
                {
                method: "POST",
                credentials: "include"
                }
            );
        } catch (error) {
            console.error(error);
        }
    };

    // initial auth check
    const checkAuth = async () => {
        setIsLoading(true);
        const authVersion = authVersionRef.current;

        try {
            const token = await refreshAccessToken();

            if (!token || authVersionRef.current !== authVersion) return;

            setAccessToken(token);
            setIsLoggedIn(true);

            await fetchUser(token, authVersion);

        } catch (error) {
            if (authVersionRef.current === authVersion) {
                setAuthError("Authentication error");
            }
        } finally {
            if (authVersionRef.current === authVersion) {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // context values
    const value = {
        user,
        profile,
        accessToken,
        isLoggedIn,
        isLoading,
        authError,

        login: loginUser,
        logout,

        getValidAccessToken,
        decodeAccessToken,
        isTokenExpired
    };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};