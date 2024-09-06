const pool = require('./connection.js')

function checkEmail(email, callback){
    console.log(`${email}`);
    console.log("query");
    const sqlc = `SELECT * FROM users WHERE email = '${email}'`;
    pool.query(sqlc, (error, results) => {
        if(error){
            console.log("error");
            error = new Error("Emaili ararken hatayla karşılaşıldı");
            callback(error, true, results);
        } else {
            if(results.rowCount != 0){
                console.log("already exists");
                callback(null, true, results);
            } else {
                console.log("does not exist");
                callback(null, false, results);
            }
        }
    })
}

function addUser(name, email, password, role_requested){
    const sqlc = `INSERT INTO users (name, email, password, role, role_requested) VALUES(
        '${name}', '${email}', '${password}', 'user', '${role_requested}')`;
    pool.query(sqlc);
}

function addComp(name, id, date, criteria, createdBy, projects){
    const sqlc1 = `SELECT * FROM users WHERE name = '${createdBy}'`;
    pool.query(sqlc1, (error, results1) => {
        if(!error && results1.rowCount != 0){
            const creator_id = results1.rows[0].userid;
            console.log("creating contest");
            const sqlc1 = `INSERT INTO contests (name, created_by, date, description, access_code) VALUES(
                '${name}', '${creator_id}', '${date}', '', '${id}')`;
            pool.query(sqlc1);
            console.log("acquiring contest id");
            getComp(id, (error, results2) => {
                if(!error && results2.rowCount != 0){
                    const contestId = results2.rows[0].id;
                    for(i = 0; i < criteria.length; i++){
                        console.log("inserting criteria")
                        const sqlc = `INSERT INTO contest_criteria (contest_id, criteria_name, criteria_description) VALUES(
                            '${contestId}', '${criteria[i]}', '')`;
                        pool.query(sqlc);
                    }
                    addProj(id, projects)
                }
            });
        }
    });
}

function getComp(id, callback){
    const sqlc = `SELECT * FROM contests WHERE access_code = '${id}'`;
    pool.query(sqlc, (error, results) => {
        callback(error, results);
    });
}

function addProj(id, projects){
    getComp(id, (error, result) => {
        console.log("no error yet in proj")
        if(error){
            console.log("error in proj")
        }
        if(!error && result.rowCount != 0){
            const contestId = result.rows[0].id;
            console.log("read contest id");
            for(i = 0; i < projects.length; i++){
                const sqlc = `INSERT INTO projects (name, contest, description) VALUES (
                    '${projects[i].name}', '${contestId}', '${projects[i].description}')`;
                pool.query(sqlc);
                console.log("project created");
            }
        }
    });
}

module.exports = {checkEmail, addUser, addComp, getComp, addProj};