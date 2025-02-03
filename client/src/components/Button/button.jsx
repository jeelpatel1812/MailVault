import React from 'react'
import style from './button.css'
export default function Button(props) {
  return (
    <button className={`button ${props.className}`} styles={props.styles} onClick={props.onClick}>{props.children}</button>
  )
}
