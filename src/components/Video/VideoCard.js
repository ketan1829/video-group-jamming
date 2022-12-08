import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import '../Meet/Meet.css'

const VideoCard = (props) => {
  const ref = useRef();
  const peer = props.peer;
  const totalPeer = props.number;
  const index = props.index;

  useEffect(() => {
    peer.on('stream', (stream) => {
      ref.current.srcObject = stream;
    });
    peer.on('track', (track, stream) => {
      console.log('track got altered');
    });
  }, [peer]);

  return (
    <div className='peerdiv'>
    <video
      className='PeerContainer'
      playsInline
      autoPlay
      // onLoadStart={(e)=>{e.target.volume=0.0}}
      ref={ref}
      style={{
        // height:totalPeer > 1?"calc(100vh - 470px)":"calc(100vh - 170px)",
        height:totalPeer > 1?"calc(100vh - 470px)":"calc(100vh - 230px)",
        width:totalPeer > 1?"calc(100vw - 892px)":"100%"
      }}
      // height="100%"
      // width="100%"
    />
    </div>
  );
};

const Video = styled.video`
  min-width:100%;
  min-height: 42vh;
  height:100%;
  width: 100%;
  border-radius: 4px;
  border: 6px solid #ffffb3;
  display:flex;
`;

const OldVideo = styled.video`
  display: flex;
  width: 100%;
  height: 100%;
  border: 6px solid #ffffb3 ;
  justify-content: space-around;
`;

export default VideoCard;
