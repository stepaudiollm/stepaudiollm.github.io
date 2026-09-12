import { fragmentSource } from './voice-orb-shader.js?v=20260907-transition-color-1'
import { createOrbAudio } from './voice-orb-audio.js?v=20260907-restored-1'
import { createOrbFluid } from './voice-orb-fluid.js?v=20260907-restored-1'

const vertexSource = `
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    uv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

// Shared sRGB ramps for animated orbs and SVG-filtered thumbnails/fallbacks.
const palettes = {
  copper: [[0.17, 0.045, 0.025], [0.82, 0.36, 0.22], [0.99, 0.95, 0.92]],
  rose: [[0.16, 0.035, 0.095], [0.75, 0.32, 0.5], [0.99, 0.94, 0.96]],

  teal: [[0.024, 0.149, 0.165], [0, 0.722, 0.686], [0.945, 0.965, 0.965]],
  ink: [[0.02, 0.043, 0.09], [0.184, 0.447, 0.643], [0.933, 0.953, 0.98]],
  mist: [[0.055, 0.129, 0.22], [0.263, 0.565, 0.816], [0.945, 0.965, 0.988]],
  mint: [[0.035, 0.149, 0.114], [0.243, 0.667, 0.51], [0.949, 0.976, 0.953]],
  lagoon: [[0.022, 0.086, 0.104], [0.105, 0.475, 0.51], [0.927, 0.967, 0.966]],
  frost: [[0.098, 0.155, 0.185], [0.545, 0.733, 0.827], [0.965, 0.983, 0.988]],
  sage: [[0.08, 0.142, 0.125], [0.475, 0.643, 0.584], [0.959, 0.977, 0.964]],
  aqua: [[0.037, 0.163, 0.196], [0.204, 0.737, 0.796], [0.945, 0.984, 0.988]],
  slate: [[0.035, 0.062, 0.118], [0.365, 0.467, 0.627], [0.948, 0.961, 0.982]],
  amber: [[0.16, 0.075, 0.025], [0.78, 0.5, 0.18], [0.99, 0.965, 0.905]],
  lilac: [[0.11, 0.045, 0.19], [0.6, 0.43, 0.78], [0.973, 0.945, 0.99]],
}

const createFlow = (image, anchor) => {
  const palette = palettes[anchor.closest("[data-orb-palette]")?.dataset.orbPalette] || palettes.teal
  const canvas = document.createElement('canvas')
  canvas.className = 'voice-orb-flow'
  canvas.setAttribute('aria-hidden', 'true')
  // Side orbs stop drawing, but hover/click/rail transforms still recomposite them.
  // Keep the actual pixels: the default discarded buffer can repaint as a blank
  // surface even though the canvas node and animation phase never changed.
  const gl = canvas.getContext('webgl', { alpha: false, depth: false, antialias: false, preserveDrawingBuffer: true, powerPreference: 'low-power' })
  if (!gl) return null
  const shaders = [], programs = []
  let buffer, texture, empty, fluid
  const destroy = () => {
    canvas.remove()
    fluid?.destroy()
    shaders.forEach(shader => gl.deleteShader(shader))
    programs.forEach(program => gl.deleteProgram(program))
    if (texture) gl.deleteTexture(texture)
    if (empty) gl.deleteTexture(empty)
    if (buffer) gl.deleteBuffer(buffer)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
  try {
    const makeProgram = (fragment) => {
      const program = gl.createProgram()
      programs.push(program)
      for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragment]]) {
        const shader = gl.createShader(type)
        shaders.push(shader)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader))
        gl.attachShader(program, shader)
      }
      gl.bindAttribLocation(program, 0, 'position')
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Orb program unavailable')
      return program
    }
    const program = makeProgram(fragmentSource)
    buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    const makeTexture = () => {
      const result = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, result)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      return result
    }
    texture = makeTexture()
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    empty = makeTexture()
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]))
    fluid = createOrbFluid(gl, makeProgram, buffer)
    const u = Object.fromEntries(['material', 'fluidMap', 'time', 'audio', 'cumulative', 'paletteLow', 'paletteMid', 'paletteHigh'].map(key => [key, gl.getUniformLocation(program, key)]))
    anchor.after(canvas)
    return {
      canvas,
      draw(phase, average, cumulative, delta = 0, bands = [0, 0, 0, 0]) {
        if (gl.isContextLost()) { canvas.hidden = true; return }
        const size = Math.round(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2))
        if (!size) return
        if (canvas.width !== size || canvas.height !== size) canvas.width = canvas.height = size
        if (delta > 0) fluid?.step(delta, bands)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, size, size)
        gl.useProgram(program)
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, fluid?.texture || empty)
        gl.uniform1i(u.material, 0); gl.uniform1i(u.fluidMap, 1)
        gl.uniform1f(u.time, phase)
        gl.uniform4fv(u.audio, average); gl.uniform4fv(u.cumulative, cumulative)
        gl.uniform3fv(u.paletteLow, palette[0])
        gl.uniform3fv(u.paletteMid, palette[1])
        gl.uniform3fv(u.paletteHigh, palette[2])
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        canvas.dataset.rendered = 'true'
      },
      destroy,
    }
  } catch {
    destroy()
    return null
  }
}

export const initVoiceOrbFlow = (root, slides) => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const instances = new Map()
  const audio = createOrbAudio(root)
  let visible = !('IntersectionObserver' in window)
  let frame = null, last = null, disposed = false
  let transitioning = false, transitionRevision = 0
  const animate = () => visible && !document.hidden && !reduced.matches && !disposed
    && [...instances.values()].some(instance => instance.renderer)

  const tick = (now) => {
    frame = null
    if (!animate()) { last = null; return }
    // Preserve each surface throughout a rail transition; resume from that exact
    // phase after movement, even when navigation is repeated rapidly.
    if (transitioning) {
      last = null
      frame = window.requestAnimationFrame(tick)
      return
    }
    const delta = last === null ? 0 : Math.min((now - last) / 1000, 0.05)
    last = now
    instances.forEach((instance, slide) => {
      // Side orbs keep their last rendered frame; selection resumes the same material.
      if (!instance.renderer || !slide.classList.contains('is-active')) return
      const bands = audio.sample(instance.media)
      for (let i = 0; i < 4; i++) {
        instance.average[i] += (bands[i] - instance.average[i]) * (1 - Math.pow(0.45, delta * 60))
        instance.cumulative[i] += bands[i] * delta * 21
      }
      instance.phase += delta * 1.4
      instance.renderer.draw(instance.phase, instance.average, instance.cumulative, delta, bands)
    })
    frame = window.requestAnimationFrame(tick)
  }

  const wake = () => {
    if (animate() && frame === null) frame = window.requestAnimationFrame(tick)
    else if (!animate()) {
      if (frame !== null) window.cancelAnimationFrame(frame)
      frame = null
      last = null
    }
  }
  const syncMotion = () => {
    instances.forEach(instance => {
      if (!reduced.matches && !instance.renderer) instance.renderer = createFlow(instance.image, instance.anchor)
      if (instance.renderer) {
        instance.renderer.canvas.hidden = reduced.matches
        if (!reduced.matches) instance.renderer.draw(instance.phase, instance.average, instance.cumulative)
      }
    })
    wake()
  }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    wake()
  }, { threshold: 0.01 }) : null
  observer?.observe(root)
  document.addEventListener('visibilitychange', wake)
  reduced.addEventListener('change', syncMotion)
  window.addEventListener('pagehide', () => {
    disposed = true
    wake()
    observer?.disconnect()
    document.removeEventListener('visibilitychange', wake)
    reduced.removeEventListener('change', syncMotion)
    instances.forEach(instance => instance.renderer?.destroy())
    instances.clear()
    audio.destroy()
  }, { once: true })

  return {
    release(slide) {
      instances.get(slide)?.renderer?.destroy()
      instances.delete(slide)
      wake()
    },
    holdTransition() {
      const revision = ++transitionRevision
      transitioning = true
      last = null
      // Follow actual CSS completion, not a wall-clock estimate: a busy browser
      // may start composition later. Superseded transitions cannot release a new hold.
      const movement = root.getAnimations({ subtree: true }).filter(animation =>
        animation.effect?.target?.matches?.('[data-voice-orb-slide]'))
      void Promise.allSettled(movement.map(animation => animation.finished)).then(() => {
        if (revision === transitionRevision) transitioning = false
      })
    },
    async prepare(slide, anchor, retry = false) {
      const image = new Image()
      const url = new URL(anchor.src)
      url.pathname = url.pathname.replace(/\.png$/, '-texture.webp')
      if (retry) url.searchParams.set('retry', String(Date.now()))
      image.src = url.href
      await image.decode()
      if (disposed) return
      instances.get(slide)?.renderer?.destroy()
      instances.set(slide, {
        image, anchor, media: slide.querySelector('audio'), renderer: null, phase: 0,
        average: new Float32Array(4), cumulative: new Float32Array(4),
      })
      syncMotion()
    },
  }
}
