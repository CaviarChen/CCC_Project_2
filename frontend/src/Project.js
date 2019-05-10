import React, { Component } from 'react';
import { Row, Col, Card, Icon, Avatar, Collapse } from 'antd';

import AppLayout from './layouts/AppLayout';

class Project extends Component {

  render() {
    const { Meta } = Card;
    const Panel = Collapse.Panel;

    function callback(key) {
      console.log(key);
    }

    const text = `This is a very good project.`;

    return (
      <AppLayout>
        <Collapse defaultActiveKey={['1', '3']} onChange={callback}>
          <Panel header="Project Description" key="1">
            <p>{text}</p>
          </Panel>
          <Panel header="Something Else" key="2">
            <p>{text}</p>
          </Panel>
          <Panel header="Group Members" key="3">
            <Row type="flex" justify="space-around" align='middle'>
              <Col span={4}>
                <Card
                  cover={<img alt="example" src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" />}
                  actions={[<Icon type="github" style={{ fontSize: '24px' }}/>]}
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
                  actions={[<Icon type="github" style={{ fontSize: '24px' }}/>]}
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
                  actions={[<Icon type="github" style={{ fontSize: '24px' }}/>]}
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
                  actions={[<Icon type="github" style={{ fontSize: '24px' }}/>]}
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
                  actions={[<Icon type="github" style={{ fontSize: '24px' }}/>]}
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
