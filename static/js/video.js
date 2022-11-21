const constraints = {
    video: true,
    audio: true
}

const mime = "video/webm;codecs=opus, vp8"

const mediaRecorderOptions = {
    mimeType: mime,
    bitsPerSecond: 5000
}

let url = new URL('ws://localhost:3000/')
let websocket = new WebSocket(url)

let button = document.querySelector('button')
let main = document.querySelector('main')

let video, mediaRecorder

let mediaSource = new MediaSource()
mediaSource.addEventListener('sourceopen', () => {
    console.log('Opened finally')
});

button.addEventListener('click', (e) => {
    websocket.send('some data')
    if (
        navigator 
        && navigator.mediaDevices
    ) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                window.stream = stream
                mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions)
                mediaRecorder.ondataavailable = (e) => {
                    console.log(e)
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

websocket.onmessage = (e) => {
    let blob = e.data
    video = document.createElement('video')
    // video.srcObject = stream
    video.srcObject = mediaSource.handle
    sourceBuffer = mediaSource.addSourceBuffer("video/webm;codecs=opus, vp8")
    // video.srcObject = mediaSource.handle
    video.onloadedmetadata = (e) => {
        video.play()
        document.querySelector('main').appendChild(video)
    }

    // addSourceBuffer not working as mediaSource isn't ready
    // Fired when the MediaSource instance has been opened by a media element and is ready for data to be appended to the SourceBuffer objects in sourceBuffers.
    sourceBuffer = mediaSource.addSourceBuffer("video/webm;codecs=opus, vp8")

    blob.arrayBuffer().then((arrayBuffer) => {
        sourceBuffer.appendBuffer(arrayBuffer)
    })

    // addVideoToPage(mediaStream)
}

const addVideoToPage = (stream) => {
    video = document.createElement('video')
    video.srcObject = stream
    video.onloadedmetadata = (e) => {
        video.play()
        document.querySelector('main').appendChild(video)
    }
}

websocket.onopen = (e) => {
    console.log(`you have connected ${JSON.stringify(e)}`)
}

// websocket.onclose = (e) => {
//     console.log('connection closed')
// }

// websocket.onerror = (e) => {
//     console.log(`socket error - ${e.message}`)
// }