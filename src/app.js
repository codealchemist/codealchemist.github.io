import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169/build/three.module.js'

const canvas = document.getElementById('scene')
const themeToggle = document.getElementById('theme-toggle')
const themeToggleLabel = themeToggle?.querySelector('.theme-toggle-label')
const themeColorMeta = document.querySelector('meta[name="theme-color"]')

if (!canvas) {
  throw new Error('Expected #scene canvas to exist.')
}

const THEME_STORAGE_KEY = 'theme-preference'
const DEFAULT_THEME = 'dark'

const themes = {
  dark: {
    metaThemeColor: '#000000',
    toggle: {
      label: 'Light theme',
      ariaLabel: 'Switch to light theme'
    },
    scene: {
      fog: 0x170d08,
      ambientColor: 0xc49a7b,
      ambientIntensity: 1.1,
      keyColor: 0xe0ad84,
      keyIntensity: 1.45,
      rimColor: 0x9f6a45,
      rimIntensity: 0.8,
      materialRoughness: 0.56,
      materialMetalness: 0.12,
      emissive: 0x1a0e08,
      shadowColor: 0x2f1a10,
      shadowOpacity: 0.44,
      particleColor: 0xc99267,
      edgeColor: 0xe3ae82
    },
    face: {
      gradientStops: [
        { offset: 0, hue: 22, saturation: 50, lightness: 19 },
        { offset: 0.52, hue: 16, saturation: 38, lightness: 12 },
        { offset: 1, hue: 10, saturation: 34, lightness: 8 }
      ],
      iconStroke: '#e5b487',
      iconFill: 'rgba(229, 180, 135, 0.12)',
      iconGlyph: '#f3deca',
      orbFill: 'rgba(223, 167, 122, 0.08)',
      frameStroke: 'rgba(214, 163, 123, 0.34)',
      kickerChip: 'rgba(203, 147, 104, 0.2)',
      kickerText: '#dfad84',
      titleText: '#f4dfcb',
      lineText: '#d2a27b',
      divider: 'rgba(212, 161, 120, 0.22)',
      detailText: '#e0c6ad',
      ctaFill: 'rgba(165, 107, 70, 0.24)',
      ctaText: '#f0ba8f'
    }
  },
  light: {
    metaThemeColor: '#fcf7f2',
    toggle: {
      label: 'Dark theme',
      ariaLabel: 'Switch to dark theme'
    },
    scene: {
      fog: 0xf0e3d6,
      ambientColor: 0xf5e4d4,
      ambientIntensity: 1.35,
      keyColor: 0xd39a70,
      keyIntensity: 1.2,
      rimColor: 0xad6d45,
      rimIntensity: 0.42,
      materialRoughness: 0.62,
      materialMetalness: 0.06,
      emissive: 0xf2ddc8,
      shadowColor: 0xd8c0aa,
      shadowOpacity: 0.32,
      particleColor: 0xbd7d4f,
      edgeColor: 0xad683d
    },
    face: {
      gradientStops: [
        { offset: 0, hue: 32, saturation: 48, lightness: 92 },
        { offset: 0.52, hue: 26, saturation: 40, lightness: 86 },
        { offset: 1, hue: 22, saturation: 34, lightness: 78 }
      ],
      iconStroke: '#a4683f',
      iconFill: 'rgba(164, 104, 63, 0.08)',
      iconGlyph: '#4c2917',
      orbFill: 'rgba(181, 131, 91, 0.09)',
      frameStroke: 'rgba(166, 108, 68, 0.26)',
      kickerChip: 'rgba(177, 117, 75, 0.14)',
      kickerText: '#91552f',
      titleText: '#341b0f',
      lineText: '#7d5134',
      divider: 'rgba(165, 111, 74, 0.18)',
      detailText: '#68442f',
      ctaFill: 'rgba(159, 95, 53, 0.12)',
      ctaText: '#8f512c'
    }
  }
}

function readStoredTheme() {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    return storedTheme && themes[storedTheme] ? storedTheme : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

let currentThemeName = readStoredTheme()

if (document.body) {
  document.body.dataset.theme = currentThemeName
}

if (themeColorMeta) {
  themeColorMeta.setAttribute(
    'content',
    themes[currentThemeName].metaThemeColor
  )
}

const CLICK_THRESHOLD = 9
const FACE_ROTATION_STEP = Math.PI / 2
const DRAG_STEP_PIXELS = window.innerWidth < 640 ? 40 : 64
const ROTATION_LERP = 0.045
const FACE_LOCK_THRESHOLD = 0.008
const FACE_LOCK_LERP = 0.35
const UPSIDE_DOWN_HYSTERESIS = 0.08

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)

