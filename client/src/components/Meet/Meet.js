import React, { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import styled from 'styled-components';
import { Col, Divider, Row, Card, List, Badge, Breadcrumb, Layout, Menu } from 'antd';
import { useHistory, useParams } from "react-router-dom";

import { WebRTCStats } from '@peermetrics/webrtc-stats'



import 'antd/dist/antd.min.css';
import './Meet.css'

import socket from '../../socket';
import VideoCard from '../Video/VideoCard';
import BottomBar from '../BottomBar/BottomBar';
import Chat from '../Chat/Chat';

// => here,need to dig more into this
import * as process from 'process';

(window).global = window;
(window).process = process;
(window).Buffer = [];
// <=

const Meet = (props) => {
  let history = useHistory();
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

  const [statsReport, setStatsReport] = useState({})
  // const [report, setReport] = useState([])
  const [time, setTime] = useState(Date.now());
  // const [metronomeData, setMetronomeData] = useState({});

  let webrtcStats = new WebRTCStats({
    getStatsInterval: 5000
  })


  const { Header, Content, Footer } = Layout;


  // nc
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState(0);
  const [showAudioDevices, setShowAudioDevices] = useState(false);


  useEffect(() => {



    // nc
    function setToStart() {

      const getSetDevices = () => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          // nc
          const uniqueDevices = [];
          const audioDevices = devices.filter((adevice) => adevice.kind === 'audioinput');
          const videoDevices = devices.filter((vdevice) => vdevice.kind === 'videoinput');
          setAudioDevices(audioDevices);
          setVideoDevices(videoDevices);
          setSelectedAudioDeviceId(audioDevices[0].deviceId)
          // console.table(audioDevices)
        });
      }
      // nc
      navigator.mediaDevices.ondevicechange = (event) => {
        // setSelectedAudioDeviceId(0)
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          const audioDevices = devices.filter((device) => device.kind === 'audioinput');
          let selectedAudioDevicesInList = true;
          audioDevices.map((device) => {
            if (device.deviceId !== selectedAudioDeviceId) {
              selectedAudioDevicesInList = false
            } else {
              selectedAudioDevicesInList = true
            }
          });
          if (!selectedAudioDevicesInList) setSelectedAudioDeviceId(0)
          setAudioDevices(audioDevices);
          const newVideoDevices = devices.filter((device) => device.kind === 'videoinput');
          setVideoDevices(newVideoDevices);
        });
      };

      // const supported = navigator.mediaDevices.getSupportedConstraints();

      // console.log("Supported", supported)

      // // Get Video Devices
      // navigator.mediaDevices.enumerateDevices().then((devices) => {
      //   const filtered = devices.filter((device) => device.kind === 'videoinput');
      //   setVideoDevices(filtered);
      // });

      // Set Back Button Event
      window.addEventListener('popstate', goToBack);

      // Connect Camera & Mic
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        getSetDevices()
        userVideoRef.current.srcObject = stream; // local
        userStream.current = stream;

        socket.emit('BE-join-room', { roomId, userName: currentUser });

        // here new peers get added
        socket.on('FE-user-join', (users) => {
          // all users
          console.log("ALL users in user-join", users)
          const temp_peers = [];
          users.forEach(({ userId, info }) => {

            let { userName, video, audio } = info;

            if (userName !== currentUser) {
              const peer = createPeer(userId, socket.id, stream);

              peer.userName = userName;
              peer.peerID = userId;

              // peersRef.current.push({
              //   peerID: userId,
              //   peer,
              //   userName,
              // });
              push_unique_peer({ peerID: userId, peer, userName })
              temp_peers.push(peer);

              setUserVideoAudio((preList) => {
                return {
                  ...preList,
                  [peer.userName]: { video, audio },
                };
              });
              console.log("peers pushed", temp_peers)

            }
          });

          setPeers(temp_peers);
        });

        socket.on('FE-receive-call', ({ signal, from, info }) => {

          let { userName, video, audio } = info;
          const peerIdx = findPeer(from);

          if (!peerIdx) {
            const peer = addPeer(signal, from, stream);

            peer.userName = userName;

            // peersRef.current.push({
            //   peerID: from,
            //   peer,
            //   userName,
            // });
            push_unique_peer({ peerID: from, peer, userName })

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
          peerIdx?.peer.destroy();
          setPeers((users) => {
            users = users.filter((user) => user.peerID !== peerIdx?.peer.peerID);
            return [...users];
          });
          peersRef.current = peersRef.current.filter(({ peerID }) => peerID !== userId);
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


      // for getting peer stats in 5 second interval
      // setInterval(() => {
      //   console.log("pinging after 5 seconds",peers);
      //   if(peers.length){
      //     peers[0].getStats((err, stats) => {
      //       stats.forEach((report) => {
      //       if(report.kind==="video" & report.type==="remote-inbound-rtp"){
      //         console.log("report",report)
      //         setReport(report)
      //       }
      //       });
      //     });
      //   }else{
      //     console.log("else parting")
      //   }
      // }, 5000);
    }
    const _ = sessionStorage.getItem('user') === null ? props.history.push("/", { roomId }) : setToStart()

    const statsIntervals = setInterval(() => {
      // peersRef.current.forEach(({ peer }) => {console.log(peer);})
      if (peersRef.current.length) {

        peersRef.current.forEach(({ peerID, userName, peer }, index) => {

          let peerStats = {};
          peer?.getStats((err, stats) => {
            const _ = err ? console.log("stats error : ", err) : null;

            stats.forEach((stats_report) => {
              if (stats_report.kind === "video" && stats_report.type === "remote-inbound-rtp") {
                peerStats['rtt'] = stats_report.roundTripTime
                const newOne = { [userName]: peerStats };
                setStatsReport(pre_reports => ({ ...pre_reports, ...newOne }))
              }
              else if (stats_report.kind === "video" && stats_report.framesPerSecond) {
                peerStats['fps'] = stats_report.framesPerSecond
                const newOne = { [userName]: peerStats };
                setStatsReport(pre_reports => ({ ...pre_reports, ...newOne }))
              }
            })
          })
        })
      }
    }, 2000);

    // socket.on('FE-metronome', ({ userId, metroData })=>{
    //   console.log("MEET userId, metroData", userId, metroData)
    //   setMetronomeData((prev) => ({
    //     ...prev,metroData
    //   }))

    // })

    return () => {
      // socket.disconnect();
      clearInterval(statsIntervals);
    };

  }, []);

  // nc
  const push_unique_peer = ({ peerID, peer, userName }) => {
    if (peersRef.current.length > 0) {
      peersRef.current.forEach((peerData, index) => {
        console.log(peerData, index);
        if (peerData.userName === userName) {
          console.log("exist");
          peersRef.current[index] = { peerID, userName, peer };
        } else {
          console.log("new one");
          peersRef.current.push({ peerID, userName, peer })
        }
      }
      )
    } else {
      peersRef.current.push({ peerID, userName, peer })
    }
  }

  // stats
  // useEffect(() => {
  //   const peer = new Peer({
  //     initiator: false,
  //     trickle: false,
  //   });

  //   peer.getStats((err, reportNew) => {

  //     console.log('STATS: ',reportNew)
  //     const prevTime =  report[0].timestamp.toString().split(".")[1]
  //     const currTime =  reportNew[0].timestamp.toString().split(".")[1]
  //     console.log('prevTime', prevTime, "currTime", currTime)
  //     console.log("latency",currTime-prevTime)
  //     setReport(()=>reportNew)

  //   });
  // }, [report])



  // useEffect(() => {
  //   const interval = setInterval(() => getStatData(), 1000);
  //   console.log("TIME", time, report)
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);

  // function getStatData() {
  //   const peer = new Peer({
  //     initiator: true,
  //     trickle: false,
  //     wrtc: { RTCPeerConnection }
  //   });

  //   peer.getStats((err, report) => {
  //     // console.log('report', report)
  //     setReport(report)
  //   });
  // }

  function createPeer(userId, caller, stream) {
    const peer = new Peer({
      initiator: true,
      objectMode: true,
      trickle: false,
      stream,
      // iceRestart: true,
      // config: {
        iceServers:
        [
          { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credentials: 'openrelayproject'
          },
        ]
      // }
      // wrtc: { RTCPeerConnection }

    });

    peer.on('signal', (signal) => {

      console.log("signallllllllllllllllllllll 1");
      socket.emit('BE-call-user', {
        userToCall: userId,
        from: caller,
        signal,
      });
    });

    peer.on('disconnect', () => {
      console.log("disconnectttttttttttttttt");
      removePeer(peer)
    });

    peer.on('error', (error) => {
      console.log("errorrrrrrrrrrrrrrrrrrrrrr ", error);
      removePeer(peer)
    })

    peer.on('close', () => {
      console.log("closeeeeeeeeeeeeeeeeeeeeeeeeeeee ");
      removePeer(peer);

    })

    return peer;
  }

  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      iceServers:
        [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
          {
            urls: "stun:openrelay.metered.ca:80",
          },
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credentials: 'openrelayproject'
          },
          {
            urls: 'turn:openrelay.metered.ca:80?transport=tcp',
            username: 'openrelayproject',
            credentials: 'openrelayproject'
          },
          {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credentials: 'openrelayproject'
          },
          {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credentials: 'openrelayproject'
          }
        ],
      config: {}
    });

    peer.on('signal', (signal) => {
      console.log("signallllllllllllllllllllll 2");

      socket.emit('BE-accept-call', { signal, to: callerId });
    });

    peer.on('disconnect', () => {
      console.log("Ok peer dissconnected ")
      peer.destroy();
    });

    peer.on('error', (error) => {
      console.log("errorrrrrrrrrrrrrrrrrrrrrr 2");

      removePeer(peer)
    })

    peer.on('close', () => {
      console.log("closeeeeeeeeeeeeeeeeeeeeeeeeeeee 2");
      removePeer(peer)
    })

    peer.signal(incomingSignal);

    // console.log("peer OBJ:", peer)

    // peer.getStats((err, report) => {
    //   setReport(report)
    // });

    return peer;
  }

  function removePeer(peer) {
    // const isVideoOn = userVideoRef.current.srcObject.getVideoTracks()[0].enabled;
    // const isAudioOn = userVideoRef.current.srcObject.getAudioTracks()[0].enabled;
    // navigator.mediaDevices.getUserMedia({ video: isVideoOn, audio: isAudioOn })
    //   .then((stream) => {
    //     // const userVideoStream = stream.getTracks().find((track) => track.kind === 'video');
    //     // const userAudioStream = stream.getTracks().find((track) => track.kind === 'audio');
    //     // userStream.current.removeTrack(stream);
    //     // userStream.current.removeStream(stream);
    // peer.removeStream(stream);
    // peer.destroy()
    // window.location.href = '/';
    peer.destroy()
    setPeers((users) => {
      users = users.filter((user) => user.peerID !== peer.peerID);
      return [...users];
    });
    peersRef.current = peersRef.current.filter(({ peerID }) => peerID !== peer.peerID);
    // })
  }

  function findPeer(id) {
    return peersRef.current.find((p) => p.peerID === id);
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



  const SendTimestampMetronome = (metroData) => {
    console.log("DATA", metroData, "roomId", roomId)
    socket.emit('BE-metronome', { roomId, metroData });
  }

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


  // console.log("PEERS", peers, time, report)


  // setInterval(() => {

  //   if(peers.length){
  //   peers[0].getStats((err, stats) => {
  //     let statsOutput = "";
  //     stats.forEach((report) => {
  //     // if(report.kind==="video" || report.kind === "audio" & report.type==="remote-inbound-rtp"){
  //     if(report.kind==="video" || report.kind === "audio" && report.type==="remote-inbound-rtp"){
  //     // statsOutput += `<h2>Report: ${report.type}</h2>\n<strong>ID:</strong> ${report.id}<br>\n` +
  //     //     `<strong>Timestamp:</strong> ${report.timestamp}<br>\n`;
  //       // console.log("Type", report.type, "report.timestamp", report.timestamp)
  //     // console.log("report", report)

  //     // setReport(prereports=>[...prereports,report])
  //     // setReport(report)

  //     // console.log("Audio Round Trip Time (or Latency): ", report.roundTripTime*1000)

  //     }
  //     });


  // if(peers.length){
  // peers[0].getStats((err, stats) => {
  // let statsOutput = "";
  // stats.forEach((report) => {
  // if(report.kind==="video" & report.type==="remote-inbound-rtp"){
  // statsOutput += `<h2>Report: ${report.type}</h2>\n<strong>ID:</strong> ${report.id}<br>\n` +
  // `<strong>Timestamp:</strong> ${report.timestamp}<br>\n`;
  // console.log("Type", report.type, "report.timestamp", report.timestamp)
  // console.log("report", report)
  // setReport(report)
  // console.log("Audio Round Trip Time (or Latency): ", report.roundTripTime*1000)

  //     // console.log("statsOutput", statsOutput)
  //     // document.querySelector(".stats-box").innerHTML = statsOutput;

  //   });
  // }
  // }, 5000);

  const navItems = [{ key: 1, label: "Home" }, { key: 2, label: "Jam" }]

  // nc
  const switchAudioSource = (audioDeviceId) => {

    setSelectedAudioDeviceId(audioDeviceId)
    // const enabledAudio = userVideoRef.current.srcObject.getAudioTracks()[0].enabled;

    navigator.mediaDevices
      .getUserMedia({ audio: { 'deviceId': audioDeviceId, enabledAudio: true } })
      .then((stream) => {
        const newStreamTrack = stream.getTracks().find((track) => track.kind === 'audio');

        const oldStreamTrack = userStream.current.getTracks().find((track) => track.kind === 'audio');

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
      }).catch((error) => {
        console.log(error)
      });
  }

  // nc 

  useEffect(() => {

    // console.log("Reports chnaged : ", statsReport)
    return () => { }
  }, [statsReport])



  // main return
  return (
    <>
      <Layout style={{ height: '100vh' }}>
        <Header className='header'>
          <div className="logo">
            <img src={"https://i.ibb.co/pRNQHmZ/choria-96439620.png"} alt="Choira logo" style={{ paddingBottom: "50px" }} />
          </div>
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

        {/* <Layout > */}
        <Content className='main_container'>
          {/* <Divider/> */}

          <div className='VidContainer'>

            <Row gutter={[8, 2]}>
              <Col xl={peers?.length == 0 ? 24 : 12} sm={12}>
                <Badge.Ribbon text="(Me) ♛" placement="start" color="gold">
                  <video
                    className='myvideo'
                    onClick={expandScreen}
                    ref={userVideoRef}
                    // height="100%"
                    // width="100%"
                    style={{
                      height: peers?.length > 1 ? "calc(100vh - 475px)" : "calc(100vh - 230px)",
                    }}

                    muted
                    autoPlay
                  // playInline
                  ></video>
                </Badge.Ribbon>
              </Col>

              {/* <Row justify="space-around"> */}
              {
                Object.keys(peers).length > 0 &&
                peers.map((peer, index, arr) =>
                  // <Col key={peer.userName} span={peers?.length===3?12:(index+1)%2===0?24:12} >
                  <Col key={peer.userName} span={index === 1 ? 24 : 12}>
                    <Badge count={Object.keys(statsReport).length ? `RTT ${statsReport[peer.userName]?.rtt * 1000} ms` : 'RTT:N/A'} style={{ color: "green", backgroundColor: "white", marginRight: 50, marginTop: 20 }} size="small" >
                      <Badge count={Object.keys(statsReport).length ? `FPS ${statsReport[peer.userName]?.fps}` : 'FPS N/A'} style={{ color: "green", backgroundColor: "white", marginRight: 50, marginTop: 40 }} size="small" >
                        <Badge.Ribbon text={peer?.userName} placement="start" color="blue" id="userBadge">
                          <VideoCard peer={peer} number={arr.length} index={index} />
                        </Badge.Ribbon>
                      </Badge>
                    </Badge>
                  </Col>
                )
              }

            </Row>

          </div>

          {/* <Row gutter={[8, 8]}>
              <Col span={12} />
              <Col span={12} />
            </Row> */}


          {/* <Row style={{ backgroundColor: 'gold', }}>
        <Col flex="1 1 200px">
          <div >Video</div>
        </Col>
      <Col flex="0 1 200px">Audio</Col>
    </Row> */}


        </Content>

        {/* </Layout> */}

        {/* <Footer
      style={{
        textAlign: 'center',
      }}
    >
      Created by Choira
    </Footer> */}
        <Footer style={{ 'backgroundColor': 'rgba(31,37, 58, 1)' }}>
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
            audioDevices={audioDevices}
            switchAudioSource={switchAudioSource}
            SendTimestampMetronome={SendTimestampMetronome}

          />
        </Footer>

      </Layout>

    </>



  );
};


export default Meet;