// Album cards share the product audio controller and exclusive playback.
export const initVocalCards = ({ getCopy } = {}) => {
  const cleanups = [...document.querySelectorAll('.vocal-card')].map(card => {
    const status = card.querySelector('[data-vocal-status]')
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
      window.removeEventListener('stepaudio3:product-language-change', sync)
    }
  })
  window.addEventListener('pagehide', () => cleanups.forEach(cleanup => cleanup()), { once: true })
}
