// src/Components/Signup.js
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSignup = async () => {
        if (!email || !username || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        setLoading(true);
        const result = await signup(email, username, password);
        setLoading(false);
        
        if (result.success) {
            alert('Signup successful! You can now log in.');
            navigate('/login');
        } else {
            alert(result.error || 'Signup failed');
        }
    };

    return (
        <section className="auth-section">
            <div className="auth-card">
                <h2>Signup</h2>
                <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <br />
                <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                <br />
                <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                <br />
                <button onClick={handleSignup} disabled={loading}>
                    {loading ? 'Signing up...' : 'Signup'}
                </button>
            </div>
        </section>
    );
}

export default Signup;
