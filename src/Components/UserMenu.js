import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';

function UserMenu() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const timeoutRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150); // Small delay to prevent accidental closing
    };

    const handleClick = () => {
        setIsOpen(!isOpen);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div 
            ref={menuRef}
            className={`user-menu ${isOpen ? 'open' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="user-info" onClick={handleClick}>
                <span className="username">{user?.username}</span>
                <span className="user-icon">👤</span>
                <span className="dropdown-arrow">▼</span>
            </div>
            
            {isOpen && (
                <div className="dropdown-menu">
                    <div className="user-details">
                        <span className="user-email">{user?.email}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <span className="logout-icon">🚪</span>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserMenu; 