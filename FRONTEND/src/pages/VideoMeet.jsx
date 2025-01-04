import React, { useRef, useState, useEffect } from 'react'
import "../styles/videoComponent.css";
import { TextField, Button, IconButton } from "@mui/material";
import io from "socket.io-client";
//import { Input } from '@mui/base';
// import styles from "../styles/videoComponent.css";
import "../styles/videoComponent.css";

import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import {Badge} from '@mui/material';
import { useNavigate } from 'react-router-dom';


const server_url = "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
    "iceServers" : [
        {"urls" : "stun:stun.l.google.com:19302"}
    ]
}


export default function VideoMeetComponent() {
    var socketRef = useRef();
    
    let socketIdRef = useRef();

    //var socketId = useRef();

    let localVideoRef = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([]);

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);

    useEffect(() => {
        //console.log("HELLO");
        getPermissions(); // Call to check for media permissions

    })

    const getPermissions = async () => {
        try{
            const videoPermission = await navigator.mediaDevices.getUserMedia({video : true})
            if(videoPermission){
                setVideoAvailable(true);
                localVideoRef.current.srcObject = videoPermission; // Set the video stream to localVideoRef

            }else{
                setVideoAvailable(false);
            }
            
            const audioPermission = await navigator.mediaDevices.getUserMedia({audio : true})
            
            if(audioPermission){
                setAudioAvailable(true);
            }else{
                setAudioAvailable(false);
            }

            if(navigator.mediaDevices.getDisplayMedia){
                setScreenAvailable(true);
            }else{
                setScreenAvailable(false);
            }

            if(videoAvailable || audioAvailable){
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video : videoAvailable, audio : audioAvailable});
                if(userMediaStream){
                    window.localStream = userMediaStream;
                    if(localVideoRef.current){
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }

        }
        catch(err){
            console.error(err);

        }
    };

    // useEffect(() => {
    //     console.log("HELLO");
    //     getPermissions(); // Call to check for media permissions

    // })

    let getUserMediaSuccess = (stream) => {
        try{
            window.localStream.getTracks().forEach(track => track.stop())
        }catch(e) {console.log(e)}
        window.localStream = stream;
        localVideoRef.current.srcObject = stream;
        for(let id in connections){
            if(id === socketIdRef.current) continue
            connections[id].addStream(window.localStream)
            connections[id].createOffer().then((description) => {
                //console.log(description)
                connections[id].setLocalDescription(description)
                .then(() => {
                    socketRef.current.emit("signal", id, JSON.stringify({"sdp" : connections[id].localDescription}));//socketIdRef chaged to socketRef
                })
                .catch(e => console.log(e))
            })
            
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);
            try{
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            }catch(e) {console.log(e)}

            //ToDo BlackSilence

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            for(let id in connections){
                connections[id].addStream(window.localStream)
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({'sdp':connections[id].localDescription}))
                    }).catch(e => console.log(e));
                })
            }
        })
    }


    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], {enabled : false})
    }

    let black = ({width = 640, height = 480} = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), {width, height});
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], {enabled : false})
    }


    let getUserMedia = () => {
        if((video && videoAvailable) || (audio && audioAvailable)){
            navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then(getUserMediaSuccess)//TODO : getUserMediaSuccess
            .then((stream) => { })
            .catch((e) => console.log(e))
        }else{
            try{
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            }catch(e){
                console.log("Error stopping tracks:", e);
            }
        }
    }

    // useEffect(() => {
    //     if(video !== undefined && audio !== undefined){
    //         getUserMedia();
    //     }
    // }, [audio, video]);

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            //console.log("SET STATE HAS ", video, audio);

        }
    }, [video, audio])

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }


    //TODO Message
    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)
        if(fromId !== socketIdRef.current){
            if(signal.sdp){
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if(signal.sdp.type === 'offer'){
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({'sdp' : connections[fromId].localDescription}))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }
            if(signal.ice){
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }
        }
    }

    //TODO addMessage
    let addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            {sender : sender, data : data}
        ]);
        //If harshith !== Ashish (True) Jab new message add kar sakte hai, Nahi toh new message karne ki zarurat nahi hai
        if(socketIdSender !== socketIdRef.current){
            setNewMessages((prevMessages) => prevMessages + 1)
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, {secure : false})
        socketRef.current.on('signal', gotMessageFromServer)
        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-call", window.location.href)
            socketIdRef.current = socketRef.current.id
            socketRef.current.on("chat-message", addMessage)
            socketRef.current.on("user-left", (id) => {
                setVideos((videos)=>videos.filter((video)=>video.socketId !== id))
            })
            socketRef.current.on("user-joined",(id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    connections[socketListId].onicecandidate = (event) => {
                        //ice is a protocol. Iska naam hai, Interactive Conectivity Eshtablishment. Dono clients ke beech mein connection banane ke liye iss protocol ko use karte hai
                        if(event.candidate != null){
                            socketRef.current.emit('signal', socketListId, JSON.stringify({'ice':event.candidate}))
                        }
                    }

                    //1st code
                    // connections[socketListId].onaddstream = (event) => {
                    //     let videoExists = videoRef.current.find(video => video.socketId === socketListId);
                    //     if(videoExists){
                    //         setVideo(video => {
                    //             const updatedVideos = video.map(video => 
                    //                 video.socketId === socketListId ? {...video, stream : event.stream} : video
                    //             );
                    //             videoRef.current = updatedVideos;
                    //             return updatedVideos;
                    //         })
                    //     }else{
                    //         let newVideo = {
                    //             socketId : socketListId,
                    //             stream : event.stream[0],//event.stream
                    //             autoPlay : true,
                    //             playsinline : true
                    //         }
                    //         setVideos(videos => {
                    //             const updatedVideos = [...videos, newVideo];
                    //             videoRef.current = updatedVideos;
                    //             return updatedVideos;
                    //         });
                        
                    //     }
                    // };



                    //2nd code
                    // connections[socketListId].ontrack = (event) => {
                    //     const newVideo = {
                    //         socketId: socketListId,
                    //         stream: event.streams[0], // Updated to use event.streams[0]
                    //         autoPlay: true,
                    //         playsinline: true,
                    //     };
                    //     console.log(event.streams);
                        
                    //     setVideos((prevVideos) => {
                    //         const videoExists = prevVideos.find(video => video.socketId === socketListId);
                    //         if (videoExists) {
                    //             return prevVideos.map(video =>
                    //                 video.socketId === socketListId ? newVideo : video
                    //             );
                    //         } else {
                    //             return [...prevVideos, newVideo]; // Add the new video
                    //         }
                    //     });
                    // };

                    //3rd code
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };
                

                    if(window.localStream !== undefined && window.localStream !== null){
                        connections[socketListId].addStream(window.localStream);
                    }else{
                        //TODO BlackSilence
                        //let blackSilence
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }
                })
                if(id === socketIdRef.current){
                    for(let id2 in connections){
                        if(id2 === socketIdRef.current) continue
                        try{
                            connections[id2].addStream(window.localStream)
                        }catch(e){
                            connections[id2].createOffer().then((description) => {
                                connections[id2].setLocalDescription(description)
                                .then(() => {//sdp ka matlab hota hai Session Description
                                    socketRef.current.emit("signal", id2, JSON.stringify({"sdp" : connections[id2].localDescription}))
                                })
                                .catch(e => console.log(e))
                            })
                        }
                    }
                }
            })
        })
    }

    // let getMedia = () => {
    //     setVideo(videoAvailable);
    //     setAudio(audioAvailable);
    //     connectToSocketServer();
    // }

    let routeTo = useNavigate();

    let connect = () => {
        setAskForUsername(false);
        getMedia();
        //connectToSocketServer();//changes
    }

    let handleVideo = () => {
        setVideo(!video);
    }

    let handleAudio = () => {
        setAudio(!audio);
    }

    let getDisplayMediaSuccess = (stream) => {
        try{
            window.localStream.getTracks().forEach(track => track.stop())
        }catch(e)  {console.log(e)}

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for(let id in connections){
            if(id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream)
            connections[id].createOffer().then((description) => [
                connections[id].setLocalDescription(description)
                .then(() => {
                    socketRef.current.emit("signal", id, JSON.stringify({"sdp" : connections[id].localDescription}))
                })
                .catch(e => console.log(e))
            ])
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);
            try{
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            }catch(e) {console.log(e)}

            //ToDo BlackSilence

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            getUserMedia();
        })
    }

    let getDisplayMedia = () => {
        if(screen){
            if(navigator.mediaDevices.getDisplayMedia){
                navigator.mediaDevices.getDisplayMedia({video : true, audio : true})
                .then(getDisplayMediaSuccess)
                .then((stream) = {})
                .catch(e => console.log(e))
            }
        }
    }

    useEffect(() => {
        if(screen !== undefined){
            getDisplayMedia();
        }
    }, [screen]);

    let handleScreen = () => {
        setScreen(!screen);
    }

    let sendMessage = () => {
        socketRef.current.emit("chat-message", message, username);
        setMessage("");
    }
    // console.log(videos);

    let handleEndCall = () => {
        try{
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop())
        }
        catch(e){}
        routeTo("/home")
    }

    return (
    <div>
        {
            askForUsername === true ?
            <div>
                <h2>Enter into Lobby</h2>
                <TextField id = "outlined-basic" label = "Username" value = {username} onChange = {e => setUsername(e.target.value)} variant = "outlined"/>
                <Button variant = "contained" onClick = {connect}>Connect</Button>


                <div>
                    <video ref = {localVideoRef} autoPlay muted></video>
                </div>

            </div> :
            //<div className = {styles.meetVideoContainer} >
            <div className = "meetVideoContainer">

                {showModal ? <div className = "chatRoom">
                    
                    <div className="chatContainer">
                        <h1>Chat</h1>
                        <div className="chattingDisplay">
                            {messages.length > 0? messages.map((item, index) => {
                                return(
                                    <div style = {{marginBottom : "20px"}}key = {index}>
                                        <p style={{fontWeight: "bold"}}>{item.sender}</p>
                                        <p>{item.data}</p>
                                    </div>
                                )
                            }): <p>No Messages Yet</p>
                        }

                        </div>
                        <div className="chattingArea">
                            {/* {message} */}
                            <TextField value = {message} onChange = {(e) => setMessage(e.target.value)}id="outlined-basic" label="Enter Your Chat" variant="outlined" />
                            <Button variant='contained' onClick={sendMessage}>Send</Button>
                        </div>
                    </div>
                </div> : <></>}

                
        
                <div className="buttonContainers">
                    <IconButton onClick = {handleVideo} style = {{color : "white"}}>
                        {(video === true)? <VideocamIcon /> : <VideocamOffIcon />}
                    </IconButton>
                    <IconButton onClick={handleEndCall} style = {{color : "red"}}>
                        <CallEndIcon/>
                    </IconButton>
                    <IconButton onClick = {handleAudio} style = {{color : "white"}}>
                        {(audio === true) ? <MicIcon/> : <MicOffIcon/>}
                    </IconButton>
                    {screenAvailable === true?
                    <IconButton onClick = {handleScreen} style = {{color : "white"}}>
                        {(screen === true) ? <ScreenShareIcon/> : <StopScreenShareIcon/>}
                    </IconButton> : <></>}

                    <Badge badgeContent = {newMessages} max = {999} color = 'orange'>
                    <IconButton onClick = {() => setModal(!showModal)}style = {{color : "white"}}>
                        <ChatIcon/>

                    </IconButton>
                    </Badge>
                </div>


            <video className = 'meetUserVideo' ref = {localVideoRef} autoPlay muted></video>
            {/* {videos.map((video) => ( */}

                <div className = "conferenceView">
                {videos.map((video) => (
                    <div key={video.socketId}>
                        {/* <h2>{video.socketId}</h2>  */}
                    <video
                        data-socket={video.socketId}
                        ref={ref => {
                            if(ref && video.stream){
                                ref.srcObject = video.stream;
                            }
                        }}
                        autoPlay
                    >
                    </video>
                </div>
                

            ))}
            </div>
            </div>

            
        }
    </div>//{window.location.href} gives you the location
  )
}
