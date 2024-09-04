import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './styles.css';

import { io } from 'socket.io-client';
const socket = io('http://192.168.59.151:5000');

function SignUpPage() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [showSignup, setShowSignup] = useState(true);

    const handleSignUp = (e) => {
        e.preventDefault();
        if (name && email && password && role) {
            socket.emit('signUp', {name: name, email: email, password: password, role: role})

        }
    };
    const goLog = () => {
        navigate('/login');
    };

    return (
        <div className="container">
            <h1>Kayıt</h1>
            <form onSubmit={handleSignUp}>
                <div>
                    <label>İsim:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
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
                <div>
                    <label>Başvurulan Rol:</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                    >
                        <option value="" disabled selected>Rolünü Seç</option>
                        <option value="user">Kullanıcı</option>
                        <option value="member">Üye</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button type="submit" onClick={goLog}>Kayıt Ol</button>
            </form>
        </div>
    );
}

export default SignUpPage;
