const urls = new Set<string>()

export const objectUrlManager = {
  create(object: Blob | File): string {
    const url = URL.createObjectURL(object)
    urls.add(url)
    return url
  },

  revoke(url: string) {
    if (!urls.has(url)) return
    URL.revokeObjectURL(url)
    urls.delete(url)
  },

  revokeAll() {
    for (const url of urls) {
      URL.revokeObjectURL(url)
    }
    urls.clear()
  },
}
