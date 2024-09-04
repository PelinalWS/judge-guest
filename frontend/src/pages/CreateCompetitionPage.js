import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { UserContext } from '../UserContext';
import CompetitionForm from './CompetitionForm';
import './styles.css';

// Socket.io bağlantısını başlat. (backend ip)
const socket = io('http://192.168.59.151:5000');

function CreateCompetitionPage() {
    const navigate = useNavigate();
    // Kullanıcı bilgilerini UserContextten alma
    const { user } = useContext(UserContext);

    const [competitionName, setCompetitionName] = useState(''); // Yarışma adı
    const [competitionDate, setCompetitionDate] = useState(''); // Yarışma tarihi
    const [criteria, setCriteria] = useState([]); // Yarışma kriterleri
    const [projects, setProjects] = useState([]); // Yarışma projeleri

    // Yarışma oluşturma işlemi
    const handleCreateCompetition = () => {
        // Tüm alanların dolu olup olmadığını kontrol etme
        if (competitionName && competitionDate && criteria.length && projects.length) {
            // Eğer tüm alanlar doluysa yarışma oluşturma requestini servera gönder
            socket.emit('createCompetition', {
                name: competitionName,
                date: competitionDate,
                criteria,
                projects,
                createdBy: user.name,
            });

            // Yarışma başarıyla oluşturulduğunda yönlendirme yap
            socket.on('competitionCreated', (competitionId) => {
                navigate(`/competition/${competitionId}`);
            });
        } else {
            // Eğer bir veya daha fazla alan boşsa uyarı göster
            alert('Lütfen tüm alanları, yarışma tarihi de dahil olmak üzere doldurun.');
        }
    };

    return (
        <div className="container">
            <h1>Yarışma Oluştur</h1>
            {/* Yarışma formu bileşeni */}
            <CompetitionForm
                competitionName={competitionName}
                setCompetitionName={setCompetitionName}
                competitionDate={competitionDate}
                setCompetitionDate={setCompetitionDate}
                criteria={criteria}
                setCriteria={setCriteria}
                projects={projects}
                setProjects={setProjects}
            />
            {/* Yarışma oluşturma butonu */}
            <button onClick={handleCreateCompetition} style={{ width: '90%', padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '15px' }}>
                Yarışma Oluştur
            </button>
        </div>
    );
}

export default CreateCompetitionPage;
