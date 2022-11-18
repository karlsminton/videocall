const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { WebSocketServer } = require('ws')
const path = require('path')

const ws = new WebSocketServer({ server })

let clients = []

// https://stackoverflow.com/questions/69378155/is-it-possible-to-make-a-video-call-over-websocket-on-the-web-without-using-webr

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html')
})

ws.on('connection', (socket, req) => {
    // requested url by socket
    let url = req.url
    clients.push(socket)

    // clients.forEach((client) => { client.send('BARRRYYYY') })

    /** @todo extract into different controller classes */
    // video responses
    if (url === '/') {
        socket.on('open', (data) => {
            console.log(JSON.stringify(data))
        })

        socket.on('message', (message) => {
            if (!message instanceof Buffer) {
                throw new Error('Message was not a buffer')
            }

            // sendAll(message.toString())
            // console.log(message.data.message)
            // let data = JSON.parse(message.toString())
            let data = message.toString()
            console.log(data)
            sendAll(message)
        })
    }
})

const sendAll = (msg) => {
    clients.forEach((client) => {
        client.send(msg)
    })
}

server.listen('3000', () => {
    console.log('server started')
})