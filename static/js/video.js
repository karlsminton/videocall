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

// let mediaSource = new MediaSource()

window.externalMediaSource = new MediaSource()
// window.externalSourceBuffer = window.externalMediaSource.addSourceBuffer(mime)

button.addEventListener('click', (e) => {
    if (
        navigator 
        && navigator.mediaDevices
    ) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                window.stream = stream
                mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions)
                mediaRecorder.ondataavailable = (e) => {
                    websocket.send(e.data)
                    // don't remove - useful debugging values
                    // console.log(`media recorder data - ${e.data}`)
                    // console.log(`websocket bufferAmount = ${websocket.bufferedAmount}`)
                }
                mediaRecorder.start(10000)
                addVideoToPage(stream)
            })
    }
})

websocket.onmessage = (e) => {
    let blob = e.data
    console.log(blob)

    window.secondVideo = document.createElement('video')
    window.secondVideo.id = 'second'
    window.secondVideo.setAttribute('muted', '')
    window.secondVideo.srcObject = window.externalMediaSource.handle
    window.secondVideo.src = URL.createObjectURL(window.externalMediaSource)
    // window.secondVideo.srcObject = window.externalMediaSource.handle

    // video.onloadedmetadata = (e) => {
    //     video.play()
    //     document.querySelector('main').appendChild(video)
    // }
    
    // if (!window.externalMediaSource) {
    //     window.externalMediaSource = new MediaSource()
    // }
    
    window.externalMediaSource.addEventListener('sourceopen', () => {
        console.log('Opened finally')

        window.externalSourceBuffer = window.externalMediaSource.addSourceBuffer(mime)
        
        // if (!window.externalSourceBuffer) {
        //     window.externalSourceBuffer = window.externalMediaSource.addSourceBuffer(mime)
        // }

        blob.arrayBuffer().then((arrayBuffer) => {
            console.log(window)
            console.log(window.externalSourceBuffer)
            window.externalSourceBuffer.appendBuffer(arrayBuffer)
        })

        // blob.arrayBuffer().then((arrayBuffer) => {
        //     window.externalSourceBuffer.appendBuffer(arrayBuffer)
        // })
    });

    // window.secondVideo.src = URL.createObjectURL(window.externalMediaSource)

    if (!document.getElementById('second')) {
        window.secondVideo.play()
        document.querySelector('main').appendChild(window.secondVideo)
    }

    // addSourceBuffer not working as mediaSource isn't ready
    // Fired when the MediaSource instance has been opened by a media element and is ready for data to be appended to the SourceBuffer objects in sourceBuffers.

    // blob.arrayBuffer().then((arrayBuffer) => {
    //     sourceBuffer.appendBuffer(arrayBuffer)
    // })

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