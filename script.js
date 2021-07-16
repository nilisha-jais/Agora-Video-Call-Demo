// Helper fn. to handle error
 let handleFail = function(err){
    console.log("Error : ", err);
};

// Queries the container in which the remote feeds belong
let remoteContainer= document.getElementById("remote-container");

 // Helper fn. to add the video stream to remote-container
function addVideoStream(streamId){
    let streamDiv=document.createElement("div"); // Create a new div for every stream
    streamDiv.id=streamId;                       // Assigning id to div
    streamDiv.style.transform="rotateY(180deg)"; // Takes care of mirror image
    remoteContainer.appendChild(streamDiv);      // Add new div to container
}

// Helper fn. to remove the video stream from remote-container
function removeVideoStream (evt) {
    let stream = evt.stream;
    stream.stop();
    let remDiv=document.getElementById(stream.getId());
    remDiv.parentNode.removeChild(remDiv);
    console.log("Remote stream is removed " + stream.getId());
}

// Creating an Agora Client Object
let client = AgoraRTC.createClient({
    mode: "rtc", // mode: "live" | "rtc"
    codec: "vp8" //codec: "vp8" | "vp9" | "h264"
    /* "vp8": Sets the browser to use VP8 for encoding.
       "h264": Sets the browser to use H.264 for encoding.
       "vp9": This parameter is reserved for future use. */
});

//Initializig the client
client.init(config.app_id,() => console.log("AgoraRTC client initialized") ,handleFail);

// The client joins the channel
client.join(null,"any-channel",null, (uid)=>{
    // Stream object associated with your web cam is initialized
    let localStream = AgoraRTC.createStream({
        audio: true,
        video: true,
    });

    // Associates the stream to the client
    localStream.init(function() {

        //Plays the localVideo
        localStream.play('me');

        //Publishes the stream to the channel
        client.publish(localStream, handleFail);

    },handleFail);

},handleFail);

//When a stream is added to a channel
client.on('stream-added', function (evt) {
    client.subscribe(evt.stream, handleFail);
});

//When you subscribe to a stream
client.on('stream-subscribed', function (evt) {
    let stream = evt.stream;
    addVideoStream(String(stream.getId()));
    stream.play(String(stream.getId()));
});

//When a person is removed from the stream
client.on('stream-removed',removeVideoStream);
client.on('peer-leave',removeVideoStream);