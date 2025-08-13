import { v4 as uuidv4 } from "uuid"
import { HclCdpConfig } from "./types"

interface SessionData {
  sessionId: string
  lastActivityTimestamp: number // Timestamp of the last user activity
  sessionStartTimestamp: number // Timestamp when the session started
}

export class SessionManager {
  private sessionId: string | null = null
  private inactivityTimeout: number
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null
  private readonly SESSION_DATA = "hclcdp_session"
  private onSessionStart: (sessionId: string) => void
  private onSessionEnd: (sessionId: string) => void

  constructor(
    config: HclCdpConfig,
    onSessionStart?: (sessionId: string) => void,
    onSessionEnd?: (sessionId: string) => void,
  ) {
    this.inactivityTimeout = (config.inactivityTimeout || 30) * 60 * 1000

    // Provide default implementations if callbacks are not provided
    this.onSessionStart =
      onSessionStart ||
      ((sessionId: string) => {
        console.log(`Default: Session started with ID: ${sessionId}`)
      })
    this.onSessionEnd =
      onSessionEnd ||
      ((sessionId: string) => {
        console.log(`Default: Session ended with ID: ${sessionId}`)
      })

    this.initializeSession()
    this.setupActivityListeners()
  }

  private initializeSession() {
    // Retrieve session data from localStorage
    const sessionData = this.getSessionData()

    // Check if the session is still valid
    if (sessionData && this.isSessionValid(sessionData)) {
      this.sessionId = sessionData.sessionId
      this.resetInactivityTimer()
    } else {
      this.startNewSession()
    }
  }
  private getSessionData(): SessionData | null {
    const sessionDataJson = localStorage.getItem(this.SESSION_DATA)
    return sessionDataJson ? JSON.parse(sessionDataJson) : null
  }

  private saveSessionData(sessionData: SessionData) {
    localStorage.setItem(this.SESSION_DATA, JSON.stringify(sessionData))
  }

  private isSessionValid(sessionData: SessionData): boolean {
    const currentTime = Date.now()
    return currentTime - sessionData.lastActivityTimestamp < this.inactivityTimeout
  }

  private generateSessionId(): string {
    return uuidv4()
  }

  private startNewSession() {
    this.sessionId = this.generateSessionId()

    const sessionData: SessionData = {
      sessionId: this.sessionId,
      lastActivityTimestamp: Date.now(),
      sessionStartTimestamp: Date.now(),
    }
    this.saveSessionData(sessionData)
    this.resetInactivityTimer()

    this.onSessionStart(this.sessionId)
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
    localStorage.removeItem(this.SESSION_DATA)
    if (this.sessionId) {
      this.onSessionEnd(this.sessionId)
    }
    this.sessionId = null
  }

  private setupActivityListeners() {
    const activityEvents = ["mousemove", "keydown", "scroll"]
    activityEvents.forEach(event => {
      window.addEventListener(event, () => this.resetInactivityTimer())
    })
  }

  getSessionId(): string | null {
    return this.sessionId
  }

  // Method to force end the current session and start a new one
  forceNewSession(): void {
    if (this.sessionId) {
      this.endSession()
    }
    this.startNewSession()
  }
}
