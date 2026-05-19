// Wrapper around @imgly/background-removal (browser-only)
// Lazy import to avoid SSR bundling issues.

export async function removeBg(file: File | Blob): Promise<Blob> {
  const { removeBackground } = await import('@imgly/background-removal')
  return await removeBackground(file)
}

export async function fileToDataUrl(file: File | Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
