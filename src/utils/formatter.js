/**
 * Formatter utilities — extracted from config.js
 */

export const formatSize = (bytes) => {
  if (bytes >= 1000000024) { bytes = (bytes / 1000000024).toFixed(2) + ' GB' }
  else if (bytes >= 1000024) { bytes = (bytes / 1000024).toFixed(2) + ' MB' }
  else if (bytes >= 1024) { bytes = (bytes / 1024).toFixed(2) + ' KB' }
  else if (bytes > 1) { bytes = bytes + ' bytes' }
  else if (bytes === 1) { bytes = bytes + ' byte' }
  else { bytes = '0 bytes' }
  return bytes
}

export default { formatSize }
