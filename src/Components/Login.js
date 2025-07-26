import React, {useState} from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!username || !password) {
            alert("Please fill in all fields");
            return;
        }
        
        setLoading(true);
        const result = await login(username, password);
        setLoading(false);
        
        if (result.success) {
            alert("Logged in successfully");
            navigate("/");
        } else {
            alert(result.error || "Login failed");
        }
    };

    return (
        <section className="auth-section">
            <div className="auth-card">
                <h2>Login</h2>
                <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/><br/>
                <input type="password" placeholder="Password" value={password}
                       onChange={(e) => setPassword(e.target.value)}/><br/>
                <button onClick={handleLogin} disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </div>
        </section>
    );
}

export default Login;
