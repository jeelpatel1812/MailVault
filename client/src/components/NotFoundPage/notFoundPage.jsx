import React from 'react'
import NotFoundPageImg from './notFoundPage.jpg'
export const NotFoundPage = () => {
  return (
    <div style={{height: '100vh'}}>
        <img src={NotFoundPageImg} style={{margin:"auto", display: "block", maxHeight:"100%"}} alt="loading..."></img>
    </div>
  )
}
