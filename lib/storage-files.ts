/**
 * IndexedDB storage for plan files (PDF, images).
 * Persists across browser sessions — unlike sessionStorage blob URLs.
 */

const DB_NAME = 'constor_files'
const STORE_NAME = 'plan_files'
const DB_VERSION = 1

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Save or replace the file for a given plan. */
export async function savePlanFile(planId: string, data: Blob, mime: string): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put({ data, mime }, planId)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    // Silently fail — app still works without persistence
  }
}

/**
 * Load the file for a given plan.
 * Returns a fresh blob URL (must be revoked after use) or null if not found.
 */
export async function loadPlanFile(planId: string): Promise<{ url: string; mime: string } | null> {
  if (typeof indexedDB === 'undefined') return null
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(planId)
      req.onsuccess = () => {
        if (!req.result) return resolve(null)
        const { data, mime } = req.result as { data: Blob; mime: string }
        resolve({ url: URL.createObjectURL(data), mime })
      }
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

/** Delete the file for a given plan (e.g. when the plan is deleted). */
export async function deletePlanFile(planId: string): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(planId)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {}
}
