import React, {useState, useEffect} from "react";
import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import Upload from "./Components/Upload";
import Analysis from "./Components/Analysis";
import History from "./Components/History";
import Dashboard from "./Components/Dashboard";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import UserMenu from "./Components/UserMenu";
import Navigation from "./Components/Navigation";
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
                <div className="header-content">
                    <Navigation darkMode={darkMode} setDarkMode={setDarkMode} />
                </div>
            </header>

            <Routes>
                <Route path="/" element={
                    <>
                        <Upload setResult={setResult}/>
                        <Analysis>{result}</Analysis>
                    </>
                }/>
                <Route path="/dashboard" element={<Dashboard/>}/>
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
