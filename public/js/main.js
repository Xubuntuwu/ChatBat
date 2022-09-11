const socket = io();
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// get username and room from URL
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

socket.emit('joinRoom', {username, room});

socket.on('roomUsers', ({room, users})=>{
    outputRoomName(room);
    outputUsers(users);
})

// on message received from server
socket.on('message', (message)=>{
    outputMessage(message);

    // scroll automatically
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

// submits message
const chatForm = document.getElementById('chat-form');
chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();

    const newmessage = e.target.elements.msg.value;
    
    socket.emit('chatMessage', newmessage);
    // reset form
    chatForm.reset();
    // focus on textinput
    e.target.elements.msg.focus();
})

// output message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML= `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.textmessage}
    </p>`;
    const msgcontainer = document.querySelector('.chat-messages');
    msgcontainer.appendChild(div);
}

// add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

// add users to DOM
function outputUsers(users){
    userList.innerHTML = '';
    users.forEach((user)=>{
        const li = document.createElement('li');
        li.innerText = user.username;
        userList.appendChild(li);
    });
}