const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(themes[currentThemeName].scene.fog, 0.05)

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)
// Adjust camera distance based on viewport aspect ratio
// On mobile/narrow screens, move camera further to fit cube
const getOptimalCameraDistance = () => {
  const aspect = window.innerWidth / window.innerHeight
  if (aspect < 0.6) return 7.2 // Very narrow (phones)
  if (aspect < 0.8) return 6.5 // Narrow (phones)
  return 5.3 // Desktop/tablet
}
camera.position.set(0, 0.25, getOptimalCameraDistance())

const ambient = new THREE.AmbientLight(
  themes[currentThemeName].scene.ambientColor,
  themes[currentThemeName].scene.ambientIntensity
)
scene.add(ambient)

const key = new THREE.DirectionalLight(
  themes[currentThemeName].scene.keyColor,
  themes[currentThemeName].scene.keyIntensity
)
key.position.set(2.5, 3.2, 4.1)
scene.add(key)

const rim = new THREE.DirectionalLight(
  themes[currentThemeName].scene.rimColor,
  themes[currentThemeName].scene.rimIntensity
)
rim.position.set(-4, -1.6, -2.2)
scene.add(rim)

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''

  words.forEach(word => {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate
    } else {
      if (line) {
        lines.push(line)
      }
      line = word
    }
  })

  if (line) {
    lines.push(line)
  }

  return lines
}

function drawIcon(ctx, face, palette) {
  ctx.save()
  ctx.translate(512, 270)
  ctx.lineWidth = 16
  ctx.strokeStyle = palette.iconStroke
  ctx.fillStyle = palette.iconFill

  if (face.icon === 'spark') {
    ctx.beginPath()
    ctx.moveTo(0, -70)
    ctx.lineTo(18, -18)
    ctx.lineTo(70, 0)
    ctx.lineTo(18, 18)
    ctx.lineTo(0, 70)
    ctx.lineTo(-18, 18)
    ctx.lineTo(-70, 0)
    ctx.lineTo(-18, -18)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  } else if (face.icon === 'brackets') {
    ctx.beginPath()
    ctx.moveTo(-72, -60)
    ctx.lineTo(-110, 0)
    ctx.lineTo(-72, 60)
    ctx.moveTo(72, -60)
    ctx.lineTo(110, 0)
    ctx.lineTo(72, 60)
    ctx.moveTo(18, -78)
    ctx.lineTo(-18, 78)
    ctx.stroke()
  } else if (face.icon === 'ring') {
    ctx.beginPath()
    ctx.arc(0, 0, 72, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 0, 28, 0, Math.PI * 2)
    ctx.fill()
  } else if (face.icon === 'github') {
    ctx.beginPath()
    ctx.arc(0, 0, 78, 0, Math.PI * 2)
    ctx.stroke()
    ctx.font = '700 88px "Space Grotesk", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = palette.iconGlyph
    ctx.fillText('</>', 0, 6)
  } else if (face.icon === 'linkedin') {
    ctx.strokeRect(-76, -76, 152, 152)
    ctx.font = '700 92px Manrope, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = palette.iconGlyph
    ctx.fillText('in', 0, 8)
  } else if (face.icon === 'social') {
    ctx.beginPath()
    ctx.moveTo(-86, 10)
    ctx.quadraticCurveTo(0, -74, 86, 10)
    ctx.quadraticCurveTo(0, 84, -86, 10)
    ctx.stroke()
  }

  ctx.restore()
}

