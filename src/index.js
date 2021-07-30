const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {getMessage,getLocation} = require('./utils/message')
const { addUser, getUsersInRoom,getUser,removeUser } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')
// const viewsDirectoryPath = path.join(__dirname,'../views')

app.use(express.static(publicDirectoryPath))





io.on('connection', (socket) => {
    console.log('New WebSocket Connection');

    

    socket.on('join',({username,room} ,callback)=>{

        const { error, user } = addUser({ id:socket.id, username ,room})

        if(error){
            return callback(error)
        }
        socket.join(user.room)
        
        socket.emit('message', getMessage('Admin','Welcome Aboard!'))
        socket.broadcast.to(user.room).emit('message', getMessage( 'Admin',`${user.username} has joined!!`))
        callback()

        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
    }) 

    socket.on('sendMessage', (message,callback) => {

        const filter = new Filter()
        message = filter.clean(message)  // you can also use isProfane which return boolean value
        const user = getUser(socket.id)
        io.to(user.room).emit('message', getMessage(user.username,message))
        callback('Delivered')
        
    })

    socket.on('sendLocation', ({ longitude, latitude },callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',getLocation(user.username,`http://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })

    socket.on('disconnect', () => {

        const user = removeUser(socket.id)  // It is possible that the id that is disconnecting was never a part of users array like if he was connected to login page but gave wrong username than he gets disconnected but was never a part of the users array.
        if(user){  
            io.to(user.room).emit('message', getMessage('Admin',`${user.username} has left!`))   // so we only want to show this message only when the user was part of the array  
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }

    })
})

server.listen(port, () => {
    console.log('Server started on port 3000');
})