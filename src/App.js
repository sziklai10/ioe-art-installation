import React, { Component } from "react";
import ReactDOM from 'react-dom';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import './App.css';
import socketIOClient from "socket.io-client";
import ReactPlayer from 'react-player'
import Europe from './videos/europe.mp4'
import Looping from './videos/loop.mp4'
import Australia from './videos/australia.mp4'
import Antarctica from './videos/antarctica.mp4'
import EuropeButton from './images/europe-map.png'
import AustraliaButton from './images/australia-map.png'
import AntarcticaButton from './images/antarctica-map.png'

export default class App extends Component {
 


  constructor() {
    super();
    this.state = {
      endpoint: "http://192.168.0.12:8081", // this is telling our socket.io client to connect to our bridge.js node local server on port 8081
      oscPortIn: 7500, // this will configure our bridge.js node local server to receive OSC messages on port 7400
      oscPortOut: 3331, // this will configure our bridge.js node local server to send OSC messages on port 3331 (we're not actually sending anything in this sketch but it is required)
      source: Looping,
      playing: true,
      loop: false,
      open: true,
    };

    this.x = 0;         
    this.y = 0;
    this.z = 0;
    this.received = false;

  }

  // 'https://www.youtube.com/watch?v=jskGbAwcBuI'
  showEurope = () => { //function triggered by button (below) which set a source state (by using setState) to Europe (Europe has assigned video at the top)
    this.setState({ source: Europe });
  }

  showAntarctica = () => {
    this.setState({ source: Antarctica });
  }

  showAustralia = () => {
    this.setState({ source: Australia });
  }

  back = () => {
    this.setState({ source: Looping });
    this.setState({ loop: true });
  }


  onOpenModal = () => { //pop-up message open
    this.setState({ open: true });
  };

  onCloseModal = () => { //pop-up message close
    this.setState({ open: false });
};


  componentDidMount() {
    const { endpoint } = this.state; // using our endpoint from state object - this is a modern ES6 way of accessing elements from an object called destructuring assignment
    const { oscPortIn } = this.state; // using our in port for OSC from state object
    const { oscPortOut } = this.state; // using our our port for OSC from state object
    const socket = socketIOClient(endpoint); // create an instance of our socket.io client
    socket.on('connect', function () { // connect and configure local server with settings from the state object
      socket.emit('config', {
        server: { port: oscPortIn, host: '192.168.0.12' },
        client: { port: oscPortOut, host: '192.168.0.12' }
      });
    });
    socket.on('message', (function (msg) { // once we receive a message, process it a bit then call this.receiveOSC()
      if (msg[0] === '#bundle') { // treat it slightly differently if it's a bundle or not
        for (var i = 2; i < msg.length; i++) {
          this.receiveOsc(msg[i][0], msg[i].splice(1));
        }
      } else {
        this.receiveOsc(msg[0], msg.splice(1));
      }
    }).bind(this)); // we have to explicitly bind this to the upper execution context so that we can call this.receiveOSC()
  }

  receiveOsc(address, value) { //receiving the data from osc
    this.received = true;

    if (this.received) {
      console.log("received OSC: " + address + ", " + value);

      if (address === '/analogue') { //getting the data from the arduino 
        // this.setState({ con: "connected" });
        this.x = value[0]; //variable for the data coming from the arduino
        this.y = value[1];
        this.z = value[2];
        if (this.x === 0 && this.y === 1 && this.z === 1) { //if the first button pressed plays Europe video
          this.setState({ source: Europe });
        } else if (this.x === 1 && this.y === 0 && this.z === 1) { //if the second button pressed plays Australia video
          this.setState({ source: Australia });
        } else if (this.x === 1 && this.y === 1 && this.z === 0) { //if the third button pressed plays Antarctica video
          this.setState({ source: Antarctica });
        } else {
          this.setState({ source: Looping }); //if no buttons are pressed play the loop video
        }

      }
    }
  }

  render() {
    const { open } = this.state;
    return (
      <div>        
        <div>
          <Modal open={open} onClose={this.onCloseModal} center> //pop up message
            <p>Welcome to our project about Climate Change <br></br>  
              Use buttons on the map to navigate or the web interface buttons if no connection to the server <br></br>
              To enable to first video to play please use controls
            </p>
          </Modal>
        </div>
        {/* <p>{this.state.con}</p> */}
        <div className="continents">
          <button className="button" type="button" onClick={this.showAntarctica.bind(this)} ><img src={AntarcticaButton} /></button>
          <button className="button" type="button" onClick={this.showEurope.bind(this)}><img src={EuropeButton} /></button>
          <button className="button" type="button" onClick={this.showAustralia.bind(this)}><img src={AustraliaButton} /></button>
        </div>

        <div className="videoPlayer">
          <ReactPlayer controls width="100%" height="100%" playing url={this.state.source} onEnded={this.back.bind(this)} />
        </div>
      </div>
    );
  }
}
