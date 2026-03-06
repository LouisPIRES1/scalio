'use client'

import { useEffect } from 'react'

export function ExtensionCleaner() {
  useEffect(() => {
    const remove = () => {
      document.querySelectorAll(
        '[id*="notion"],[class*="notion"],[id*="clipper"],[id*="1password"],[id*="lastpass"],[id*="bitwarden"]'
      ).forEach((el) => el.remove())
    }

    remove()

    const observer = new MutationObserver(remove)
    observer.observe(document.body, { childList: true, subtree: false })

    return () => observer.disconnect()
  }, [])

  return null
}
