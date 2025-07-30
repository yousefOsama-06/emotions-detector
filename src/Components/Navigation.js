import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import UserMenu from './UserMenu';

function Navigation({ darkMode, setDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

    return (
    <nav className="main-nav">
      {/* Dark Mode Toggle */}
      <button
        className="dark-mode-toggle"
        onClick={() => setDarkMode((d) => !d)}
        aria-label="Toggle dark mode"
        type="button"
      >
       <span className="icon-wrapper">
         <span className="icon-sun" aria-hidden="true" style={{
           opacity: darkMode ? 0 : 1,
           transform: darkMode ? 'rotate(-90deg) scale(0.7)' : 'rotate(0deg) scale(1)',
           transition: 'all 0.4s cubic-bezier(.4,0,.2,1)'
         }}>
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
             <circle cx="12" cy="12" r="5"/>
             <line x1="12" y1="1" x2="12" y2="3"/>
             <line x1="12" y1="21" x2="12" y2="23"/>
             <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
             <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
             <line x1="1" y1="12" x2="3" y2="12"/>
             <line x1="21" y1="12" x2="23" y2="12"/>
             <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
             <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
           </svg>
         </span>
         <span className="icon-moon" aria-hidden="true" style={{
           opacity: darkMode ? 1 : 0,
           transform: darkMode ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.7)',
           transition: 'all 0.4s cubic-bezier(.4,0,.2,1)'
         }}>
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
             <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
           </svg>
         </span>
       </span>
     </button>

           {/* User Menu */}
      {user && <UserMenu />}

      {/* Navigation Dropdown */}
      <div className="nav-dropdown-container" ref={dropdownRef}>
        <button 
          className="nav-toggle" 
          onClick={toggleDropdown}
          aria-label="Toggle navigation menu"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
          <span className="nav-toggle-text">Menu</span>
        </button>
        
        <div className={`nav-dropdown ${isOpen ? 'open' : ''}`}>
          <Link className="nav-dropdown-link" to="/" onClick={closeDropdown}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Home
          </Link>
          
          <Link className="nav-dropdown-link" to="/dashboard" onClick={closeDropdown}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </Link>
          
          <Link className="nav-dropdown-link" to="/history" onClick={closeDropdown}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            History
          </Link>
          
          {!user && (
            <>
              <Link className="nav-dropdown-link" to="/login" onClick={closeDropdown}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10,17 15,12 10,7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Login
              </Link>
              
              <Link className="nav-dropdown-link" to="/signup" onClick={closeDropdown}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
   </nav>
 );
}

export default Navigation; 