const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const port = 6969;
const server = http.createServer(express);
const wss = new WebSocket.Server({ server })

const hosts = {}

wss.on('connection', function connection(ws) {
    console.log('A user connected.')
  ws.on('message', (data) => handleMessage(data, ws))
  ws.on('close', () => {
    Object.keys(hosts).forEach((hostID) => {
      if (hosts[hostID].connection === ws) {
        hosts[hostID].connection = null
      }
      if (hosts[hostID].client === ws) {
        hosts[hostID].client = null
      }
    })
  });
})

server.listen(port, function() {
  console.log(`Server is listening on ${port}!`)
})

function handleMessage(message, ws) {
    console.log(message)
    const data = JSON.parse(message)

    switch (data.type) {
        case 'connection':
            handleConnect(data, ws)
            break
        default:
            handleForward(data, ws)
    }
}

function handleConnect(data, ws) {
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
        host.client && host.client.send(JSON.stringify({
            type: 'expired'
        }))
        host.client = ws
        ws.send(JSON.stringify({
            type: 'info',
            message: 'Client connected'
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
            hosts[data.hostID].connection && hosts[data.hostID].connection.send(data.message)
            break
    }
}