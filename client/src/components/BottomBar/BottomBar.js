import React, { useCallback, useState } from 'react';
import { Button, Col, Divider, Row, Space, Badge } from 'antd';
import {
  AudioOutlined,
  VideoCameraOutlined,
  VideoCameraFilled,
} from '@ant-design/icons';

import styled from 'styled-components';
import './BottomBar.css'

const BottomBar = ({
  clickChat,
  clickCameraDevice,
  goToBack,
  toggleCameraAudio,
  userVideoAudio,
  clickScreenSharing,
  screenShare,
  videoDevices,
  showVideoDevices,
  setShowVideoDevices
}) => {
  const handleToggle = useCallback(
    (e) => {
      setShowVideoDevices((state) => !state);
    },
    [setShowVideoDevices]
  );

  const [isActive, setIsActive] = useState(false);
  const [isActiveVid, setIsActiveVid] = useState(false);
  const [isActiveAud, setIsActiveAud] = useState(false);

  const handleBtnClick = () => {
    setIsActive(current => !current);
  };

  return (


    <Row className='bottomRow'>
      <Col span={12}>Metronome</Col>
      <Col span={12}>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className='gutter-box' justify='end'>
        {/* <Col className="gutter-row rightPart" span={6}>
          <div className='col-style'>col-6</div>
        </Col>
        <Col className="gutter-row" span={6}>
          <div className='col-style'>col-6</div>
        </Col>
        <Col className="gutter-row" span={6}>
          <div className='col-style'>col-6</div>
        </Col>
        <Col className="gutter-row" span={6}>
          <div className='col-style'>col-6</div>
        </Col> */}

        <Col span={4}>
          <Button type="primary" danger onClick={goToBack} >End Jam</Button>
        </Col>
        <Col span={6} >
          <Space>
          <Button ghost onClick={()=>toggleCameraAudio('audio')} className='btn active' >
            <AudioOutlined />
          </Button>
          <Badge size="small" count={<VideoCameraOutlined />}> 
          
          <Button ghost icon={<VideoCameraOutlined />} onClick={()=>{toggleCameraAudio('video');}} size="middle"  />
            {/* <VideoCameraOutlined /> */}
          {/* </Button> */}
          </Badge>
          {/* <Button type='primary' ml-4>chat</Button> */}
          </Space>
        </Col>
        
        <Col span={9}><Button type='primary'>chat</Button></Col>
        </Row>



      </Col>
    </Row>
    
  );
};



const Bar = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 8%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  background-color: #f7ca18;
`;
const Left = styled.div`
  display: flex;
  align-items: center;

  margin-left: 15px;
`;

const Center = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const Right = styled.div``;

const ChatButton = styled.div`
  width: 75px;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;

  :hover {
    background-color: #77b7dd;
    cursor: pointer;
    border-radius: 15px;
  }

  * {
    pointer-events: none;
  }
`;

const ScreenButton = styled.div`
  width: auto;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;
  text-align:center;
  :hover {
    background-color: #77b7dd;
    cursor: pointer;
    border-radius: 15px;
  }

  .sharing {
    color: #ee2560;
  }
`;

const FaIcon = styled.i`
  width: 30px;
  font-size: calc(16px + 1vmin);
`;

const StopButton = styled.div`
  width: 75px;
  height: 30px;
  border: none;
  font-size: 0.9375rem;
  line-height: 30px;
  margin-right: 15px;
  background-color: #ee2560;
  border-radius: 15px;
  align-content:center;
  text-align:center;

  :hover {
    background-color: #f25483;
    cursor: pointer;
  }
`;

const CameraButton = styled.div`
  position: relative;
  width: 75px;
  border: none;
  font-size: 0.9375rem;
  text-align:center;
  padding: 5px;
  
  :hover {
    background-color: #77b7dd;
    cursor: pointer;
    border-radius: 15px;
  }

  * {
    pointer-events: none;
  }

  .fa-microphone-slash {
    color: #ee2560;
  }

  .fa-video-slash {
    color: #ee2560;
  }
`;

const SwitchMenu = styled.div`
  display: flex;
  position: absolute;
  width: 20px;
  top: 7px;
  left: 80px;
  z-index: 1;

  :hover {
    background-color: #476d84;
    cursor: pointer;
    border-radius: 15px;
  }

  * {
    pointer-events: none;
  }

  > i {
    width: 90%;
    font-size: calc(10px + 1vmin);
  }
`;

const SwitchList = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: -65.95px;
  left: 80px;
  background-color: #4ea1d3;
  color: white;
  padding-top: 5px;
  padding-right: 10px;
  padding-bottom: 5px;
  padding-left: 10px;
  text-align: left;

  > div {
    font-size: 0.85rem;
    padding: 1px;
    margin-bottom: 5px;

    :not(:last-child):hover {
      background-color: #77b7dd;
      cursor: pointer;
    }
  }

  > div:last-child {
    border-top: 1px solid white;
    cursor: context-menu !important;
  }
`;

export default BottomBar;