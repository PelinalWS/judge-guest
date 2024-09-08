import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './styles.css';
import { io } from 'socket.io-client';

const url = require('../config.json').url;
const socket = io(`${url.backend}`);

function AdminPage() {
    const { competitionId } = useParams(); // URL'den yarışma ID'si alınıyor
    const navigate = useNavigate();
    const [data, setData] = useState([]);

    useEffect(() => {
        socket.emit('request-vote-table', competitionId);
        socket.on('receive-vote-table', (data) => {
            setData(data);
        });
    }, []);

    const goComp = () => {
      navigate(`/competition/${competitionId}`)
    }

    return (
        <div>
          <h1>Data Table</h1>
          {data.length > 0 ? (
            <table border="1">
              <thead>
                <tr>
                  {/* Dynamically render table headers based on data fields */}
                  {Object.keys(data[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Render each row of data */}
                {data.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <>
              <p style={{ alignContent: 'center' }}>No data available.</p>
              <button onClick={goComp}>Oylama Sayfasına Dön</button></>
          )}
        </div>
      );

}
export default AdminPage;