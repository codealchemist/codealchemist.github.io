import React, { Component } from 'react'
import './Info.css'

export default class InfoTwitter extends Component {
  render () {
    return (
      <div className="info">
        <div className="animated slideInUp">
          <h1>Twitter</h1>
          <h3>
            <a href="https://twitter.com/albertomiranda" target="_blank">
              @albertomiranda
            </a>
          </h3>

          <p>
            Yup, I'm on Twitter too ;)<br />
          </p>
        </div>
      </div>
    )
  }
}
