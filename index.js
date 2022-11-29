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
    
    // give socket a unique id & add to clients
    socket.id = crypto.randomUUID()
    clients[socket.id] = socket

    // console.log all connected clients
    logAllClients()

    // send connecting client all clients IDs
    socket.send(JSON.stringify(Object.keys(clients)))

    socket.alive = true
    ping()

    // requested url by socket
    let url = req.url
    /** @todo extract into different controller classes */
    if (url === '/') {
        socket.on('message', (message) => {
            // exact match (===) doesn't work here
            if (message == 'pong') {
                console.log('message was a pong')
                socket.alive = true
            } else if (message instanceof Buffer) {
                // sendAll(['video', message])
                sendAll(message)
            } else {
                throw new Error('Message was not a buffer or a pong')
            }
        })
    }
})

ws.on('close', () => {
    clearInterval(ping)
})

const ping = () => {
    setInterval(() => {
        Object.keys(clients).forEach((id) => {
            if (clients[id].alive !== true) {
                console.log(`server terminated connection with client ${clients[id].id} due to lack of response to ping`)
                clients[id].terminate()
                delete clients[id]
                console.log(Object.keys(clients))
                return
            }

            clients[id].alive = false
            clients[id].send('ping')
        })
    }, 15000)
}

const logAllClients = () => {
    console.log('')
    console.log('clients connected;')
    Object.keys(clients).forEach(key => {
        console.log(`client id - ${clients[key].id}`)
    })
    console.log('')
}

const sendAllExceptSelf = (msg, id) => {
    Object.keys(clients).filter((value) => {
        return value.id !== id
    }).forEach((key) => {
        clients[key].send(msg)
    })
}

const sendAll = (msg) => {
    Object.keys(clients).forEach((key) => {
        clients[key].send(msg)
    })
}

server.listen('3000', () => {
    console.log('server started')
})