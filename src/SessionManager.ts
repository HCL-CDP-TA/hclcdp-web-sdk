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
  private config: HclCdpConfig
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
    this.config = config
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
      // Call internal SDK callbacks
      this.onDeviceSessionEnd(this.deviceSessionId, this.userSessionId)
      this.onUserSessionEnd(this.deviceSessionId, this.userSessionId)

      // Call user-provided callbacks for timeout
      if (this.config.onDeviceSessionEnd) {
        this.config.onDeviceSessionEnd({
          deviceSessionId: this.deviceSessionId,
          userSessionId: this.userSessionId,
          reason: "timeout",
        })
      }
      if (this.config.onUserSessionEnd) {
        this.config.onUserSessionEnd({
          deviceSessionId: this.deviceSessionId,
          userSessionId: this.userSessionId,
          reason: "timeout",
        })
      }

      // Call hook callbacks
      this.callHookCallbacks("timeout")
    }
    this.deviceSessionId = null
    this.userSessionId = null
  }

  private callHookCallbacks(reason: "timeout" | "login" | "logout") {
    if (typeof window !== "undefined" && (window as any).HclCdp?.instance?._hookCallbacks) {
      const hookCallbacks = (window as any).HclCdp.instance._hookCallbacks
      const sessionData = {
        deviceSessionId: this.deviceSessionId || "",
        userSessionId: this.userSessionId || "",
        reason,
      }

      hookCallbacks.forEach((callback: any) => {
        try {
          if (callback.onDeviceSessionEnd) {
            callback.onDeviceSessionEnd(sessionData)
          }
          if (callback.onUserSessionEnd) {
            callback.onUserSessionEnd(sessionData)
          }
        } catch (error) {
          console.error("Error calling hook callback:", error)
        }
      })
    }
  }

  private setupActivityListeners() {
    const activityEvents = ["mousemove", "keydown", "scroll"]
    activityEvents.forEach(event => {
      window.addEventListener(event, () => this.resetInactivityTimer())
    })
  }

  // Ensures a valid session exists, creating a new one if expired
  private ensureValidSession(): void {
    const sessionData = this.getSessionData()

    // If no session data exists or session is expired, create new session
    if (!sessionData || !this.isSessionValid(sessionData)) {
      if (sessionData) {
        console.log("⏰ Session expired, creating new session for this event")
      }
      this.startNewSession()
    } else if (!this.deviceSessionId || !this.userSessionId) {
      // Session data exists in storage but not in memory (shouldn't happen, but safety check)
      this.deviceSessionId = sessionData.deviceSessionId
      this.userSessionId = sessionData.userSessionId
    }
  }

  getSessionId(): string | null {
    this.ensureValidSession()
    return this.deviceSessionId // For backward compatibility, return device session
  }

  getDeviceSessionId(): string | null {
    this.ensureValidSession()
    return this.deviceSessionId
  }

  getUserSessionId(): string | null {
    this.ensureValidSession()
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
        // Call internal SDK callback
        this.onUserSessionEnd(this.deviceSessionId, oldUserSessionId)

        // Call user-provided callback for login (which ends previous session)
        if (this.config.onUserSessionEnd) {
          this.config.onUserSessionEnd({
            deviceSessionId: this.deviceSessionId,
            userSessionId: oldUserSessionId,
            reason: "login",
          })
        }

        // Call hook callbacks for login
        this.callHookCallbacks("login")
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

  // Method to handle user logout (ends user session but keeps device session)
  logout(): void {
    if (this.deviceSessionId && this.userSessionId) {
      const currentUserSessionId = this.userSessionId

      // Call user-provided callback for logout
      if (this.config.onUserSessionEnd) {
        this.config.onUserSessionEnd({
          deviceSessionId: this.deviceSessionId,
          userSessionId: currentUserSessionId,
          reason: "logout",
        })
      }

      // Call hook callbacks for logout
      this.callHookCallbacks("logout")

      // Start a new user session (this will internally call onUserSessionEnd for the old session)
      this.startNewUserSession()
    }
  }

  updateConfig(newConfig: HclCdpConfig): void {
    this.config = newConfig
    this.inactivityTimeout = (newConfig.inactivityTimeout || 30) * 60 * 1000
  }
}
