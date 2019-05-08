import React, { Component } from 'react'
import mapboxgl from 'mapbox-gl'
import { Button, Drawer, Layout, Menu } from 'antd'

import TOKEN from './config.js'
import * as geoData from './melbourne.geojson'

const { Header, Content, Footer } = Layout;

mapboxgl.accessToken = TOKEN;

class App extends Component {

  constructor(props: Props) {
    super(props);
    this.state = {
      lng: 144.9631,
      lat: -37.8136,
      zoom: 12,
      visible: false
    };
  }

  showDrawer = (e) => {
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

    var hoveredStateId =  null;

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
          "fill-color": "#627BC1",
          "fill-opacity": ["case",
          ["boolean", ["feature-state", "hover"], false],
          1,
          0.5
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
        'layout':{
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
    const { lng, lat, zoom } = this.state;
    return (
      <Layout>
        <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
          <div className="logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['2']}
            style={{ lineHeight: '64px' }}
          >
            <Menu.Item key="1">Project</Menu.Item>
            <Menu.Item key="2">Visualization</Menu.Item>
            <Menu.Item key="3">Statistic</Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px', marginTop: 68 }}>
          <div>
            <center>
              <h2>COMP90024 Cluster and Cloud Computing Project 2</h2>
            </center>
            <div
              style = {{ height: "78vh" }}
              ref={el => this.mapContainer = el}
              className="absolute top right left bottom" />
          </div>
          <Drawer
            title="Basic Drawer"
            placement="right"
            closable={false}
            onClose={this.onClose}
            visible={this.state.visible}
          >
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </Drawer>
        </Content>
        <Footer style={{ textAlign: 'center'}}>
          With love @2019 Created by CMJ, Jason, Mars, Patrick, Zijun
        </Footer>
      </Layout>
    );
  }
}

export default App;
