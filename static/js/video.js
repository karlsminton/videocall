const constraints = {
    video: true,
    audio: true
}

const mediaRecorderOptions = {
    mimeType: "video/webm;codecs=opus, vp8",
    bitsPerSecond: 5000
}

let url = new URL('ws://localhost:3000/')

let websocket = new WebSocket(url)
websocket.bitsPerSecond


let button = document.querySelector('button')
let main = document.querySelector('main')

let video, mediaRecorder

button.addEventListener('click', (e) => {
    websocket.send('some data')
    if (
        navigator 
        && navigator.mediaDevices
    ) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions)
                mediaRecorder.ondataavailable = (e) => {
                    websocket.send(e.data)
                    // don't remove - useful debugging values
                    // console.log(`media recorder data - ${e.data}`)
                    // console.log(`websocket bufferAmount = ${websocket.bufferedAmount}`)
                }
                mediaRecorder.start(1000)
                addVideoToPage(stream)
            })
    }
})

websocket.onopen = (e) => {
    console.log(`you have connected ${JSON.stringify(e)}`)
}

// websocket.onclose = (e) => {
//     console.log('connection closed')
// }

// websocket.onerror = (e) => {
//     console.log(`socket error - ${e.message}`)
// }

websocket.onmessage = (e) => {
    console.log(e.data)
    
    // if (data.stream) {
    //     window.stream = data.stream
    //     addVideoToPage(data.stream)
    // }
}

const addVideoToPage = (stream) => {
    video = document.createElement('video')
    video.srcObject = stream
    video.onloadedmetadata = (e) => {
        video.play()
        document.querySelector('main').appendChild(video)
    }
}