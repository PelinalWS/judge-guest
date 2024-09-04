import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProjectList({ projects, votingStarted, resultsVisible, user, competitionId }) {
    const navigate = useNavigate();

    const handleVote = (projectId) => {
        navigate(`/competition/${competitionId}/vote/${projectId}`);
    };

    return (
        <div className="card-container">
            {projects.map((project, index) => (
                <div key={project.id} className={`card ${index === 0 && resultsVisible ? 'highlight' : ''}`}>
                    <div className="card-content">
                        <h4>{project.name}</h4>
                        <p>{project.description}</p>
                        {resultsVisible ? (
                            <>
                                <p>Ortalama Puan: {project.averageScore.toFixed(2)}</p>
                                <p>Kendi Puanınız: {project.votes[user.name] || 'Puan verilmedi'}</p>
                            </>
                        ) : (
                            <p>Verdiğiniz Puan: {project.votes[user.name] || 'Puan verilmedi'}</p>
                        )}
                    </div>
                    <div className="card-actions" style={{ marginTop: '15px' }}>
                        <button
                            onClick={() => handleVote(project.id)}
                            disabled={!votingStarted || project.votes[user.name]}>
                            {project.votes[user.name] ? 'Oy Kullanıldı' : 'Oy Ver'}
                        </button>
                        {project.votes[user.name] && <p style={{ marginTop: '10px' }}>Bu projeye zaten oy verdiniz.</p>}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ProjectList;
