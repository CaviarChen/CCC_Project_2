import React, { Component } from 'react';
import { Card, Col, Collapse, Icon, Row, Statistic } from 'antd';
import { Line } from 'react-chartjs-2';
import Axios from 'axios';

import AppLayout from './layouts/AppLayout';

import { TOKEN, DATABASE_URL } from './config.js';


const Panel = Collapse.Panel;


class Statistics extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tweet_count: null,
      tweet_img_count: null,
      import_tweet: {},
      harvest_tweet: {}
    };
  }

  loadData = async () => {

    const reqs = [];
    reqs.push(Axios.get(DATABASE_URL + '/tweet_data'));
    reqs.push(Axios.get(DATABASE_URL + '/tweet_image_with_yolo'));
    reqs.push(Axios.get(DATABASE_URL + '/tweet_data/_design/stats/_view/tweet_per_day?group=true'));

    const res = await Axios.all(reqs);
    let tweet = res[0].data;
    let tweet_img = res[1].data;
    let tweet_data = res[2].data;

    var import_date = [];
    var import_data = [];
    var harvest_date = [];
    var harvest_data = [];

    for (let i = 0; i < tweet_data.rows.length; i++) {
      if (tweet_data.rows[i].key[3] === "import_twitter_tweet") {
        let i_date = tweet_data.rows[i].key[0].toString() + '-' + tweet_data.rows[i].key[1].toString() + '-' + tweet_data.rows[i].key[2].toString();
        import_date.push(i_date);
        import_data.push(tweet_data.rows[i].value);
      } else if (tweet_data.rows[i].key[3] === "harvest_twitter_tweet") {
        let h_date = tweet_data.rows[i].key[0].toString() + '-' + tweet_data.rows[i].key[1].toString() + '-' + tweet_data.rows[i].key[2].toString();
        harvest_date.push(h_date);
        harvest_data.push(tweet_data.rows[i].value);
      }
    }

    this.setState({
      tweet_count: tweet['doc_count'],
      tweet_img_count: tweet_img['doc_count'],
      import_tweet: {
        labels: import_date,
        datasets: [{
          label: 'Import Tweet',
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
          data: import_data
        }]
      },
      harvest_tweet: {
        labels: harvest_date,
        datasets: [{
          label: 'Harvest Tweet',
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
          data: harvest_data
        }]
      }
    })
  };

  componentDidMount() {
    this.loadData();
  }

  render() {
    return (
      <AppLayout>
        <div style={{ background: '#ECECEC', padding: '16px' }}>
          <Row gutter={32}>
            <Col span={12} style={{ textAlign: "center" }} >
              <Card>
                <Statistic 
                  title="Total Tweet Count" 
                  value={this.state.tweet_count}
                  prefix={<Icon type="twitter" style={{ color: "#1DA1F2" }} />} />
              </Card>
            </Col>
            <Col span={12} style={{ textAlign: "center" }}>
              <Card>
                <Statistic 
                  title="Total Tweet With Image Count" 
                  value={this.state.tweet_img_count} 
                  prefix={<Icon type="picture" style={{ color: "#1DA1F2" }} />} />
              </Card>
            </Col>
          </Row>
        </div>
        <Collapse defaultActiveKey={['2']} >
          <Panel header="Imported Tweet Time Distribution" key="1">
            <Line 
              data={this.state.import_tweet}
              width={100} 
              height={30} />
          </Panel>
          <Panel header="Harvested Tweet Time Distribution" key="2">
            <Line 
              data={this.state.harvest_tweet}
              width={100} 
              height={30} />
          </Panel>
        </Collapse>
      </AppLayout>
    );
  }
}

export default Statistics;
