import { CdpDestinationHandler } from "../types"

export class GoogleAnalytics implements CdpDestinationHandler {
  async init(config: Record<string, string>): Promise<void> {
    if (!config || !config.measurementId) {
      console.error("Google Analytics measurementId is not provided.")
      return
    }

    const scriptId = "google-analytics-4"

    // Check if the script is already added to avoid duplicates
    if (!document.getElementById(scriptId)) {
      const scriptElement = document.createElement("script")
      scriptElement.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}&l=ga4DataLayer`
      scriptElement.async = true
      scriptElement.type = "text/javascript"
      scriptElement.id = scriptId

      // Append the script to the head
      document.getElementsByTagName("head")[0].appendChild(scriptElement)

      // Return a promise that resolves when the script is loaded
      return new Promise((resolve, reject) => {
        scriptElement.onload = () => {
          console.debug("===GA4 script loaded===")
          ;(window as any).ga4DataLayer = (window as any).ga4DataLayer || []
          ;(window as any).gtag = function (...args: any[]) {
            ;(window as any).ga4DataLayer.push(args)
          }

          // Initialize gtag
          ;(window as any).gtag("js", new Date())
          ;(window as any).gtag("config", config.measurementId)

          // Log success message
          console.info("Google Analytics has been successfully initialized.")
          resolve() // Resolve the promise
        }

        scriptElement.onerror = () => {
          console.error("Failed to load Google Analytics script.")
          reject(new Error("Failed to load Google Analytics script.")) // Reject the promise
        }
      })
    } else {
      console.warn("Google Analytics script is already loaded.")
      return Promise.resolve() // Resolve immediately if the script is already loaded
    }
  }

  track(event: { event: string; properties?: Record<string, any> }): void {
    console.log("===In GA4 track===", event)
    ;(window as any).gtag("event", event.event, event.properties)
  }

  page(event: { event: string; properties?: Record<string, any> }): void {
    console.log("===In GA4 page===", event)
    ;(window as any).gtag("event", event.event, event.properties)
  }

  identify(event: { properties?: Record<string, any> }): void {
    console.log("===In GA4 identify===")
    ;(window as any).gtag("set", "user_properties", event.properties)
  }
}
