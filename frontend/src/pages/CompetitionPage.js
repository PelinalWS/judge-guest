import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { UserContext } from '../UserContext';
import { QRCodeCanvas } from 'qrcode.react';
import ProjectList from './ProjectList';
import ConnectedUsersList from './ConnectedUsersList';
import './styles.css';

// Backend server ile socket bağlantısı. (Backend sunucusu ip!!!)
const socket = io('http://192.168.59.151:5000');

function CompetitionPage() {
    // URL'den yarışma kimliğini alma
    const { competitionId } = useParams();
    // Sayfa yönlendirmesi için navigate işlevi
    const navigate = useNavigate();
    // Kullanıcı bilgisini al ve güncellemek için
    const { user, setUser } = useContext(UserContext);

    const [competition, setCompetition] = useState(null); // Yarışma bilgisi
    const [username, setUsername] = useState(user.name || ''); // Kullanıcı adı
    const [juryMembers, setJuryMembers] = useState([]); // Jüri üyeleri
    const [votingStarted, setVotingStarted] = useState(false); // Oylamanın başlayıp başlamadığını takip eder
    const [votingFinished, setVotingFinished] = useState(false); // Oylamanın bitip bitmediğini takip eder
    const [resultsVisible, setResultsVisible] = useState(false); // Sonuçların görünüp görünmediğini takip eder


    useEffect(() => {
        if (!user.name) {
            return;
        }

        // Yarışmaya katılma bildirimi
        socket.emit('joinCompetition', { competitionId, name: user.name });

        // Yarışma verisini dinler
        socket.on('competitionData', (data) => {
            // Yarışmaya katılan kullanıcıları unique olacak şekilde filtreleme
            const uniqueUsers = Array.from(new Set(data.connectedUsers.map(u => u.name)))
                .map(name => data.connectedUsers.find(u => u.name === name));

            // Yarışma bilgilerini günceller
            setCompetition({
                ...data,
                connectedUsers: uniqueUsers,
            });
            setJuryMembers(data.juryMembers || []);
            setVotingStarted(data.votingStarted || false);
            setVotingFinished(data.votingFinished || false);
            setResultsVisible(data.resultsVisible || false);
        });

        // unmount olduğunda dinleyiciyi kaldır
        return () => {
            socket.off('competitionData');
        };
    }, [competitionId, user]);

    // Kullanıcı adını kaydetme işlemi
    const handleUsernameSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            setUser({ name: username, role: 'user' });
            socket.emit('joinCompetition', { competitionId, name: username });
        }
    };

    // Oylamayı başlatma işlemi
    const startVoting = () => {
        setVotingStarted(true);
        socket.emit('startVoting', { competitionId });
    };

    // Oylamayı bitirme işlemi
    const finishVoting = () => {
        setVotingStarted(false);
        setVotingFinished(true);
        socket.emit('finishVoting', { competitionId });
    };

    // Sonuçları gösterme işlemi
    const handleShowResults = () => {
        socket.emit('showResults', { competitionId });
        setResultsVisible(true);
    };

    // Lobiye geri dönme işlemini yönetir
    const returnToLobby = () => {
        navigate('/lobby');
    };

    // Eğer kullanıcı adı yoksa kullanıcıdan adını girmesini ister (Link ile baglananlar icin)
    if (!user.name) {
        return (
            <div className="container">
                <h2>Yarışmaya Katıl</h2>
                <form onSubmit={handleUsernameSubmit}>
                    <label>Kullanıcı Adınızı Girin:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <button type="submit">Katıl</button>
                </form>
            </div>
        );
    }

    // Eğer yarışma verisi henüz gelmemişse
    if (!competition) {
        return <div>Yarışma bulunamadı...</div>;
    }

    // Eğer sonuçlar görünürse projeleri puanlarına göre sıralar degilse sıralamayı olduğu gibi bırakır
    const sortedProjects = resultsVisible
        ? [...competition.projects].sort((a, b) => b.averageScore - a.averageScore)
        : competition.projects;

    return (
        <div className="container">
            <h1>{competition.name}</h1>
            <h3>Tarih: {competition.date || 'Tarih belirtilmedi'}</h3>

            {/* QR kod */}
            <div className="qr-section">
                <div className="competition-code">
                    <span>Yarışma Kodu:</span>
                    <strong>{competitionId}</strong>
                </div>
                <QRCodeCanvas
                    value={`http://192.168.59.151:3000/competition/${competitionId}`}
                    size={200}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"H"}
                    includeMargin={true}
                />
                <p>Yarışmaya katılmak için bu QR kodu tarayın.</p>
            </div>

            {/* Projeleri listeleyen bileşen */}
            <h3>Projeler</h3>
            <ProjectList
                projects={sortedProjects}
                votingStarted={votingStarted}
                resultsVisible={resultsVisible}
                user={user}
                competitionId={competitionId}
            />

            {/* Katılımcıları listeleme */}
            <h3>Katılımcılar</h3>
            <ConnectedUsersList
                connectedUsers={competition.connectedUsers}
                juryMembers={juryMembers}
                user={user}
                toggleJuryMember={(userName) => {
                    const updatedJury = juryMembers.includes(userName)
                        ? juryMembers.filter((jury) => jury !== userName)
                        : [...juryMembers, userName];

                    setJuryMembers(updatedJury);
                    socket.emit('updateJuryMembers', { competitionId, juryMembers: updatedJury });
                }}
            />

            {/* oylamayı başlatma, bitirme ve sonuçları gösterme işlemleri (admin veya member için) */}
            {(user.role === 'admin' || user.role === 'member') && (
                <div style={{ marginTop: '20px' }}>
                    <button onClick={startVoting} disabled={votingStarted || votingFinished}>
                        Oylamayı Başlat
                    </button>
                    <button onClick={finishVoting} disabled={!votingStarted} style={{ marginLeft: '10px' }}>
                        Oylamayı Bitir
                    </button>
                    {!resultsVisible && votingFinished && (
                        <button onClick={handleShowResults} style={{ marginLeft: '10px' }}>
                            Sonuçları Gör
                        </button>
                    )}
                </div>
            )}

            {/* Sonuçlar görünüyorsa lobiye dönme butonu */}
            {resultsVisible && (
                <div style={{ marginTop: '20px' }}>
                    <button onClick={returnToLobby}>Lobiye Dön</button>
                </div>
            )}
        </div>
    );
}

export default CompetitionPage;
