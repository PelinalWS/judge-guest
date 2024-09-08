import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import { io } from 'socket.io-client';

const url = require('../config.json').url;
const socket = io(`${url.backend}`);

function SignUpPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = (e) => {
        e.preventDefault();
        if (name && email && password) {
            socket.emit('signUp', {name: name, email: email, password: password})
        }
    };

    const goLog = () => {
        navigate('/logIn');
    };

    useEffect(()=> {
        socket.on('signUp-confirm', goLog);
        const handleSignUpReject = (message) => {
            alert(message);
        };
        socket.on('signUp-reject', handleSignUpReject);
        return () => {
            socket.off('signUp-confirm', goLog);
            socket.off('signUp-reject', handleSignUpReject);
            };
    });

    return (
        <div className="container">
            <h1>Kayıt</h1>
            <form onSubmit={handleSignUp}>
                <div>
                    <label>Kullanıcı Adı:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{
                            width: '95%',
                            marginLeft: '10px'
                        }}
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
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
                <button type="submit">Kayıt Ol</button>
                <button onClick={goLog}>Giriş Yap</button>
            </form>
        </div>
    );
}

export default SignUpPage;