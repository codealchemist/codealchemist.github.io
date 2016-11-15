let obj
const keyMap = {
  ArrowRight: () => obj.updater.next(),
  ArrowLeft: () => obj.updater.prev()
}
const events = {
  onDocumentMouseDown: (event) => {
		event.preventDefault()
		document.addEventListener( 'mousemove', events.onDocumentMouseMove, false )
		document.addEventListener( 'mouseup', events.onDocumentMouseUp, false )
		document.addEventListener( 'mouseout', events.onDocumentMouseOut, false )
		obj.mouseXOnMouseDown = event.clientX - obj.windowHalfX
		obj.targetRotationOnMouseDown = obj.targetRotation
	},

  onDocumentMouseMove: (event) => {
		obj.mouseX = event.clientX - obj.windowHalfX
		obj.targetRotation = obj.targetRotationOnMouseDown + ( obj.mouseX - obj.mouseXOnMouseDown ) * 0.02
    obj.updater.update({targetRotation: obj.targetRotation})
	},

	onDocumentMouseUp: (event) => {
		document.removeEventListener( 'mousemove', events.onDocumentMouseMove, false )
		document.removeEventListener( 'mouseup', events.onDocumentMouseUp, false )
		document.removeEventListener( 'mouseout', events.onDocumentMouseOut, false )
	},

	onDocumentMouseOut: (event) => {
		document.removeEventListener( 'mousemove', events.onDocumentMouseMove, false )
		document.removeEventListener( 'mouseup', events.onDocumentMouseUp, false )
		document.removeEventListener( 'mouseout', events.onDocumentMouseOut, false )
	},

	onDocumentTouchStart: (event) => {
		if ( event.touches.length === 1 ) {
			event.preventDefault()
			obj.mouseXOnMouseDown = event.touches[ 0 ].pageX - obj.windowHalfX
			obj.targetRotationOnMouseDown = obj.targetRotation
		}
	},

	onDocumentTouchMove: (event) => {
		if ( event.touches.length === 1 ) {
			event.preventDefault()
			obj.mouseX = event.touches[ 0 ].pageX - obj.windowHalfX
			obj.targetRotation = obj.targetRotationOnMouseDown + ( obj.mouseX - obj.mouseXOnMouseDown ) * 0.05
      obj.updater.update({targetRotation: obj.targetRotation})
		}
	},

  onDocumentKeyDown: (event) => {
    // console.log('-- KEY DOWN', event.code)
    let code = event.code
    if (!(code in keyMap)) return
    let x = keyMap[code]()
    obj.targetRotation = x
  },

  onWindowResize: (event) => {
    obj.updater.update({size: {
      windowHalfX: window.innerWidth / 2,
      windowHalfY: window.innerHeight / 2
    }})
	}
}

export default class CubeEvents {
  constructor ({updater, size}) {
    this.updater = updater
    this.windowHalfX = size.windowHalfX
    this.windowHalfY = size.windowHalfY
    this.targetRotation = 0
    this.targetRotationOnMouseDown = 0
		this.mouseX = 0
		this.mouseXOnMouseDown = 0

    this.init()
  }

  init () {
    obj = this
    document.addEventListener('mousedown', events.onDocumentMouseDown, false)
		document.addEventListener('touchstart', events.onDocumentTouchStart, false)
		document.addEventListener('touchmove', events.onDocumentTouchMove, false)
    document.addEventListener('keydown', events.onDocumentKeyDown, false)
    window.addEventListener('resize', events.onWindowResize, false)
  }
}
