import React, { Component } from 'react'
import './Info.css'

export default class InfoMe extends Component {
  render () {
    return (
      <div className="info" key="info-me">
        <div className="animated slideInUp">
          <h1>I'm Alberto Miranda</h1>
          <h3>I love being a <em>Web Alchemist</em> ;)</h3>

          <p>
            Hey! Nice you meet you!<br />
          </p>
        </div>
      </div>
    )
  }
}
