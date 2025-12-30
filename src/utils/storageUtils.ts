// Utility to clean up localStorage and prevent quota exceeded errors

export function cleanupLocalStorage() {
  try {
    // Clean notifications - keep only last 50
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    if (notifications.length > 50) {
      const limited = notifications.slice(0, 50)
      localStorage.setItem('notifications', JSON.stringify(limited))
      console.log(`Cleaned notifications: ${notifications.length} -> ${limited.length}`)
    }

    // Check total localStorage usage
    let totalSize = 0
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        totalSize += localStorage[key].length + key.length
      }
    }
    
    const sizeInMB = (totalSize / 1024 / 1024).toFixed(2)
    console.log(`LocalStorage usage: ${sizeInMB} MB`)
    
    // If over 4MB, clear old data
    if (totalSize > 4 * 1024 * 1024) {
      console.warn('LocalStorage near quota, cleaning up...')
      // Clear notifications completely if too large
      localStorage.setItem('notifications', JSON.stringify([]))
    }
    
    return true
  } catch (error) {
    console.error('Failed to cleanup localStorage:', error)
    return false
  }
}

export function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded, cleaning up...')
      cleanupLocalStorage()
      // Try again after cleanup
      try {
        localStorage.setItem(key, value)
        return true
      } catch {
        console.error('Still failed after cleanup')
        return false
      }
    }
    console.error('Failed to set localStorage item:', error)
    return false
  }
}
