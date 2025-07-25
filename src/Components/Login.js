import React, {useState} from "react";


function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const res = await fetch("http://localhost:8000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({username, password}),
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Logged in successfully");
            } else {
                alert(data.error || "Login failed");
            }
        } catch (err) {
            alert("Login failed: " + err.message);
        }
    };

    return (
        <section className="auth-section">
            <div className="auth-card">
                <h2>Login</h2>
                <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/><br/>
                <input type="password" placeholder="Password" value={password}
                       onChange={(e) => setPassword(e.target.value)}/><br/>
                <button onClick={handleLogin}>Login</button>
            </div>
        </section>
    );
}

export default Login;
