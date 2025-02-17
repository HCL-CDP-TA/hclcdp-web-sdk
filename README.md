## HCL CDP Web/JS SDK

This repository contains the HCL CDP Web SDK, which provides a set of tools and components to integrate with the HCL Customer Data Platform (CDP). For those wanting to integrate using a React/Nextjs application, use the hclcdp-web-sdk-react

### Installation

To install the HCL CDP Web SDK for React, you can use npm or yarn:

```bash
npm install hclcdp-web-sdk
```

or

```bash
yarn add hclcdp-web-sdk
```

### Usage

Here's an example of how to use the HCL CDP Web SDK - replace with endpoint and writeKey suitable for your environment.

## Usage without React

```typescript
"use client"
import Link from "next/link"
import { HclCdp } from "hclcdp-web-sdk"
import type { HclCdpConfig } from "hclcdp-web-sdk"
import { useEffect } from "react"

export default function Raw() {
  useEffect(() => {
    const config: HclCdpConfig = {
      writeKey: "<writekey>",
      inactivityTimeout: 1,
      enableSessionLogging: false,
      enableUserLogoutLogging: false,
      cdpEndpoint: "<endpoint>",
    }

    HclCdp.init(config, () => {
      console.log("cdp initialized")
      HclCdp.page("Raw Home Page")
    })
  })

  return (
    <div>
      <h1>HCL CDP JS SDK without React</h1>
      <button
        onClick={() => {
          HclCdp.track("button_click")
        }}>
        Track
      </button>
      <button
        onClick={() => {
          HclCdp.identify("johnsmith")
        }}>
        Identity
      </button>
      <button
        onClick={() => {
          HclCdp.logout()
        }}>
        Logout
      </button>
      {}
      <p>
        <Link href="/react">React</Link>
      </p>
    </div>
  )
}
```
