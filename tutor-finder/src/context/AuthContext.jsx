import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();
const ACCESS_TOKEN_KEY = "accessToken";

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
    const authCheckStarted = useRef(false);

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
        try {
            const res = await fetch(`${import.meta.env.VITE_ENDPOINT_URL}/api/auth/refresh`,{
                method: "POST",
                credentials: "include"
            });

            const data = await res.json();

            if (!res.ok || !data.accessToken) {
                setUser(null);
                setProfile(null);
                setAccessToken(null);
                setIsLoggedIn(false);
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                return null;
            }

            setAccessToken(data.accessToken);
            localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
            return data.accessToken;

        } 
        catch (error) {
            setUser(null);
            setProfile(null);
            setAccessToken(null);
            setIsLoggedIn(false);
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            return null;
        }
    };

    useEffect(() => {
        if (!isLoggedIn) return undefined;

        const interval = setInterval(async () => {
            try {
                await refreshAccessToken();
            } catch (err) {
                console.error("Token refresh failed:", err);
            }
        }, 14 * 60 * 1000); // 14 minutes

        return () => clearInterval(interval);
    }, [isLoggedIn]);

  // fetch the full user data here
    const fetchUser = async (token) => {
        try {
        if (!token) {
            console.log("No access token available");
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
            setUser(null);
            setProfile(null);
            setAccessToken(null);
            setIsLoggedIn(false);
            return null;
        }
        setUser(data.user);

        setProfile(data.user?.profile);
        return data.user;

        } catch (error) {
            console.log("Error fetching user:", error);
            return null;
        }
    };

    // login
    const loginUser = async (email, password) => {
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

            console.log(data);

            setAccessToken(data.accessToken);
            localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);

            const decoded = decodeAccessToken(data.accessToken);
            setIsLoggedIn(true);

            await fetchUser(data.accessToken);

            return { success: true };

        } catch (error) {
            setAuthError(error.message);
            return { success: false, error: error.message };
        }
    };

    // logout
    const logout = async () => {
        try {
            setUser(null);
            setProfile(null);
            setAccessToken(null);
            setIsLoggedIn(false);
            localStorage.removeItem(ACCESS_TOKEN_KEY);

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
        if (authCheckStarted.current) return;
        authCheckStarted.current = true;
        setIsLoading(true);

        try {
            const token = await refreshAccessToken();

            if (!token) {
                setIsLoading(false);
                return;
            }

            const decoded = decodeAccessToken(token);

            setAccessToken(token);
            setIsLoggedIn(true);

            // IMPORTANT: pass token directly
            await fetchUser(token);

        } catch (error) {
            setAuthError("Authentication error");
            setUser(null);
            setProfile(null);
            setAccessToken(null);
            setIsLoggedIn(false);
            localStorage.removeItem(ACCESS_TOKEN_KEY);
        }

        setIsLoading(false);
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
        isAuthenticated: isLoggedIn,
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