function makeFaceTexture(face, hueShift = 0, palette) {
  const texCanvas = document.createElement('canvas')
  texCanvas.width = 1024
  texCanvas.height = 1024
  const ctx = texCanvas.getContext('2d')
  if (!ctx) {
    throw new Error('Unable to create face texture context.')
  }

  const gradient = ctx.createLinearGradient(0, 0, 1024, 1024)
  palette.gradientStops.forEach(stop => {
    gradient.addColorStop(
      stop.offset,
      `hsl(${stop.hue + hueShift}, ${stop.saturation}%, ${stop.lightness}%)`
    )
  })
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1024, 1024)

  ctx.fillStyle = palette.orbFill
  ctx.beginPath()
  ctx.arc(820, 190, 180, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(220, 820, 220, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = palette.frameStroke
  ctx.lineWidth = 18
  ctx.strokeRect(42, 42, 940, 940)

  ctx.fillStyle = palette.kickerChip
  ctx.fillRect(96, 104, 210, 44)

  ctx.fillStyle = palette.kickerText
  ctx.textAlign = 'left'
  ctx.font = '600 28px "Space Grotesk", sans-serif'
  ctx.fillText(face.kicker.toUpperCase(), 112, 136)

  drawIcon(ctx, face, palette)

  ctx.fillStyle = palette.titleText
  ctx.textAlign = 'left'
  ctx.font = '700 84px "Space Grotesk", sans-serif'
  ctx.fillText(face.title, 110, 480)

  ctx.fillStyle = palette.lineText
  ctx.font = '500 46px Manrope, sans-serif'
  ctx.fillText(face.lineOne, 110, 570)
  ctx.fillText(face.lineTwo, 110, 640)

  ctx.strokeStyle = palette.divider
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(110, 705)
  ctx.lineTo(914, 705)
  ctx.stroke()

  ctx.fillStyle = palette.detailText
  ctx.font = '500 34px Manrope, sans-serif'
  wrapText(ctx, face.detail, 804)
    .slice(0, 3)
    .forEach((line, index) => {
      ctx.fillText(line, 110, 780 + index * 52)
    })

  if (face.url) {
    ctx.fillStyle = palette.ctaFill
    ctx.fillRect(110, 900, 300, 58)
    ctx.fillStyle = palette.ctaText
    ctx.font = '600 28px "Space Grotesk", sans-serif'
    ctx.fillText('CLICK TO OPEN', 136, 937)
  }

  const texture = new THREE.CanvasTexture(texCanvas)
  texture.anisotropy = 4
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

const faceData = [
  {
    kicker: 'GitHub',
    title: 'codealchemist',
    lineOne: 'Public code',
    lineTwo: 'Experiments and builds',
    detail:
      'Open my GitHub profile to browse repositories, prototypes and shared work.',
    url: 'https://github.com/codealchemist',
    action: 'Open GitHub profile',
    icon: 'github'
  },
  {
    kicker: 'LinkedIn',
    title: 'albertomiranda',
    lineOne: 'Professional history',
    lineTwo: 'Roles and background',
    detail:
      'Open LinkedIn for a concise view of experience, collaborations, and past roles.',
    url: 'https://linkedin.com/in/albertomiranda',
    action: 'Open LinkedIn profile',
    icon: 'linkedin'
  },
  {
    kicker: 'Open Source',
    title: 'Builder',
    lineOne: 'Code sharing',
    lineTwo: 'WebTorrent Desktop',
    detail:
      'I loved contributing to open source and collaborating on useful software with strong community value.',
    url: 'https://webtorrent.io/desktop',
    action: 'Open WebTorrent Desktop',
    icon: 'ring'
  },
  {
    kicker: 'Contact',
    title: "Let's build",
    lineOne: 'Best first contact',
    lineTwo: 'Reach out on LinkedIn',
    detail:
      'If you want to collaborate, hire, or discuss a product idea, LinkedIn is the best place to start.',
    url: 'https://linkedin.com/in/albertomiranda',
    action: 'Start a conversation on LinkedIn',
    icon: 'social'
  },
  {
    kicker: 'Front',
    title: "Hi! I'm Bert 🤚",
    lineOne: 'Software Developer',
    lineTwo: 'Focused on the web',
    detail:
      'I build thoughtful web experiences with code, clear UX, human collaboration and some magic 🪄',
    action: 'Rotate to explore each face.',
    icon: 'spark'
  },
  {
    kicker: 'About',
    title: 'Web Alchemist',
    lineOne: 'Interfaces with intent',
    lineTwo: 'Performance in mind',
    detail:
      'I enjoy turning ideas into fast, useful, and human digital products.',
    action: 'Use arrow keys to snap to each side.',
    icon: 'brackets'
  }
]

const materials = faceData.map((face, index) => {
  const texture = makeFaceTexture(
    face,
    index * 7,
    themes[currentThemeName].face
  )
  return new THREE.MeshStandardMaterial({
    map: texture,
    roughness: themes[currentThemeName].scene.materialRoughness,
    metalness: themes[currentThemeName].scene.materialMetalness,
    emissive: new THREE.Color(themes[currentThemeName].scene.emissive),
    emissiveIntensity: 0
  })
})

const cube = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), materials)
scene.add(cube)

