import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './styles.css';

import { io } from 'socket.io-client';
const socket = io('http://192.168.59.151:5000');

function LoginPage() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if(email && password) {
            setUser('', email, password, '', '');
            socket.emit('login-request', {mail: email, password: password});
            socket.on('login-confirm', (data) => {
                setUser({
                    name: data.name,
                    email: data.email,
                    password: '',
                    role: data.role,
                    token: data.token
                });
            });
            navigate('/login');
            socket.on('login-reject', (data) => {

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
