import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './styles.css';

import { io } from 'socket.io-client';
const socket = io('http://localhost:5000');

function LoginPage() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if(email && password) {
            socket.emit('login-request', {mail: email, password: password});
            socket.on('login-confirm', (name, email, role, token) => {
                setUser({
                    name: name,
                    email: email,
                    password: '',
                    role: role,
                    token: token
                });
                navigate('/lobby');
            });
            navigate('/login');
            socket.on('login-reject', (message) => {
                
            })
        }
    };

    const goSign = () => {
        navigate('/signUp');
    };

    return (
        <div className="container">
            <h1>Giriş</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label>Parola</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Giriş Yap</button>
                <button onClick={goSign}>Kayıt Ol</button>
            </form>
        </div>
    );
}

export default LoginPage;
