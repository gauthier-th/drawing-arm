import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Layout from './Layout'
import GlobalContext from './GlobalContext'

import Home from './pages/Home'
import SuiviTrace from './pages/SuiviTrace'
import Page404 from './pages/404'
import Formes from './pages/Formes'
import Libre from './pages/Libre'

function App() {
  return <GlobalContext>
    <BrowserRouter basename='/'>
      <Layout>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/suivi-trace' component={SuiviTrace} />
          <Route exact path='/formes' component={Formes} />
          <Route exact path='/libre' component={Libre} />
          <Route component={Page404} />
        </Switch>
      </Layout>
    </BrowserRouter>
  </GlobalContext>
}

export default App
