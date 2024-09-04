import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { UserContext } from '../UserContext';
import './styles.css';

// Backend sunucusuyla bağlantı kurma
const socket = io('http://192.168.59.151:5000'); // backend server ip

function VotePage() {
    // URL'den competitionId ve projectId parametreleri
    const { competitionId, projectId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(UserContext);

    const [competition, setCompetition] = useState(null);
    const [votes, setVotes] = useState({});
    const [isJury, setIsJury] = useState(false); // Kullanıcının jüri üyesi olup olmadığını takip etme
    const [comment, setComment] = useState('');

    // competitionId, user, location değiştiğinde çalışacak olan effect
    useEffect(() => {
        // Kullanıcı adı veya rolü yoksa logine yönlendir
        if (!user.name || !user.role) {
            navigate('/');
            return;
        }

        // Yarışma verileri requesti
        socket.emit('requestCompetitionData', { competitionId });

        socket.on('competitionData', (data) => {
            setCompetition(data);
            setIsJury(location.state?.juryMembers.includes(user.name)); // Kullanıcının jüri olup olmadığını kontrol et

            // Her kriter için default oy (3-orta)
            const initialVotes = {};
            data.criteria.forEach((criterion) => {
                initialVotes[criterion] = 3; // default
            });
            setVotes(initialVotes);
        });

        return () => {
            socket.off('competitionData');
        };
    }, [competitionId, user, navigate, location.state]);

    // Kullanıcının verdiği oyları güncelleyen fonksiyon
    const handleVoteChange = (criterion, score) => {
        setVotes((prevVotes) => ({
            ...prevVotes,
            [criterion]: score,
        }));
    };

    // Oyları ve yorumu gönderme işlemi
    const submitVotes = () => {
        // Tüm oyların toplamını ve ortalamasını hesaplama
        const totalScore = Object.values(votes).reduce((sum, score) => sum + score, 0);
        const averageScore = totalScore / Object.keys(votes).length;
        const finalScore = isJury ? averageScore * 2 : averageScore; // Jüri üyesiyse puan ikiyle çarpılır

        // Oyları ve yorumu sunucuya gönder
        socket.emit('submitVotes', {
            competitionId,
            projectId,
            finalScore,
            userName: user.name,
            votes, // Detaylı oylar
            comment: comment.trim(),
        });

        // Oylama işlemi tamamlandıktan sonra yarışma sayfasına yönlendir
        navigate(`/competition/${competitionId}`);
    };

    if (!competition) {
        return <div>Yarışma bulunamadı</div>;
    }

    // Proje verisini yarışma projeleri arasında bulma
    const project = competition.projects.find((p) => p.id === projectId);
    if (!project) {
        return <div>Proje bulunamadı.</div>;
    }

    return (
        <div className="container">
            <h2>{project.name} için Oy Verin</h2>
            {isJury && <p className="jury-info">Jüri üyesi olarak atandınız. Oylarınız iki katı değerindedir.</p>}
            <div className="likert-container">
                {/* Her kriter için Likert ölçeği oluşturma */}
                {competition.criteria.map((criterion, index) => (
                    <div key={index} className="likert-item" style={{ marginBottom: '15px' }}>
                        <label>{criterion}: </label>
                        <div className="likert-buttons">
                            {[1, 2, 3, 4, 5].map((score) => (
                                <button
                                    key={score}
                                    onClick={() => handleVoteChange(criterion, score)}
                                    className={votes[criterion] === score ? 'selected' : ''}>
                                    {score}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '15px' }}>
                <label>Yorum Bırakın:</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Yorumunuzu buraya yazın..."
                />
            </div>
            <button onClick={submitVotes} style={{ width: '100%', marginTop: '20px' }}>
                Oyları Gönder
            </button>
        </div>
    );
}

export default VotePage;
