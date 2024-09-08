import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import { io } from 'socket.io-client';

const url = require('../config.json').url;
const socket = io(`${url.backend}`);

function AuthPage(){
    const navigate = useNavigate();
    const [data, setData] = useState([]);



    useEffect(() => {
        socket.emit('request-users');

        socket.on('receive-users', (list) => {
          setData(list);
        });
        return () => {
            socket.off('receive-users');
        };
    });

    const updateRole = (chosen, newRole) => {
        socket.emit('update-user-auth', { email: chosen, newAuth: newRole });
      };

    const goLobby = () =>{
        navigate('/lobby');
    }

    return (
      <div className='container'>
      <div style={{ margin: '20px auto', width: '90%', maxWidth: '800px', overflowX: 'auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Kullanıcı Bilgileri</h1>
        {data.length > 0 ? (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              margin: '25px 0',
              fontSize: '1em',
              fontFamily: 'Arial, sans-serif',
              backgroundColor: '#f8f9fa',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <thead>
              <tr style={{
                      backgroundColor: '#007bff',
                      color: '#ffffff',
                      textAlign: 'center',
                      padding: '12px 15px',
                    }}>
                <th>Kullanıcı Adı</th>
                <th>Email</th>
                <th>Rol</th>
                <th style={{padding: '12px 15px'}}>Eylemler</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: '1px solid #dddddd',
                  }}
                >
                  {Object.values(row).map((value, i) => (
                    <td
                      key={i}
                      style={{
                        padding: '12px 15px',
                      }}
                    >
                      {value}
                    </td>
                  ))}
                  <td
                    style={{
                      padding: '12px 15px',
                      display: 'flex',
                      gap: '10px',
                    }}
                  >
                    <button
                      onClick={() => updateRole(row.email, 'user')}
                      disabled= {row.role === 'user'}
                    >
                      Kullanıcı
                    </button>
                    <button
                      onClick={() => updateRole(row.email, 'member')}
                      disabled= {row.role === 'member'}
                    >
                      Üye
                    </button>
                    <button
                      onClick={() => updateRole(row.email, 'admin')}
                      disabled= {row.role === 'admin'}
                    >
                      Admin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <>
            <p style={{ textAlign: 'center' }}>Erişilebilir bilgi yok.</p>
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <button onClick={goLobby}>Go to Lobby</button>
        </div>
      </div>
      </div>
    );
}

export default AuthPage;