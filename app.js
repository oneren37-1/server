const express = require('express');
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');

const options = {
    ca: fs.readFileSync('./185.143.179.130/ca_bundle.crt'),
    cert: fs.readFileSync('./185.143.179.130/certificate.crt'),
    key: fs.readFileSync('./185.143.179.130/private.key')
};

const port = 6969;
const server = https.createServer(express);
const wss = new WebSocket.Server({ server })

let hosts = {}

wss.on('connection', function connection(ws) {
    console.log('A user connected.')
  ws.on('message', (data) => handleMessage(data, ws))
  ws.on('close', () => {
    Object.keys(hosts).forEach((hostID) => {
        try {
            if (hosts[hostID].connection === ws) {
                hosts[hostID].connection.close();
                hosts[hostID].client.close()
                hosts[hostID] = undefined;
            }
            else if (hosts[hostID].client === ws) {
                hosts[hostID].client.close()
                hosts[hostID].client = null
            }
        }
        catch (e) {
            console.log(e)
        }
    })
  });
})

server.listen(port, function() {
  console.log(`Server is listening on ${port}!`)
})

function handleMessage(message, ws) {
    console.log(message)
    try {
        const data = JSON.parse(message)

        switch (data.type) {
            case 'connection':
                handleConnect(data, ws)
                break
            default:
                handleForward(data, ws)
        }
    }
    catch (e) {
        console.log(e)
    }
}

function handleConnect(data, ws) {
    console.log('handle connect')
    switch (data.role) {
    case 'host':
        if (!hosts[data.hostID]) {
            hosts[data.hostID] = {
                hostID: data.hostID,
                hostPassword: data.hostPassword,
                connection: ws,
                client: null
            }
        } else {
            hosts[data.hostID].connection = ws
        }
        ws.send(JSON.stringify({
            type: 'info',
            message: 'Host created'
        }))
        break
    case 'client':
        const host = hosts[data.hostID]
        if (!host) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Host not found'
            }))
            return;
        }
        if (host.hostPassword !== data.hostPassword) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Wrong credentials'
            }))
            return;
        }
        console.log('send expired at ' + new Date().getMilliseconds());
        host.client && host.client.send(JSON.stringify({
            type: 'expired'
        }))
        host.client = ws
        ws.send(JSON.stringify({
            type: 'info',
            message: 'Client connected',
            requestId: data.message.requestId
        }))
        break
    }
}

function handleForward(data, ws) {
    if (!hosts[data.hostID]) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Host not found'
        }))
        return;
    }

    switch (data.role) {
        case 'host':
            hosts[data.hostID].client && hosts[data.hostID].client.send(data.message)
            break
        case 'client':
            if (hosts[data.hostID].client !== ws) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'No access'
                }))
                return;
            }
            if (typeof data.message !== 'string') data.message = JSON.stringify(data.message)
            hosts[data.hostID].connection && hosts[data.hostID].connection.send(data.message)
            break
    }
}