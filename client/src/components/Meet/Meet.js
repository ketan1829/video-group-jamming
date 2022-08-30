import React, { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import styled from 'styled-components';
import { Col, Divider, Row, Card, List, Badge, Breadcrumb, Layout, Menu } from 'antd';

import 'antd/dist/antd.css';
import './Meet.css'

import socket from '../../socket';
import VideoCard from '../Video/VideoCard';
import BottomBar from '../BottomBar/BottomBar';
import Chat from '../Chat/Chat';

const Meet = (props) => {
  const currentUser = sessionStorage.getItem('user');
  const [peers, setPeers] = useState([]);
  const [userVideoAudio, setUserVideoAudio] = useState({
    localUser: { video: true, audio: true },
  });
  const [videoDevices, setVideoDevices] = useState([]);
  const [displayChat, setDisplayChat] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [showVideoDevices, setShowVideoDevices] = useState(false);
  const peersRef = useRef([]);
  const userVideoRef = useRef();
  const screenTrackRef = useRef();
  const userStream = useRef();
  const roomId = props.match.params.roomId;


  const { Header, Content, Footer } = Layout;


  useEffect(() => {
    // Get Video Devices
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const filtered = devices.filter((device) => device.kind === 'videoinput');
      setVideoDevices(filtered);
    });

    // Set Back Button Event
    window.addEventListener('popstate', goToBack);

    // Connect Camera & Mic
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideoRef.current.srcObject = stream;
        userStream.current = stream;

        socket.emit('BE-join-room', { roomId, userName: currentUser });
        socket.on('FE-user-join', (users) => {
          // all users
          console.log("ALL users in user-join", users)
          const peers = [];
          users.forEach(({ userId, info }) => {
            let { userName, video, audio } = info;

            if (userName !== currentUser) {
              const peer = createPeer(userId, socket.id, stream);

              peer.userName = userName;
              peer.peerID = userId;

              peersRef.current.push({
                peerID: userId,
                peer,
                userName,
              });
              peers.push(peer);

              setUserVideoAudio((preList) => {
                return {
                  ...preList,
                  [peer.userName]: { video, audio },
                };
              });
              console.log("peers pushed", peers)

            }
          });

          setPeers(peers);
        });

        socket.on('FE-receive-call', ({ signal, from, info }) => {
          let { userName, video, audio } = info;
          const peerIdx = findPeer(from);

          if (!peerIdx) {
            const peer = addPeer(signal, from, stream);

            peer.userName = userName;

            peersRef.current.push({
              peerID: from,
              peer,
              userName: userName,
            });
            setPeers((users) => {
              return [...users, peer];
            });
            setUserVideoAudio((preList) => {
              return {
                ...preList,
                [peer.userName]: { video, audio },
              };
            });
          }
        });

        socket.on('FE-call-accepted', ({ signal, answerId }) => {
          const peerIdx = findPeer(answerId);
          peerIdx.peer.signal(signal);
        });

        socket.on('FE-user-leave', ({ userId, userName }) => {
          const peerIdx = findPeer(userId);
          peerIdx.peer.destroy();
          setPeers((users) => {
            users = users.filter((user) => user.peerID !== peerIdx.peer.peerID);
            return [...users];
          });
          peersRef.current = peersRef.current.filter(({ peerID }) => peerID !== userId );
        });
      });

    socket.on('FE-toggle-camera', ({ userId, switchTarget }) => {
      const peerIdx = findPeer(userId);

      setUserVideoAudio((preList) => {
        let video = preList[peerIdx.userName].video;
        let audio = preList[peerIdx.userName].audio;

        if (switchTarget === 'video') video = !video;
        else audio = !audio;

        return {
          ...preList,
          [peerIdx.userName]: { video, audio },
        };
      });
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  function createPeer(userId, caller, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket.emit('BE-call-user', {
        userToCall: userId,
        from: caller,
        signal,
      });
    });
    peer.on('disconnect', () => {
      peer.destroy();
    });

    return peer;
  }

  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket.emit('BE-accept-call', { signal, to: callerId });
    });

    peer.on('disconnect', () => {
      peer.destroy();
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function findPeer(id) {
    return peersRef.current.find((p) => p.peerID === id);
  }

  function createUserVideo(peer, index, arr) {
    return (
      <VideoBox
        className={`width-peer${peers.length > 8 ? '100' : peers.length}`}
        onClick={expandScreen}
        key={index}
      >
        {writeUserName(peer.userName)}
        <FaIcon className='fas fa-expand' />
        <VideoCard key={index} peer={peer} number={arr.length} />
      </VideoBox>
    );
  }

  function writeUserName(userName, index) {
    if (userVideoAudio.hasOwnProperty(userName)) {
      if (!userVideoAudio[userName].video) {
        return <UserName key={userName}>{userName}</UserName>;
      }
    }
  }

  // Open Chat
  const clickChat = (e) => {
    e.stopPropagation();
    setDisplayChat(!displayChat);
  };

  // BackButton
  const goToBack = (e) => {
    e.preventDefault();
    socket.emit('BE-leave-room', { roomId, leaver: currentUser });
    sessionStorage.removeItem('user');
    window.location.href = '/';
  };

  const toggleCameraAudio = (e) => {
    

    console.log("EVENT",e)

    const target = e // .target.getAttribute('data-switch');

    setUserVideoAudio((preList) => {
      let videoSwitch = preList['localUser'].video;
      let audioSwitch = preList['localUser'].audio;

      if (target === 'video') {
        const userVideoTrack = userVideoRef.current.srcObject.getVideoTracks()[0];
        videoSwitch = !videoSwitch;
        userVideoTrack.enabled = videoSwitch;
      } else {
        const userAudioTrack = userVideoRef.current.srcObject.getAudioTracks()[0];
        audioSwitch = !audioSwitch;

        if (userAudioTrack) {
          userAudioTrack.enabled = audioSwitch;
        } else {
          userStream.current.getAudioTracks()[0].enabled = audioSwitch;
        }
      }

      return {
        ...preList,
        localUser: { video: videoSwitch, audio: audioSwitch },
      };
    });

    socket.emit('BE-toggle-camera-audio', { roomId, switchTarget: target });
  };

  const clickScreenSharing = () => {
    if (!screenShare) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((stream) => {
          const screenTrack = stream.getTracks()[0];

          peersRef.current.forEach(({ peer }) => {
            // replaceTrack (oldTrack, newTrack, oldStream);
            peer.replaceTrack(
              peer.streams[0]
                .getTracks()
                .find((track) => track.kind === 'video'),
              screenTrack,
              userStream.current
            );
          });

          // Listen click end
          screenTrack.onended = () => {
            peersRef.current.forEach(({ peer }) => {
              peer.replaceTrack(
                screenTrack,
                peer.streams[0]
                  .getTracks()
                  .find((track) => track.kind === 'video'),
                userStream.current
              );
            });
            userVideoRef.current.srcObject = userStream.current;
            setScreenShare(false);
          };

          userVideoRef.current.srcObject = stream;
          screenTrackRef.current = screenTrack;
          setScreenShare(true);
        });
    } else {
      screenTrackRef.current.onended();
    }
  };

  const expandScreen = (e) => {
    const elem = e.target;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
  };

  const clickBackground = () => {
    if (!showVideoDevices) return;

    setShowVideoDevices(false);
  };

  const clickCameraDevice = (event) => {
    if (event && event.target && event.target.dataset && event.target.dataset.value) {
      const deviceId = event.target.dataset.value;
      const enabledAudio = userVideoRef.current.srcObject.getAudioTracks()[0].enabled;

      navigator.mediaDevices
        .getUserMedia({ video: { deviceId }, audio: enabledAudio })
        .then((stream) => {
          const newStreamTrack = stream.getTracks().find((track) => track.kind === 'video');
          const oldStreamTrack = userStream.current
            .getTracks()
            .find((track) => track.kind === 'video');

          userStream.current.removeTrack(oldStreamTrack);
          userStream.current.addTrack(newStreamTrack);

          peersRef.current.forEach(({ peer }) => {
            // replaceTrack (oldTrack, newTrack, oldStream);
            peer.replaceTrack(
              oldStreamTrack,
              newStreamTrack,
              userStream.current
            );
          });
        });
    }
  };


  console.log("PEERS", peers)

  const navItems = [{key:1,label:"Home"},{key:2,label:"Jam"}]

  return (
  
    <>

  
    <Layout>
    <Header className='header' style={{background: 'rgba(31,37, 58, 1)'}}>
      <div className="logo" style={{
        float: "left",
        width: "130px",
        height: "41px",
        margin: "16px 24px 16px 0",
        align:"centre",
        
        
      }}><img src={"https://choira.io/static/media/choria.02aeae5c.svg"} alt="Choira logo" style={{paddingBottom:"50px"}} /></div>
      {/* <Menu
        theme="light"
        mode="horizontal"
        className='header'
        defaultSelectedKeys={['2']}
        color = '#1f253a'
        items= {navItems}
        
        // {new Array(15).fill(null).map((_, index) => {
        //   const key = index + 1;
        //   return {
        //     key,
        //     label: `nav ${key}`,
        //   };
        // })}
      /> */}
    </Header>

    <Layout className="screen body">
    <Content
      style={{
        padding: '40px 80px',
        height: '1000px',
        backgroundColor: 'rgba(31,37, 58, 1)'
      }}
    >
    {/* <Divider/> */}

    <div className='VidContainer'>
    
    <Row gutter={[8, 8]}>
      <Col span={12} >
      <Badge.Ribbon text="(Host) ♛" placement="start" color="gold">
        <video
          className='MyPeerContainer'
          onClick={expandScreen}
          ref={userVideoRef}
          muted
          autoPlay
          // playInline
        ></video>
        </Badge.Ribbon>
      </Col>
      
      {/* <Row justify="space-around"> */}
      {peers &&
            peers.map((peer, index, arr) => 
            
            <Col span={12} >
                <Badge.Ribbon text={peer?.userName} placement="start" color="blue">
                <VideoCard key={index} peer={peer} number={arr.length} />
                </Badge.Ribbon>
            </Col>
            
            
            
      )}
      
    </Row>

    </div>

    <Row gutter={[8, 8]}>
      <Col span={12} />
      <Col span={12} />
    </Row>

    <BottomBar
          clickScreenSharing={clickScreenSharing}
          clickChat={clickChat}
          clickCameraDevice={clickCameraDevice}
          goToBack={goToBack}
          toggleCameraAudio={toggleCameraAudio}
          userVideoAudio={userVideoAudio['localUser']}
          screenShare={screenShare}
          videoDevices={videoDevices}
          showVideoDevices={showVideoDevices}
          setShowVideoDevices={setShowVideoDevices}
        />
    {/* <Row style={{ backgroundColor: 'gold', }}>
        <Col flex="1 1 200px">
          <div >Video</div>
        </Col>
      <Col flex="0 1 200px">Audio</Col>
    </Row> */}


    </Content>

    </Layout>

    {/* <Footer
      style={{
        textAlign: 'center',
      }}
    >
      Created by Choira
    </Footer> */}

    </Layout>

    </>

    

  );
};