const shadowFloor = new THREE.Mesh(
  new THREE.CircleGeometry(2.8, 64),
  new THREE.MeshBasicMaterial({
    color: themes[currentThemeName].scene.shadowColor,
    transparent: true,
    opacity: themes[currentThemeName].scene.shadowOpacity
  })
)
shadowFloor.rotation.x = -Math.PI / 2
shadowFloor.position.y = -1.7
scene.add(shadowFloor)

const particleGeo = new THREE.BufferGeometry()
const particleCount = 260
const positions = new Float32Array(particleCount * 3)

for (let i = 0; i < particleCount; i += 1) {
  const i3 = i * 3
  positions[i3] = (Math.random() - 0.5) * 16
  positions[i3 + 1] = (Math.random() - 0.2) * 6
  positions[i3 + 2] = (Math.random() - 0.5) * 12
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
const particles = new THREE.Points(
  particleGeo,
  new THREE.PointsMaterial({
    color: themes[currentThemeName].scene.particleColor,
    size: 0.045,
    transparent: true,
    opacity: 0.42
  })
)
scene.add(particles)

const faceNormals = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1)
]

const faceUpVectors = [
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, -1),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 1, 0)
]

const cameraDirection = new THREE.Vector3()
const worldNormal = new THREE.Vector3()
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const edgeBaseNormal = new THREE.Vector3(0, 0, 1)
const edgeQuaternion = new THREE.Quaternion()
const worldFaceUp = new THREE.Vector3()
const faceUpsideDownState = [false, false, false, false, false, false]

let activeFaceIndex = -1
let isDragging = false
let pointerMoved = false
let prevX = 0
let prevY = 0
let downX = 0
let downY = 0
let dragAccX = 0
let dragAccY = 0

const targetQuaternion = new THREE.Quaternion()
const turnQuaternion = new THREE.Quaternion()
const cameraForward = new THREE.Vector3()
const cameraUp = new THREE.Vector3()
const cameraRight = new THREE.Vector3()

const faceEdgeGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-1.08, -1.08, 0),
  new THREE.Vector3(1.08, -1.08, 0),
  new THREE.Vector3(1.08, 1.08, 0),
  new THREE.Vector3(-1.08, 1.08, 0)
])
const faceEdgeMaterial = new THREE.LineBasicMaterial({
  color: themes[currentThemeName].scene.edgeColor,
  transparent: true,
  opacity: 0,
  toneMapped: false
})
const clickableFaceEdge = new THREE.LineLoop(faceEdgeGeometry, faceEdgeMaterial)
clickableFaceEdge.visible = false
cube.add(clickableFaceEdge)

materials.forEach(material => {
  if (material.map) {
    material.map.center.set(0.5, 0.5)
    material.map.rotation = 0
  }
})

function applyTheme(themeName) {
  const nextThemeName = themes[themeName] ? themeName : DEFAULT_THEME
  const theme = themes[nextThemeName]

  currentThemeName = nextThemeName
  document.body.dataset.theme = nextThemeName

  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', theme.metaThemeColor)
  }

  if (themeToggleLabel) {
    themeToggleLabel.textContent = theme.toggle.label
  }

  if (themeToggle) {
    themeToggle.setAttribute('aria-label', theme.toggle.ariaLabel)
    themeToggle.setAttribute('aria-pressed', String(nextThemeName === 'light'))
  }

  scene.fog.color.setHex(theme.scene.fog)
  ambient.color.setHex(theme.scene.ambientColor)
  ambient.intensity = theme.scene.ambientIntensity
  key.color.setHex(theme.scene.keyColor)
  key.intensity = theme.scene.keyIntensity
  rim.color.setHex(theme.scene.rimColor)
  rim.intensity = theme.scene.rimIntensity

  shadowFloor.material.color.setHex(theme.scene.shadowColor)
  shadowFloor.material.opacity = theme.scene.shadowOpacity
  particles.material.color.setHex(theme.scene.particleColor)
  faceEdgeMaterial.color.setHex(theme.scene.edgeColor)

  materials.forEach((material, index) => {
    const previousTexture = material.map
    const texture = makeFaceTexture(faceData[index], index * 7, theme.face)
    texture.center.set(0.5, 0.5)
    texture.rotation = previousTexture?.rotation ?? 0
    material.map = texture
    material.roughness = theme.scene.materialRoughness
    material.metalness = theme.scene.materialMetalness
    material.emissive.setHex(theme.scene.emissive)
    material.needsUpdate = true

    if (previousTexture) {
      previousTexture.dispose()
    }
  })

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextThemeName)
  } catch {}
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    applyTheme(currentThemeName === 'dark' ? 'light' : 'dark')
  })
}

