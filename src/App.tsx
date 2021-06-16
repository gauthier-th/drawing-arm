import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Layout from './Layout'
import GlobalContext from './GlobalContext'

import Home from './pages/Home'
import SuiviTrace from './pages/SuiviTrace'
import Page404 from './pages/404'

function App() {
  return <GlobalContext>
    <BrowserRouter basename='/'>
      <Layout>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/suivi-trace' component={SuiviTrace} />
          <Route component={Page404} />
        </Switch>
      </Layout>
    </BrowserRouter>
  </GlobalContext>
}

export default App
