import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Map from './Map'
import Project from './Project'
import Statistics from './Statistics'

class App extends Component {

  render () {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Map} />
          <Route path="/project" component={Project} />
          <Route path="/statistics" component={Statistics} />
        </Switch>
      </Router>
    );
  }
}

export default App;
