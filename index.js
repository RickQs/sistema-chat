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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

io.on('connection', (socket) => {
    // io.emit('conectado', 'Estou conectado!')

    // socket.broadcast.emit('novo usuario', 'Um novo usuário se conectou!')

    socket.on('chat message', (obj) => {
        io.emit('chat message', obj)
    })

    socket.on('disconnect', (obj) => {
        io.emit('disconnected', obj.nome + ' saiu')
    })
})

http.listen(3000, () => {
    console.log('server rodando')
})