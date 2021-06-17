import React, { useContext, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { Typography } from 'antd'
import { Context } from '../GlobalContext'
import '../styles/Formes.css'

const { Title } = Typography

export default function Formes() {
  const history = useHistory()
  const { socketManager } = useContext(Context)
  const selectRef = useRef<HTMLSelectElement>(null)
  const onClick = () => {
    if (selectRef.current) {
      socketManager.traceShape(selectRef.current.value)
      history.push('/suivi-trace')
    }
  }
  return <>
    <Title>Formes</Title>
    <p>Traçage de formes prédéfinies.</p>
    <br />
    <p>Choisissez la forme à tracer :</p>
    <div className="select-trace-shape">
      <select ref={selectRef}>
        <option value="square">Carré</option>
        <option value="triangle">Triangle</option>
        <option value="losange">Losange</option>
        <option value="star">Étoile</option>
      </select>
      <button onClick={onClick}>Tracer !</button>
    </div>
  </>
}