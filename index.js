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
var historicoMsgId = []

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

io.on('connection', (socket) => {
    
    var lastHour, lastMinute = 0
    var ultimaMsgId = ''
    
    socket.on('novo usuario', (usuario) => {
        if (usuarios.indexOf(usuario) != -1) {
            socket.emit('novo usuario', {sucesso: false})
        } else {
            usuarios.push(usuario)
            socketIds.push(socket.id)

            socket.emit('novo usuario', {sucesso: true})
            io.emit('login', {usuarios: [...usuarios].sort(), msg: usuario + ' entrou'})
        }
    })

    socket.on('nova mensagem', (obj) => {
        if (usuarios.indexOf(obj.nome) != -1 && usuarios.indexOf(obj.nome) == socketIds.indexOf(socket.id)) {
            historicoMsgId.push(socket.id)
            ultimaMsgId = socket.id

            if (historicoMsgId.length > 1 && ultimaMsgId === historicoMsgId[historicoMsgId.length - 2]) {
                obj.ultimaMsg = true
            }

            let currHour = dayjs().hour()
            let currMinute = dayjs().minute()
            if (currHour !== lastHour || currMinute !== lastMinute) {
                lastHour = currHour
                lastMinute = currMinute
                obj.time = dayjs().format("HH:mm")
            }
            io.emit('nova mensagem', obj)
        } else {
            console.log('Erro: Você não tem permissão para executar esta ação.')
        }
    })

    socket.on('disconnect', () => {
        let id = socketIds.indexOf(socket.id)
        let msg = usuarios[id] + ' saiu'
        socketIds.splice(id, 1)
        usuarios.splice(id, 1)
        socket.broadcast.emit('logout', {usuarios: [...usuarios].sort(), msg})
    })
})

http.listen(3000, () => {
    console.log('server rodando')
})