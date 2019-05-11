import React, { Component } from 'react'
import mapboxgl from 'mapbox-gl'
import { Drawer, Collapse } from 'antd'
import { Radar, Pie } from 'react-chartjs-2'
import Axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css'

import AppLayout from './layouts/AppLayout'

import TOKEN from './config.js'
import * as mel_geo_basic_url from './melbourne_avgpoints.geojson'
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

var pieData = null

const Panel = Collapse.Panel;

mapboxgl.accessToken = TOKEN;


class Map extends Component {

  constructor(props) {
    super(props);
    this.state = {
      lng: 145.1060,
      lat: -37.83905,
      zoom: 7.9,
      advisible: false,
      pdvisible: false,
      map: null,
      is_loading: true
    };
  }


  loadData = async (map) => {

    const reqs = [];
    reqs.push(Axios.get("http://www.ccc.8bits.io:8080/tweet_data/_design/designDoc/_view/get_surburb_summary?group=true"));
    reqs.push(Axios.get(mel_geo_basic_url));

    const res = await Axios.all(reqs);
    let adder = res[0].data
    let mel_geo_basic = res[1].data

    console.log(res);


    let newData = this.appendProperties(mel_geo_basic, adder)
    this.setState({
      is_loading: false,
    });

    map.getSource('suburbs').setData(newData);
  }

  appendProperties = (basic, adder) => {
    let minv = null, maxv = null;

    for (let i = 0; i < adder.rows.length; i++){
      let key = adder.rows[i].key
      if(key > 0 && key < 310) {
        basic.features[key-1].properties['TOTAL_TWEET'] = adder.rows[i].value[1]
        basic.features[key-1].properties['RELATED_TWEET'] = adder.rows[i].value[0]
        basic.features[key-1].properties['RELATED_TWEET_RATIO'] = adder.rows[i].value[0] / adder.rows[i].value[1] * 1.8;
        
        if (minv == null || minv > basic.features[key-1].properties['RELATED_TWEET_RATIO'])
          minv = basic.features[key-1].properties['RELATED_TWEET_RATIO']

        if (maxv == null || maxv < basic.features[key-1].properties['RELATED_TWEET_RATIO'])
          maxv = basic.features[key-1].properties['RELATED_TWEET_RATIO']

      }
    }

    return basic
  }

  onAreaClick = (e) => {
    this.showDrawer(e)
    this.state.map.flyTo({
      center: [e.properties.AVG_LNG, e.properties.AVG_LAT],
      zoom: 12.5,
      bearing: 0,
      speed: 0.4, // make the flying slow
      curve: 2.2, // change the speed at which it zooms out
    });
  }

  onPointClick = (e) => {
    this.showPdDrawer(e)
    this.state.map.flyTo({
      center: [e.geometry.coordinates[0], e.geometry.coordinates[1]],
      zoom: 15,
      bearing: 0,
      speed: 0.4, // make the flying slow
      curve: 2.2, // change the speed at which it zooms out
    });
  }

  showDrawer = (e) => {
    sa2name = e.properties.SA2_NAME16

    pieData = {
      labels: [
        'Related Tweet',
        'Unrelated Tweet'
      ],
      datasets: [{
        data: [e.properties.RELATED_TWEET, e.properties.TOTAL_TWEET-e.properties.RELATED_TWEET],
        backgroundColor: [
          '#36A2EB',
          '#FF6384',
        ],
        hoverBackgroundColor: [
          '#36A2EB',
          '#FF6384',
        ]
      }]
    };

    this.setState({
      advisible: true,
    });
  };

  onClose = () => {
    this.setState({
      advisible: false,
    });
  };

  showPdDrawer = (e) => {
    this.setState({
      pdvisible: true,
    });
  };

  onPdClose = () => {
    this.setState({
      pdvisible: false,
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
    

    map.on('load', (function () {

      map.addSource('suburbs', {
        'type': 'geojson',
        'data': null,
      })

      this.loadData(map);

      map.addSource('testPoints', {
        'type': 'geojson',
        'data': geoPoint
      })

      map.addLayer({
        'id': 'suburb-fills',
        'type': 'fill',
        'source': 'suburbs',
        "paint": {
          'fill-color':[
            'interpolate',
            ['linear'],
            ['get', 'RELATED_TWEET_RATIO'],
            0, '#F2F12D',
            0.1, '#EED322',
            0.2, '#E6B71E',
            0.3, '#DA9C20',
            0.4, '#CA8323',
            0.5, '#B86B25',
            0.6, '#A25626',
            0.7, '#8B4225',
            0.8, '#723122',
            0.9, '#512015',
            1,   '#000000'
            ],
          // 'fill-color': [
          //   "rgb",
          //   // red is higher when feature.properties.temperature is higher
          //   ["get", "COLOR_RATIO"],
          //   // green is always zero
          //   200,
          //   // blue is higher when feature.properties.temperature is lower
          //   ["-", 255, ["get", "COLOR_RATIO"]]
        // ],
          "fill-opacity": ["case",
            ["boolean", ["feature-state", "hover"], false],
            0.8,
            0.5
          ]
        }
      });

      map.addLayer({
        'id': 'suburb-borders',
        'type': 'line',
        'source': 'suburbs',
        "paint": {
          "line-color": "#8B4225",
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
              [5, 0.5],
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
          'circle-radius': 7,
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
    

    }).bind(this))


    // map.on('click', 'suburb-fills', this.onAreaClick.bind(this));

    // map.on('click', 'test-point', this.onPointClick.bind(this));

    map.on('click', function(e) {
      let f = map.queryRenderedFeatures(e.point, { layers: ['test-point'] })
      if (f.length) {
        this.onPointClick(f[0])
      } 
      else {
        f = map.queryRenderedFeatures(e.point, { layers: ['suburb-fills'] })
        if (f.length) {
          this.onAreaClick(f[0])
        }
      }
      
    }.bind(this));

    map.on('mouseenter', 'test-point', function(e) {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'test-point', function() {
      map.getCanvas().style.cursor = '';
    });

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
          visible={this.state.advisible}
        >
          <Collapse defaultActiveKey={['1', '2']}>
            <Panel header="This is panel header 1" key="1">
              <Radar data={radarData} width={100} />
            </Panel>
            <Panel header="This is panel header 2" key="2">
              <Pie data={pieData} width={100} />
            </Panel>
            <Panel header="This is panel header 3" key="3">
            </Panel>
          </Collapse>
        </Drawer>

        <Drawer
          title='balabalabala'
          width="30%"
          placement="right"
          closable={false}
          onClose={this.onPdClose}
          visible={this.state.pdvisible}
        >
        </Drawer>


      </AppLayout>
    );
  }
}

export default Map;
