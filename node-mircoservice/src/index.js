const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const multer = require('multer')
const {memoryStorage} = require("multer");
const fs = require('fs')
const upload = multer({storage: memoryStorage()})
//Used to be const upload = multer({storage: memoryStorage()};

//Application config
const app = express()
const port = 3000
const jsonParser = bodyParser.json()
app.use(jsonParser)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']

}))

//MySQL
const mysql = require('mysql2')
const {dbConfig} = require("./dbConfig");
const {BLOB} = require("mysql/lib/protocol/constants/types");
const connection = mysql.createConnection(dbConfig)
connection.connect()

console.log("Starting up!")

app.get('/getImage', cors(), (req, res) => {
    //res.header("Access-Control-Allow-Origin", "*");
    let encounterId = req.query.encounterId != null ? req.query.encounterId : null;

    if (encounterId != null) {
        //connection.connect()
        console.log("Connected to db")

        //Input
        const inputEncounterId = req.query.encounterId;

        //Async function for query
        function getImage(eId) {
            return new Promise((resolve, reject) => {
                connection.query(`SELECT (pictureData)
                                  FROM EncounterImages_T
                                  WHERE encounterId = ?;`, [eId], (err, results) => {
                    if (err != null) return reject(err)
                    resolve(results[0].pictureData)
                    //fs.writeFileSync('get.png', results[0].pictureData)
                    //resolve(Object.values(JSON.parse(JSON.stringify(results))))
                })
            })
        }

        getImage(inputEncounterId).then(result => {
            console.log("Res = ")
            console.log({result}, result.length)
            res.send({result})


            //connection.end()

        }).catch(err => {
            console.log("Error: " + err)
            connection.end()
            res.send("Error: " + err)

        })
    } else {
        res.send('ID => NULL')
    }

})

app.post('/putImage', cors(), upload.single('blob'), (req, res) => {

    console.log("Multer data: ")
    console.log(req.body)
    console.log(req.file)

    //Writes out the image
    //fs.writeFileSync('out.png', req.file.buffer)


    let inputEncounterId = req.body.encounterId;

    function putImage(eId, file) {
        return new Promise((resolve, reject) => {
            connection.query("SELECT (id) FROM EncounterImages_T WHERE encounterId = ?;", [eId], (err, results) => {
                if (err != null) return reject(err)

                if (results.length != 0) {
                    //UPDATE
                    let id = results[0].id
                    //Tog bort BINARY() runt picturedata på båda
                    connection.query("UPDATE EncounterImages_T SET pictureData = ? WHERE id = ?", [req.file.buffer, id], (err, results, fields) => {
                        if (err != null) return reject(err)
                        resolve('Successfully updated image!')
                    })

                } else {
                    //INSERT
                    connection.query("INSERT INTO EncounterImages_T (encounterId, pictureData) VALUES(?,?)", [eId, req.file.buffer], (err, results, fields) => {
                        if (err != null) return reject(err)
                        resolve('Successfully inserted image!')
                    })
                }
            })
        })
    }

    putImage(inputEncounterId, req.file).then(result => {
        console.log(result)
        res.send(result)
        //connection.end()
    }).catch(err => {
        console.log("Error: " + err)
        //connection.end()
        res.send("Error: " + err)

    })
})

app.listen(port, jsonParser, () => {
    console.log(`Example app listening on port ${port}`)

    function testConn(){
        return new Promise((resolve, reject) => {
            connection.query(`SHOW TABLES LIKE "EncounterImages_T";`, [], (err, results) => {
                if(err != null) return reject(err)

                let res =Object.values(JSON.parse(JSON.stringify(results)))
                if(res.length == 0){
                    connection.query("CREATE TABLE EncounterImages_T(ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT, encounterId INT NOT NULL, pictureData BLOB);", [], (err, results) => {
                        if(err != null) return reject(err)
                        resolve('Table set up')
                    })
                }else{
                    resolve('No new table set up, already exists')
                }
            })
        })
    }
    testConn().then( result => {
        console.log("Db setup complete: ( " + result + " )")

    }).catch(err => {
        console.log("Error: " + err)
    })

})
