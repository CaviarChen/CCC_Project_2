import React, { Component } from 'react'
import mapboxgl from 'mapbox-gl'
import { Drawer, Collapse, Spin, Card, Tag, Divider } from 'antd'
import { Bar, Pie, Radar } from 'react-chartjs-2'
import Axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css'

import AppLayout from './layouts/AppLayout'

import { TOKEN, DATABASE_URL } from './config.js'
import * as mel_geo_basic_url from './melbourne_avgpoints.geojson'
import * as mel_census_data from './melb_census.geojson'

const Panel = Collapse.Panel;
const bar_option = {
  scales: {
    yAxes: [{
      ticks: {
        beginAtZero: true
      }
    }]
  }
};

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
      is_loading: true,
      current_pd_docid: null,
      pieData: null,
      barData: null,
      sa2name: null,
      current_pd_data: null
    };
  }

  loadData = async (map) => {

    const reqs = [];
    reqs.push(Axios.get(DATABASE_URL + 'tweet_data/_design/designDoc/_view/get_surburb_summary?group=true'));
    reqs.push(Axios.get(mel_geo_basic_url));
    reqs.push(Axios.get(DATABASE_URL + 'tweet_data/_design/designDoc/_view/sample_points'));
    reqs.push(Axios.get(mel_census_data));

    const res = await Axios.all(reqs);
    let adder = res[0].data
    let mel_geo_basic = res[1].data
    let mel_geo_point = res[2].data
    let mel_census = res[3].data

    let areaData = this.appendProperties(mel_geo_basic, adder, mel_census)
    let pointData = this.makeGeoPoints(mel_geo_point)

    this.setState({
      is_loading: false,
    });

    map.getSource('suburbs').setData(areaData);
    map.getSource('points').setData(pointData);
  }

  appendProperties = (basic, adder, mel_census) => {
    for (let i = 0; i < adder.rows.length; i++) {
      let key = adder.rows[i].key
      if (key > 0 && key < 310) {
        basic.features[key - 1].properties['TOTAL_TWEET'] = adder.rows[i].value[1]
        basic.features[key - 1].properties['RELATED_TWEET'] = adder.rows[i].value[0]
        basic.features[key - 1].properties['RELATED_TWEET_RATIO'] = adder.rows[i].value[0] / adder.rows[i].value[1] * 1.8;
        basic.features[key - 1].properties['FEMALE_NEVER_MARRIED'] = mel_census['features'][i]['properties']['f_20_24_yr_never_married']
        basic.features[key - 1].properties['FEMALE_TOTAL'] = mel_census['features'][i]['properties']['f_20_24_yr_tot']
        basic.features[key - 1].properties['PERSON_NEVER_MARRIED'] = mel_census['features'][i]['properties']['p_20_24_yr_never_married']
        basic.features[key - 1].properties['PERSON_TOTAL'] = mel_census['features'][i]['properties']['p_20_24_yr_tot']
      }
    }
    return basic
  }

  makeGeoPoints = (data) => {
    var geo = {}
    geo['type'] = "FeatureCollection";
    geo['features'] = []
    for (let i = 0; i < data.rows.length; i++) {
      geo.features.push({
        "type": "Feature",
        "properties": {
          "id": data.rows[i].id
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            data.rows[i].value.longtitude,
            data.rows[i].value.latitude
          ]
        }
      })
    }
    return geo
  }

  onAreaClick = (e) => {
    this.showDrawer(e)
    this.state.map.flyTo({
      center: [e.properties.AVG_LNG, e.properties.AVG_LAT],
      zoom: 12,
      bearing: 0,
      speed: 0.4, // make the flying slow
      curve: 2.2, // change the speed at which it zooms out
    });
  }

  onPointClick = (e) => {
    this.showPdDrawer(e)
    this.state.map.flyTo({
      center: [e.geometry.coordinates[0], e.geometry.coordinates[1]],
      zoom: 16,
      bearing: 0,
      speed: 0.4, // make the flying slow
      curve: 2.2, // change the speed at which it zooms out
    });
  }

  showDrawer = (e) => {
    this.setState({
      advisible: true,
      sa2name: e.properties.SA2_NAME16,
      pieData: {
        labels: [
          'UnRelated Tweet',
          'Related Tweet'
        ],
        datasets: [{
          data: [e.properties.TOTAL_TWEET - e.properties.RELATED_TWEET, e.properties.RELATED_TWEET],
          backgroundColor: [
            '#36A2EB',
            '#FF6384',
          ],
          hoverBackgroundColor: [
            '#36A2EB',
            '#FF6384',
          ]
        }]
      },
      barData: {
        labels: [
          'Female never married',
          'Female total',
          'Person never married',
          'Person total'
        ],
        datasets: [{
          label: 'Number',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(255, 99, 132, 0.4)',
          hoverBorderColor: 'rgba(255, 99, 132, 1)',
          data: [
            e.properties.FEMALE_NEVER_MARRIED, 
            e.properties.FEMALE_TOTAL, 
            e.properties.PERSON_NEVER_MARRIED, 
            e.properties.PERSON_TOTAL
          ]
        }]
      }
    })
  };

  onClose = () => {
    this.setState({
      advisible: false,
    });
  };

  showPdDrawer = (e) => {
    this.setState({
      pdvisible: true,
      current_pd_docid: e.properties.id
    });
    this.loadPdData(e.properties.id);
  };

  loadPdData = async (docid) => {
    const res = await Axios.get(DATABASE_URL + '/tweet_data/' +  docid)
    if(docid === this.state.current_pd_docid){
      this.setState({
        current_pd_data: res.data.data,
      })
    }
  }

  onPdClose = () => {
    this.setState({
      pdvisible: false,
      current_pd_data: null
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
      map.addSource('points', {
        'type': 'geojson',
        'data': null
      })

      this.loadData(map);

      map.addLayer({
        'id': 'suburb-fills',
        'type': 'fill',
        'source': 'suburbs',
        "paint": {
          'fill-color': [
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
            1, '#000000'
          ],
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

      map.addLayer({
        id: 'test-heat',
        type: 'heatmap',
        source: 'points',
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
        source: 'points',
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

    map.on('click', function (e) {
      let f = map.queryRenderedFeatures(e.point, { layers: ['test-point'] })
      if (f.length) {
        this.onPointClick(f[0])
      } else {
        f = map.queryRenderedFeatures(e.point, { layers: ['suburb-fills'] })
        if (f.length) {
          this.onAreaClick(f[0])
        }
      }
    }.bind(this));

    map.on('mouseenter', 'test-point', function (e) {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'test-point', function () {
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
        <Spin
          className="spin"
          spinning={this.state.is_loading}
          size="large"
          tip="Loading..."
          style={{ position: "absolute", margin: "auto", top: "50%", left: "50%", zIndex: "1000" }} />
        <div
          style={style}
          ref={el => this.mapContainer = el}
          className="mapbox map" />
        <Drawer
          title={this.state.sa2name}
          width="35%"
          placement="right"
          closable={false}
          onClose={this.onClose}
          visible={this.state.advisible}
        >
          <Collapse defaultActiveKey={['1', '2']}>
            <Panel header="Related Tweet Pie Chart" key="1">
              <Pie 
                data={this.state.pieData} 
                width={100} 
                height={120} />
            </Panel>
            <Panel header="Relationship Bar Chart" key="2">
              <Bar 
                data={this.state.barData} 
                width={100} 
                height={120}
                options={bar_option} />
            </Panel>
          </Collapse>
        </Drawer>
        <Drawer
          title="Tweet Content"
          width="35%"
          placement="right"
          closable={false}
          onClose={this.onPdClose}
          visible={this.state.pdvisible}
        >
          <PDDrawCard data={this.state.current_pd_data} />
        </Drawer>
      </AppLayout>
    );
  }
}

function PDDrawCard(props) {
  const data = props.data;
  if (data == null) {
    return (
      <Card
        title={'loading'}
        style={{ width: '100%' }}
      >
        <p>{'loading'}</p>
      </Card>);
  }
  return (
    <Card
      title={'@' + data.user.name}
      style={{ width: '100%' }}
    >
      <p>{data.text}</p>
      <div>
        {data.words_of_interest.map((tag) => {
          const tagElem = (
            <Tag key={tag}>
              {tag}
            </Tag>
          );
          return tagElem;
        })}
      </div>
      <Divider />
    <img 
      alt="tweetimage"
      src={ data.images[0].url }
      width='100%' />
    </Card>
  );
}

export default Map;
