/*
  WebSocket connection Script
*/
const serverURL = 'ws://192.168.50.242:8546';

let socket;
// variables for the DOM elements:
let incomingSpan;
let outgoingText;
let connectionSpan;
let connectButton;

const interval = setInterval(function() {
if (socket.readyState === WebSocket.OPEN) {
    socket.send('{"jsonrpc":"2.0","method":"admin_peers","params":[],"id":1}');
    socket.send('{"jsonrpc":"2.0","method":"admin_nodeInfo","params":[],"id":2}');
    socket.send('{"jsonrpc":"2.0","method":"debug_metrics","params":[],"id":3}');
}
}, 2000);

function setup() {
  // get all the DOM elements that need listeners:
  incomingSpan = document.getElementById('incoming');
  outgoingText = document.getElementById('outgoing');
  connectionSpan = document.getElementById('connection');
  connectButton = document.getElementById('connectButton');
  // set the listeners:
  outgoingText.addEventListener('change', sendMessage);
  connectButton.addEventListener('click', changeConnection);
  openSocket(serverURL);
}

function openSocket(url) {
  // open the socket:
  socket = new WebSocket(url);
  socket.addEventListener('open', openConnection);
  socket.addEventListener('close', closeConnection);
  socket.addEventListener('message', readIncomingMessage);
}


function changeConnection(event) {
  // open the connection if it's closed, or close it if open:
  if (socket.readyState === WebSocket.CLOSED) {
    openSocket(serverURL);
  } else {
    socket.close();
  }
}

function openConnection() {
  // display the change of state:
  connectionSpan.innerHTML = "true";
  connectButton.value = "Disconnect";
  if (socket.readyState === WebSocket.OPEN) {
    //   socket.send('{"id": 4, "method": "eth_subscribe", "params": ["newHeads", {"includeTransactions": true}]}');
  }
}

function closeConnection() {
  // display the change of state:
  connectionSpan.innerHTML = "false";
  connectButton.value = "Connect";
}

function readIncomingMessage(event) {
  data = JSON.parse(event.data);
  document.getElementById("incoming").textContent = JSON.stringify(data, null, 2);

  if(data.id === 1){ //admin_peers
    //     document.getElementById("total_peers").textContent = data.result.length;
  }else if(data.id === 2){ //admin_nodeInfo
    document.getElementById("enode").textContent = data.result.enode;
    if(data.result.protocols.eth.hasOwnProperty('head')){
        document.getElementById("blk_number").textContent = data.result.protocols.eth.head
        socket.send('{"jsonrpc":"2.0","method":"eth_getBlockByHash","params":["'+ data.result.protocols.eth.head +'", false],"id":5}');        
    }
  }else if(data.id === 3){ //debug_metrics
    document.getElementById("total_peers").textContent = data.result.peers.connected_total;
  }else if(data.id === 4){ //eth_subscription newHeads+Transactions
    data = JSON.parse(transaction);
    document.getElementById("tx_hash").textContent = data.params.result.hash;
    document.getElementById("tx_miner").textContent = data.params.result.miner;
    document.getElementById("tx_timestamp").textContent = parseInt(data.params.result.timestamp, 16);

    if(isObject(data.params.result.transactions[0])){
        document.getElementById("last_tx_hash").textContent = data.params.result.transactions[0].hash;
        document.getElementById("last_tx_from").textContent = data.params.result.transactions[0].from;
        document.getElementById("last_tx_to").textContent = data.params.result.transactions[0].to;
    }
  }else if(data.id === 5){ //eth_getBlockByHash
    document.getElementById("blk_miner").textContent = data.result.miner;
    document.getElementById("blk_timestamp").textContent = parseInt(data.result.timestamp, 16);
  }

}


function sendMessage() {
  //if the socket's open, send a message:
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(outgoingText.value);
  }
}

// add a listener for the page to load:
window.addEventListener('load', setup);

function isObject(obj){
    return obj != null && obj.constructor.name === "Object"
}

function getUserIP(onNewIP) { //  onNewIp - your listener function for new IPs
    //compatibility for firefox and chrome
    var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var pc = new myPeerConnection({
        iceServers: []
    }),
    noop = function() {},
    localIPs = {},
    ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
    key;

    function iterateIP(ip) {
        if (!localIPs[ip]) onNewIP(ip);
        localIPs[ip] = true;
    }

     //create a bogus data channel
    pc.createDataChannel("");

    // create offer and set local description
    pc.createOffer().then(function(sdp) {
        sdp.sdp.split('\n').forEach(function(line) {
            if (line.indexOf('candidate') < 0) return;
            line.match(ipRegex).forEach(iterateIP);
        });
        
        pc.setLocalDescription(sdp, noop, noop);
    }).catch(function(reason) {
        // An error occurred, so handle the failure to connect
    });

    //listen for candidate events
    pc.onicecandidate = function(ice) {
        if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
        ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
    };
}

// Usage

getUserIP(function(ip){
	document.getElementById("device_ip").innerHTML = "http://"+ip+":8545";
});