const RoomContainer = styled.div`
  display: flex;
  width: 100%;
  max-height: 100vh;
  flex-direction: row;
  
`;

const OldVideoContainer = styled.div`
  max-width: 100%;
  height: 92%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  align-items: center;
  padding: 15px;
  box-sizing: border-box;
  gap: 10px;
`;

const VideoContainer = styled.div`
  max-width: 100%;
  height: 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  align-items: center;
  box-sizing: border-box;
  padding: 10px
`;

const MyVideoContainer = styled.div`
  max-width: 50%;
  height: 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  align-items: center;
  box-sizing: border-box;
  padding: 10px
`;

const VideoAndBarContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
`;

const OldMyVideo = styled.video`
  border-radius: 4px;
  display: flex;
  max-width: 50%;
  max-height: 50%;
  border: 6px solid ;
`;

const MyVideo = styled.video`
  
  min-width:100%;
  border-radius: 4px;
  border: 6px solid ;
  
`;

const OldVideoBox = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  > video {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  :hover {
    > i {
      display: block;
    }
  }
`;

const VideoBox = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  > video {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 1);
    

  }

  :hover {
    > i {
      display: block;
    }
  }
`;

const MyVideoBox = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  max-width: 25%;
  min-height: 20%;
  > video {
    top: 0;
    left: 0;
    max-width: 25%;
    min-height: 20%;
    border-radius: 10px;
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 1);

  }

  :hover {
    > i {
      display: block;
    }
  }
`;

const UserName = styled.div`
  position: absolute;
  font-size: calc(20px + 5vmin);
  z-index: 1;
`;

const FaIcon = styled.i`
  display: none;
  position: absolute;
  right: 15px;
  top: 15px;
`;

export default Meet;