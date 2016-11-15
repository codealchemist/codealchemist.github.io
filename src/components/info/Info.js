import React from 'react'
import InfoGithub from './InfoGithub.js'
import InfoLinkedin from './InfoLinkedin.js'
import InfoMe from './InfoMe.js'
import InfoTwitter from './InfoTwitter.js'

export default class Info {
  constructor () {
    this.map = {
      github: <InfoGithub key="info-github" />,
      linkedin: <InfoLinkedin key="info-linkedin" />,
      me: <InfoMe key="info-me" />,
      twitter: <InfoTwitter key="info-twitter" />
    }
  }

  get (id) {
    return this.map[id]
  }
}
