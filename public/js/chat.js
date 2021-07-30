const socket = io()
// ELements

const form = document.querySelector('#msg-form')
const formInput = form.querySelector('input')
const formButton = form.querySelector('button')
const messages = document.querySelector('#messages')


//Template

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML


const autoscroll = () =>{
    // New message element
    const newMessage = messages.lastElementChild

    //Height of the last message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)   // we calculate margin of the new message
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin // offset don't compute margin

    //visible height
    const visibleHeight =  messages.offsetHeight  // offset gives the  height we can see
    
    // Height of messages container
    const containerHeight = messages.scrollHeight  // scrollHeight gives the  total height we can scroll through
    
    // How far i have scrolled
    const scrollOffset = messages.scrollTop + visibleHeight // scrollTop gives the height we have scrolled from the top

    if (containerHeight - newMessageHeight<= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }


}

socket.on('locationMessage', ({username,url, time }) => {
    console.log(url);
    const html = Mustache.render(locationTemplate, {
        username,
        url,
        time: moment(time).format('h:mm a') 
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('message', ({username,message, time }) => {
    
    const html = Mustache.render(messageTemplate, { username , message, time: moment(time).format('h:mm a') }) //second parameter takes value to be rendered

    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})


form.addEventListener('submit', (e) => {
    e.preventDefault()
    formButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.msg.value

    if (message === '') {
        formButton.removeAttribute('disabled')
        formInput.focus()
    } else {


        socket.emit('sendMessage', message, (message) => {  // Callback function should be the last parameter in emit & the parameter that callback may contains data sent by the server 
            formInput.value = ''
            formButton.removeAttribute('disabled')
            formInput.focus()

            console.log('The message was ' + message);   // this is the function that runs after the data is received by server



        })
    }
})

const button = document.querySelector('#send-location')

button.addEventListener('click', () => {


    if (!navigator.geolocation) {  // navigator.geolocation is undefined means the browser doesn't support this feature

        button.removeAttribute('disabled')
        return alert('Your browser does not support this feature')
    }
    button.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {

        const { longitude, latitude } = position.coords
        socket.emit('sendLocation', { longitude, latitude }, () => {
            button.removeAttribute('disabled')
            console.log('Location shared')
        })

    },()=>{
        console.log('Some Error occured');
        button.removeAttribute('disabled')
    },{timeout:10000})
})

// getCurrentPosition(successCallback,errorCallback,);

// query
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
 

socket.emit('join', { username, room },(error)=>{

    if(error){
        alert(error)
        location.href = '/' // redirecting to root directory
    }
})

//selecting sidebar template
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML



socket.on('roomData',({room, users })=>{
    const html = Mustache.render(sidebarTemplate,{
        room,users
    })
    document.querySelector('#sidebar').innerHTML = html
})










