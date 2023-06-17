var socket = new WebSocket("ws://localhost:6969");


socket.onopen = function() {
    console.log("Соединение ws установлено.");

    socket.send(JSON.stringify({
        type: 'connection',
        role: 'host',
        hostID: '123',
        hostPassword: '123'
    }))
};

socket.onclose = function(event) {
    if (event.wasClean) {
        console.log('Соединение ws закрыто чисто');
    } else {
        console.log('Обрыв соединения ws'); // например, "убит" процесс сервера
    }
    console.log('Код: ' + event.code + ' причина: ' + event.reason);
};

socket.onmessage = function(event) {
    console.log("Получены данные ws " + event.data);
    const data = JSON.parse(event.data)
    switch (data.type) {
        case 'offer':
            console.log('Offer received')
            console.log(data.offer)
            createRTCConnection(data.offer)
            break
        case 'iceCandidate':
            console.log('Ice candidate received')
            console.log(data.iceCandidate)
            peerConnection.addIceCandidate(JSON.parse(data.iceCandidate))
            break
    }
};

socket.onerror = function(error) {
    console.log("Ошибка ws " + error.message);
};

//---------------------------------------------


const peerConnection = new RTCPeerConnection();
let dataChannel;

// peerConnection.onconnectionstatechange = (event) => {
//     console.log('Connection state change: ' + peerConnection.connectionState)
// }

peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        console.log('New ICE candidate' + JSON.stringify(peerConnection.localDescription))

        socket.send(JSON.stringify({
            role: 'host',
            type: 'iceCandidate',
            hostID: '123',
            message: JSON.stringify({
                type: 'iceCandidate',
                iceCandidate: JSON.stringify(event.candidate)
            })
        }))
    }
}

peerConnection.addEventListener('datachannel', event => {
    dataChannel = event.channel
    dataChannel.onopen = () => {
        console.log('data channel is open and ready to be used')
    }
    dataChannel.onmessage = (event) => {
        console.log("Message: " + event.data);
    }
    window.dc = dataChannel
})



async function createRTCConnection(offer) {



    await peerConnection.setRemoteDescription(offer)
        .then(async () => {
            // peerConnection.ondatachannel = (event) => {
            //     console.log('Data channel from client received')
            //     console.log(event.channel)
            //
            //     dataChannel = event.channel
            //     dataChannel.onopen = () => {
            //         console.log('data channel is open and ready to be used')
            //     }
            //     dataChannel.onmessage = (event) => {
            //         console.log("Message: " + event.data);
            //     }
            //     window.dc = dataChannel
            // }

            const answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer)
                .then(() => {
                    socket.send(JSON.stringify({
                        role: 'host',
                        hostID: '123',
                        type: 'answer',
                        message: JSON.stringify({
                            type: 'answer',
                            answer: JSON.stringify(answer)
                        }),
                    }))

                    console.log(peerConnection.localDescription)
                    console.log(peerConnection.remoteDescription)
                })
        })
}