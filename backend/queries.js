const pool = require('./connection.js')
const bcrypt = require('bcryptjs')

function checkEmail(email, callback){
    const sqlq = `SELECT * FROM users WHERE email = '${email}'`
    pool.querry(sqlc, (error, results) => {
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