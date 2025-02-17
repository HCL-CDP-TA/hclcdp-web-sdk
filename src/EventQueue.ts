class EventQueue {
  public static readonly PAGE_QUEUE_KEY = "hcl_cdp_page_queue"
  public static readonly TRACK_QUEUE_KEY = "hcl_cdp_track_queue"
  public static readonly IDENTIFY_QUEUE_KEY = "hcl_cdp_identify_queue"

  static addToQueue(queueKey: string, payload: any): void {
    const queue = this.getQueue(queueKey)
    queue.push(payload)
    localStorage.setItem(queueKey, JSON.stringify(queue))
  }

  static getQueue(queueKey: string): any[] {
    const queue = localStorage.getItem(queueKey)
    return queue ? JSON.parse(queue) : []
  }

  static clearQueue(queueKey: string): void {
    localStorage.removeItem(queueKey)
  }

  static flushQueue(queueKey: string, method: Function): void {
    const queue = this.getQueue(queueKey)
    queue.forEach(payload => {
      try {
        switch (queueKey) {
          case EventQueue.PAGE_QUEUE_KEY:
            method(payload.pageName, payload.properties, payload.otherIds)
            break
          case EventQueue.TRACK_QUEUE_KEY:
            method(payload.eventName, payload.properties, payload.otherIds)
            break
          case EventQueue.IDENTIFY_QUEUE_KEY:
            method(payload.userId, payload.properties, payload.otherIds)
            break
        }
      } catch (error) {
        console.error(`Error flushing ${queueKey} event:`, error)
      }
    })
    this.clearQueue(queueKey)
  }
}
export default EventQueue
