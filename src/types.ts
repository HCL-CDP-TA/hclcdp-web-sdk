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
   * Send track events for device session start and end events. Defaults to false. (Optional)
   */
  enableDeviceSessionLogging?: boolean
  /**
   * Send track events for user session start and end events. Defaults to false. (Optional)
   */
  enableUserSessionLogging?: boolean
  /**
   * Send track events for User Login and Logout Events. (Optional)
   */
  enableUserLogoutLogging?: boolean
  /**
   * Callback function called when a device session ends due to inactivity timeout. (Optional)
   */
  onDeviceSessionEnd?: (sessionData: {
    deviceSessionId: string
    userSessionId: string
    reason: "timeout" | "logout"
  }) => void
  /**
   * Callback function called when a user session ends due to login, logout, or timeout. (Optional)
   */
  onUserSessionEnd?: (sessionData: {
    deviceSessionId: string
    userSessionId: string
    reason: "login" | "logout" | "timeout"
  }) => void
  /**
   * Destinations (Optional)
   */
  destinations?: DestinationConfig[]
  /**
   * @deprecated Use enableDeviceSessionLogging instead
   */
  enableSessionLogging?: boolean
}
export interface SessionData {
  deviceSessionId: string | null
  userSessionId: string | null
  deviceId: string | null
}

export interface FullSessionData {
  deviceSessionId: string
  userSessionId: string
  lastActivityTimestamp: number
  sessionStartTimestamp: number
  userSessionStartTimestamp: number
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
  originalTimestamp: number
  messageId: string
  writeKey: string
  // deviceType removed from top level; use context.userAgent.deviceType
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
  session: {
    deviceSessionId: string
    userSessionId: string
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
  geolocation?: {
    latitude: number
    longitude: number
    accuracy: number
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
