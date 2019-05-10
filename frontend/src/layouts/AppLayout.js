import React, { Component } from 'react';
import { Layout, PageHeader } from 'antd';

import AppHeader from './AppHeader'

const { Content } = Layout

class AppLayout extends Component {
  render() {
    return (
      <Layout className="app-layout" style={{ height:"100vh" }}>
      <PageHeader 
        title="COMP90024 Cluster and Cloud Computing Project 2"
        subTitle="Team 42"
      />
        <AppHeader />
        <Content style={{ padding: '0 0px', marginTop: 0 }}>
          {this.props.children}
        </Content>
      </Layout>
    );
  }
}

export default AppLayout;
