import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Layout, Menu } from 'antd';

const { Header } = Layout;

const AppHeader = withRouter(props => {
  const { location } = props;
  return (
    <Header style={{ zIndex: 1, width: '100%' , height: '48px'}}>
      <Menu
        theme="dark"
        mode="horizontal"
        style={{ lineHeight: '48px' }}
        selectedKeys={[location.pathname]}
      >
        <Menu.Item key="/project">
          <Link to="/project">Project</Link>
        </Menu.Item>
        <Menu.Item key="/">
          <Link to="/">Visualization</Link>
        </Menu.Item>
        <Menu.Item key="/statistic">
          <Link to="/statistic">Statistic</Link>
        </Menu.Item>
      </Menu>
    </Header>
  );
});

export default AppHeader;
