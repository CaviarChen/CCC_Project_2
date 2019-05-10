import React, { Component } from 'react';
import { Layout } from 'antd';

import './AppFooter.less'

const { Footer } = Layout;

class AppFooter extends Component {

  render() {
    return (
      <Footer className="app-footer" style={{ textAlign: "center", height: '50px' }}>
        With love @2019 Created by CMJ, Jason, Mars, Patrick, Zijun
      </Footer>
    );
  }
}

export default AppFooter;
