import React, { Component } from 'react'
import * as THREE from 'three'
import './Cube.css'
import CubeEvents from './CubeEvents.js'
import Info from '../info/Info.js'

// images
import imgMe from './me.jpg'
import imgLinkedin from './linkedin.png'
import imgTwitter from './twitter.jpg'
import imgGithub from './github.png'
import imgGoogle from './google.png'
import imgAtgallery from './atgallery.png'

export default class Cube extends Component {
  constructor () {
    super();
    this.totalFaces = 4
    this.rotationLength = 6.28
    this.faceLength = this.rotationLength / this.totalFaces
    this.targetRotation = 0;
    this.state = {time: new Date()}
    this.texturesToLoad = [
      {id: 'me', url: imgMe},
      {id: 'linkedin', url: imgLinkedin},
      {id: 'twitter', url: imgTwitter},
      {id: 'google', url: imgGoogle},
      {id: 'github', url: imgGithub},
      {id: 'atgallery', url: imgAtgallery}
    ]
    this.facesNumMap = [
      this.texturesToLoad[0], // me
      this.texturesToLoad[4], // github
      this.texturesToLoad[2], // twitter
      this.texturesToLoad[1], // linkedin
    ]
    this.currentFaceNumber = 0
    this.prevFaceNumber = 0
    this.rotations = 0
    this.info = new Info()
  }

  componentDidMount () {
    this.init()
  }

  init () {
    // set textures to load
    this.loadTextures(this.texturesToLoad, this.onTexturesLoaded)
  }

  loadTextures (items) {
    let loader
    let total = items.length
    let loaded = 0
    let textures = {}

    items.forEach((item) => {
      loader = new THREE.TextureLoader()
      loader.load(item.url, (texture) => {
        // console.log(`loaded texture: ${item.url}`)
        textures[item.id] = texture

        ++loaded
        if (loaded === total) {
          this.onTexturesLoaded(textures)
        }
      })
    })
  }

  setDimensions () {
    this.windowHalfX = window.innerWidth / 2;
		this.windowHalfY = window.innerHeight / 2;
  }

  setCamera () {
    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
		this.camera.position.y = 50;
		this.camera.position.z = 500;
  }

  setCube (textures) {
    let materials = new THREE.MeshFaceMaterial([
      new THREE.MeshBasicMaterial({ map: textures.linkedin }),
      new THREE.MeshBasicMaterial({ map: textures.github }),
      new THREE.MeshBasicMaterial({ map: textures.google }),
      new THREE.MeshBasicMaterial({ map: textures.atgallery }),
      new THREE.MeshBasicMaterial({ map: textures.me }),
      new THREE.MeshBasicMaterial({ map: textures.twitter })
    ])

    let geometry = new THREE.BoxGeometry( 200, 200, 200 );
		// for ( var i = 0; i < geometry.faces.length; i += 2 ) {
		// 	var hex = Math.random() * 0xffffff;
		// 	geometry.faces[ i ].color.setHex( hex );
		// 	geometry.faces[ i + 1 ].color.setHex( hex );
		// }

    this.cube = new THREE.Mesh( geometry, materials );
    this.cube.position.y = 150;
    this.scene.add( this.cube );
  }

  setPlane () {
    let geometry = new THREE.PlaneGeometry( 200, 200 );
    geometry.rotateX( - Math.PI / 2 );
    let material = new THREE.MeshBasicMaterial( { color: 0xe0e0e0, overdraw: 0.5 } );
    this.plane = new THREE.Mesh( geometry, material );
    this.scene.add( this.plane );
  }

  setRenderer () {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor( 0xf0f0f0 );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.container = document.getElementById('cube');
    this.container.appendChild( this.renderer.domElement );
  }

  onTexturesLoaded (textures) {
    this.setDimensions()
    this.setEvents()

    this.scene = new THREE.Scene();
    this.setCamera()
    this.setCube(textures)
    this.setPlane()

    this.setRenderer()
    this.animate()
  }

  sceneUpdater ({targetRotation, size}) {
    if (targetRotation) {
      this.targetRotation = targetRotation
      // console.log('- rotation:', targetRotation)

      // 1 full round is 6.28 units
      // 1 face is 1.57 units
      // -0.785 displacement
      this.rotations = Math.floor(Math.abs(targetRotation / this.rotationLength))
      let relativeMovement = Math.abs(Math.abs(targetRotation) - (this.rotationLength * this.rotations))
      // console.log(`-- TotalMove: ${targetRotation} | RelMov: ${relativeMovement} | Rot: ${this.rotations}`)

      let displacement = this.faceLength / 2
      let currentFaceNumber = (relativeMovement + displacement) / this.faceLength
      if (targetRotation<0 && currentFaceNumber >= 1) currentFaceNumber = 5 - currentFaceNumber
      // console.log('-- current face:', currentFaceNumber)
      if (currentFaceNumber >= this.totalFaces) currentFaceNumber = 0
      this.currentFaceNumber = Math.floor(currentFaceNumber)
    }

    if (size) {
      this.windowHalfX = window.innerWidth / 2;
  		this.windowHalfY = window.innerHeight / 2;
  		this.camera.aspect = window.innerWidth / window.innerHeight;
  		this.camera.updateProjectionMatrix();
  		this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
  }

  setEvents () {
    this.cubeEvents = new CubeEvents({
      updater: {
        update: (data) => this.sceneUpdater(data),
        next: () => this.next(),
        prev: () => this.prev()
      },
      size: {
        windowHalfX: this.windowHalfX,
        windowHalfY: this.windowHalfY
      }
    })
  }

  next () {
    // console.log('--> next')
    this.targetRotation += this.faceLength
    this.sceneUpdater({targetRotation: this.targetRotation})
    return this.targetRotation
  }

  prev () {
    // console.log('--> prev')
    this.targetRotation -= this.faceLength
    this.sceneUpdater({targetRotation: this.targetRotation})
    return this.targetRotation
  }

	animate () {
		requestAnimationFrame( () => this.animate() );
		this.renderScene();
	}

  didFaceChanged () {
    if (this.currentFaceNumber !== this.prevFaceNumber) {
      this.prevFaceNumber = this.currentFaceNumber
      return true
    }

    return false
  }

	renderScene () {
		this.plane.rotation.y = this.cube.rotation.y += ( this.targetRotation - this.cube.rotation.y ) * 0.05;
		this.renderer.render( this.scene, this.camera );

    // refresh react view / debounce
    if (!this.refreshTimer && this.didFaceChanged()) {
      this.refreshTimer = setTimeout(() => {
        this.setState({time: new Date()})
        this.refreshTimer = null
      }, 300)
    }
	}

  render () {
    // set active info block, changes with cube rotation
    let activeFaceId = this.facesNumMap[this.currentFaceNumber].id
    let activeFace = this.info.get(activeFaceId)

    return (
      <div>
        <div id="cube">
          <div id="info">Use arrows or drag</div>
        </div>
          {activeFace}
      </div>
    )
  }
}
