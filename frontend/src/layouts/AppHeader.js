import React, { Component } from 'react';
import { Layout, Menu } from 'antd';

const { Header } = Layout;

class AppHeader extends Component {
  render() {
    return (
      <Header style={{ zIndex: 1, width: '100%' }}>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['2']}
          style={{ lineHeight: '64px' }}
        >
          <Menu.Item key="1">Project</Menu.Item>
          <Menu.Item key="2">Visualization</Menu.Item>
          <Menu.Item key="3">Statistic</Menu.Item>
        </Menu>
      </Header>
    );
  }
}

export default AppHeader;
