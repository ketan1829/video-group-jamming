import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Layout, Col, Row, Form, Input, Button, Select, Space } from 'antd';
import BannerAnim, { Element } from 'rc-banner-anim';
import TweenOne from 'rc-tween-one'

import './Main.css'
import 'antd/dist/antd.css';
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

    socket.on('FE-error-user-exist', ({ error }) => {
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
  }, [props.history]);

  function clickJoin(values ) {
    // const roomName = roomRef.current.value;
    // const userName = userRef.current.value;
    const { roomName, userName } = values
    console.log(roomName, userName);
    if (!roomName || !userName) {
      setErr(true);
      setErrMsg('Enter Room Name or User Name');
    } else {
      socket.emit('BE-check-user', { roomId: roomName, userName });
    }
  }

  const onFinish = values => {
    roomRef.current = values.roomName
    userRef.current = values.userName
    clickJoin(values)
  };

  const onReset = () => {
    form.resetFields();
  };

  const onFill = () => {
    form.setFieldsValue({
      roomName: 'Mark',
      userName: 'KET',
    });
  };

  return (
    <Layout>
      <Header className='ant-layout-header' style={{background: 'rgba(31,37, 58, 1)'}}>
        <div className="logo">
          <img src={"https://choira.io/static/media/choria.02aeae5c.svg"} alt="Choira logo" style={{paddingBottom:"50px"}} />
        </div>
      </Header>
      <Layout style={{background: 'rgba(31,37, 58, 1)', minHeight:'670px'}}>
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
            <Form.Item name="userName" label={<label style={{ color: "white" }}>Username</label>} rules={[{ required: true }]}>
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
              <Button className="mr-2" style={{backgroundColor:'#ffc701', color:'#333'}} type="primary" htmlType="submit" onClick={clickJoin}>
                Create Room
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
        textAlign: 'center',
        position: 'sticky',
      }}>
        Created with 🖤  by Choira ©2022</Footer>
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

export default Main;
