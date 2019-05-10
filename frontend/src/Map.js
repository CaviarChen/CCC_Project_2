import React, { Component } from 'react'
import mapboxgl from 'mapbox-gl'
import { Drawer, Collapse } from 'antd'
import { Radar, Pie } from 'react-chartjs-2'
import 'mapbox-gl/dist/mapbox-gl.css'

import AppLayout from './layouts/AppLayout'

import TOKEN from './config.js'
import * as geoData from './melbourne_avgpoints.geojson'
import * as geoPoint from './testPoints.geojson'

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

const Panel = Collapse.Panel;

mapboxgl.accessToken = TOKEN;


class Map extends Component {

  constructor(props) {
    super(props);
    this.state = {
      lng: 145.1060,
      lat: -37.83905,
      zoom: 7.9,
      visible: false,
      map: null
    };
  }

  onAreaClick = (e) => {
    this.showDrawer(e)
    this.state.map.flyTo({
      center: [e.features[0].properties.AVG_LNG, e.features[0].properties.AVG_LAT],
      zoom: 12.5,
      bearing: 0,
      speed: 0.4, // make the flying slow
      curve: 2.2, // change the speed at which it zooms out
    });
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

    this.setState({
      map: map
    })

    var hoveredStateId = null;

    map.on('load', function () {

      map.addSource('suburbs', {
        'type': 'geojson',
        'data': geoData
      })

      map.addSource('testPoints', {
        'type': 'geojson',
        'data': geoPoint
      })

      map.addLayer({
        'id': 'suburb-fills',
        'type': 'fill',
        'source': 'suburbs',
        "paint": {
          'fill-color': '#094183',
          "fill-opacity": ["case",
            ["boolean", ["feature-state", "hover"], false],
            0.5,
            0
          ]
        }
      });

      map.addLayer({
        'id': 'suburb-borders',
        'type': 'line',
        'source': 'suburbs',
        "paint": {
          "line-color": "#094183",
          "line-width": 0.5,
          "line-opacity": 1
        }
      });

      // map.addLayer({
      //   'id': 'suburb-symbol',
      //   'type': 'symbol',
      //   'source': 'suburbs',
      //   'layout': {
      //     "text-field": "{SA2_NAME16}",
      //     "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      //     "text-size": 10

      //   }
      // })


      map.addLayer({
        id: 'test-heat',
        type: 'heatmap',
        source: 'testPoints',
        maxzoom: 15,
        paint: {
          // increase weight as diameter breast height increases
          'heatmap-weight': 1,
          // increase intensity as zoom level increases
          'heatmap-intensity': {
            stops: [
              [11, 1],
              [15, 3]
            ]
          },
          // assign color values be applied to points depending on their density
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, "rgba(33,102,172,0)",
            0.2, "rgb(103,169,207)",
            0.4, "rgb(209,229,240)",
            0.6, "rgb(253,219,199)",
            0.8, "rgb(239,138,98)",
            1, "rgb(178,24,43)"
          ],
          // increase radius as zoom increases
          'heatmap-radius': {
            stops: [
              [11, 15],
              [15, 20]
            ]
          },
          // decrease opacity to transition into the circle layer
          'heatmap-opacity': {
            default: 1,
            stops: [
              [14, 1],
              [15, 0]
            ]
          },
        }
      });

      map.addLayer({
        id: 'test-point',
        type: 'circle',
        source: 'testPoints',
        minzoom: 14,
        paint: {
          // increase the radius of the circle as the zoom level and dbh value increases
          'circle-radius': 5,
          'circle-color': 'rgb(178,24,43)',
          'circle-stroke-color': 'white',
          'circle-stroke-width': 1,
          'circle-opacity': {
            stops: [
              [14, 0],
              [15, 1]
            ]
          }
        }
      });
    })


    map.on('click', 'suburb-fills', this.onAreaClick.bind(this));

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

    const style = {
      width: '100%',
      height: '100%'
    };

    return (
      <AppLayout>
        <div
          style={style}
          ref={el => this.mapContainer = el}
          className="mapbox map" />

        <Drawer
          title={sa2name}
          width="30%"
          placement="right"
          closable={false}
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <Collapse defaultActiveKey={['1', '2']}>
            <Panel header="This is panel header 1" key="1">
              <Radar data={radarData} width={150} />
            </Panel>
            <Panel header="This is panel header 2" key="2">
              <Pie data={pieData} width={180} />
            </Panel>
            <Panel header="This is panel header 3" key="3">
            </Panel>
          </Collapse>
          
          
        </Drawer>
      </AppLayout>
    );
  }
}

export default Map;
