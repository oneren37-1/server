var socket = new WebSocket("ws://localhost:6969");


socket.onopen = function() {
    console.log("Соединение ws установлено.");

    socket.send(JSON.stringify({
        type: 'connection',
        role: 'client',
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
    try {
        console.log("Получены данные ws " + event.data);
        const data = JSON.parse(event.data)
        switch (data.type) {
            case 'info':
                if (data.message = 'Client connected') {
                    createOffer()
                }
                break
            case 'answer':
                console.log('Answer received')
                console.log(data.answer)
                handleAnswer(data.answer)
                break

            case 'iceCandidate':
                console.log('Ice candidate received')
                console.log(data.iceCandidate)
                const parsed = JSON.parse(data.iceCandidate)
                const candidate = new RTCIceCandidate({
                    candidate: parsed.candidate,
                    sdpMid: parsed.sdpMid,
                    sdpMLineIndex: parsed.sdpMLineIndex
                })
                console.log(candidate);
                peerConnection.addIceCandidate(candidate)
                break
        }
    }
    catch (e) {
        console.log(e)
    }
};

socket.onerror = function(error) {
    console.log("Ошибка ws " + error.message);
};

//---------------------------------------------

const peerConnection = new RTCPeerConnection();

const dataChannel = peerConnection.createDataChannel('test');
console.log('Data channel created')
dataChannel.onopen = () => {
    console.log('data channel is open and ready to be used')
}
dataChannel.onmessage = (event) => {
    console.log("Message: " + event.data);
}
dataChannel.onerror = event => {
    console.log(`Произошла ошибка: ${event.error}`);
};

// peerConnection.onconnectionstatechange = (event) => {
//     console.log('Connection state change: ' + peerConnection.connectionState)
// }

peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        console.log("New ICE candidate: " + JSON.stringify(peerConnection.localDescription));
        console.log(event.candidate);

        socket.send(JSON.stringify({
            role: 'client',
            type: 'iceCandidate',
            hostID: '123',
            message: JSON.stringify({
                type: 'iceCandidate',
                payload: JSON.stringify(event.candidate)
            })
        }))
    }
}

window.dc = dataChannel



async function createOffer() {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer)
        .then(() => {
            console.log('Sending offer')
            socket.send(JSON.stringify({
                role: 'client',
                type: 'offer',
                hostID: '123',
                message: JSON.stringify({
                    type: 'offer',
                    payload: JSON.stringify(offer.sdp)
                })
            }))
        })
}

async function handleAnswer(answer) {
    await peerConnection.setRemoteDescription(JSON.parse(answer))
        .then(() => {
            console.log('Answer set');
            console.log(peerConnection.connectionState)
            console.log(peerConnection.iceConnectionState)
        })
}

