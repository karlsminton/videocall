const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { WebSocketServer } = require('ws')
const path = require('path')
const crypto = require('crypto')

const ws = new WebSocketServer({ server })

let clients = {}

// https://stackoverflow.com/questions/69378155/is-it-possible-to-make-a-video-call-over-websocket-on-the-web-without-using-webr

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html')
})

ws.on('connection', (socket, req) => {
    console.log(`req.socket.remoteAddress - ${req.socket.remoteAddress}`)
    // requested url by socket
    let url = req.url
    
    // give socket a unique id
    socket.id = crypto.randomUUID()

    // add socket to list of connected clients
    clients[socket.id] = socket

    // log all connected clients
    console.log('')
    console.log('clients connected;')
    Object.keys(clients).forEach(key => {
        console.log(`client id - ${clients[key].id}`)
    })
    console.log('')

    

    /** @todo extract into different controller classes */
    // video responses
    if (url === '/') {
        socket.on('message', (message) => {
            if (!message instanceof Buffer) {
                throw new Error('Message was not a buffer')
            }

            sendAll(message)
        })
    }
})

const sendAll = (msg) => {
    Object.keys(clients).forEach((key) => {
        clients[key].send(msg)
    })
}

server.listen('3000', () => {
    console.log('server started')
})