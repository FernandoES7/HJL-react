import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

function mapUsuario(usuario, token) {
  return {
    id: usuario.id ?? usuario.id_cliente,
    name: usuario.nombre,
    email: usuario.email,
    documento: usuario.documento,
    role: usuario.rol === 'admin' ? 'admin' : 'customer',
    token,
  };
}

function persistSession(usuario, token, setUser) {
  const sessionUser = mapUsuario(usuario, token);
  localStorage.setItem('hostal_user', JSON.stringify(sessionUser));
  localStorage.setItem('hostal_token', token);
  setUser(sessionUser);
  return sessionUser;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('hostal_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('hostal_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('hostal_user');
        localStorage.removeItem('hostal_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    return persistSession(res.data.usuario, res.data.token, setUser);
  };

  const register = async (nombre, email, password, documento) => {
    const res = await authAPI.register(nombre, email, password, documento);
    return persistSession(res.data.usuario, res.data.token, setUser);
  };

  const logout = () => {
    localStorage.removeItem('hostal_user');
    localStorage.removeItem('hostal_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
