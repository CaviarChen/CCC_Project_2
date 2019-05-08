import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Map from './Map'

class App extends Component {

  render () {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Map} />
        </Switch>
      </Router>
    );
  }
}

export default App;
