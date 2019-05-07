import React, { Component } from 'react'
import mapboxgl from 'mapbox-gl'

import TOKEN from './config.js'
import * as geoData from './melbourne.geojson'

mapboxgl.accessToken = TOKEN;

class App extends Component {

  constructor(props: Props) {
    super(props);
    this.state = {
      lng: 144.9631,
      lat: -37.8136,
      zoom: 12
    };
  }

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

    map.on('click', 'suburb-fills', function (e) {
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(e.features[0].properties.SA2_NAME16)
        .addTo(map);
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
    const { lng, lat, zoom } = this.state;
    return (
        <div>
          <center>
            <h2>COMP90024 Cluster and Cloud Computing Project 2</h2>
          </center>
          <div
            style = {{height:"100vh"}}
            ref={el => this.mapContainer = el}
            className="absolute top right left bottom" />
        </div>
    );
  }
}

export default App;
