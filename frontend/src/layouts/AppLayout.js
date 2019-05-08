import React, { Component } from 'react';
import { Layout } from 'antd';

import AppHeader from './AppHeader'
import AppFooter from './AppFooter';
import './AppLayout.less'

const { Content } = Layout

class AppLayout extends Component {
  render() {
    return (
      <Layout className="app-layout">
        <AppHeader />
        <Content>
          {this.props.children}
        </Content>
        <AppFooter />
      </Layout>
    );
  }
}

export default AppLayout;
