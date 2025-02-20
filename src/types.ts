/**
 * CDP Configuration
 */
export interface HclCdpConfig {
  /**
   * The write key to use for the CDP source. (Required)
   */
  writeKey: string
  /**
   * The endpoint to use for the CDP instance. (Required)
   */
  cdpEndpoint: string
  /**
   * Default session timeout. Defaults to 30 minutes. (Optional)
   */
  inactivityTimeout?: number
  /**
   * Send track events for session start and end events. Defaults to false. (Optional)
   */
  enableSessionLogging?: boolean
  /**
   * Send track events for User Login and Logout Events. (Optional)
   */
  enableUserLogoutLogging?: boolean
}
export interface SessionData {
  sessionId: string | null
  deviceId: string | null
}

export interface EventPayload {
  type: string
  event: string
  name?: string
  userId: string
  id: string
  sessionId: string
  originalTimestamp: number
  messageId: string
  writeKey: string
  deviceType: string
  context: EventContext
  properties?: Record<string, any>
  customerProperties?: Record<string, any>
  otherIds?: Record<string, string>
  // [key: string]: string | number
}
export interface EventContext {
  library: {
    name: string
    type: string
    version?: string
  }
  userAgent: {
    deviceType: string
    osType: string
    osVersion: string
    browser: string
    ua: string
  }
  page?: {
    path: string
    title: string
    referrer: string
    url: string
    search: string
  }
  utm?: {
    [key: string]: string
  }
}
