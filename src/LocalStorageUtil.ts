class LocalStorageUtil {
  private static readonly PAGE_QUEUE_KEY = "hcl_cdp_page_queue"
  private static readonly TRACK_QUEUE_KEY = "hcl_cdp_track_queue"
  private static readonly IDENTIFY_QUEUE_KEY = "hcl_cdp_identify_queue"

  static getQueue(key: string): any[] {
    const queue = localStorage.getItem(key)
    return queue ? JSON.parse(queue) : []
  }

  static addToQueue(key: string, event: any): void {
    const queue = this.getQueue(key)
    queue.push(event)
    localStorage.setItem(key, JSON.stringify(queue))
  }

  static clearQueue(key: string): void {
    localStorage.removeItem(key)
  }
}
