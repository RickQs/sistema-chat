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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

io.on('connection', (socket) => {
    // io.emit('conectado', 'Estou conectado!')

    socket.broadcast.emit('novo usuario', 'Um novo usuário se conectou!')

    socket.on('disconnect', () => {
        console.log('Desconectado.')
    })
})

http.listen(3000, () => {
    console.log('server rodando')
})