const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3000;

io.on('connection', (socket) => {
    console.log('A user connected.');

    socket.on('requestOffer', (targetUserId) => {
        console.log(`User ${socket.id} requested offer to user ${targetUserId}.`);
        // Передача события 'offerRequest' целевому пользователю по его id
        io.to(targetUserId).emit('offerRequest', { from: socket.id });
    });
    
    socket.on('sendOffer', (offerData) => {
        console.log(`User ${socket.id} sent offer to user ${offerData.to}.`);
        // Передача события 'offer' целевому пользователю по его id
        io.to(offerData.to).emit('offer', { from: socket.id, offer: offerData.offer });
    });

    socket.on('sendAnswer', (answerData) => {
        console.log(`User ${socket.id} sent answer to user ${answerData.to}.`);
        // Передача события 'answer' целевому пользователю по его id
        io.to(answerData.to).emit('answer', { from: socket.id, answer: answerData.answer });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected.');
    });
});

http.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
});