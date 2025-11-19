# Changelog

## [1.3.2](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/compare/v1.3.1...v1.3.2) (2025-11-19)


### Bug Fixes

* queuein g issue ([ae04d96](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/ae04d9659200dcec33b366c6d2e9e57308d0f5d2))

## [1.3.1](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/compare/v1.3.0...v1.3.1) (2025-11-18)


### Bug Fixes

* session timing & queue fixes ([8c5c336](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/8c5c33667eb6dae63aa74aea1ffaa9589cafc849))

## [1.3.0](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/compare/v1.2.0...v1.3.0) (2025-11-18)


### Features

* added public flushqueue method ([8e673bb](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/8e673bb96f097e358a6d57e62bf996eba077c42b))


### Bug Fixes

* initialize SessionManager before flushing event queue to prevent blank session IDs ([3563b33](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/3563b33d61eea1728638cb3aa8b67cc97a600fab))
* moved deviceId to under context.userAgent ([bfed02a](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/bfed02adc014aa7d5d841c365f7318521df25491))
* removed deviceType at the top level in the payload ([bda1a90](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/bda1a90fac45a043ccea175e901a19659ecf562e))

## [1.2.0](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/compare/v1.1.2...v1.2.0) (2025-11-05)


### Features

* added location tracking ([843e508](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/843e50826373991aea64211d6aa93789842cd8a4))

## [1.1.2](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/compare/v1.1.1...v1.1.2) (2025-10-31)


### Bug Fixes

* create new session when one expires through inactivity ([a429737](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/a4297378818ecd80292870a6f3f17c87cfc64024))

## [1.1.1](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/compare/v1.1.0...v1.1.1) (2025-09-15)


### Bug Fixes

* event logging chagned to json object, not stringified version ([b1afaa7](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/b1afaa7501879e61e09c24f427a203fe880c531f))

## [1.1.0](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/compare/v1.0.1...v1.1.0) (2025-08-28)


### Features

* improved session management with new callbacks for session end ([7bfe598](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/7bfe59889678abc1112d54eef8b8378147eebbfe))

## [1.0.1](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/compare/v1.0.0...v1.0.1) (2025-08-26)


### Bug Fixes

* fix aut-cookie collection for fb/ga etc ([5e72726](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/5e72726ab565f11385a9cf46484fcf6d68e77794))

## [1.0.0](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/compare/v0.2.1...v1.0.0) (2025-08-25)


### ⚠ BREAKING CHANGES

* replace sessionId with userSessionId & deviceSessionId

### Features

* replace sessionId with userSessionId & deviceSessionId ([8786e18](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/8786e184e6dac9116c813bbccaa326884b6899ac))


### Bug Fixes

* build changes ([56ea5ec](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/56ea5ec28e5297574c5c820fa92e5469dcbd4eed))

## [0.2.2](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/compare/v0.2.1...v0.2.2) (2025-08-20)


### Bug Fixes

* build changes ([56ea5ec](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/56ea5ec28e5297574c5c820fa92e5469dcbd4eed))

## [0.2.1](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/compare/v0.2.0...v0.2.1) (2025-08-20)


### Bug Fixes

* logging improvements ([1030925](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/10309259732baaa2770cb8a1d6147922bb7c7482))

## [0.2.0](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/compare/v0.1.2...v0.2.0) (2025-08-15)


### Features

* added enhanced session and identity observability and API access ([ee72cb5](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/ee72cb525c30e3bea46bd2412d9e38b44068beb9))

## [0.1.2](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/compare/v0.1.1...v0.1.2) (2025-08-14)


### Bug Fixes

* build ([83d8915](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/83d8915d807a0697ba781a4207101933a9365fea))

## [0.1.1](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/compare/v0.1.0...v0.1.1) (2025-08-14)


### Bug Fixes

* removed logging & migration ([6dd0389](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/6dd038907ead6371de8a1a9e45351a423410929f))

## [0.1.0](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/compare/v0.0.12...v0.1.0) (2025-08-14)


### Features

* profile_id introduced adding to devce_id which is added as a new id - retained after logout, unlike profile_id ([a30996f](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/a30996f7e1b2344c836254add6aee9da767d33a8))

## [0.0.12](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/compare/v0.0.11...v0.0.12) (2025-08-13)


### Bug Fixes

* session start/end events, new session & deviceid on logout ([891ecbc](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/commit/891ecbcbe4add824400e8e153514a9d00af2c81c))
