const getMessage = (username,message)=>{
    return {
        username,
        message:message,
        time: new Date().getTime()
    }
}
const getLocation = (username,url)=>{
    return {
        username,
        url,
        time: new Date().getTime()
    }
}

module.exports = {
    getMessage,
    getLocation
}