import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Main from './components/Main/Main';
import Room from './components/Room/Room'
import Meet from './components/Meet/Meet'
import styled from 'styled-components';

// import './App.css';


function App() {
  return (
    <BrowserRouter>
      <AppContainer>
        <Switch>
          <Route exact path="/" component={Main} />
          {/* <Route exact path="/room/:roomId" component={Room} /> */}
          <Route exact path="/jam/:roomId" component={Meet} />
        </Switch>
      </AppContainer>
    </BrowserRouter>
  );
}

const AppContainer = styled.div`
  font-size: calc(8px + 2vmin);
  color: white;
  background-color: #454552;
`;

const OldAppContainer = styled.div`
  display: flex;
  flex-direction: column;
  // min-height: 100vh;
  align-items: center;
  justify-content: center;
  font-size: calc(8px + 2vmin);
  color: white;
  background-color: #454552;
  text-align: center;
`;


export default App;
