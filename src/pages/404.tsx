import React from 'react'
import { Typography } from 'antd'

const { Title } = Typography


export default function Page404() {
  return <>
    <Title>Erreur 404 : page introuvable</Title>
    <p>Désolé, mais cette page n'existe pas.</p>
  </>
}