import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Layout, Col, Row, Form, Input, Button, Select, Space } from 'antd';
import BannerAnim, { Element } from 'rc-banner-anim';
import TweenOne from 'rc-tween-one'
import { withRouter } from "react-router";

import './Main.css'
import 'antd/dist/antd.min.css';
import '../../index.css'

import socket from '../../socket';

const Main = (props) => {
  const roomRef = useRef();
  const userRef = useRef();
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const { Header, Footer, Sider, Content } = Layout;
  const BgElement = Element.BgElement;
  const [form] = Form.useForm();

  const { Option } = Select;

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const tailLayout = {
    wrapperCol: {
      offset: 8,
      span: 16,
    },
  };


  useEffect(() => {
    const stateData = props.location.state
    const _ = stateData?form.setFieldsValue({
      roomName: stateData.roomId,
      userName : ''
    }):null;

    socket.on('FE-error-user-exist', ({ error }) => {
      console.log("FE-error-user-exist Evenet fired")
      if (!error) {
        const roomName = roomRef.current;
        const userName = userRef.current;

        sessionStorage.setItem('user', userName);
        props.history.push(`/jam/${roomName}`);
      } else {
        setErr(error);
        setErrMsg('User name already exist');
      }
    });
    socket.on("connect", () => {
      // const transport = socket.io.engine.transport.name; // in most cases, "polling"
      // console.log("########### : transport ",transport)
    
      // socket.io.engine.on("upgrade", () => {
      //   const upgradedTransport = socket.io.engine.transport.name; // in most cases, "websocket"
      //   console.log("########### upgradedTransport : ",upgradedTransport)
      // });
  });
  }, [props.history]);

  function clickJoin(values) {
    // const roomName = roomRef.current.value;
    // const userName = userRef.current.value;
    const { roomName, userName } = values
    if (!roomName || !userName) {
      setErr(true);
      setErrMsg('Enter Room Name or User Name');
    } else {
      socket.emit('BE-check-user', { roomId: roomName, userName })
    }
  }
  const onFinish = values => {
    roomRef.current = values.roomName;
    userRef.current = values.userName;
    clickJoin(values);
  };

  const onReset = () => {
    form.resetFields();
  };

  const onFill = () => {
    let r = (Math.random()).toString(36).toUpperCase().substring(2,5);
    form.setFieldsValue({
      roomName: 'Mark',
      userName: r,
    });
  };

  return (
    <Layout style={{height:'100vh'}}>
      
      <video autoPlay muted loop id="bgvideo"style={{opacity:0.25, backgroundBlendMode:'darken'}}>
        <source src='https://static.videezy.com/system/resources/previews/000/019/515/original/Mikro2.mp4' type='video/mp4'/>
      </video>
      <Header className='ant-layout-header' style={{background: 'rgba(31,37, 58, .97)'}}>
        <div className="logo">
          <img src={"https://i.ibb.co/pRNQHmZ/choria-96439620.png"} alt="Choira logo" style={{paddingBottom:"50px"}} />
        </div>
      </Header>
      <Layout style={{background: 'rgba(31,37, 58, .97)'}}>
        {/* <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}> */}
          {/* <video id="background-video" autoPlay={true} loop muted width="100%" height="50%" style={{position: 'fixed', height: '80vh', width: '100vw',left: 0, right: 0, objectFit:'cover', objectPosition:'100% 0', opacity:0.25, backgroundBlendMode:'darken'}}>
            
            <source src='https://static.videezy.com/system/resources/previews/000/019/515/original/Mikro2.mp4' type='video/mp4'/>
          </video> */}
        {/* </div> */}
        <Content className='content'>
        
        <Row justify="space-around"  > 
          <Col flex={3}>
          <div className='banner'>
            <BannerAnim prefixCls="banner-user">
              <Element key="aaa"
                prefixCls="banner-user-elem"
                followParallax={{
                  delay: 1000,
                  data: [
                    { id: 'bg', value: 20, bgPosition: '50%', type: ['backgroundPositionX'] },
                    { id: 'title', value: 50, type: 'x' },
                    { id: 'content', value: -30, type: 'x' },
                  ],
                }}
              >
              <BgElement
                  key="bg"
                  className="bg"
                  style={{
                    background: '#364D79',
                  }}
                  id="bg"
                />
                <TweenOne className="banner-user-title" 
                  animation={{ y: 30, opacity: 0, type: 'from' }}
                  id="title"
                >
                  Fast, reliable and <span style={{color:'#ffc701'}}>secure</span>
                </TweenOne>
                <TweenOne className="banner-user-text" 
                  animation={{ y: 30, opacity: 0, type: 'from', delay: 100 }}
                  id="content"
                >
                  <span style={{color:'#ffc701'}}>Jamming</span> with Choira Jam
                </TweenOne>
              </Element>
              {/* <Element key="bbb"
                prefixCls="banner-user-elem"
              >
                <BgElement
                  key="bg"
                  className="bg"
                  style={{
                    background: '#64CBCC',
                    padding: '16px',
                  }}
                />
                <TweenOne className="banner-user-title" animation={{ y: 30, opacity: 0, type: 'from' }}>
                  Ant Motion Banner
                </TweenOne>
                <TweenOne className="banner-user-text" 
                  animation={{ y: 30, opacity: 0, type: 'from', delay: 100 }}
                >
                  The Fast Way Use Animation In React
                </TweenOne>
              </Element> */}
            </BannerAnim>
          </div>
          </Col>
          <Col flex={2}>
          <div className='banner'>
          <Form {...layout} form={form} name="control-hooks" onFinish={onFinish} >
            <Form.Item name="roomName" label={<label style={{ color: "white" }}>Room Name</label>} rules={[{ required: true }]} style={{color:'red'}}>
              <Input id="roomName"/>
            </Form.Item>
            {/* here user name checking added */}
            <Form.Item {...err && {help: errMsg,validateStatus: 'error'}} name="userName" label={<label style={{ color: "white" }}>Username</label>} rules={[{ required: true,message:'Please enter your username ;)' }]}>
              <Input id="userName"/>
            </Form.Item>
            {/* <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
              <Select
                placeholder="Select a option and change input text above"
                // onChange={onGenderChange}
                allowClear
              >
                <Option value="male">male</Option>
                <Option value="female">female</Option>
                <Option value="other">other</Option>
              </Select>
            </Form.Item> */}
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.gender !== currentValues.gender}
            >
              {({ getFieldValue }) => {
                return getFieldValue('gender') === 'other' ? (
                  <Form.Item name="customizeGender" label="Customize Gender" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                ) : null;
              }}
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Space direction='horizontal'>
              <Button className="mr-2" style={{backgroundColor:'#ffc701', color:'#333'}} type="primary" htmlType="submit">
                Create/Join Room
              </Button>
              <Button className="mr-2" htmlType="button" onClick={onReset}>
                Reset
              </Button>
              <Button className="bg-primary border-primary" type="link" htmlType="button" style={{color:'#ffc701'}} onClick={onFill}>
                Fill form
              </Button>
              </Space>
            </Form.Item>
          </Form>
          </div>
          </Col>
        </Row>
        </Content>
      </Layout>
      <Footer style={{
        backgroundColor:'rgba(31,37, 58, .97)',
        textAlign: 'center',
      }}>
        <Content style={{color:'white',fontSize:'12px'}} >Created with 💛  by Choira ©2022</Content>
        </Footer>
    </Layout>
  );
};

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

// const Row = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: flex-end;
//   margin-top: 15px;
//   line-height: 35px;
// `;

// const Label = styled.label``;

// const Input = styled.input`
//   width: 150px;
//   height: 35px;
//   margin-left: 15px;
//   padding-left: 10px;
//   outline: none;
//   border: none;
//   border-radius: 5px;
// `;

const Error = styled.div`
  margin-top: 10px;
  font-size: 20px;
  color: #e85a71;
`;

const JoinButton = styled.button`
  height: 40px;
  margin-top: 35px;
  outline: none;
  border: none;
  border-radius: 15px;
  color: #d8e9ef;
  background-color: #4ea1d3;
  font-size: 25px;
  font-weight: 500;

  :hover {
    background-color: #7bb1d1;
    cursor: pointer;
  }
`;

export default withRouter(Main);
