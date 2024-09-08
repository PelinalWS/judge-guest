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

function addUser(name, email, password){
    const sqlc = `INSERT INTO users (name, email, password, role) VALUES(
        '${name}', '${email}', '${password}', 'user')`;
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
                        const sqlc = `INSERT INTO contest_criteria (contest_id, criteria_name, criteria_description, coefficient) VALUES(
                            '${contestId}', '${criteria[i].name}', '${criteria[i].description}', '${criteria[i].coefficient}')`;
                        pool.query(sqlc);
                    }
                    addProj(id, projects);
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
    getComp(id, async (error1, result) => {
        console.log("no error yet in proj")
        if(error1){
            console.log("error in proj")
        }
        if(!error1 && result.rowCount != 0){
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

function getProj(id, callback){
    const sqlc = `SELECT * FROM projects WHERE contest = '${id}'`;
    pool.query(sqlc, callback);
}

function getUser(name, callback){
    const sqlc = `SELECT userid FROM users WHERE name = '${name}'`;
    pool.query(sqlc, callback);
}

async function vote(email, compId, projectId, comment, votes){
    const sqlc = `INSERT INTO votes ("user", contest, project, "comment")
	                    SELECT
                        	u.userid,
                        	p.contest AS contest_id,
                        	p.id AS project_id,
                        	'${comment}' AS comment
	                    FROM
                        	users u
	                    JOIN
                        	contests c ON c.access_code = '${compId}'
	                    JOIN
                        	projects p ON p.id = ${projectId}
	                    WHERE
                        	u.email = '${email}';`;
    await pool.query(sqlc);
    const sqlc2 = `INSERT INTO user_criteria_vote (userid, criteria_id, point, project_id)
                        SELECT
                            u.userid,
                            c.criteria_id,
                            ${votes} AS point,
                            ${projectId} AS project_id
                        FROM
                            users u
                        JOIN
                            contest_criteria c ON `;
}

function getVoteList(compId, callback){
    const sqlc = "";
}

function listAllUsers(callback){
    const sqlc = `SELECT name, email, role FROM users ORDER BY email ASC`;
    pool.query(sqlc, callback);
}

function changeAuth(newAuth, email){
    if(newAuth == 'user'){
        const sqlc = `UPDATE users SET role = 'user' WHERE email = '${email}';`;
        pool.query(sqlc);
    } else if(newAuth == 'member'){
        const sqlc = `UPDATE users SET role = 'member' WHERE email = '${email}';`;
        pool.query(sqlc);
    } else if(newAuth == 'admin'){
        const sqlc = `UPDATE users SET role = 'admin' WHERE email = '${email}';`;
        pool.query(sqlc);
    }
}

module.exports = {checkEmail, addUser, addComp, getComp, getUser, addProj, getProj, vote, getVoteList, listAllUsers, changeAuth};