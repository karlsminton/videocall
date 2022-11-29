const constraints = {
    video: true,
    audio: true
}

const mime = "video/webm;codecs=opus, vp8"
// const mediaRecorderOptions = {
//     mimeType: mime,
//     bitsPerSecond: 5000
// }
const mediaRecorderOptions = {
    mimeType: mime,
    audioBitsPerSecond: 5000,
    videoBitsPerSecond: 5000
}


let url = new URL('ws://localhost:3000/')
let websocket = new WebSocket(url)
let button = document.querySelector('button')
let video, mediaRecorder
window.externalMediaSource = new MediaSource()
let startAccepting = false

// clients is full list of clients connected to room
let clients = []


// uuid is your unique id in this room
// 36 characters
// example: 0ec8fe70-50bd-4c1e-a816-7c3075d4d472
let uuid

button.addEventListener('click', (e) => {
    if (
        navigator 
        && navigator.mediaDevices
    ) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                startAccepting = true
                window.stream = stream
                mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions)
                mediaRecorder.ondataavailable = (e) => {
                    console.log(e.data)
                    if (websocket.readyState === WebSocket.OPEN) {
                        websocket.send(e.data)
                    }
                    // don't remove - useful debugging values
                    // console.log(`media recorder data - ${e.data}`)
                    // console.log(`websocket bufferAmount = ${websocket.bufferedAmount}`)
                }
                mediaRecorder.start(1000)
                addVideoToPage(stream)
            })
    }
})

websocket.onmessage = (e) => {
    // console.log(e.data)
    // Not the best control flow - need a better way of identifying messages
    // Nesting a blob in an array doesn't appear to work
    if (e.data.constructor.name === 'Blob') {
        acceptVideo(e)
    }
    // pong
    if (e.data === 'ping') {
        // console.log('ping')
        websocket.send('pong')
    }
    if (typeof e.data === 'string' && e.data !== 'ping') {
        joinRoom(e.data)
    }
}

const acceptVideo = (e) => {
    // console.log(`can accept? ${startAccepting}`)

    if (startAccepting !== true) {
        return
    }

    let blob = e.data
    // console.log(blob)

    window.secondVideo = document.createElement('video')
    window.secondVideo.id = 'second'
    window.secondVideo.setAttribute('muted', '')

    let container = document.createElement('div')
    container.className = 'vid'

    window.secondVideo.srcObject = window.externalMediaSource.handle
    window.secondVideo.src = URL.createObjectURL(window.externalMediaSource)
    
    window.externalMediaSource.addEventListener('sourceopen', () => {
        // console.log('Opened finally')

        window.externalSourceBuffer = window.externalMediaSource.addSourceBuffer(mime)

        blob.arrayBuffer().then((arrayBuffer) => {
            // console.log(window)
            // console.log(window.externalSourceBuffer)
            window.externalSourceBuffer.appendBuffer(arrayBuffer)
        })
    });

    if (window.externalSourceBuffer) {
        blob.arrayBuffer().then((arrayBuffer) => {
            window.externalSourceBuffer.appendBuffer(arrayBuffer)
        })
    }

    if (!document.getElementById('second')) {
        container.appendChild(window.secondVideo)
        document.querySelector('main').appendChild(container)
        window.secondVideo.play()
    }
}

const joinRoom = (json) => {
    let connectionString = JSON.parse(json)
    // console.log(connectionString)
}

const addVideoToPage = (stream) => {
    let container = document.createElement('div')
    container.className = 'vid'

    video = document.createElement('video')
    video.id = 'self'
    video.srcObject = stream
    video.onloadedmetadata = (e) => {
        container.appendChild(video)
        document.querySelector('main').appendChild(container)
        video.play()
    }
}

websocket.onopen = (e) => {
    console.log(`you have connected ${JSON.stringify(e)}`)
}