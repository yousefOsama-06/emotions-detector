// src/Components/Signup.js
import React, { useState } from 'react';

function Signup() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        try {
            const res = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert('Signup successful! You can now log in.');
            } else {
                alert(data.error || 'Signup failed');
            }
        } catch (err) {
            alert('Signup failed: ' + err.message);
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
                <button onClick={handleSignup}>Signup</button>
            </div>
        </section>
    );
}

export default Signup;
