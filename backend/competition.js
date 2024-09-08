// yarisma mantigi ile ilgili socket eventlerini içerir
const crypto = require('crypto');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const checks = require('./queries.js');
const process = require("./keys.json"); //gets the token keys

let competitions = {};

// Yarisma kodu generate eder (6 haneli)
function generateCompetitionCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
}

function handleSocketEvents(socket, io) {

    socket.on('signUp', ({ name, email, password, role }) => {
        console.log("kullanıcı kayıdı")
        checks.checkEmail(email, (error, det, results) => {
            if(error){
                console.log("email hata");
                console.log(det);
            }
            if(!error && !det){
                bcrypt.hash(password, 10, (error, hash) => {
                    if(error){
                        console.log("hash yaparken hata");
                    } else {
                        checks.addUser(name, email, hash, role);
                    }
                });
                console.log("kayıt başarılı");
                socket.emit('signUp-confirm');
            }
        });
    });

    socket.on('login-request', ({ email, password})=>{
        checks.checkEmail(email, (error, det, results) => {
            if(!error && !det){
                console.log("bağlı değil")
                const message = "Bu email bir hesaba bağlı değil";
                socket.emit('login-reject', (message));
            } else if(!error && det){
                console.log("hesap bulundu")
                bcrypt.compare(password, results.rows[0].password, (error, res) => {
                    console.log("şifre doğru");
                    if(!error & res){
                        const name = results.rows[0].name;
                        const email = results.rows[0].email;
                        const password = results.rows[0].password;
                        const role = results.rows[0].role;
                        if(role == "user"){
                            const tok = jwt.sign({
                                name: name,
                                email: email,
                                role: role
                            }, process.env.JWT_U, {
                                expiresIn: "2h"
                            });
                        socket.emit('login-confirm', {name, email, role, tok});
                        } else if(role == "member") {
                            const tok = jwt.sign({
                                name: name,
                                email: email,
                                role: role
                            }, process.env.JWT_M, {
                                expiresIn: "2h"
                            });
                        socket.emit('login-confirm', {name, email, role, tok});
                        } else if(role == "admin") {
                            const tok = jwt.sign({
                                name: name,
                                email: email,
                                role: role
                            }, process.env.JWT_A, {
                                expiresIn: "2h"
                            });
                        socket.emit('login-confirm', {name, email, role, tok});
                        } else {
                            const message = "Henüz rolünüz tanımlanmadı."
                            socket.emit('login-reject', (message));
                        }
                    }
                })
            }
        })
    });

     // Yarisma yaratma
     socket.on('createCompetition', ({ name, date, criteria, projects, createdBy, juryVoteCoefficient }) => {
        const competitionId = generateCompetitionCode();
        competitions[competitionId] = {
            name,
            date, 
            criteria,  // katsayılar ve acıklamalar criteria icinde
            projects: projects.map(project => ({
                ...project,
                totalScore: 0,
                voteCount: 0,
                averageScore: 0,
                votes: {},
                comments: []
            })),
            createdBy,
            connectedUsers: [],
            juryMembers: [],
            votingStarted: false,
            votingFinished: false,
            resultsVisible: false,
            juryVoteCoefficient: juryVoteCoefficient || 2,  // default jüri katsayısı
        };
    
        console.log(`Competition created: ${competitionId}`, competitions[competitionId]);
    
        socket.join(competitionId);
        socket.emit('competitionCreated', competitionId);
    });

    // Yarismaya katilma
    socket.on('joinCompetition', ({ competitionId, name }) => {
        checks.getComp(competitionId, (result) => {
            const competition = result;

        });
        if (competitions[competitionId]) {
            const competition = competitions[competitionId];

            const userExists = competition.connectedUsers.some((user) => user.name === name);
            if (!userExists) {
                competition.connectedUsers.push({ name });
            }

            socket.join(competitionId);
            io.in(competitionId).emit('competitionData', competition);
            console.log(`User ${name} joined competition: ${competitionId}`);
        } else {
            socket.emit('error', 'Competition not found');
            console.log(`Competition not found: ${competitionId}`);
        }
    });

    // Request Competition Data
    socket.on('requestCompetitionData', ({ competitionId }) => {
        checks.getComp(competitionId, (error1, results1) => {
            if(error1) {
                console.log(`No competition found with competitionId: ${competitionId}`);
                socket.emit('error', 'Competition not found');
            } else {
                checks.getProj(results1.rows[0].id, (error2, results2) => {
                    if(!error2 && results2.rowCount != 0){
                        const projects = {};
                        for(i = 0; i < results2.rowCount; i++){
                            projects[i] = {
                                id: results2.rows[i].id,
                                name: results2.rows[i].name,
                                description: results2.rows[i].description
                            };
                        }
                        const competition = {
                            name: results1.rows[0].name,
                            date: results1.rows[0].date,
                            description: results1.rows[0].description,
                            access: results1.rows[0].access_code,
                            projects: projects
                        }
                        console.log(`Sending competition data for competitionId: ${competitionId}`);
                        socket.emit('competitionData', competition);
                    }
                });

            }
        });
    });

    // Update Jury Members
    socket.on('updateJuryMembers', ({ competitionId, juryMembers }) => {
        if (competitions[competitionId]) {
            competitions[competitionId].juryMembers = juryMembers;
            io.in(competitionId).emit('competitionData', competitions[competitionId]);
            console.log(`Updated jury members for competition: ${competitionId}`);
        }
    });

    // Start Voting
    socket.on('startVoting', ({ competitionId }) => {
        if (competitions[competitionId]) {
            competitions[competitionId].votingStarted = true;
            io.in(competitionId).emit('competitionData', competitions[competitionId]);
            console.log(`Voting started for competition: ${competitionId}`);
        }
    });

    // Finish Voting
    socket.on('finishVoting', ({ competitionId }) => {
        if (competitions[competitionId]) {
            competitions[competitionId].votingFinished = true;
            competitions[competitionId].votingStarted = false;
            io.in(competitionId).emit('competitionData', competitions[competitionId]);
            console.log(`Voting finished for competition: ${competitionId}`);
        }
    });

    // Show Results
    socket.on('showResults', ({ competitionId }) => {
        if (competitions[competitionId]) {
            competitions[competitionId].resultsVisible = true;
            io.in(competitionId).emit('competitionData', competitions[competitionId]);
            console.log(`Results made visible for competition: ${competitionId}`);
        }
    });

    socket.on('submitVotes', ({ competitionId, projectId, userName, comment, votes }) => {
        const competition = competitions[competitionId];
        if (competition) {
            const project = competition.projects.find(p => p.id === projectId);
            if (project) {
                let totalWeightedScore = 0;
                let totalCoefficient = 0;
                let userWeightedScore = 0;
    
                // Oylar üzerinde dön ve her kriter için katsayı uygula
                Object.entries(votes).forEach(([criterionName, score]) => {
                    const criterion = competition.criteria.find(c => c.name === criterionName);
                    const criterionCoefficient = criterion ? criterion.coefficient : 1;
                    totalWeightedScore += score * criterionCoefficient;  // Katsayı uygula
                    totalCoefficient += criterionCoefficient;  // Katsayıları topla
    
                    // Kullanıcının oyu için ağırlıklı puanı hesapla
                    userWeightedScore += score * criterionCoefficient;
                });
    
                // Ağırlıklı ortalama puanı kriter sayısına göre hesapla
                const weightedAverageScore = totalWeightedScore / competition.criteria.length;
    
                const isJury = competition.juryMembers.includes(userName);
    
                // Kullanıcının ağırlıklı puanını kriter sayısına böl
                userWeightedScore = userWeightedScore / competition.criteria.length;
    
                // Eğer kullanıcı jüri üyesiyse, jüri oyu katsayısını uygula
                userWeightedScore = isJury ? userWeightedScore * competition.juryVoteCoefficient : userWeightedScore;
    
                // Oyu ve yorumu kaydet
                project.votes[userName] = {
                    ...votes,
                    weightedScore: userWeightedScore,  // Kullanıcının son ağırlıklı puanını kaydet
                };
    
                // Yorum mevcutsa kaydet
                if (comment) {
                    project.comments.push({ userName, comment }); // Yorum ve kullanıcı adıyla beraber kaydet
                }
    
                // Proje puanını güncelle
                project.totalScore += weightedAverageScore;
                project.voteCount += 1;
                project.averageScore = project.totalScore / project.voteCount;
    
                // Güncellenen yarışma verilerini tüm kullanıcılara gönder
                io.in(competitionId).emit('competitionData', competition);
    
                // Logları yazdır
                console.log(`Yarışma: ${competitionId}`);
                console.log(`Proje: ${project.name}`);
                console.log(`Kullanıcı: ${userName}`);
                console.log(`Oylar:`, votes);
                console.log(`Kullanıcı Ağırlıklı Puanı: ${userWeightedScore.toFixed(2)}`);
                console.log(`Yorum: ${comment || 'Yorum yok'}`);
                console.log('---');
            }
        }
    });
    
    

}

module.exports = {
    generateCompetitionCode,
    handleSocketEvents
};