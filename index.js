import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import dayjs from 'dayjs'
// import customParseFormat from 'dayjs/plugin/customParseFormat.js'
// dayjs.extend(customParseFormat)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
 
const app = express()
const http = createServer(app)
const io = new Server(http)

var usuarios = []
var socketIds = []

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

io.on('connection', (socket) => {
    
    var lastHour, lastMinute = 0
    
    socket.on('new user', (data) => {
        if (usuarios.indexOf(data) != -1) {
            socket.emit('new user', {success: false})
        } else {
            usuarios.push(data)
            socketIds.push(socket.id)

            socket.emit('new user', {success: true})
            socket.broadcast.emit('login', data + ' entrou')
        }
    })

    socket.on('chat message', (obj) => {
        if (usuarios.indexOf(obj.nome) != -1 && usuarios.indexOf(obj.nome) == socketIds.indexOf(socket.id)) {
            let currHour = dayjs().hour()
            let currMinute = dayjs().minute()
            if (currHour !== lastHour || currMinute !== lastMinute) {
                lastHour = currHour
                lastMinute = currMinute
                obj.time = dayjs().format("HH:mm")
            }
            io.emit('chat message', obj)
        } else {
            console.log('Erro: Você não tem permissão para executar esta ação.')
        }
    })

    // CORRIGIR USUARIO INCORRETO DESCONECTANDO
    socket.on('disconnect', () => {
        socket.broadcast.emit('logout', usuarios[usuarios.length-1] + ' saiu')
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