// // подключение к серверу по WebSocket
// const socket = io.connect('http://localhost:3000');
//
//
// function connect() {
//     socket.send(JSON.stringify({
//         type: 'connection',
//         role: 'host',
//         hostID: '123',
//         hostPassword: '123'
//     }))
// }
//
//
// socket.on('message', (data) => {
//     if (data.type === 'info' && data.message === 'Host created') {
//         console.log("Connected to server");
//     }
//
//     if (data.type === 'error') {
//         console.log(data.message);
//     }
//
//     if (data.type === 'expired') {
//         // TODO: handle expired
//     }
//
//     if (data.type === 'offer') {
//         console.log(`User ${data.from} requested offer.`);
//         requestOffer(data.message)
//     }
// })
// //
// // // Обработчик события получения offer
// // socket.on('offer', async (offerData) => {
// //     // Создание RTCPeerConnection
// //     remoteConnection = new RTCPeerConnection();
// //     console.log('Created remote peer connection object remoteConnection');
// //     // Добавление обработчика события получения ICE-кандидата
// //     remoteConnection.addEventListener('icecandidate', async event => {
// //         console.log('Remote ICE candidate: ', event.candidate);
// //         await localConnection.addIceCandidate(event.candidate);
// //     }
// // });
//
// // функция принимает webrtc-соединение и отправляет запрос на получение offer
// async function requestOffer(offeredConnection) {
//     // Создание RTCPeerConnection
//     localConnection = new RTCPeerConnection();
//     console.log('Created local peer connection object localConnection');
//     localConnection.setRemoteDescription(offeredConnection);
//     localConnection.createAnswer().then(
//         async answer => {
//             await localConnection.setLocalDescription(answer);
//             sendAnswer(answer);
//         })
// }