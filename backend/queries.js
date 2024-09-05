const pool = require('./connection.js')

function checkEmail(email, callback){
    const sqlc = `SELECT * FROM users WHERE email = '${email}'`
    pool.query(sqlc, (error, results) => {
        if(error){
            error = new Error("Emaili ararken hatayla karşılaşıldı")
            callback(error, true, results)
        } else {
            if(results.rowCount != 0){
                callback(null, true, results)
            } else {
                callback(null, false, results)
            }
        }
    })
}

function addUser(name, email, password, role_requested){
    const sqlc = `INSERT INTO users (name, email, password, role, role_requested) VALUES(
        '${name}', '${email}', '${hash}', user, '${role}')`;
    pool.query(sqlc);
}
