import React, {useState, useEffect} from "react";
import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import Upload from "./Components/Upload";
import Analysis from "./Components/Analysis";
import History from "./Components/History";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import UserMenu from "./Components/UserMenu";
import { AuthProvider, useAuth } from "./Components/AuthContext";
import './App.css';

function AppContent() {
    const [darkMode, setDarkMode] = useState(false);
    const { user, loading } = useAuth();

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

    const [result, setResult] = useState({});

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <>
            <header>
                <h1>Mental Health App</h1>
                <nav>
                    <Link id="btn" to="/">Home</Link>
                    <Link id="btn" to="/history">History</Link>
                    {user ? (
                        <UserMenu />
                    ) : (
                        <>
                            <Link id="btn" to="/login">Login</Link>
                            <Link id="btn" to="/signup">Signup</Link>
                        </>
                    )}
                    <button
                        id="dark-mode-toggle"
                        className={darkMode ? 'dark' : 'light'}
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
                                {/* Sun SVG */}
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12"
                                                                                                          cy="12"
                                                                                                          r="5"/><line
                                    x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line
                                    x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78"
                                                                               y2="19.78"/><line x1="1" y1="12"
                                                                                                 x2="3"
                                                                                                 y2="12"/><line
                                    x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64"
                                                                           y2="18.36"/><line x1="18.36" y1="5.64"
                                                                                             x2="19.78" y2="4.22"/></svg>
                            </span>
                            <span className="icon-moon" aria-hidden="true" style={{
                                opacity: darkMode ? 1 : 0,
                                transform: darkMode ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.7)',
                                transition: 'all 0.4s cubic-bezier(.4,0,.2,1)'
                            }}>
                                {/* Moon SVG */}
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path
                                    d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
                            </span>
                        </span>
                    </button>
                </nav>
            </header>

            <Routes>
                <Route path="/" element={
                    <>
                        <Upload setResult={setResult}/>
                        <Analysis>{result}</Analysis>
                    </>
                }/>
                <Route path="/history" element={<History/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>
            </Routes>

            <footer>Mental Health 2025</footer>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
