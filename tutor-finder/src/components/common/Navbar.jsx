// src/components/common/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import {
  FaBell,
  FaComment,
  FaSignOutAlt,
  FaChevronDown,
  FaBook,
  FaUserCircle,
  FaGraduationCap,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

// ============ Click-outside hook ============
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

// ============ Desktop nav link ============
const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative py-2 text-sm font-medium transition-colors ${
        isActive ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
      }`
    }
  >
    {({ isActive }) => (
      <>
        {children}
        {isActive && (
          <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" />
        )}
      </>
    )}
  </NavLink>
);

// ============ Icon button (bell, chat) ============
const IconButton = ({ icon: Icon, badge, onClick, to, label }) => {
  const classes =
    'relative inline-flex items-center justify-center w-10 h-10 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors';

  const content = (
    <>
      <Icon className="w-[18px] h-[18px]" />
      {badge > 0 && (
        <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={label}>
        {content}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={classes} aria-label={label}>
      {content}
    </button>
  );
};

// ============ Main ============
const Navbar = () => {
  const { user, logout, isLoggedIn } = useAuth();
  const { getUnreadCount } = useNotification();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = getUnreadCount?.() ?? 0;

  useClickOutside(profileRef, () => setIsProfileOpen(false));
  useClickOutside(notifRef, () => setIsNotifOpen(false));

  // Elevate on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const closeMobileMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const dashboardPath =
    user?.role === 'tutor' ? '/dashboard/tutor' : '/dashboard/student';

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/search', label: 'Find Tutors' },
  ];

  const initials =
    user?.profilePic
      ? null
      : [user?.firstName, user?.lastName]
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'U';

  const profilePicUrl = user?.profilePic
    ? user.profilePic.startsWith('http')
      ? user.profilePic
      : `${import.meta.env.VITE_ENDPOINT_URL}${user.profilePic}`
    : null;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full bg-white/85 backdrop-blur-lg border-b transition-all duration-200 ${
          scrolled ? 'border-gray-200 shadow-soft' : 'border-transparent'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-3">

            {/* ========== LOGO ========== */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
                <FaGraduationCap className="text-white w-[18px] h-[18px]" />
              </div>
              <span className="hidden sm:inline text-[17px] font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Tutor Finder
              </span>
            </Link>

            {/* ========== DESKTOP NAV ========== */}
            <div className="hidden md:flex items-center gap-8 ml-6">
              {navLinks.map((link) => (
                <NavItem key={link.to} to={link.to}>
                  {link.label}
                </NavItem>
              ))}
            </div>

            {/* ========== RIGHT SIDE ========== */}
            <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">

              {isLoggedIn ? (
                <>

                  {/* Messages */}
                  <IconButton icon={FaComment} to="/messages" label="Messages" />

                  {/* Profile */}
                  <div className="relative ml-1" ref={profileRef}>
                    <button
                      onClick={() => {
                        setIsProfileOpen((v) => !v);
                        setIsNotifOpen(false);
                      }}
                      className={`flex items-center gap-2 p-1 pr-2 rounded-full transition-all border ${
                        isProfileOpen
                          ? 'bg-primary-50 border-primary-200'
                          : 'hover:bg-gray-100 border-transparent'
                      }`}
                      aria-label="Open profile menu"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold text-xs ring-2 ring-white">
                        {profilePicUrl ? (
                          <img
                            src={profilePicUrl}
                            alt={user?.firstName || 'User'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      <FaChevronDown
                        className={`w-2.5 h-2.5 text-gray-400 transition-transform hidden sm:block ${
                          isProfileOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-3 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-hard border border-gray-100 py-2 z-50 overflow-hidden">

                        {/* Header */}
                        <div className="px-4 py-3.5 border-b border-gray-100">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {[user?.firstName, user?.lastName]
                              .filter(Boolean)
                              .join(' ') || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {user?.email}
                          </p>
                          {user?.role && (
                            <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-primary-50 text-primary-700 rounded-full">
                              {user.role}
                            </span>
                          )}
                        </div>

                        {/* Links */}
                        <div className="py-1.5">
                          <Link
                            to={dashboardPath}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <MdDashboard className="w-4 h-4 text-gray-400" />
                            Dashboard
                          </Link>
                          <Link
                            to="/search"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FaBook className="w-4 h-4 text-gray-400" />
                            Find Tutors
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 pt-1.5">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <FaSignOutAlt className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* ========== MOBILE TOGGLE ========== */}
              <button
                onClick={() => setIsMenuOpen((v) => !v)}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? (
                  <FaTimes className="w-5 h-5" />
                ) : (
                  <FaBars className="w-5 h-5" />
                )}
              </button>

            </div>
          </div>
        </div>
      </nav>

      {/* ========== MOBILE MENU ========== */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 bg-black/30 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={closeMobileMenu}
          />

          <div className="fixed inset-x-0 top-16 z-50 md:hidden bg-white border-b border-gray-200 shadow-hard rounded-b-2xl animate-slide-down">
            <div className="p-4 space-y-1.5">

              {/* Links */}
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {!isLoggedIn ? (
                <div className="pt-3 mt-2 border-t border-gray-100 space-y-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="block btn-primary text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="pt-3 mt-2 border-t border-gray-100 space-y-1">
                  <Link
                    to={dashboardPath}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <MdDashboard className="w-4 h-4 text-gray-400" />
                    Dashboard
                  </Link>
                  <Link
                    to="/messages"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FaComment className="w-4 h-4 text-gray-400" />
                    Messages
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;