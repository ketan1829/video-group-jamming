import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import '../Meet/Meet.css'

const VideoCard = (props) => {
  const ref = useRef();
  const peer = props.peer;

  useEffect(() => {
    peer.on('stream', (stream) => {
      ref.current.srcObject = stream;
    });
    peer.on('track', (track, stream) => {
    });
  }, [peer]);

  return (
    <video
    className='PeerContainer'
      playsInline
      autoPlay
      ref={ref}
    />
  );
};

const Video = styled.video`
  border: 6px solid #ffffb3 ;
  min-width:100%;
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
