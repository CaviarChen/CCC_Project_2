import React, { Component } from 'react';
import { Card, Col, Icon, Row, Statistic } from 'antd';
import Axios from 'axios';

import AppLayout from './layouts/AppLayout';

import { TOKEN, DATABASE_URL } from './config.js';


class Statistics extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tweet_count: null,
      tweet_img_count: null
    };
  }

  loadData = async () => {

    const reqs = [];
    reqs.push(Axios.get(DATABASE_URL + '/tweet_data'));
    reqs.push(Axios.get(DATABASE_URL + '/tweet_image_with_yolo'));

    const res = await Axios.all(reqs);
    let tweet = res[0].data;
    let tweet_img = res[1].data;

    this.setState({
      tweet_count: tweet['doc_count'],
      tweet_img_count: tweet_img['doc_count']
    })
  };

  componentDidMount() {
    this.loadData();
  }

  render() {
    return (
      <AppLayout>
        <div style={{ background: '#ECECEC', padding: '64px' }}>
          <Row gutter={128}>
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
      </AppLayout>
    );
  }
}

export default Statistics;
