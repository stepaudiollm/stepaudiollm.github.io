// One shared context, one source per media element. The analysis branch never
// changes volume; the source connects directly to the output exactly once.
export const createOrbAudio = (root) => {
  const tracks = new Map()
  let context = null
  const ensure = (media) => {
    if (!media) return
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      context ||= new AudioContext()
      if (context.state === 'suspended') void context.resume().catch(() => {})
      if (tracks.has(media)) return
      const analyser = context.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      const source = context.createMediaElementSource(media)
      source.connect(context.destination)
      source.connect(analyser)
      tracks.set(media, { analyser, source, bins: new Uint8Array(analyser.frequencyBinCount) })
    } catch {
      // Unsupported analysis leaves ordinary media playback available.
    }
  }
  const onGesture = (event) => {
    const slide = event.target.closest?.('.voice-orb-slide.is-active')
    if (slide && event.target.closest('[data-player-toggle], [data-player-waveform]')) ensure(slide.querySelector('audio'))
  }
  const onPlay = (event) => { if (event.target.matches('audio')) ensure(event.target) }
  root.addEventListener('click', onGesture, true)
  root.addEventListener('play', onPlay, true)
  return {
    sample(media) {
      const track = tracks.get(media)
      if (!track || media.paused || media.ended || context.state !== 'running') return [0, 0, 0, 0]
      const { analyser, bins } = track
      analyser.getByteFrequencyData(bins)
      const band = (low, high) => {
        const bin = context.sampleRate / analyser.fftSize
        const start = Math.min(bins.length - 1, Math.round(low / bin))
        const end = Math.min(bins.length - 1, Math.round(high / bin))
        let sum = 0
        for (let i = start; i <= end; i++) sum += bins[i]
        return sum / ((end - start + 1) * 255)
      }
      return [band(0, 200), band(200, 2000), band(2000, 20000), band(0, context.sampleRate / 2)]
    },
    destroy() {
      root.removeEventListener('click', onGesture, true)
      root.removeEventListener('play', onPlay, true)
      tracks.forEach(({ source, analyser }) => { source.disconnect(); analyser.disconnect() })
      tracks.clear()
      if (context) void context.close().catch(() => {})
    },
  }
}
