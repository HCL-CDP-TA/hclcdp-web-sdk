import { CdpDestinationHandler } from "../types"

declare global {
  interface Window {
    fbq: ((...args: any[]) => void) & { push?: (...args: any[]) => void }
    _fbq?: (...args: any[]) => void
  }
}

export class Facebook implements CdpDestinationHandler {
  private facebookPixelId: string | undefined

  async init(config: Record<string, string>): Promise<void> {
    if (!config || !config.pixelId) {
      console.error("Facebook Pixel ID is not provided.")
      return
    }

    this.facebookPixelId = config.pixelId
    const scriptId = "facebookPixel"

    // Check if the script is already added to avoid duplicates
    if (!document.getElementById(scriptId)) {
      window._fbq =
        window._fbq ||
        function (...args: any[]) {
          ;(window.fbq as any).callMethod
            ? (window.fbq as any).callMethod.apply(window.fbq, args)
            : (window.fbq as any).queue.push(args)
        }

      window.fbq = window.fbq || window._fbq
      window.fbq.push = window.fbq
      ;(window.fbq as any).loaded = true
      ;(window.fbq as any).disablePushState = true
      ;(window.fbq as any).allowDuplicatePageViews = true
      ;(window.fbq as any).version = "2.0"
      ;(window.fbq as any).queue = []

      console.debug("===In Facebook init===")

      // Initialize Facebook Pixel
      window.fbq("init", this.facebookPixelId)
      // window.fbq("track", "PageView")

      // Add the Facebook Pixel script to the document
      const scriptElement = document.createElement("script")
      scriptElement.type = "text/javascript"
      scriptElement.id = scriptId
      scriptElement.async = true
      scriptElement.src = "https://connect.facebook.net/en_US/fbevents.js"

      const firstScript = document.getElementsByTagName("script")[0]
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(scriptElement, firstScript)
      }

      // Wait for the script to load
      return new Promise((resolve, reject) => {
        scriptElement.onload = () => {
          console.info("Facebook Pixel has been successfully initialized.")
          resolve()
        }

        scriptElement.onerror = () => {
          console.error("Failed to load Facebook Pixel script.")
          reject(new Error("Failed to load Facebook Pixel script."))
        }
      })
    } else {
      console.warn("Facebook Pixel script is already loaded.")
      return Promise.resolve() // Resolve immediately if the script is already loaded
    }
  }

  track(event: { event: string; properties?: Record<string, any> }): void {
    console.log("===In Facebook track===")
    if (typeof window.fbq === "function") {
      window.fbq("track", event.event, event.properties)
    } else {
      console.error("Facebook Pixel is not initialized. Did you call init()?")
    }
  }

  page(event: { event: string; properties?: Record<string, any> }): void {
    console.log("===In Facebook page===")
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView", event.properties)
    } else {
      console.error("Facebook Pixel is not initialized. Did you call init()?")
    }
  }

  identify(event: { properties?: Record<string, any> }): void {
    console.log("===In Facebook identify===")
    if (typeof window.fbq === "function") {
      window.fbq("track", "Identify", event.properties)
    } else {
      console.error("Facebook Pixel is not initialized. Did you call init()?")
    }
  }
}
