const mysql   = require('mysql');
const jwt     = require('jsonwebtoken');
const util    = require('util');
const db      = mysqlConnect(mysql);
const query   = util.promisify(db.query).bind(db);
const log4js  = require("log4js");

log4js.configure({
    appenders: { jwt: { type: "file", filename: "./logs/jwt.log" } },
    categories: { default: { appenders: ["jwt"], level: "error" } }
});
const logger = log4js.getLogger("jwt");

module.exports = (route) => {

    route.get('/auth', (req, res) => {

        logMessage('info', 'API root was accessed');
        res.send ('Welcome to the authentication server');
        
    });
    
    route.get('/auth/get-token/:site/:id', (req, res) => {

        const user = {
            id: req.params.id,
            site: req.params.site
        }

        jwt.sign({ user }, process.env.JWT_KEY, (err, token) => {

            if(err) return res.sendStatus(403);

            let data = [user.site, user.id, token, epochDate()];
            storeToken(data);

            res.json({
                token: token,
                message: 'Token has been saved to validation table'
            });

        });
    
    });

    route.delete('/auth/kill-token', verifyToken, (req, res) => {

        jwt.verify(req.token, process.env.JWT_KEY, (err) => {
            if(err) {
                res.sendStatus(403);
            } else {
                killToken(req.token);
                res.sendStatus(200)
            }
        });

    });

    route.get('/auth/check-token', verifyToken, (req, res) =>{

        jwt.verify(req.token, process.env.JWT_KEY, (err) => {
            if(err) { 
                res.sendStatus(403);
            } else {
                checkToken(res, req.token);
            }
        });

    });

}

async function checkToken(res, token) {

    let sql = "CALL check_token(?)";

    try {

        let result = await query(sql, token);

        if(!result[0].length) {
            res.sendStatus(403);
        } else {
            res.sendStatus(200);
        }

    } catch(err) {
        logMessage('error', err);
    }
} 

function epochDate() {
    return Math.floor(Date.now() / 1000);
}

async function storeToken(data) {

    let sql = "CALL store_token(?, ?, ?, ?)";
    try {
        await query(sql, data);
    }catch(error) {
        logMessage('error', error);
    }

}

async function killToken(token) {

    let sql = "CALL kill_token(?)";
    try {
        await query(sql, token);
    }catch(error) {
        logMessage('error', error);
    }

}

function verifyToken(req, res, next) {

    const bearerHeader = req.headers['authorization'];

    if(typeof bearerHeader !== 'undefined') {

        const bearerToken = bearerHeader.split(' ')[1];
        req.token = bearerToken;
        next();

    } else {
        res.sendStatus(403);
    }

}

function logMessage(level, msg) {

    logger.level = level;

    switch(level) {
        case 'trace':
            logger.trace(msg);
            break;
        case 'debug':
            logger.debug(msg);
            break;
        case 'info':
            logger.info(msg);
            break;
        case 'warn':
            logger.warn(msg);
            break;
        case 'error':
            logger.error(msg);
            break;
        case 'fatal':
            logger.fatal(msg);
            break;
    }
}

function mysqlConnect(mysql) {

    // Create connection
    const db = mysql.createConnection({
        host     : process.env.DB_HOST,
        user     : process.env.DB_USER,
        password : process.env.DB_PASS,
        database : process.env.DATABASE  
    });

    // Connect
    db.connect((err) => {
        if (err) {
            logMessage('error', err);;
        }
        
    });

    return db;
}