applyTheme(currentThemeName)

function getClosestFaceIndex() {
  camera.getWorldDirection(cameraDirection)
  cameraDirection.multiplyScalar(-1).normalize()

  let bestDot = -Infinity
  let bestIndex = 0

  faceNormals.forEach((normal, index) => {
    worldNormal.copy(normal).applyQuaternion(cube.quaternion).normalize()
    const dot = worldNormal.dot(cameraDirection)
    if (dot > bestDot) {
      bestDot = dot
      bestIndex = index
    }
  })

  return bestIndex
}

function setCanvasLinkState(isLink) {
  canvas.classList.toggle('is-link', isLink && !isDragging)
}

function updateClickableFaceEdge(index) {
  const isLinked = Boolean(faceData[index]?.url)
  clickableFaceEdge.visible = isLinked
  if (!isLinked) {
    faceEdgeMaterial.opacity = 0
    return
  }

  const normal = faceNormals[index].clone().normalize()
  edgeQuaternion.setFromUnitVectors(edgeBaseNormal, normal)
  clickableFaceEdge.quaternion.copy(edgeQuaternion)
  clickableFaceEdge.position.copy(normal.multiplyScalar(1.104))
}

function updateFaceCopy(index) {
  if (index === activeFaceIndex || !faceData[index]) {
    setCanvasLinkState(Boolean(faceData[activeFaceIndex]?.url))
    return
  }

  activeFaceIndex = index
  const activeFace = faceData[index]

  setCanvasLinkState(Boolean(activeFace.url))
  updateClickableFaceEdge(index)
}

function detectActiveFace() {
  const closestFace = getClosestFaceIndex()
  updateFaceCopy(closestFace)
}

function updateAllFaceReadability() {
  const projectedCamUp = new THREE.Vector3()

  materials.forEach((material, index) => {
    if (!material?.map) {
      return
    }

    // Get face's world orientation
    const faceUp = faceUpVectors[index]
      .clone()
      .applyQuaternion(cube.quaternion)
      .normalize()
    const faceNormal = faceNormals[index]
      .clone()
      .applyQuaternion(cube.quaternion)
      .normalize()
    const faceRight = new THREE.Vector3()
      .crossVectors(faceNormal, faceUp)
      .normalize()

    // Get camera's up direction
    const camUp = camera.up.clone().normalize()

    // Project camera up onto face plane (remove component perpendicular to face)
    projectedCamUp.copy(camUp)
    const dotNorm = projectedCamUp.dot(faceNormal)
    projectedCamUp.addScaledVector(faceNormal, -dotNorm).normalize()

    // Express projected camera up in face's local coordinates
    const x = projectedCamUp.dot(faceRight)
    const y = projectedCamUp.dot(faceUp)
    let angle = -Math.atan2(y, x) - 180

    // Find the best 90-degree rotation (0, π/2, π, 3π/2)
    let bestRotation = 0
    let bestDot = -Infinity

    const rotations = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]
    rotations.forEach(rot => {
      const alignment = Math.cos(angle - rot)
      if (alignment > bestDot) {
        bestDot = alignment
        bestRotation = rot
      }
    })

    if (Math.abs(material.map.rotation - bestRotation) > 0.01) {
      material.map.rotation = bestRotation
    }
  })
}

function queueQuarterTurn(stepX, stepY) {
  camera.getWorldDirection(cameraForward)
  cameraUp.copy(camera.up).normalize()
  cameraRight.crossVectors(cameraForward, cameraUp).normalize()

  // Build accumulated turn quaternion in world space
  const accumulatedTurn = new THREE.Quaternion()

  if (stepY !== 0) {
    // Horizontal drag/key turn around camera up axis.
    turnQuaternion.setFromAxisAngle(cameraUp, stepY * FACE_ROTATION_STEP)
    accumulatedTurn.multiply(turnQuaternion)
  }

  if (stepX !== 0) {
    // Vertical drag/key turn around camera right axis.
    turnQuaternion.setFromAxisAngle(cameraRight, stepX * FACE_ROTATION_STEP)
    accumulatedTurn.multiply(turnQuaternion)
  }

  // Apply accumulated turn to target in world space
  targetQuaternion.premultiply(accumulatedTurn)
}

function setPointerFromEvent(event) {
  const bounds = canvas.getBoundingClientRect()
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
}

