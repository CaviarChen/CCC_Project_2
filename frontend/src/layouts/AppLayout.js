import React, { Component } from 'react';
import { Layout } from 'antd';

import AppHeader from './AppHeader'
import AppFooter from './AppFooter';

const { Content } = Layout

class AppLayout extends Component {
  render() {
    return (
      <Layout className="app-layout" style={{ height:"100vh" }}>
        <AppHeader />
        <Content style={{ padding: '0 50px', marginTop: 0 }}>
          {this.props.children}
        </Content>
        <AppFooter />
      </Layout>
    );
  }
}

export default AppLayout;
