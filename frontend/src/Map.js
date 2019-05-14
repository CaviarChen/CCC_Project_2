import React, { Component } from 'react'
import mapboxgl from 'mapbox-gl'
import { Drawer, Collapse, Spin, Card, Tag, Divider, Statistic, Row, Col, Icon, Select } from 'antd'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import Axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css'
import './Map.css'


import AppLayout from './layouts/AppLayout'

import { TOKEN, DATABASE_URL, GOBACKEND_URL } from './config.js'
import * as mel_geo_basic_url from './melbourne_avgpoints.geojson'
import * as mel_census_data from './melb_census.geojson'

const Panel = Collapse.Panel;
const Option = Select.Option;
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
      current_area_code: null,
      barData: null,
      doughnutData: null,
      sa2name: null,
      current_pd_data: null,
      total_tweet: null,
      related_tweet: null,
      image_tweet: null,
      legend_display: 'block',
      guide_display: 'block',

      lineDataYear: null,
      rawLineData: null,
      lineData: null,
      lineDataYears: null,
    };
  }

  loadData = async (map) => {

    const reqs = [];
    reqs.push(Axios.get(DATABASE_URL + 'tweet_data/_design/designDoc/_view/get_surburb_summary_image?group=true'));
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
        basic.features[key - 1].properties['IMAGE_TWEET'] = adder.rows[i].value[2]
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

  handleChange(value) {
    this.setState({
      lineDataYear: parseInt(value, 10)
    })
  }

  handleChange = this.handleChange.bind(this)

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
      total_tweet: e.properties.TOTAL_TWEET,
      related_tweet: e.properties.RELATED_TWEET,
      image_tweet: e.properties.IMAGE_TWEET,
      advisible: true,
      sa2name: e.properties.SA2_NAME16,
      current_area_code: e.id,

      doughnutData: {
        labels: [
          'UnRelated Tweet',
          'Related Text Tweet',
          'Related Image Tweet'
        ],
        datasets: [{
          data: [e.properties.TOTAL_TWEET - e.properties.RELATED_TWEET, e.properties.RELATED_TWEET - e.properties.IMAGE_TWEET, e.properties.IMAGE_TWEET],
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
      },

      barData: {
        labels: [
          'Related tweet',
          'Total tweet',
          '20-24 aged Female never married',
          '20-24 aged Female total',
          '20-24 aged Person never married',
          '20-24 aged Person total'
        ],
        datasets: [{
          label: 'Number',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(255, 99, 132, 0.4)',
          hoverBorderColor: 'rgba(255, 99, 132, 1)',
          data: [
            e.properties.RELATED_TWEET,
            e.properties.TOTAL_TWEET,
            e.properties.FEMALE_NEVER_MARRIED,
            e.properties.FEMALE_TOTAL,
            e.properties.PERSON_NEVER_MARRIED,
            e.properties.PERSON_TOTAL
          ]
        }]
      }
    })
    this.loadAreaData(e)
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
    const res = await Axios.get(DATABASE_URL + 'tweet_data/' + docid)
    if (docid === this.state.current_pd_docid) {
      this.setState({
        current_pd_data: res.data.data,
      })
    }
  }

  loadAreaData = async (e) => {
    const res = await Axios.get(DATABASE_URL + 'tweet_data/_design/designDoc/_view/melbourne_surburb_time_interval?group_level=3&startkey=[' + e.id + ']&endkey=[' + e.id + ', {}, {}]')
    if (e.id === this.state.current_area_code) {
      this.setState({
        rawLineData: res.data
      })
      this.setYearsFromRawLineData()
      this.setYearData()
    }
  }

  onPdClose = () => {
    this.setState({
      pdvisible: false,
      current_pd_data: null
    });
  };

  setYearData() {
    if (this.state.rawLineData === null || this.state.lineDataYear === null){
      return 
    }
    let timeMap = {}
    let timeLable = []
    let totalValue = []
    let relatedValue = []
    let rows = this.state.rawLineData.rows
    for(let y=0;y<25;y++){
      timeMap[y] = [0, 0]
    }
    for(let i=0;i<rows.length;i++){
      if(rows[i].key[1] === this.state.lineDataYear){
        timeMap[rows[i].key[2]] = rows[i].value
      }
    }
    for(let n=0;n<25;n++){
      relatedValue.push(timeMap[n][0])
      totalValue.push(timeMap[n][1])
      timeLable.push(n.toString() + ':00')
    }
    let data = {
      labels: timeLable,
      datasets: [
        {
          label: 'Total Tweet',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(75,192,192,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: totalValue
        },
        {
          label: 'Related Tweet',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(75,192,192,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: relatedValue
        }
      ]
    };
    this.setState({
      lineData: data
    })
  }

  setYearsFromRawLineData() {
    if (this.state.rawLineData === null) {
      return []
    } else {
      let rows = this.state.rawLineData.rows
      let years = []
      for (let i = 0; i < rows.length; i++) {
        if (!years.includes(rows[i]['key'][1])) {
          years.push(rows[i]['key'][1])
        }
      }
      this.setState({
        lineDataYears: years
      })
    }
  }

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

    map.on('zoom', function () {
      if (map.getZoom() >= 10) {
        this.setState({
          legend_display: 'none',
          guide_display: 'none'
        })
      } else {
        this.setState({
          legend_display: 'block',
          guide_display: 'block'
        })
      }
    }.bind(this));
  }

  render() {
    return (
      <AppLayout>
        <Spin
          className="spin"
          spinning={this.state.is_loading}
          size="large"
          tip="Loading..."
          style={{ position: "absolute", margin: "auto", top: "50%", left: "50%", zIndex: "1000" }} />
        <div className='legend' style={{ display: this.state.legend_display }}>
          <h4>Related Tweets Percentage</h4>
          <div><span style={{ backgroundColor: '#F2F12D' }}></span>0%</div>
          <div><span style={{ backgroundColor: '#EED322' }}></span>10%</div>
          <div><span style={{ backgroundColor: '#E6B71E' }}></span>20%</div>
          <div><span style={{ backgroundColor: '#DA9C20' }}></span>30%</div>
          <div><span style={{ backgroundColor: '#CA8323' }}></span>40%</div>
          <div><span style={{ backgroundColor: '#B86B25' }}></span>50%</div>
          <div><span style={{ backgroundColor: '#A25626' }}></span>60%</div>
          <div><span style={{ backgroundColor: '#8B4225' }}></span>70%</div>
          <div><span style={{ backgroundColor: '#723122' }}></span>80%</div>
          <div><span style={{ backgroundColor: '#512015' }}></span>90%</div>
          <div><span style={{ backgroundColor: '#000000' }}></span>100%</div>
        </div>
        <div className='toplegend' style={{ display: this.state.guide_display }}>
          <h4>Quick Guide</h4>
          <div>1. Click area for Statistic Results.</div>
          <div>2. Zoom in for detailed inspection.</div>
          <div>3. Click sample Tweet points for analysis.</div>
        </div>
        <div
          style={{ height: "88vh" }}
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
          <Collapse defaultActiveKey={['1', '2', '3']}>
            <Panel header="Related Tweet Pie Chart" key="1">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="Total Tweets" value={this.state.total_tweet} prefix={<Icon type="twitter" style={{ color: "#1DA1F2" }} />} />
                </Col>
                <Col span={8}>
                  <Statistic title="Related Tweets" value={this.state.related_tweet} suffix={'/ ' + this.state.total_tweet} />
                </Col>
                <Col span={8}>
                  <Statistic title="Image Tweets" value={this.state.image_tweet} suffix={'/ ' + this.state.related_tweet} prefix={<Icon type="picture" style={{ color: "#1DA1F2" }} />} />
                </Col>
              </Row>
              <Doughnut
                data={this.state.doughnutData}
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
            <Panel header="Tweet Traffic Diagram" key="3">
              <Select
                labelInValue
                defaultValue={{ key: 'Select Year' }}
                style={{ width: 150 }}
                onChange={this.handleChange}
              >
                {this.state.lineDataYears.map((year) => { const optElem = (<Option value={year} key={year}> {year} </Option>); return optElem; })}
              </Select>
              <Line data={this.state.lineData} />

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
        src={GOBACKEND_URL + "helper/get_annotated_image?image_url=" + encodeURIComponent(data.images[0].url)}
        width='100%' />
    </Card>
  );
}

export default Map;
