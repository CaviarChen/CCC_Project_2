import React, { Component } from 'react'
import mapboxgl from 'mapbox-gl'
import { Drawer } from 'antd'
import { Radar, Pie } from 'react-chartjs-2'
import 'mapbox-gl/dist/mapbox-gl.css'

import AppLayout from './layouts/AppLayout'

import TOKEN from './config.js'
import * as geoData from './melbourne.geojson'

var sa2name = null;

const radarData = {
  labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: 'rgba(179,181,198,0.2)',
      borderColor: 'rgba(179,181,198,1)',
      pointBackgroundColor: 'rgba(179,181,198,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(179,181,198,1)',
      data: [65, 59, 90, 81, 56, 55, 40]
    },
    {
      label: 'My Second dataset',
      backgroundColor: 'rgba(255,99,132,0.2)',
      borderColor: 'rgba(255,99,132,1)',
      pointBackgroundColor: 'rgba(255,99,132,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(255,99,132,1)',
      data: [28, 48, 40, 19, 96, 27, 100]
    }
  ]
};

const pieData = {
  labels: [
    'Red',
    'Green',
    'Yellow'
  ],
  datasets: [{
    data: [300, 50, 100],
    backgroundColor: [
      '#FF6384',
      '#36A2EB',
      '#FFCE56'
    ],
    hoverBackgroundColor: [
      '#FF6384',
      '#36A2EB',
      '#FFCE56'
    ]
  }]
};

mapboxgl.accessToken = TOKEN;


class Map extends Component {

  constructor(props) {
    super(props);
    this.state = {
      lng: 144.9631,
      lat: -37.8136,
      zoom: 12,
      visible: false
    };
  }

  showDrawer = (e) => {
    sa2name = e.features[0].properties.SA2_NAME16
    this.setState({
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  componentDidMount() {
    const { lng, lat, zoom } = this.state;

    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/shijiel2/cjvcb640p3oag1gjufck6jcio',
      center: [lng, lat],
      zoom
    });

    var hoveredStateId = null;

    map.on('load', function () {

      map.addSource('suburbs', {
        'type': 'geojson',
        'data': geoData
      })


      map.addLayer({
        'id': 'suburb-fills',
        'type': 'fill',
        'source': 'suburbs',
        "paint": {
          'fill-color': '#627BC1',
          "fill-opacity": ["case",
            ["boolean", ["feature-state", "hover"], false],
            0.7,
            0.3
          ]
        }
      });

      map.addLayer({
        'id': 'suburb-borders',
        'type': 'line',
        'source': 'suburbs',
        "paint": {
          "line-color": "#627BC1",
          "line-width": 2
        }
      });

      map.addLayer({
        'id': 'suburb-symbol',
        'type': 'symbol',
        'source': 'suburbs',
        'layout': {
          "text-field": "{SA2_NAME16}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12

        }
      })
    })


    map.on('click', 'suburb-fills', this.showDrawer.bind(this));

    map.on('mousemove', 'suburb-fills', function (e) {
      if (e.features.length > 0) {
        if (hoveredStateId) {
          map.setFeatureState({
            source: 'suburbs',
            id: hoveredStateId
          }, {
              hover: false
            });
        }
        hoveredStateId = e.features[0].id;
        map.setFeatureState({
          source: 'suburbs',
          id: hoveredStateId
        }, {
            hover: true
          });
      }
    });

    map.on('mouseleave', 'suburb-fills', function () {
      if (hoveredStateId) {
        map.setFeatureState({
          source: 'suburbs',
          id: hoveredStateId
        }, {
            hover: false
          });
      }
    });

  }

  render() {
    return (
      <AppLayout>
        <div>
          <center>
            <h2>COMP90024 Cluster and Cloud Computing Project 2</h2>
          </center>
          <div
            style={{ height: "78vh" }}
            ref={el => this.mapContainer = el}
            className="absolute top right left bottom" />
        </div>
        <Drawer
          title={sa2name}
          width="500"
          placement="right"
          closable={false}
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <p>Some contents...</p>
          <Radar data={radarData} width={150} />
          <p>Some contents...</p>
          <Pie data={pieData} width={180} />
        </Drawer>
      </AppLayout>
    );
  }
}

export default Map;
