import React, { Component } from 'react';
import { Button, Card, Col, Collapse, Icon, Row, Typography } from 'antd';

import AppLayout from './layouts/AppLayout';

class Project extends Component {

  render() {
    const { Meta } = Card;
    const { Title, Paragraph, Text } = Typography;
    const Panel = Collapse.Panel;

    return (
      <AppLayout>
        <Collapse defaultActiveKey={['1']}>
          <Panel header="Project Description" key="1">
            <Typography>
              <Title level={2}>Introduction</Title>
              <Paragraph>
                The software engineering activity builds on the lecture materials describing Cloud systems and especially the UniMelb/NeCTAR Research Cloud and its use of OpenStack; on Instagram data (provided); on Twitter APIs, and CouchDB and the kinds of data analytics (e.g. MapReduce) that CouchDB supports as well as data from the Australian Urban Research Infrastructure Network <a href="https://portal.aurin.org.au" target="_blank" rel="noopener noreferrer">AURIN</a>.
              </Paragraph>
              <Paragraph>
                The focus of this assignment is to explore the <a href="https://en.wikipedia.org/wiki/Seven_deadly_sins" target="_blank" rel="noopener noreferrer">Seven Deadly Sins</a> through social media analytics. There has been a huge amount of work on sentiment analysis of social media, e.g. are people happy or sad as recorded by their tweets, but far less work on other aspects of human nature and emotion: greed, lust, laziness etc. Teams will explore one or more deadly sins and collect social media data that captures some aspect of that sin and compares it with official data from AURIN. A few examples of the deadly sins might be:
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
                <Button type="link" size={'large'} href="https://github.com/CaviarChen/CCC_Project_2">
                  GitHub Repo
                </Button>
              </Paragraph>
            </Typography>
          </Panel>
          <Panel header="Group Members" key="3">
            <Row type="flex" justify="space-around" align='middle'>
              <Col span={4}>
                <Card
                  cover={<img alt="example" src="https://github.com/cmjhaha886.png?size=400" />}
                  actions={[<a href="https://github.com/cmjhaha886" target="_blank" rel="noopener noreferrer"><Icon type="github" style={{ fontSize: '24px' }}/></a>]}
                >
                  <Meta
                    title="Minjian Chen"
                    description="Backend"
                    style={{textAlign: "center"}}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card
                  cover={<img alt="example" src="https://github.com/shijiel2.png?size=400" />}
                  actions={[<a href="https://github.com/shijiel2" target="_blank" rel="noopener noreferrer"><Icon type="github" style={{ fontSize: '24px' }}/></a>]}
                >
                  <Meta
                    title="Shijie Liu"
                    description="Frontend"
                    style={{textAlign: "center"}}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card
                  cover={<img alt="example" src="https://github.com/PwzXxm.png?size=400" />}
                  actions={[<a href="https://github.com/PwzXxm" target="_blank" rel="noopener noreferrer"><Icon type="github" style={{ fontSize: '24px' }}/></a>]}
                >
                  <Meta
                    title="Weizhi Xu"
                    description="Backend"
                    style={{textAlign: "center"}}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card
                  cover={<img alt="example" src="https:github.com/MarsXue.png?size=400" />}
                  actions={[<a href="https://github.com/MarsXue" target="_blank" rel="noopener noreferrer"><Icon type="github" style={{ fontSize: '24px' }}/></a>]}
                >
                  <Meta
                    title="Wenqing Xue"
                    description="Frontend"
                    style={{textAlign: "center"}}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card
                  cover={<img alt="example" src="https://github.com/CaviarChen.png?size=400" />}
                  actions={[<a href="https://github.com/CaviarChen" target="_blank" rel="noopener noreferrer"><Icon type="github" style={{ fontSize: '24px' }}/></a>]}
                >
                  <Meta
                    title="Zijun Chen"
                    description="Backend"
                    style={{textAlign: "center"}}
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
