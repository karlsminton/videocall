const app = require('express')()
const net = require('net')
const http = require('http')
const server = http.createServer(app)
const crypto = require('crypto')
const { WebSocketServer } = require('ws')

const ws = new WebSocketServer({ server })

let clients = []

const SOCKET_MAGIC_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/html/index.html')
})


ws.on('connection', (socket) => {
    clients.push(socket)
    console.log('connected')

    clients.forEach((client) => { client.send('BARRRYYYY') })

    socket.on('message', (message) => {
        if (!message instanceof Buffer) {
            throw new Error('Message was not a buffer')
        }

        // sendAll(message.toString())
        // console.log(message.data.message)
        let data = JSON.parse(message.toString())
        console.log(data)
        sendAll(message)
    })
})

const sendAll = (msg) => {
    clients.forEach((client) => {
        client.send(msg)
    })
}

server.listen('3000', () => {
    console.log('server started')
})