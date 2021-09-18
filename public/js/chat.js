const socket = io();

// element selectors
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('#messageInput');
const $messageFormButton = document.querySelector('#sendMessage');
const $shareLocationBtn = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $attachmentBtn = document.querySelector('#send-attachment');
const $selectAttachmentInput = document.querySelector('#inputFile');
const $selectedImage = document.querySelector;

// select file
$attachmentBtn.addEventListener('click', () => {
  console.log('select an image');
  $selectAttachmentInput.click();
  $selectAttachmentInput.addEventListener('change', () => {
    console.log($selectAttachmentInput.value);
  });
});

// template
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
// const mapTemplate = document.querySelector('#map-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Initialize and add the map
function initMap(data) {
  if (data === undefined || data === null) {
    return;
  }
  //   console.log(data.mapID);
  const mapDiv = document.getElementById(data.mapID);
  const map = new google.maps.Map(mapDiv, {
    zoom: 16,
    center: data.location,
  });
  // The marker, positioned at Uluru
  const marker = new google.maps.Marker({
    position: data.location,
    map: map,
  });
}

// Initialize and add the map
// function initMap() {
//   const mapDiv = document.getElementById('map');
//   //   console.log(mapD);
//   // The location of Uluru
//   const uluru = { lat: -25.344, lng: 131.036 };
//   // The map, centered at Uluru
//   const map = new google.maps.Map(mapDiv, {
//     zoom: 16,
//     center: uluru,
//   });
//   // The marker, positioned at Uluru
//   const marker = new google.maps.Marker({
//     position: uluru,
//     map: map,
//   });
// }

// autoscroll
const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

// receive message from server
socket.on('message', (message) => {
  // console.log(message)
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

// receive location message from server
socket.on('locationMessage', (message) => {
  // create random mapId for seperate Maps
  const randomMapID = (length) => {
    let result = '';
    let characters = 'abcdefghijklmnopqrstuvwxyz';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
  const mapID = randomMapID(5);
  //   console.log(mapID);

  //   prepare data for passing
  const { username, location, createdAt } = message;
  const { latitude, longitude } = location;
  const [lat, lng] = [latitude, longitude];

  const data = {
    location: { lat, lng },
    username,
    createdAt,
    mapID,
  };

  //   create map Div
  const mapDiv = document.createElement('div');
  mapDiv.setAttribute('id', mapID);
  mapDiv.style.width = 250 + 'px';
  mapDiv.style.height = 250 + 'px';
  //   console.log(mapDiv);
  // render location message
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    location: message.location,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  // add location message into chat
  $messages.insertAdjacentHTML('beforeend', html);
  $messages.appendChild(mapDiv);
  //   pass data to map
  initMap(data);
  autoscroll();
});

// Track users data in room
socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector('#sidebar').innerHTML = html;
});

// send message button action
$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled');

  const message = e.target.elements.message.value;
  socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    // console.log('Message delivered!')
  });
});

// share location button action
$shareLocationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('geolocation is not supported by browser');
  }
  navigator.geolocation.getCurrentPosition((position) => {
    $shareLocationBtn.setAttribute('disabled', 'disabled');
    // send location
    socket.emit(
      'sharelocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $shareLocationBtn.removeAttribute('disabled', 'disabled');
        console.log('location shared.');
      }
    );
  });
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
