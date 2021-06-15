import React from 'react'
import { Layout, Menu } from 'antd'
import { useLocation, useHistory } from 'react-router-dom'
import './styles/Layout.css'

const { Header, Content } = Layout

type LayoutProps = {
  children: React.ReactNode
}

export default function AppLayout({ children }: LayoutProps) {
  const location = useLocation()
  const history = useHistory()
  return <Layout className="page-layout">
    <Header className="header" style={{ background: '#fff', padding: 0 }}>
      <div className="container">
        <div className="logo">
          <img src="/img/logo-esirem.png" alt="logo" />
        </div>
        <Menu mode="horizontal" defaultSelectedKeys={[location.pathname]} onClick={({ key }) => history.push(key)}>
          <Menu.Item key="/">Accueil</Menu.Item>
          <Menu.Item key="/suivi-trace">Suivi tracé</Menu.Item>
          <Menu.Item key="/formes">Formes</Menu.Item>
          <Menu.Item key="/libre">Libre</Menu.Item>
        </Menu>
      </div>
    </Header>
    <Layout>
      <Layout className="container" style={{ padding: '0 24px 24px' }}>
        <Content
          className="site-layout-background"
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  </Layout>
}