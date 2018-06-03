import React, { Component } from 'react'
import './Info.css'

export default class InfoGithub extends Component {
  render () {
    return (
      <div className="info">
        <div className="animated fadeIn">
          <h1>Github</h1>
          <h3>
            <a href="https://github.com/codealchemist" target="_blank">
              https://github.com/codealchemist
            </a>
          </h3>

          <p>
            I enjoy sharing code!<br />
            I also collaborate with really cool open source projects like
            <a href="https://webtorrent.io/desktop" target="_blank">
              WebTorrent Desktop
            </a>
            <br />
          </p>
        </div>
      </div>
    )
  }
}
