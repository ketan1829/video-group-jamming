// import { readFileSync } from "fs";
import io from 'socket.io-client';
// const sockets = io('http://localhost:3001', { autoConnect: true, forceNew: true });

const sockets = io('https://jam.choira.io');

// const sockets = io('/');
export default sockets;
