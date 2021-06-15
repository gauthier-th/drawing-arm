import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Layout from './Layout'

import Home from './pages/Home'
import Page404 from './pages/404'

function App() {
  return <BrowserRouter basename='/'>
    <Layout>
      <Switch>
        <Route exact path='/' component={Home} />
        <Route component={Page404} />
      </Switch>
    </Layout>
  </BrowserRouter>
}

export default App
