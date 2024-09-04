import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './styles.css';

function LoginPage() {
    const navigate = useNavigate();
    const { setLog } = useContext(UserContext);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (name && email && password) {
            setLog({name, email, password});
            navigate('/lobby');
        } else if(email && password) {
            setLog({email, password})
            navigate('/lobby');
        } else if(name && password) {
            setLog({name, password})
            navigate('/lobby');
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
                    <label>İsim:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
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
