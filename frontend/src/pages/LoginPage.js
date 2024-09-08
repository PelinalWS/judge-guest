import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './styles.css';
import { io } from 'socket.io-client';

const url = require('../config.json').url;
const socket = io(`${url.backend}`);

function LoginPage() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if(email && password) {
            socket.emit('login-request', {email: email, password: password});
        }
    };

    const goSign = () => {
        navigate('/signUp');
    };

    useEffect(() => {
        const handleLoginConfirm = (data) => {
            console.log('Logging in');
            setUser({
                name: data.name,
                email: data.email,
                password: 'XXX',
                role: data.role,
                token: data.token,
                // Other user properties
            });
            navigate('/lobby');
        };
        const handleLoginReject = (message) => {
            alert(message);
        };
        socket.on('login-confirm', handleLoginConfirm);
        socket.on('login-reject', handleLoginReject);
      
        // Cleanup listeners when component unmounts or effect re-runs
        return () => {
        socket.off('login-confirm', handleLoginConfirm);
        socket.off('login-reject', handleLoginReject);
        };      
    });

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
                        style={{
                            width: '95%',
                            marginLeft: '10px'
                        }}
                    />
                </div>
                <div>
                    <label>Parola</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            width: '95%',
                            marginLeft: '10px'
                        }}
                    />
                </div>
                <button type="submit">Giriş Yap</button>
                <button onClick={goSign}>Kayıt Ol</button>
            </form>
        </div>
    );
}

export default LoginPage;