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
  /**
   * Destinations (Optional)
   */
  destinations?: DestinationConfig[]
}
export interface SessionData {
  sessionId: string | null
  deviceId: string | null
}

export interface FullSessionData {
  sessionId: string
  lastActivityTimestamp: number
  sessionStartTimestamp: number
}

export interface IdentityData {
  profileId: string
  deviceId: string
  userId: string
}

export interface EventPayload {
  type: string
  event: string
  name?: string
  userId: string
  id: string // This will be the profileId
  deviceId: string
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

export interface DestinationConfig {
  id: string
  classRef: CdpDestinationConstructor
  config: Record<string, string>
  instance?: any
}
export interface CdpDestinationHandler {
  init(config: Record<string, string>): Promise<void>
  track(event: { event: string; properties?: Record<string, any> }): void
  page(event: { event: string; properties?: Record<string, any> }): void
  identify(event: { properties?: Record<string, any> }): void
}

export interface CdpDestinationConstructor {
  new (): CdpDestinationHandler
}
