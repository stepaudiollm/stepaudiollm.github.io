/** Keep decorative scene loops alive without interrupting their separate audio. */
export function createSceneVideoPlayback({ videos, shouldPlay, stallMs = 8_000 }) {
  let timer = null
  let suspended = false
  let destroyed = false
  const records = videos.filter(Boolean).map(video => ({
    video, pending: null, wanted: false, lastTime: -1, lastFrames: -1,
    progressAt: performance.now(), reloads: 0, retryAt: 0, handlers: [],
  }))

  const wanted = record => !destroyed && !suspended && shouldPlay(record.video)
  const play = record => {
    const { video } = record
    if (!wanted(record) || record.pending || performance.now() < record.retryAt) return
    if (!video.paused && !video.ended) return
    video.muted = true
    try {
      const attempt = Promise.resolve(video.play())
      record.pending = attempt
      attempt.then(() => {
        if (!wanted(record)) video.pause()
      }).catch(() => {
        // A user gesture, canplay, or the bounded recovery below can try again.
        record.retryAt = performance.now() + 1_000
      }).finally(() => {
        if (record.pending === attempt) record.pending = null
      })
    } catch {
      record.retryAt = performance.now() + 1_000
    }
  }

  const sync = ({ userInitiated = false } = {}) => {
    if (destroyed) return
    let active = false
    const now = performance.now()
    records.forEach(record => {
      const { video } = record
      const nextWanted = wanted(record)
      if (!nextWanted) {
        record.wanted = false
        video.pause()
        return
      }
      active = true
      if (userInitiated) {
        record.retryAt = 0
        record.reloads = 0
      }
      if (!record.wanted) {
        record.wanted = true
        record.progressAt = now
        record.reloads = 0
        record.retryAt = 0
      }
      if (!video.getAttribute('src') && video.dataset.src) {
        video.src = video.dataset.src
        video.load()
      }
      play(record)
      const frames = video.getVideoPlaybackQuality?.().totalVideoFrames ?? 0
      const progressed = frames > 0
        ? frames !== record.lastFrames
        : Math.abs(video.currentTime - record.lastTime) > .02
      if (progressed) {
        record.lastTime = video.currentTime
        record.lastFrames = frames
        record.progressAt = now
      } else if ((video.error || video.readyState >= 2) && now - record.progressAt >= stallMs && record.reloads < 2) {
        // A media pipeline can remain "playing" while no frames advance.
        // Reset only this preview, at most twice per activation/user gesture.
        record.reloads += 1
        record.progressAt = now
        record.pending = null
        video.load()
        play(record)
      }
    })
    if (active && !timer) timer = setTimeout(() => { timer = null; sync() }, 1_000)
    if (!active && timer) { clearTimeout(timer); timer = null }
  }

  records.forEach(record => {
    const recover = () => {
      if (wanted(record)) play(record)
    }
    for (const event of ['canplay', 'pause', 'ended']) {
      record.video.addEventListener(event, recover)
      record.handlers.push([event, recover])
    }
  })

  return {
    sync,
    suspend() { suspended = true; sync() },
    resume() { suspended = false; sync() },
    destroy() {
      if (timer) clearTimeout(timer)
      timer = null
      destroyed = true
      records.forEach(({ video, handlers }) => {
        handlers.forEach(([event, handler]) => video.removeEventListener(event, handler))
        video.pause()
      })
    },
  }
}
