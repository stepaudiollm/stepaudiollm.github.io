// Selection shows the written input; only the dedicated transport starts audio.
export const initVocalCards = ({ getCopy, playerController } = {}) => {
  const cards = [...document.querySelectorAll('.vocal-card')]
  const syncDetails = () => window.stepAudioProductCopy.syncVocalDetails()
  const select = card => {
    cards.forEach(item => item.classList.toggle('is-selected', item === card))
    syncDetails()
  }
  const stage = document.querySelector('.vocal-card-grid')
  const move = direction => {
    playerController.pauseAll()
    const index = cards.findIndex(card => card.classList.contains('is-selected'))
    select(cards[(index + direction + cards.length) % cards.length])
  }
  const onKey = event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    move(event.key === 'ArrowLeft' ? -1 : 1)
    cards.find(card => card.classList.contains('is-selected')).querySelector('[data-vocal-select]').focus({ preventScroll: true })
  }


  stage.addEventListener('keydown', onKey)
  const cleanups = cards.map(card => {
    const status = card.querySelector('[data-vocal-status]')
    const onClick = event => {
      // The capture phase selects the card before the audio controller handles play.
      if (!card.classList.contains('is-selected')) {
        playerController.pauseAll()
        select(card)
      }
    }
    card.addEventListener('click', onClick, true)
    const sync = () => {
      const copy = getCopy()
      const message = card.classList.contains('is-error') ? copy.loadFailed
        : card.classList.contains('is-loading') ? copy.loading : ''
      if (status.textContent !== message) status.textContent = message
    }
    const observer = new MutationObserver(sync)
    observer.observe(card, { attributes: true, attributeFilter: ['class'] })
    window.addEventListener('stepaudio3:product-language-change', sync)
    sync()
    return () => {
      observer.disconnect()
      card.removeEventListener('click', onClick, true)
      window.removeEventListener('stepaudio3:product-language-change', sync)
    }
  })
  window.addEventListener('stepaudio3:product-language-change', syncDetails)
  syncDetails()
  window.addEventListener('pagehide', () => {


    stage.removeEventListener('keydown', onKey)
    cleanups.forEach(cleanup => cleanup())
    window.removeEventListener('stepaudio3:product-language-change', syncDetails)
  }, { once: true })
}
