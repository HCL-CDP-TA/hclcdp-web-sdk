import { v4 as uuidv4 } from "uuid"
import { HclCdpConfig } from "./types"

interface SessionData {
  deviceSessionId: string
  userSessionId: string
  lastActivityTimestamp: number // Timestamp of the last user activity
  sessionStartTimestamp: number // Timestamp when the device session started
  userSessionStartTimestamp: number // Timestamp when the user session started
}

export class SessionManager {
  private deviceSessionId: string | null = null
  private userSessionId: string | null = null
  private inactivityTimeout: number
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null
  private readonly SESSION_DATA = "hclcdp_session"
  private onDeviceSessionStart: (deviceSessionId: string, userSessionId: string) => void
  private onDeviceSessionEnd: (deviceSessionId: string, userSessionId: string) => void
  private onUserSessionStart: (deviceSessionId: string, userSessionId: string) => void
  private onUserSessionEnd: (deviceSessionId: string, userSessionId: string) => void

  constructor(
    config: HclCdpConfig,
    onDeviceSessionStart?: (deviceSessionId: string, userSessionId: string) => void,
    onDeviceSessionEnd?: (deviceSessionId: string, userSessionId: string) => void,
    onUserSessionStart?: (deviceSessionId: string, userSessionId: string) => void,
    onUserSessionEnd?: (deviceSessionId: string, userSessionId: string) => void,
  ) {
    this.inactivityTimeout = (config.inactivityTimeout || 30) * 60 * 1000

    // Provide default implementations if callbacks are not provided
    this.onDeviceSessionStart =
      onDeviceSessionStart ||
      ((deviceSessionId: string, userSessionId: string) => {
        console.log(`Default: Device session started - Device: ${deviceSessionId}, User: ${userSessionId}`)
      })
    this.onDeviceSessionEnd =
      onDeviceSessionEnd ||
      ((deviceSessionId: string, userSessionId: string) => {
        console.log(`Default: Device session ended - Device: ${deviceSessionId}, User: ${userSessionId}`)
      })
    this.onUserSessionStart =
      onUserSessionStart ||
      ((deviceSessionId: string, userSessionId: string) => {
        console.log(`Default: User session started - Device: ${deviceSessionId}, User: ${userSessionId}`)
      })
    this.onUserSessionEnd =
      onUserSessionEnd ||
      ((deviceSessionId: string, userSessionId: string) => {
        console.log(`Default: User session ended - Device: ${deviceSessionId}, User: ${userSessionId}`)
      })

    this.initializeSession()
    this.setupActivityListeners()
  }

  private initializeSession() {
    // Retrieve session data from localStorage
    const sessionData = this.getSessionData()

    // Check if the session is still valid
    if (sessionData && this.isSessionValid(sessionData)) {
      this.deviceSessionId = sessionData.deviceSessionId
      this.userSessionId = sessionData.userSessionId
      console.log("🔄 Device Session ID loaded from storage:", this.deviceSessionId)
      console.log("🔄 User Session ID loaded from storage:", this.userSessionId)
      this.resetInactivityTimer()
    } else {
      if (sessionData) {
        console.log("⏰ Previous session expired, creating new session")
      }
      this.startNewSession()
    }
  }
  private getSessionData(): SessionData | null {
    const sessionDataJson = sessionStorage.getItem(this.SESSION_DATA)
    return sessionDataJson ? JSON.parse(sessionDataJson) : null
  }

  private saveSessionData(sessionData: SessionData) {
    sessionStorage.setItem(this.SESSION_DATA, JSON.stringify(sessionData))
  }

  private isSessionValid(sessionData: SessionData): boolean {
    const currentTime = Date.now()
    return currentTime - sessionData.lastActivityTimestamp < this.inactivityTimeout
  }

  private generateSessionId(): string {
    return uuidv4()
  }

  private startNewSession() {
    this.deviceSessionId = this.generateSessionId()
    this.userSessionId = this.generateSessionId()
    console.log("✨ New Device Session ID created:", this.deviceSessionId)
    console.log("✨ New User Session ID created:", this.userSessionId)

    const sessionData: SessionData = {
      deviceSessionId: this.deviceSessionId,
      userSessionId: this.userSessionId,
      lastActivityTimestamp: Date.now(),
      sessionStartTimestamp: Date.now(),
      userSessionStartTimestamp: Date.now(),
    }
    this.saveSessionData(sessionData)
    this.resetInactivityTimer()

    this.onDeviceSessionStart(this.deviceSessionId, this.userSessionId)
    this.onUserSessionStart(this.deviceSessionId, this.userSessionId)
  }
  private resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
    }

    this.inactivityTimer = setTimeout(() => {
      this.endSession()
    }, this.inactivityTimeout)

    // Update the last activity timestamp
    const sessionData = this.getSessionData()
    if (sessionData) {
      sessionData.lastActivityTimestamp = Date.now()
      this.saveSessionData(sessionData)
    }
  }

  private endSession() {
    console.log("🔚 Device Session ended:", this.deviceSessionId)
    console.log("🔚 User Session ended:", this.userSessionId)
    sessionStorage.removeItem(this.SESSION_DATA)
    if (this.deviceSessionId && this.userSessionId) {
      this.onDeviceSessionEnd(this.deviceSessionId, this.userSessionId)
      this.onUserSessionEnd(this.deviceSessionId, this.userSessionId)
    }
    this.deviceSessionId = null
    this.userSessionId = null
  }

  private setupActivityListeners() {
    const activityEvents = ["mousemove", "keydown", "scroll"]
    activityEvents.forEach(event => {
      window.addEventListener(event, () => this.resetInactivityTimer())
    })
  }

  getSessionId(): string | null {
    return this.deviceSessionId // For backward compatibility, return device session
  }

  getDeviceSessionId(): string | null {
    return this.deviceSessionId
  }

  getUserSessionId(): string | null {
    return this.userSessionId
  }

  // Get full session data including timestamps
  getFullSessionData(): SessionData | null {
    return this.getSessionData()
  }

  // Method to start a new user session (for login/logout)
  startNewUserSession(): void {
    const oldUserSessionId = this.userSessionId
    this.userSessionId = this.generateSessionId()
    console.log("✨ New User Session ID created:", this.userSessionId)

    const sessionData = this.getSessionData()
    if (sessionData && this.deviceSessionId) {
      // End the previous user session if it existed
      if (oldUserSessionId) {
        this.onUserSessionEnd(this.deviceSessionId, oldUserSessionId)
      }

      sessionData.userSessionId = this.userSessionId
      sessionData.userSessionStartTimestamp = Date.now()
      this.saveSessionData(sessionData)

      // Start the new user session
      this.onUserSessionStart(this.deviceSessionId, this.userSessionId)
    }
  }

  // Method to force end the current session and start a new one
  forceNewSession(): void {
    if (this.deviceSessionId && this.userSessionId) {
      this.endSession()
    }
    this.startNewSession()
  }

  // Method to update the inactivity timeout at runtime
  updateTimeout(timeoutMinutes: number): void {
    this.inactivityTimeout = timeoutMinutes * 60 * 1000
    // Reset the timer with the new timeout
    this.resetInactivityTimer()
  }
}
