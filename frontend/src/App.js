import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Map from './Map'
import Project from './Project'
import Statistic from './Statistic'

class App extends Component {

  render () {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Map} />
          <Route path="/project" component={Project} />
          <Route path="/statistic" component={Statistic} />
        </Switch>
      </Router>
    );
  }
}

export default App;
