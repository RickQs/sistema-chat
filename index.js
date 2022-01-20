import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const http = createServer(app)
const io = new Server(http)

var usuarios = []
var socketIds = []

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

io.on('connection', (socket) => {
    
    socket.on('new user', (data) => {
        if (usuarios.indexOf(data) != -1) {
            socket.emit('new user', {success: false})
        } else {
            usuarios.push(data)
            socketIds.push(socket.id)

            socket.emit('new user', {success: true})
            socket.broadcast.emit('welcome', data + ' entrou')
        }
    })

    socket.on('chat message', (obj) => {
        if (usuarios.indexOf(obj.nome) != -1 && usuarios.indexOf(obj.nome) == socketIds.indexOf(socket.id)) {
            io.emit('chat message', obj)
        } else {
            console.log('Erro: Você não tem permissão para executar esta ação.')
        }
    })

    socket.on('disconnect', () => {
        let id = socketIds.indexOf(socket.id)
        socketIds.splice(id, 1)
        usuarios.splice(id, 1)
        console.log(socketIds)
        console.log(usuarios)
        console.log('Usuário desconectado')
    })
})

http.listen(3000, () => {
    console.log('server rodando')
})