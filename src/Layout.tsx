import React, { useContext, useEffect, useState } from 'react'
import { Layout, Menu } from 'antd'
import { useLocation, useHistory } from 'react-router-dom'
import { Context } from './GlobalContext'
import { ServoStatus } from './SocketManager'
import { servoStatusToString } from './utils'
import './styles/Layout.css'

const { Header, Content } = Layout

export type LayoutProps = {
  children: React.ReactNode
}

export default function AppLayout({ children }: LayoutProps) {
  const { socketManager } = useContext(Context)
  const [status, setStatus] = useState<ServoStatus>(socketManager.getStatus())
  const location = useLocation()
  const history = useHistory()
  useEffect(() => {
    const updateStatus = (e: any) => {
      setStatus(e.data)
    }
    socketManager.addEventListener('updateStatus', updateStatus)
    return () => {
      socketManager.removeEventListener('updateStatus', updateStatus)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <Layout className="page-layout">
    <Header className="header" style={{ background: '#fff', padding: 0 }}>
      <div className="container">
        <div>
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
        <div>
          {servoStatusToString(status)}
        </div>
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