function tryOpenFaceLink(event) {
  setPointerFromEvent(event)
  raycaster.setFromCamera(pointer, camera)
  const hit = raycaster.intersectObject(cube)[0]
  if (!hit || !hit.face) {
    return
  }

  const faceIndex = hit.face.materialIndex
  const face = faceData[faceIndex]
  if (face?.url) {
    window.open(face.url, '_blank', 'noopener,noreferrer')
  }
}

function onPointerDown(event) {
  isDragging = true
  pointerMoved = false
  prevX = event.clientX
  prevY = event.clientY
  downX = event.clientX
  downY = event.clientY
  dragAccX = 0
  dragAccY = 0
  setCanvasLinkState(false)
  canvas.setPointerCapture(event.pointerId)
}

function onPointerMove(event) {
  if (!isDragging) {
    return
  }

  const dx = event.clientX - prevX
  const dy = event.clientY - prevY
  prevX = event.clientX
  prevY = event.clientY

  if (
    Math.hypot(event.clientX - downX, event.clientY - downY) > CLICK_THRESHOLD
  ) {
    pointerMoved = true
  }

  // Keep drag direction mapped directly to screen direction, but rotate face-by-face.
  dragAccX += dx
  dragAccY += dy

  const stepDeltaY = (dragAccX / DRAG_STEP_PIXELS) | 0
  const stepDeltaX = (dragAccY / DRAG_STEP_PIXELS) | 0

  if (stepDeltaY !== 0) {
    queueQuarterTurn(0, stepDeltaY)
    dragAccX -= stepDeltaY * DRAG_STEP_PIXELS
  }
  if (stepDeltaX !== 0) {
    queueQuarterTurn(stepDeltaX, 0)
    dragAccY -= stepDeltaX * DRAG_STEP_PIXELS
  }
}

function onPointerUp(event) {
  if (!isDragging) {
    return
  }

  isDragging = false
  if (!pointerMoved) {
    tryOpenFaceLink(event)
  }
  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId)
  }
  setCanvasLinkState(Boolean(faceData[activeFaceIndex]?.url))
}

canvas.addEventListener('pointerdown', onPointerDown)
canvas.addEventListener('pointermove', onPointerMove)
canvas.addEventListener('pointerup', onPointerUp)
canvas.addEventListener('pointercancel', onPointerUp)

window.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    queueQuarterTurn(0, -1)
    event.preventDefault()
  } else if (event.key === 'ArrowRight') {
    queueQuarterTurn(0, 1)
    event.preventDefault()
  } else if (event.key === 'ArrowUp') {
    queueQuarterTurn(-1, 0)
    event.preventDefault()
  } else if (event.key === 'ArrowDown') {
    queueQuarterTurn(1, 0)
    event.preventDefault()
  } else if (event.key === 'Enter') {
    const activeFace = faceData[activeFaceIndex]
    if (activeFace?.url) {
      window.open(activeFace.url, '_blank', 'noopener,noreferrer')
      event.preventDefault()
    }
  }
})

window.addEventListener('resize', () => {
  const newAspect = window.innerWidth / window.innerHeight
  camera.aspect = newAspect
  camera.position.z = getOptimalCameraDistance()
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const clock = new THREE.Clock()

function updateMaterialGlow(elapsed) {
  const isActiveLinked = Boolean(faceData[activeFaceIndex]?.url)
  const targetOpacity = isActiveLinked
    ? 0.52 + Math.sin(elapsed * 4.1) * 0.09
    : 0
  faceEdgeMaterial.opacity += (targetOpacity - faceEdgeMaterial.opacity) * 0.2
}

function animate() {
  const elapsed = clock.getElapsedTime()
  const quaternionDelta = cube.quaternion.angleTo(targetQuaternion)
  const quaternionLerp =
    quaternionDelta < FACE_LOCK_THRESHOLD ? FACE_LOCK_LERP : ROTATION_LERP

  cube.quaternion.slerp(targetQuaternion, quaternionLerp)

  if (quaternionDelta < 0.0025) {
    cube.quaternion.copy(targetQuaternion)
  }

  cube.position.y = Math.sin(elapsed * 0.9) * 0.07

  particles.rotation.y = elapsed * 0.03
  particles.position.y = Math.sin(elapsed * 0.22) * 0.12

  updateAllFaceReadability()
  detectActiveFace()
  updateMaterialGlow(elapsed)

  renderer.render(scene, camera)
  window.requestAnimationFrame(animate)
}

updateFaceCopy(getClosestFaceIndex())
targetQuaternion.copy(cube.quaternion)
updateAllFaceReadability()
animate()
