import React, { Component } from 'react';
import { Row, Col, Card, Icon, Avatar, Collapse, Typography, Divider } from 'antd';

import AppLayout from './layouts/AppLayout';

class Project extends Component {

  render() {
    const { Meta } = Card;
    const { Title, Paragraph, Text } = Typography;
    const Panel = Collapse.Panel;

    function callback(key) {
      console.log(key);
    }

    return (
      <AppLayout>
        <Collapse defaultActiveKey={['1']} onChange={callback}>
          <Panel header="Project Description" key="1">
          <Typography>
              <Title>Introduction</Title>
              <Paragraph>
                The software engineering activity builds on the lecture materials describing Cloud systems and especially the UniMelb/NeCTAR Research Cloud and its use of OpenStack; on Instagram data (provided); on Twitter APIs, and CouchDB and the kinds of data analytics (e.g. MapReduce) that CouchDB supports as well as data from the Australian Urban Research Infrastructure Network (AURIN – <a href="https://portal.aurin.org.au">https://portal.aurin.org.au</a>).
              </Paragraph>
              <Paragraph>
                The focus of this assignment is to explore the Seven Deadly Sins (<a href="https://en.wikipedia.org/wiki/Seven_deadly_sins">https://en.wikipedia.org/wiki/Seven_deadly_sins</a>) through social media analytics. There has been a huge amount of work on sentiment analysis of social media, e.g. are people happy or sad as recorded by their tweets, but far less work on other aspects of human nature and emotion: greed, lust, laziness etc. Teams will explore one or more deadly sins and collect social media data that captures some aspect of that sin and compares it with official data from AURIN. A few examples of the deadly sins might be:
              </Paragraph>
              <Paragraph>
                <ul>
                  <li><Text strong>Pride:</Text> how many selfies are taken in particular areas, how many tweets/images about make-up/personal care, ...</li>
                  <li><Text strong>Greed:</Text> tweets/images about food/drink or about money/income, ...</li>
                  <li><Text strong>Lust:</Text> tweets that include the likes of “I want...”, “I love...”, “I’m jealous...” or images of a “certain” adult nature;</li>
                  <li><Text strong>Envy:</Text> tweets that include the likes of “I wish...”, “I need...”, “I desire...”</li>
                  <li><Text strong>Gluttony:</Text> tweets/images that show overweight people or about dietary issues, e.g. fast food restaurants such as #maccas or related products such as #bigmac etc;</li>
                  <li><Text strong>Wrath:</Text> tweets that include the likes of “I hate...”, “I’m angry...” or about crime or areas with high levels of negative emotion (sentiment) on particular topics etc</li>
                  <li><Text strong>Sloth:</Text> tweets that mention sleep, laziness, or areas where there are more/less tweets at night/early morning.</li>
                </ul>
              </Paragraph>

              <Divider />

              <Title>About Our Project</Title>
              <Paragraph>
                balabalabalabala
              </Paragraph>
              <Paragraph>
                balabalabalabala<Text strong>balabalabalabala</Text>。
              </Paragraph>
              <Title level={2}>balabalabalabala</Title>
              <Paragraph>
                balabalabalabala<Text code>balabalabalabala</Text><Text code>balabalabalabala</Text>
            </Paragraph>

              <Paragraph>
                <ul>
                  <li><a href="/docs/spec/proximity">balabalabalabala</a></li>
                  <li><a href="/docs/pattern/navigation">balabalabalabala</a></li>
                  <li><a href="/docs/resource/download">balabalabalabala</a></li>
                </ul>
              </Paragraph>
            </Typography>
          </Panel>
          <Panel header="Group Members" key="3">
            <Row type="flex" justify="space-around" align='middle'>
              <Col span={4}>
                <Card
                  cover={<img alt="example" src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" />}
                  actions={[<a href="https://github.com/cmjhaha886" target="_blank" rel="noopener noreferrer"><Icon type="github" style={{ fontSize: '24px' }}/></a>]}
                >
                  <Meta
                    avatar={<Avatar src="https://github.com/cmjhaha886.png?size=200" />}
                    title="Minjian Chen"
                    description="Backend"
                  />
                </Card>
              </Col>
              <Col span={4} >
                <Card
                  cover={<img alt="example" src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" />}
                  actions={[<a href="https://github.com/shijiel2" target="_blank" rel="noopener noreferrer"><Icon type="github" style={{ fontSize: '24px' }}/></a>]}
                >
                  <Meta
                    avatar={<Avatar src="https://github.com/shijiel2.png?size=200" />}
                    title="Shijie Liu"
                    description="Frontend"
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card
                  cover={<img alt="example" src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" />}
                  actions={[<a href="https://github.com/PwzXxm" target="_blank" rel="noopener noreferrer"><Icon type="github" style={{ fontSize: '24px' }}/></a>]}
                >
                  <Meta
                    avatar={<Avatar src="https://github.com/PwzXxm.png?size=200" />}
                    title="Weizhi Xu"
                    description="Backend"
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card
                  cover={<img alt="example" src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" />}
                  actions={[<a href="https://github.com/MarsXue" target="_blank" rel="noopener noreferrer"><Icon type="github" style={{ fontSize: '24px' }}/></a>]}
                >
                  <Meta
                    avatar={<Avatar src="https:github.com/MarsXue.png?size=200" />}
                    title="Wenqing Xue"
                    description="Frontend"
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card
                  cover={<img alt="example" src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" />}
                  actions={[<a href="https://github.com/CaviarChen" target="_blank" rel="noopener noreferrer"><Icon type="github" style={{ fontSize: '24px' }}/></a>]}
                >
                  <Meta
                    avatar={<Avatar src="https://github.com/CaviarChen.png?size=200" />}
                    title="Zijun Chen"
                    description="Backend"
                  />
                </Card>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </AppLayout>
    );
  }
}

export default Project;
