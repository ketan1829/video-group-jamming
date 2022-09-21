import React, { useCallback, useRef, useState } from 'react';
import { Button, Col, Divider, Row, Space, Badge, Card, InputNumber, Dropdown, Menu, message, Modal } from 'antd';
import Icon, {
  AudioOutlined,
  VideoCameraOutlined,
  RightCircleOutlined,
  AudioMutedOutlined,
  VideoCameraFilled,
  GoldOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  UpOutlined,
  CaretRightOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';

// import { useMetronome } from "react-metronome-hook";
import { useMetronome } from "./Metronome";

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
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);


  

  let click1 = "//daveceddia.com/freebies/react-metronome/click1.wav";
  let click2 = "//daveceddia.com/freebies/react-metronome/click2.wav";
  // click1 = new Audio(click1);
  // click2 = new Audio(click2);
  let timmer = useRef(null)

  const [metronomeState, setMetronomeState] = useState({
      isPlaying: false,
      count: 0,
      bpm: 100,
      beatsPerMeasure: 4
    });

    const {
      startMetronome,
      stopMetronome,
      isTicking,
      setBpm,
      setBeatsPerMeasure,
      bpm,
      beatsPerMeasure
    } = useMetronome(metronomeState.bpm, metronomeState.beatsPerMeasure, [click1, click2]);

  const handleBtnClick = () => {
    setIsActive(current => !current);
  };

  const handleMenuClick = (e) => {
    message.info('Click on menu item.');
    console.log('click', e);
  };

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 3000);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const MetroSvg = () => (
    <svg margin='0' padding='0' width="100px" height="100px" fill="currentColor" viewBox="0 0 1024 1024"><path d="M0 0h512v512H0z" fill="rgba(128, 128, 128, 0.08)" fillOpacity="1"></path><g className="" transform="translate(0,0)"><path d="M256 81c-7.7 0-15.5.33-23 .95V119h46V81.95c-7.5-.62-15.3-.95-23-.95zm-41 3.07c-4.8.76-9.5 1.65-13.9 2.69-14.7 3.46-26.3 8.71-32.8 14.04l-22.4 140.3L215 341V137h-23v-18h23V84.07zm82 0V119h23v18h-23v238.4c30.6 2.8 54.5 19.5 73.7 40.5 11 12.2 20.6 25.8 29.6 39.4l-56.6-354.5c-6.5-5.33-18.1-10.58-32.8-14.04-4.4-1.04-9.1-1.93-13.9-2.69zM39.34 90.79L24.66 101.2l20.89 29.6 15.14-9.9-21.35-30.11zm54.81 29.71l-56.04 36.7L82.56 183l17.54-11.5-5.95-51zM233 137v46h46v-46h-46zm-124.8 50.8l-15.3 10 48.9 69.2-30.1 188.3c9-13.6 18.6-27.2 29.6-39.4 19.2-21 43.1-37.7 73.7-40.5v-2.8l-73.2-105.7 4.1-26-37.7-53.1zM233 201v46h46v-46h-46zm0 64v46h46v-46h-46zm0 64v38l5.5 8H279v-46h-46zm206 23v23h-33.2l2.9 18H439v23h18v-64h-18zm-215 41c-29 0-50.3 14.1-69.3 35.1-15.5 17-28.9 38.4-42.1 58.9h286.8c-13.2-20.5-26.6-41.9-42.1-58.9-19-21-40.3-35.1-69.3-35.1h-37l12.4 17.9-14.8 10.2-19.5-28.1H224z" fill="#fff" fillOpacity="1"></path></g></svg>
  );

  const MetroIcon = (props) => <Icon component={MetroSvg} {...props} />;


  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={[
        {
          label: '1st menu item',
          key: '1',
          icon: <UserOutlined />,
        },
        {
          label: '2nd menu item',
          key: '2',
          icon: <UserOutlined />,
        },
        {
          label: '3rd menu item',
          key: '3',
          icon: <UserOutlined />,
        },
      ]}
    />
  );


  // Metronome --------------------------------------------

  const handleMetronomeChange = (value) => {
    const bpm = value;
    if(bpm>=60 || bpm<=260) setBpm(bpm)
    // // console.log("init BPM", bpm)
    // if(metronomeState.isPlaying){
    //   clearInterval(timmer.current)
    //   timmer.current = setInterval(playclick, (60/metronomeState.bpm)*1000)
    //   setMetronomeState((prev)=>(
    //     {
    //       ...prev.count = 0,
    //       ...prev.bpm = bpm,
    //     }
    //   ))
    // }else{
    //   setMetronomeState({...metronomeState.bpm,bpm})
    //   // console.log("BPM", metronomeState.bpm)
    // }
  }


  const playclick = () => {

      // click1.play();

    let {count, beatsPerMeasure} = metronomeState;
    // let nxtCount = (count + 1) % metronomeState.beatsPerMeasure
    // console.log("Metronome Count",nxtCount)

    if(count % beatsPerMeasure ===0) {
      click2.play();

    }else {
      click1.play();
    }

    setMetronomeState(prev=>({
      ...prev.count = (prev.count + 1) % prev.beatsPerMeasure
    }))
    console.log("--- Clk Metronome",metronomeState)

  }


  const startstop = () => {

    if (metronomeState.isPlaying){
      clearInterval(timmer.current)
      setMetronomeState((prev)=>({
        ...prev.isPlaying=false
      }))
      console.log("Timmer Stop", timmer.current)
    }else{
      timmer.current = setInterval(playclick, (60/ metronomeState.bpm) * 1000)
      console.log("current Timmer", timmer.current)
      setMetronomeState((prev)=>({
        ...prev.count = 0,
        ...prev.isPlaying = true
    }
    ,playclick()
      ))
      // playclick()
      console.log("Timmer", timmer.current)
    }
  }


  return (


    <Row className='bottomRow'>
      <Col span={12}>
        <div style={{paddingLeft:'40px'}}>

      
        {/* Metronome */}

        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className='gutter-box' justify='end'>


          {/* <Col span={6}>
            <Button type="primary" danger onClick={goToBack} >End Jam</Button>
          </Col> */}
          <Col span={11} >
            <Space span={2}>
            
          {/* <GoldOutlined  style={{ fontSize: '40px', alignContent:'center'}}  /> */}
            {/* Start MetroNome */}
            <Button ghost icon={<CaretRightOutlined />} size="middle" className='btn active' style={{whiteSpace: "normal",width:'50px', fontSize: '40px'}} onClick={isTicking ? stopMetronome : startMetronome}  />

            {/* BPM input */}
            <InputNumber bordered={false}  status="warning" defaultValue={120} style={{color:'gold', width:65}} min={60} max={160} onChange={handleMetronomeChange} />
            {/* <Button ghost icon={<UsergroupAddOutlined />} size="middle" className='btn active' style={{whiteSpace: "normal",width:'50px'}} onClick={showModal}/> */}

            
            <Modal
              open={open}
              title="Invite Participants"
              onOk={handleOk}
              onCancel={handleCancel}
              footer={[
                <Button key="back" onClick={handleCancel}>
                  Return
                </Button>,
                // <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                //   Submit
                // </Button>
                ,
                <Button
                  // key="link"
                  // href="https://google.com"
                  type="primary"
                  loading={loading}
                  onClick={handleOk}
                >
                  Copy Link
                </Button>,
              ]}
              >
              <p>Some contents...</p>
            </Modal>


            {/* <Badge size="small" placement="start" count={isActiveAud?"x":null}>  */}
            {/* <SwitchMenu onClick={handleToggle}>
              <i className='fas fa-angle-up'></i>
            </SwitchMenu> */}
            <Button ghost onClick={()=>{toggleCameraAudio('audio');setIsActiveAud(!isActiveAud)}} className='btn active' >
              {/* <Button ghost> */}
              <Space span={2}>
              {!isActiveAud ? <AudioOutlined />:<AudioMutedOutlined />}
            <Dropdown overlay={menu} placement="topLeft" arrow trigger={['click']} >
              <EllipsisOutlined rotate='90' />
            </Dropdown>
              </Space>
              {/* </Button> */}
            </Button>
            {/* </Badge> */}

            <Badge size="small" count={isActiveVid?"x":null}> 
            <Button ghost icon={<VideoCameraOutlined />} onClick={()=>{toggleCameraAudio('video');setIsActiveVid(!isActiveVid)}} size="middle"  />
              {/* <VideoCameraOutlined /> */}
            {/* </Button> */}
            </Badge>
            {/* <Button type='primary' ml-4>chat</Button> */}
            </Space>
          </Col>
          <Col span={12}>
            <Button type='primary' style={{backgroundColor:'#ffc701', color:'#333'}}>record</Button>
          </Col>


        </Row>

        

        </div>
      </Col>

      <Col span={12}>

        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className='gutter-box' justify='end'>


          <Col span={6}>
            <Button type="primary" danger onClick={goToBack} >End Jam</Button>
          </Col>
          <Col span={10} >
            <Space span={2}>
            
            <Button ghost icon={<RightCircleOutlined />} size="middle" className='btn active' style={{whiteSpace: "normal",width:'50px'}}/>

            <Button ghost icon={<UsergroupAddOutlined />} size="middle" className='btn active' style={{whiteSpace: "normal",width:'50px'}} onClick={showModal}/>

            
            <Modal
              open={open}
              title="Invite Participants"
              onOk={handleOk}
              onCancel={handleCancel}
              footer={[
                <Button key="back" onClick={handleCancel}>
                  Return
                </Button>,
                // <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                //   Submit
                // </Button>
                ,
                <Button
                  // key="link"
                  // href="https://google.com"
                  type="primary"
                  loading={loading}
                  onClick={handleOk}
                >
                  Copy Link
                </Button>,
              ]}
              >
              <p>Some contents...</p>
            </Modal>


            {/* <Badge size="small" placement="start" count={isActiveAud?"x":null}>  */}
            {/* <SwitchMenu onClick={handleToggle}>
              <i className='fas fa-angle-up'></i>
            </SwitchMenu> */}
            <Button ghost onClick={()=>{toggleCameraAudio('audio');setIsActiveAud(!isActiveAud)}} className='btn active' >
              {/* <Button ghost> */}
              <Space span={2}>
              {!isActiveAud ? <AudioOutlined />:<AudioMutedOutlined />}
            <Dropdown overlay={menu} placement="topLeft" arrow trigger={['click']} >
              <EllipsisOutlined rotate='90' />
            </Dropdown>
              </Space>
              {/* </Button> */}
            </Button>
            {/* </Badge> */}

            <Badge size="small" count={isActiveVid?"x":null}> 
            <Button ghost icon={<VideoCameraOutlined />} onClick={()=>{toggleCameraAudio('video');setIsActiveVid(!isActiveVid)}} size="middle"  />
              {/* <VideoCameraOutlined /> */}
            {/* </Button> */}
            </Badge>
            {/* <Button type='primary' ml-4>chat</Button> */}
            </Space>
          </Col>
          <Col span={6}>
            <Button type='primary' style={{backgroundColor:'#ffc701', color:'#333'}}>chatt</Button>
          </Col>


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
  top: -10px;
  left: -4px;
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
    font-size: calc(15px + 1vmin);
    color: white;
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