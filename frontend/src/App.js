import React, { Component } from 'react';
import ReactMapGL, {NavigationControl} from 'react-map-gl';
import './App.css';


const TOKEN = 'pk.eyJ1IjoibWFyc3h1ZSIsImEiOiJjanZha3IweDIxZGt5NDRzMXlobmhjbGRyIn0.F3PshM4rzEMkJHMh6QqPkw';

const navStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  padding: '10px'
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: -37.8136,
        longitude: 144.9631,
        zoom: 11,
        bearing: 0,
        pitch: 0,
        width: 1440,
        height: 700,
      }
    };
  }
  render() {
    const {viewport} = this.state;
    return (
      <div className="App">
        <center>
          <h2>COMP90024 Cluster and Cloud Computing Project 2</h2>
        </center>
        
        <ReactMapGL
          {...viewport}
          mapStyle="mapbox://styles/mapbox/dark-v9"
          mapboxApiAccessToken={TOKEN}>
          <div className="nav" style={navStyle}>
            <NavigationControl/>
          </div>
        </ReactMapGL>
      </div>
    );
  }
}

export default App;
