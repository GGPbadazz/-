import QRCode from 'qrcode'

// Generate QR code as data URL
export const generateQRCode = async (text, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.98,  // 增加质量
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 400,  // 增加尺寸提高清晰度
      scale: 8,    // 增加缩放比例
      ...options
    }
    
    return await QRCode.toDataURL(text, defaultOptions)
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

// Generate simple barcode pattern (Code 128-like representation)
export const generateBarcode = (text, options = {}) => {
  const defaultOptions = {
    width: 500,     // 增加宽度
    height: 120,    // 增加高度
    fontSize: 14,   // 增加字体大小
    color: '#000000',
    backgroundColor: '#FFFFFF',
    productName: '',  // 添加产品名称
    ...options
  }
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  // 设置高DPI支持
  const dpr = window.devicePixelRatio || 1
  canvas.width = defaultOptions.width * dpr
  canvas.height = defaultOptions.height * dpr
  ctx.scale(dpr, dpr)
  
  // 设置抗锯齿
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  
  // Fill background
  ctx.fillStyle = defaultOptions.backgroundColor
  ctx.fillRect(0, 0, defaultOptions.width, defaultOptions.height)
  
  // Draw barcode pattern
  ctx.fillStyle = defaultOptions.color
  
  // Simple barcode pattern generator
  const barPattern = generateBarcodePattern(text)
  const barWidth = (defaultOptions.width - 40) / barPattern.length
  
  for (let i = 0; i < barPattern.length; i++) {
    if (barPattern[i] === '1') {
      ctx.fillRect(20 + i * barWidth, 20, barWidth, defaultOptions.height - 60)
    }
  }
  
  // Draw barcode text
  ctx.fillStyle = defaultOptions.color
  ctx.font = `${defaultOptions.fontSize}px monospace`
  ctx.textAlign = 'center'
  ctx.fillText(text, defaultOptions.width / 2, defaultOptions.height - 35)
  
  // Draw product name if provided
  if (defaultOptions.productName) {
    ctx.font = `${defaultOptions.fontSize - 2}px Arial`
    ctx.fillText(defaultOptions.productName, defaultOptions.width / 2, defaultOptions.height - 15)
  }
  
  return canvas.toDataURL('image/png', 1.0)  // 最高质量
}

// Generate a simple barcode pattern based on text
const generateBarcodePattern = (text) => {
  let pattern = '1010' // Start pattern
  
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i)
    // Simple encoding: use char code to generate pattern
    const charPattern = (charCode % 16).toString(2).padStart(4, '0')
    pattern += charPattern.replace(/0/g, '10').replace(/1/g, '01')
  }
  
  pattern += '1010' // End pattern
  
  return pattern
}

// Generate both QR code and barcode
export const generateBarcodeData = async (text, productName = '') => {
  try {
    const [qrCode, barcode] = await Promise.all([
      generateQRCode(text),
      Promise.resolve(generateBarcode(text, { productName }))
    ])
    
    return {
      qrCode,
      barcode,
      text,
      productName
    }
  } catch (error) {
    console.error('Error generating barcode data:', error)
    throw error
  }
}

// Auto-generate barcode for product if not exists
export const generateProductBarcode = () => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substr(2, 5).toUpperCase()
  // Generate 14-digit barcode
  const barcode = `${timestamp.slice(-6)}${random}`.padEnd(14, '0').substring(0, 14)
  return barcode
}

// Generate SVG barcode
export const generateBarcodeSVG = (text, options = {}) => {
  const defaultOptions = {
    width: 300,     // 合理的SVG尺寸
    height: 120,    // 合理的SVG尺寸
    fontSize: 14,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    productName: '',
    ...options
  }
  
  const pattern = generateBarcodePattern(text)
  const barWidth = (defaultOptions.width - 40) / pattern.length
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${defaultOptions.width}" height="${defaultOptions.height}" viewBox="0 0 ${defaultOptions.width} ${defaultOptions.height}">
    <rect width="100%" height="100%" fill="${defaultOptions.backgroundColor}"/>
  `
  
  // Draw barcode pattern
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '1') {
      svg += `<rect x="${20 + i * barWidth}" y="20" width="${barWidth}" height="${defaultOptions.height - 60}" fill="${defaultOptions.color}"/>
      `
    }
  }
  
  // Add barcode text
  svg += `<text x="${defaultOptions.width / 2}" y="${defaultOptions.height - 35}" text-anchor="middle" font-family="monospace" font-size="${defaultOptions.fontSize}" fill="${defaultOptions.color}">${text}</text>
  `
  
  // Add product name if provided
  if (defaultOptions.productName) {
    svg += `<text x="${defaultOptions.width / 2}" y="${defaultOptions.height - 15}" text-anchor="middle" font-family="Arial" font-size="${defaultOptions.fontSize - 2}" fill="${defaultOptions.color}">${defaultOptions.productName}</text>
    `
  }
  
  svg += `</svg>`
  
  return svg
}

// Generate both QR code and barcode with format options
export const generateBarcodeDataWithFormat = async (text, format = 'png', productName = '') => {
  try {
    const qrCode = await generateQRCode(text)
    let barcode
    
    if (format === 'svg') {
      barcode = 'data:image/svg+xml;base64,' + btoa(generateBarcodeSVG(text, { productName }))
    } else {
      barcode = generateBarcode(text, { productName })
    }
    
    return {
      qrCode,
      barcode,
      text,
      format,
      productName
    }
  } catch (error) {
    console.error('Error generating barcode data:', error)
    throw error
  }
}
