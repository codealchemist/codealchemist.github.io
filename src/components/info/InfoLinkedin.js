import React, { Component } from 'react'
import './Info.css'

export default class InfoLinkedin extends Component {
  render () {
    return (
      <div className="info">
        <div className="animated fadeIn">
          <h1>LinkedIn</h1>
          <h3>
            <a href="https://linkedin.com/in/albertomiranda" target="_blank">
              https://linkedin.com/in/albertomiranda
            </a>
          </h3>

          <p>
            LinkedIn <em>remembers</em> better than me all the companies I've worked for.<br />
          </p>
        </div>
      </div>
    )
  }
}
