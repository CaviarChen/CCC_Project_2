import React, { Component } from 'react';
import { Layout, PageHeader } from 'antd';

import AppHeader from './AppHeader'
import AppFooter from './AppFooter';

const { Content } = Layout

class AppLayout extends Component {
  render() {
    return (
      <Layout className="app-layout" style={{ height:"100vh" }}>
      <PageHeader
          title="COMP90024 Cluster and Cloud Computing Project 2"
      />
        <AppHeader />
        <Content style={{ padding: '0 0px', marginTop: 0 }}>
          {this.props.children}
        </Content>
        <AppFooter />
      </Layout>
    );
  }
}

export default AppLayout;
