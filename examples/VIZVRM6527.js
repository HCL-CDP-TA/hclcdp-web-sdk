!(function () {
  "use strict"
  var e = {
      zpgimm1j76dntmdfvryq: [
        {
          srcId: 1126,
          WriteKey: "zpgimm1j76dntmdfvryq",
          ConfigJson: { name: "GA4 Destination", type: "web", measurement_id: "G-32WV69RBZ4" },
          CDPDestinationId: 19,
          Id: 6527,
          VizVrmId: "VIZVRM6527",
          DestinationStatus: "ACTIVE",
          DestinationInstanceId: 900,
        },
      ],
    },
    t = {
      indentity: {
        Id: 6186,
        CampaignId: 6527,
        EventName: "indentity",
        EventDescription: "indentity",
        EventType: "track",
        EventProperties: '[{"name":"product","description":"productViewed","type":"STRING"}]',
        AllowedDestinationInstanceList: "[900]",
        IsActive: 1,
        Type: null,
        LemEventName: null,
        CreatedBy: 3642,
        UpdatedBy: 3554,
        CreatedOn: "2024-07-04T13:56:04.000Z",
        UpdatedOn: "2024-08-22T14:54:13.000Z",
        TransformerFunction: null,
      },
      "test Event": {
        Id: 6187,
        CampaignId: 6527,
        EventName: "test Event",
        EventDescription: "",
        EventType: "track",
        EventProperties: '[{"name":"test property","description":"test","type":"JSON"}]',
        AllowedDestinationInstanceList: "[]",
        IsActive: 0,
        Type: null,
        LemEventName: null,
        CreatedBy: 3618,
        UpdatedBy: 3618,
        CreatedOn: "2024-07-08T16:08:40.000Z",
        UpdatedOn: "2024-07-08T16:09:47.000Z",
        TransformerFunction: {},
      },
      term_life_insurance_acquire: {
        Id: 6190,
        CampaignId: 6527,
        EventName: "term_life_insurance_acquire",
        EventDescription: "term_life_insurance_acquire",
        EventType: "track",
        EventProperties:
          '[{"name":"userAction","description":"userAction","type":"STRING"},{"name":"product","description":"product","type":"STRING"}]',
        AllowedDestinationInstanceList: "[899]",
        IsActive: 0,
        Type: null,
        LemEventName: null,
        CreatedBy: 3554,
        UpdatedBy: 3642,
        CreatedOn: "2024-07-24T14:44:17.000Z",
        UpdatedOn: "2024-08-13T06:45:07.000Z",
        TransformerFunction: {
          899: {
            page: 'function transformEvents(event) { return { "eventName": event.name, "properties" : event.properties }}',
            track:
              'function transformEvents(event) { return { "eventName": event.event, "properties" : event.properties }}',
          },
        },
      },
      Test: {
        Id: 6198,
        CampaignId: 6527,
        EventName: "Test",
        EventDescription: "Test",
        EventType: "track",
        EventProperties:
          '[{"name":"userAction","description":"userAction","type":"STRING"},{"name":"page","description":"productViewed","type":"STRING"}]',
        AllowedDestinationInstanceList: "[899]",
        IsActive: 0,
        Type: null,
        LemEventName: null,
        CreatedBy: 3616,
        UpdatedBy: 3642,
        CreatedOn: "2024-08-07T05:34:26.000Z",
        UpdatedOn: "2024-08-13T06:45:09.000Z",
        TransformerFunction: {
          899: {
            page: 'function transformEvents(event) { return { "eventName": event.name, "properties" : event.properties }}',
            track:
              'function transformEvents(event) { return { "eventName": event.event, "properties" : event.properties }}',
          },
        },
      },
      car_insurance_acquire: {
        Id: 6201,
        CampaignId: 6527,
        EventName: "car_insurance_acquire",
        EventDescription: "car_insurance_acquire",
        EventType: "track",
        EventProperties:
          '[{"name":"userAction","description":"userAction","type":"STRING"},{"name":"product","description":"product","type":"STRING"}]',
        AllowedDestinationInstanceList: "[900]",
        IsActive: 1,
        Type: null,
        LemEventName: null,
        CreatedBy: 3554,
        UpdatedBy: 3642,
        CreatedOn: "2024-08-13T06:45:24.000Z",
        UpdatedOn: "2024-09-18T10:01:46.000Z",
        TransformerFunction: null,
      },
    }
  let n = "1"
  const i = {
    setLogLevel(e) {
      switch (e.toUpperCase()) {
        case "INFO":
          return void (n = 1)
        case "DEBUG":
          return void (n = 2)
        case "WARN":
          n = 3
      }
    },
    info() {
      n <= 1 && console.log(...arguments)
    },
    debug() {
      n <= 2 && console.log(...arguments)
    },
    warn() {
      n <= 3 && console.log(...arguments)
    },
    error() {
      n <= 4 && console.log(...arguments)
    },
  }
  class a {
    constructor(e) {
      this.FacebookPixelId = e
    }
    init() {
      ;(window._fbq = function () {
        window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments)
      }),
        (window.fbq = window.fbq || window._fbq),
        (window.fbq.push = window.fbq),
        (window.fbq.loaded = !0),
        (window.fbq.disablePushState = !0),
        (window.fbq.allowDuplicatePageViews = !0),
        (window.fbq.version = "2.0"),
        (window.fbq.queue = []),
        i.debug("===In facebook init==="),
        window.fbq("init", this.FacebookPixelId),
        window.fbq("track", "PageView")
      var e = document.createElement("script")
      ;(e.type = "text/javascript"),
        (e.id = "facebookPixel"),
        (e.async = !0),
        (e.src = "https://connect.facebook.net/en_US/fbevents.js")
      const t = document.getElementsByTagName("script")[0]
      t.parentNode.insertBefore(e, t)
    }
    page(e) {
      i.debug("===In facebook page==="), window.fbq("page", e.event, e.properties)
    }
    track(e) {
      i.debug("===In facebook track==="), window.fbq("track", e.event, e.properties)
    }
    identify(e) {
      i.debug("===In facebook identify==="), window.fbq("identify", e.userId, e.properties)
    }
  }
  class o {
    constructor(e) {
      this.quoraPixelId = e
    }
    init() {
      i.debug("===In quora init===")
      var e = document.createElement("script")
      ;(e.type = "text/javascript"),
        (e.text = `!function(e,t,n,c,a,p){e.qp||((c=e.qp=function(){c.qp?c.qp.apply(c,arguments):c.queue.push(arguments)}).queue=[],(a=document.createElement(t)).async=!0,a.src="https://a.quora.com/qevents.js",(p=document.getElementsByTagName(t)[0]).parentNode.insertBefore(a,p))}(window,"script"),qp("init", "${this.quoraPixelId}"),qp("track","ViewContent");`)
      document.getElementsByTagName("head")[0].appendChild(e)
    }
    track(e) {
      i.debug("===In quora track==="), window.qp("track", e.event)
    }
  }
  class r {
    constructor(e) {
      this.conversionId = e
    }
    init() {
      !(function (e, t, n) {
        const i = n.createElement("script")
        ;(i.src = t), (i.async = 1), (i.type = "text/javascript"), (i.id = "googleAds-integration")
        n.getElementsByTagName("head")[0].appendChild(i)
      })(0, `https://www.googletagmanager.com/gtag/js?id=${this.conversionId}`, document),
        i.debug("===In gAds init==="),
        (window.dataLayer = window.dataLayer || []),
        (window.gtag = function () {
          window.dataLayer.push(arguments)
        }),
        window.gtag("js", new Date()),
        window.gtag("config", this.conversionId)
    }
    track(e) {
      i.debug("===In gAds track==="), window.gtag("event", e.event, e.properties)
    }
    page(e) {
      i.debug("===In gAds page==="), window.gtag("event", e.event, e.properties)
    }
    identify(e) {
      i.debug("[GoogleAds] identify:: method not supported")
    }
  }
  const s = (e, t, n = true) => {
    i.debug(`in script loader=== ${e}`)
    const a = document.createElement("script")
    ;(a.src = t), (a.async = void 0 === n || n), (a.type = "text/javascript"), (a.id = e)
    const o = document.getElementsByTagName("head")
    if (0 !== o.length) i.debug("==adding script==", a), o[0].insertBefore(a, o[0].firstChild)
    else {
      const e = document.getElementsByTagName("script")[0]
      i.debug("==parent script==", e), i.debug("==adding script==", a), e.parentNode.insertBefore(a, e)
    }
  }
  class c {
    constructor(e) {
      this.accountId = e
    }
    init() {
      i.debug("===in init Clevertap===")
      const e =
        "https:" == document.location.protocol
          ? "https://d2r1yp2w7bby2u.cloudfront.net/js/a.js"
          : "http://static.clevertap.com/js/a.js"
      ;(window.clevertap = { event: [], profile: [], account: [], onUserLogin: [], notifications: [], privacy: [] }),
        window.clevertap.account.push({ id: this.accountId }),
        window.clevertap.privacy.push({ optOut: !1 }),
        window.clevertap.privacy.push({ useIP: !1 }),
        s("clevertap-integration", e)
    }
    identify(e) {
      i.debug("in clevertap identify"), window.clevertap.onUserLogin.push({ Site: e.properties })
    }
    track(e) {
      i.debug("in clevertap track"), window.clevertap.event.push(e.event, e.properties)
    }
    page(e) {
      i.debug("in clevertap page"), window.clevertap.event.push(e.event, e.properties)
    }
  }
  class d {
    constructor(e) {
      this.siteId = e
    }
    init() {
      var e, t, n, a
      i.debug("===In init Hotjar==="),
        (window.hotjarSiteId = this.siteId),
        (e = window),
        (t = document),
        (e.hj =
          e.hj ||
          function () {
            ;(e.hj.q = e.hj.q || []).push(arguments)
          }),
        (e._hjSettings = { hjid: e.hotjarSiteId, hjsv: 6 }),
        (n = t.getElementsByTagName("head")[0]),
        ((a = t.createElement("script")).async = 1),
        (a.src = "https://static.hotjar.com/c/hotjar-" + e._hjSettings.hjid + ".js?sv=" + e._hjSettings.hjsv),
        n.appendChild(a),
        (this._ready = !0)
    }
    identify(e) {
      i.debug("===In Hotjar identify==="), window.hj("identify", e.userId, e.properties)
    }
    track(e) {
      i.debug("===In Hotjar track==="), window.hj("event", e.event, e.properties)
    }
    page() {
      i.debug("===In Hotjar page==="), i.debug("[Hotjar] page:: method not supported")
    }
  }
  class l {
    constructor(e) {
      this.trackingID = e
    }
    init() {
      i.debug("===in init GA==="),
        (window.GoogleAnalyticsObject = "ga"),
        (window.ga =
          window.ga ||
          function () {
            ;(window.ga.q = window.ga.q || []), window.ga.q.push(arguments)
          }),
        (window.ga.l = new Date().getTime()),
        s("ga", "https://www.google-analytics.com/analytics.js"),
        window.ga("create", this.trackingID, "auto")
    }
    identify(e) {
      i.debug("===In GA identify==="), window.ga(e.userId, e.properties)
    }
    track(e) {
      i.debug("===In GA track==="), window.ga(e.event, e.properties)
    }
    page(e) {
      i.debug("===In GA page==="), window.ga(e.event, e.properties)
    }
  }
  class p {
    constructor(e) {
      this.measurementId = e
    }
    init() {
      !(function (e, t, n) {
        const i = n.createElement("script")
        ;(i.src = t), (i.async = 1), (i.type = "text/javascript"), (i.id = "google-analytics 4")
        n.getElementsByTagName("head")[0].appendChild(i)
      })(0, `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}&l=ga4DataLayer`, document),
        i.debug("===In GA4 init==="),
        (window.ga4DataLayer = window.ga4DataLayer || []),
        (window.gtag = function () {
          window.ga4DataLayer.push(arguments)
        }),
        window.gtag("js", new Date()),
        window.gtag("config", this.measurementId)
    }
    identify(e) {
      i.debug("===In GA4 identify==="), window.gtag("set", "user_properties", e.properties)
    }
    track(e) {
      i.debug("===In GA4 track==="), window.gtag("event", e.event, e.properties)
    }
    page(e) {
      i.debug("===In GA4 page==="), window.gtag("event", e.event, e.properties)
    }
  }
  class u {
    constructor(e) {
      this.partnerId = e
    }
    init() {
      i.debug("===in init LinkedIn Insight Tag==="),
        s("LinkedIn Insight Tag", "https://snap.licdn.com/li.lms-analytics/insight.min.js"),
        this.partnerId && (window._linkedin_data_partner_id = this.partnerId)
    }
    identify(e) {
      i.debug("===In linkedin identify===")
    }
    track(e) {
      i.debug("===In linkedin track===")
    }
    page(e) {
      i.debug("===In linkedin page===")
    }
  }
  class m {
    constructor(e) {
      this.accountId = e
    }
    init() {
      const e = this.accountId
      i.debug("===In tiktok init==="),
        (function (t, n, i) {
          t.TiktokAnalyticsObject = i
          var a = (t[i] = t[i] || [])
          ;(a.methods = ["page", "track", "identify"]),
            (a.setAndDefer = function (e, t) {
              e[t] = function () {
                e.push([t].concat(Array.prototype.slice.call(arguments, 0)))
              }
            })
          for (var o = 0; o < a.methods.length; o++) a.setAndDefer(a, a.methods[o])
          ;(a.instance = function (e) {
            for (var t = a._i[e] || [], n = 0; n < a.methods.length; n++) a.setAndDefer(t, a.methods[n])
            return t
          }),
            (a.load = function (e, t) {
              var o = "https://analytics.tiktok.com/i18n/pixel/events.js"
              ;(a._i = a._i || {}),
                (a._i[e] = []),
                (a._i[e]._u = o),
                (a._t = a._t || {}),
                (a._t[e] = +new Date()),
                (a._o = a._o || {}),
                (a._o[e] = t || {})
              var r = n.createElement("script")
              ;(r.type = "text/javascript"), (r.async = !0), (r.src = o + "?sdkid=" + e + "&lib=" + i)
              var s = n.getElementsByTagName("script")[0]
              s.parentNode.insertBefore(r, s)
            }),
            a.load(e),
            a.page()
        })(window, document, "ttq")
    }
    identify(e) {
      i.debug("===In Tiktok identify==="), window.ttq.identify(e.event, e)
    }
    track(e) {
      i.debug("===In Tiktok track==="), window.ttq.track(e.event, e)
    }
    page(e) {
      i.debug("===In Tiktok page==="), window.ttq.page(e.event, e)
    }
  }
  class g {
    constructor(e) {
      this.accountId = e
    }
    init() {
      i.debug("===in init criteo==="),
        this.accountId
          ? ((window.criteo_q = window.criteo_q || []),
            s("Criteo", `//dynamic.criteo.com/js/ld/ld.js?a=${this.accountId}`),
            window.criteo_q.push({ event: "setAccount", account: this.accountId }))
          : i.debug("Account ID missing")
    }
    identify(e) {
      i.debug("in criteo identify")
    }
    track(e) {
      i.debug("in criteo track"), window.criteo_q.push(e)
    }
    page(e) {
      i.debug("in criteo page"), window.criteo_q.push(e)
    }
  }
  class f {
    constructor(e) {
      this.accountId = e
    }
    init() {
      ;(window._tfa = window._tfa || []),
        i.debug("===In taboola init==="),
        window._tfa.push({ notify: "event", name: "page_view", id: this.accountId })
      const e = `//cdn.taboola.com/libtrc/unip/${this.accountId}/tfa.js`
      !(function (e, t, n) {
        if (!e.getElementById(n)) {
          const i = e.createElement("script")
          ;(i.async = 1), (i.type = "text/javascript"), (i.src = t), (i.id = n)
          e.getElementsByTagName("head")[0].appendChild(i)
        }
      })(document, e, "tb_tfa_script")
    }
    identify(e) {
      i.debug("===In Taboola identify==="), _tfa.push(e)
    }
    track(e) {
      i.debug("===In Taboola track==="), _tfa.push(e)
    }
    page(e) {
      i.debug("===In Taboola page==="), _tfa.push(e)
    }
  }
  const b = function (e, t, n, i, a, o) {
      const [r] = t.destinations.filter(e => e.destinationInstanceId === o)
      if (!r) return null
      switch (i) {
        case "page":
          r.class.page(a, e)
          break
        case "track":
          r.class.track(a, e)
          break
        case "identify":
          r.class.identify(a, e)
      }
    },
    j = function (e, t, n, i, a, o, r) {
      const s = a[e || t]
      let c = [],
        d = null
      const l = "v1" === o ? n.paramArray.srcid : n.writeKey
      if (!l) return null
      if (
        (i[l].map(e => {
          c.push({ destinationId: e.CDPDestinationId, destinationInstanceId: e.DestinationInstanceId })
        }),
        s && Object.keys(s).length > 0)
      ) {
        const e = JSON.parse(s.AllowedDestinationInstanceList)
        if (!s.IsActive) return null
        e.map(e => {
          let i = s.TransformerFunction[e] ? s.TransformerFunction[e] : null
          i && "object" == typeof i && (i = i[t]),
            i &&
              (d = ((e, t, n, i) => {
                const a = "v1" === n ? i : t.jsonData,
                  o = e.substring(e.indexOf("{") + 1, e.lastIndexOf("}")).replace(/[\n\t\r]/g, "")
                return new Function("event", o)(a, o)
              })(i, n, o, r))
          const a = c.filter(t => t.destinationInstanceId === e)
          if (a.length)
            switch (a[0].destinationId) {
              case 1:
              case 2:
              case 5:
              case 6:
              case 8:
              case 10:
              case 12:
              case 18:
              case 19:
              case 20:
              case 21:
              case 22:
                b(o, n, 0, t, d, e)
            }
        })
      }
    }
  class T {
    constructor(e) {
      this.marketerId = e
    }
    init() {
      i.debug("===In Outbrain init===")
      var e = document.createElement("script")
      ;(e.type = "text/javascript"),
        (e.text = `!function(_window, _document) {\n        var OB_ADV_ID = '${this.marketerId}';\n        if (_window.obApi) {\n          var toArray = function(object) {\n            return Object.prototype.toString.call(object) === '[object Array]' ? object : [object];\n          };\n          _window.obApi.marketerId = toArray(_window.obApi.marketerId).concat(toArray(OB_ADV_ID));\n          return;\n        }\n        var api = _window.obApi = function() {\n          api.dispatch ? api.dispatch.apply(api, arguments) : api.queue.push(arguments);\n        };\n        api.version = '1.1';\n        api.loaded = true;\n        api.marketerId = OB_ADV_ID;\n        api.queue = [];\n        var tag = _document.createElement('script');\n        tag.async = true;\n        tag.src = '//amplify.outbrain.com/cp/obtp.js';\n        tag.type = 'text/javascript';\n        var script = _document.getElementsByTagName('script')[0];\n        script.parentNode.insertBefore(tag, script);\n      }(window, document);\n      obApi('page', 'PAGE_VIEW');`)
      document.getElementsByTagName("head")[0].appendChild(e)
    }
    track(e) {
      i.debug("===In Outbrain track==="),
        e && e.properties ? window.obApi("track", e.event, e.properties) : window.obApi("track", e.event)
    }
  }
  var w, O
  ;(w = void 0),
    (O = function () {
      var e =
          ("undefined" != typeof crypto && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
          ("undefined" != typeof msCrypto &&
            "function" == typeof msCrypto.getRandomValues &&
            msCrypto.getRandomValues.bind(msCrypto)),
        t = new Uint8Array(16)
      function n() {
        if (!e)
          throw new Error(
            "crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported",
          )
        return e(t)
      }
      for (var i = [], a = 0; a < 256; ++a) i.push((a + 256).toString(16).substr(1))
      return function (e, t, a) {
        "string" == typeof e && ((t = "binary" === e ? new Uint8Array(16) : null), (e = null))
        var o = (e = e || {}).random || (e.rng || n)()
        if (((o[6] = (15 & o[6]) | 64), (o[8] = (63 & o[8]) | 128), t)) {
          for (var r = a || 0, s = 0; s < 16; ++s) t[r + s] = o[s]
          return t
        }
        return (function (e, t) {
          var n = i
          return (
            n[e[0]] +
            n[e[1]] +
            n[e[2]] +
            n[e[3]] +
            "-" +
            n[e[4]] +
            n[e[5]] +
            "-" +
            n[e[6]] +
            n[e[7]] +
            "-" +
            n[e[8]] +
            n[e[9]] +
            "-" +
            n[e[10]] +
            n[e[11]] +
            n[e[12]] +
            n[e[13]] +
            n[e[14]] +
            n[e[15]]
          ).toLowerCase()
        })(o)
      }
    }),
    "object" == typeof exports && "undefined" != typeof module
      ? (module.exports = O())
      : "function" == typeof define && define.amd
      ? define(O)
      : ((w = w || self).uuidv4 = O()),
    (function (n) {
      ;(n.lmSMTObj = n.lmSMTObj || []),
        (lmSMTObj.jsonData = {}),
        (lmSMTObj.cookieDomain = null),
        (lmSMTObj.domainList = []),
        (lmSMTObj.clickTrackers = null),
        (lmSMTObj.initialize = null),
        (lmSMTObj.finalize = null),
        (lmSMTObj.pixelFireStatus = !1),
        (lmSMTObj.onsiteEndpoint = "us-ax.lemnisk.co/"),
        (lmSMTObj.smartTagversion = "0.01v"),
        (lmSMTObj.libraryName = "javascript"),
        (lmSMTObj.callbackFunction = null),
        (lmSMTObj.writeKey = lmSMTObj.writeKey || null),
        (lmSMTObj.destinations = []),
        (lmSMTObj.vizNotifObject = !1),
        (lmSMTObj.resetFields = function () {
          ;(lmSMTObj.jsonData = {}), (lmSMTObj.pixelFireStatus = !1), (lmSMTObj.callbackFunction = null)
        }),
        (lmSMTObj.parse = function (e) {
          try {
            if ((e && (lmSMTObj.resetFields(), (lmSMTObj.argType = e)), !lmSMTObj.pixelFireStatus))
              try {
                lmSMTObj.fireAnalyze()
              } catch (e) {
                ;(lmSMTObj.jsonData.err = e), lmSMTObj.fireAnalyze()
              }
          } catch (e) {
            ;(lmSMTObj.jsonData.err = e), lmSMTObj.fireAnalyze()
          }
        }),
        (lmSMTObj.getUTMparams = function () {
          try {
            for (
              var e, t = new RegExp("(?:\\?|&)(utm_[^=]+)=(.*?)(?=&|$)", "gi"), n = {};
              null != (e = t.exec(document.URL));

            )
              n[e[1]] = e[2]
            return Object.keys(n).length > 0 ? n : void 0
          } catch (e) {}
        }),
        (lmSMTObj.getEventParams = function (e) {
          if ("object" == typeof e || null == e) {
            for (var t in (null == e && (e = {}), (lmSMTObj.jsonData.properties = {}), e))
              e.hasOwnProperty(t) && (lmSMTObj.jsonData.properties[t] = e[t])
            ;(lmSMTObj.jsonData.properties.path = e.path ? e.path : location.pathname),
              (e.referrer || document.referrer) &&
                (lmSMTObj.jsonData.properties.referrer = e.referrer ? e.referrer : document.referrer),
              (e.search || location.search) &&
                (lmSMTObj.jsonData.properties.search = e.search ? e.search : location.search),
              (lmSMTObj.jsonData.properties.title = e.title ? e.title : document.title),
              (lmSMTObj.jsonData.properties.url = e.url ? e.url : document.URL)
          } else
            (lmSMTObj.jsonData.context.page = {}),
              (lmSMTObj.jsonData.context.page.path = location.pathname),
              document.referrer && (lmSMTObj.jsonData.context.page.referrer = document.referrer),
              document.search && (lmSMTObj.jsonData.context.page.search = location.search),
              (lmSMTObj.jsonData.context.page.title = document.title),
              (lmSMTObj.jsonData.context.page.url = document.URL)
        }),
        (lmSMTObj.getAMCVCookie = function () {
          try {
            var e = /AMCV_([^;]+)/,
              t = document.cookie.match(e)
            if ((t = t ? t[1] : null) && null !== t) {
              var n = t.split("=")[1]
              ;(n = decodeURIComponent(n)), (e = /MCMID\|([^|]+)/)
              var i = n.match(e),
                a = i ? i[1] : null
              if (a && null !== a) return a
            }
          } catch (e) {
            return ""
          }
        }),
        (lmSMTObj.getCommonParams = function (e) {
          if (lmSMTObj.getCookie("userId")) var t = lmSMTObj.getCookie("userId")
          if (lmSMTObj.getCookie("_ga")) var n = lmSMTObj.getCookie("_ga")
          if (lmSMTObj.getCookie("_fbc")) var i = lmSMTObj.getCookie("_fbc")
          if (lmSMTObj.getCookie("_fbp")) var a = lmSMTObj.getCookie("_fbp")
          if (lmSMTObj.getAMCVCookie()) var o = lmSMTObj.getAMCVCookie()
          if (
            ((lmSMTObj.jsonData.id = lmSMTObj.vizidCookie("_vz", lmSMTObj.cookieDomain)),
            (lmSMTObj.jsonData.userId = t),
            (lmSMTObj.jsonData.originalTimestamp = new Date().getTime()),
            (lmSMTObj.jsonData.messageId = uuidv4()),
            (lmSMTObj.jsonData.writeKey = lmSMTObj.writeKey),
            (lmSMTObj.jsonData.otherIds = { _ga: n, _fbc: i, _fbp: a, mcmid: o }),
            "object" == typeof e)
          )
            for (var r in e) e.hasOwnProperty(r) && (lmSMTObj.jsonData.otherIds[r] = e[r])
          lmSMTObj.jsonData.context = {
            library: { name: lmSMTObj.libraryName, version: lmSMTObj.version },
            userAgent: {
              deviceType: lmSMTObj.getDevice(),
              osType: lmSMTObj.getOS(),
              osVersion: lmSMTObj.getOsVersion(),
              browser: lmSMTObj.checkBrowser(),
              ua: navigator.userAgent,
            },
            utm: lmSMTObj.getUTMparams(),
          }
        }),
        (lmSMTObj.init = function (t) {
          ;(lmSMTObj.destinations = []),
            (lmSMTObj.writeKey = t),
            lmSMTObj.initialize(),
            e &&
              e[t] &&
              e[t].forEach(e => {
                switch (e.CDPDestinationId) {
                  case 1:
                    lmSMTObj.destinations.push({
                      id: "fb",
                      class: new a(e.ConfigJson.pixelId),
                      destinationInstanceId: e.DestinationInstanceId,
                    })
                    break
                  case 2:
                    lmSMTObj.destinations.push({
                      id: "clevertap",
                      class: new c(e.ConfigJson.account_id),
                      destinationInstanceId: e.DestinationInstanceId,
                    })
                    break
                  case 5:
                    lmSMTObj.destinations.push({
                      id: "linkedin",
                      class: new u(e.ConfigJson.linkedin),
                      destinationInstanceId: e.DestinationInstanceId,
                    })
                    break
                  case 6:
                    lmSMTObj.destinations.push({
                      id: "qp",
                      class: new o(e.ConfigJson.pixel_key),
                      destinationInstanceId: e.DestinationInstanceId,
                    })
                    break
                  case 8:
                    lmSMTObj.destinations.push({
                      id: "hotjar",
                      class: new d(e.ConfigJson.site_id),
                      destinationInstanceId: e.DestinationInstanceId,
                    })
                    break
                  case 10:
                    lmSMTObj.destinations.push({
                      id: "ga",
                      class: new l(e.ConfigJson.tracking_id.Id),
                      destinationInstanceId: e.DestinationInstanceId,
                    })
                    break
                  case 12:
                    lmSMTObj.destinations.push({
                      id: "gAds",
                      class: new r(e.ConfigJson.google_conversion_id),
                      destinationInstanceId: e.DestinationInstanceId,
                    })
                    break
                  case 18:
                    lmSMTObj.destinations.push({
                      id: "tiktok",
                      class: new m(e.ConfigJson.pixelId),
                      destinationInstanceId: e.DestinationInstanceId,
                    })
                    break
                  case 19:
                    lmSMTObj.destinations.push({
                      id: "ga4",
                      class: new p(e.ConfigJson.measurement_id),
                      destinationInstanceId: e.DestinationInstanceId,
                    })
                    break
                  case 20:
                    lmSMTObj.destinations.push({
                      id: "criteo",
                      class: new g(e.ConfigJson.criteoOneTagId),
                      destinationInstanceId: e.DestinationInstanceId,
                    })
                    break
                  case 21:
                    lmSMTObj.destinations.push({
                      id: "taboola",
                      class: new f(e.ConfigJson.pixelId),
                      destinationInstanceId: e.DestinationInstanceId,
                    })
                    break
                  case 22:
                    lmSMTObj.destinations.push({
                      id: "outbrain",
                      class: new T(e.ConfigJson.marketerId),
                      destinationInstanceId: e.DestinationInstanceId,
                    })
                }
              }),
            lmSMTObj.destinations.length && lmSMTObj.destinations.map(e => e.class.init())
        }),
        (lmSMTObj.route = function (n, i) {
          j(n, i, lmSMTObj, e, t, "v3")
        }),
        (lmSMTObj.identify = function (e, t, n, i) {
          try {
            if (
              (lmSMTObj.resetFields(),
              (lmSMTObj.jsonData.customerProperties = {}),
              (lmSMTObj.jsonData.type = "identify"),
              "function" == typeof n && ((i = n), (n = null)),
              "function" == typeof t && ((i = t), (n = t = null)),
              "function" == typeof e && ((i = e), (n = t = e = null)),
              "object" == typeof e && ((n = t), (t = e), (e = null)),
              e && ((lmSMTObj.jsonData.userId = e), lmSMTObj.setCookie("userId", e, 365, lmSMTObj.cookieDomain)),
              lmSMTObj.getCommonParams(n),
              lmSMTObj.getEventParams("identify"),
              "object" == typeof t)
            )
              for (var a in t) t.hasOwnProperty(a) && (lmSMTObj.jsonData.customerProperties[a] = t[a])
            if (i && "function" != typeof i) throw new TypeError("argument passed to callback is not valid type")
            lmSMTObj.parse(), lmSMTObj.route(null, "identify")
          } catch (e) {}
          i && setTimeout(i, 500)
        }),
        (lmSMTObj.track = function (e, t, n, i) {
          try {
            if (
              (lmSMTObj.resetFields(),
              (lmSMTObj.jsonData.properties = {}),
              (lmSMTObj.jsonData.type = "track"),
              !e || "string" != typeof e)
            )
              throw new TypeError("First argument has to be string")
            for (var a in ((lmSMTObj.jsonData.event = e),
            "function" == typeof n && ((i = n), (n = null)),
            "function" == typeof t && ((i = t), (n = null), (t = null)),
            lmSMTObj.getCommonParams(n),
            lmSMTObj.getEventParams("track"),
            t))
              t.hasOwnProperty(a) && (lmSMTObj.jsonData.properties[a] = t[a])
            lmSMTObj.parse(), lmSMTObj.route(e, "track")
          } catch (e) {}
          i && setTimeout(i, 500)
        }),
        (lmSMTObj.page = function (e, t, n, i) {
          try {
            lmSMTObj.resetFields(),
              "function" == typeof n && ((i = n), (n = null)),
              "function" == typeof t && ((i = t), (n = t = null)),
              "function" == typeof e && ((i = e), (n = t = e = null)),
              "object" == typeof e && ((n = t), (t = e), (e = null)),
              (lmSMTObj.jsonData.type = "page"),
              e && (lmSMTObj.jsonData.name = e),
              lmSMTObj.getCommonParams(n),
              lmSMTObj.getEventParams(t),
              lmSMTObj.parse(),
              lmSMTObj.route(e, "page")
          } catch (e) {}
          i && setTimeout(i, 500)
        }),
        (lmSMTObj.getDevice = function () {
          var e = navigator.userAgent
          return /ipad/i.test(e)
            ? "IPAD_TAB_MOBILE"
            : /android|Tablet/gi.test(e) && !/mobile/i.test(e)
            ? "TAB_MOBILE"
            : /mqqbrowser|tencenttraveler|baidubrowser|criOS|ucbrowser|mobile|CrMo/gi.test(e) ||
              (/opera|opr/gi.test(e) && /mobi|mini/gi.test(e))
            ? "MOBILE"
            : "DESKTOP"
        }),
        (lmSMTObj.getOS = function () {
          var e = n.navigator.userAgent,
            t = n.navigator.platform,
            i = null
          return (
            -1 !== ["Macintosh", "MacIntel", "MacPPC", "Mac68K"].indexOf(t)
              ? (i = "Mac OS")
              : -1 !== ["iPhone", "iPad", "iPod"].indexOf(t)
              ? (i = "iOS")
              : -1 !== ["Win32", "Win64", "Windows", "WinCE"].indexOf(t)
              ? (i = "Windows")
              : /Android/.test(e)
              ? (i = "Android")
              : !i && /Linux/.test(t) && (i = "Linux"),
            i
          )
        }),
        (lmSMTObj.getOsVersion = function () {
          try {
            var e,
              t = null
            return (
              -1 !== n.navigator.userAgent.indexOf("Windows NT 10.0") && (t = "Windows 10"),
              -1 !== n.navigator.userAgent.indexOf("Windows NT 6.2") && (t = "Windows 8"),
              -1 !== n.navigator.userAgent.indexOf("Windows NT 6.1") && (t = "Windows 7"),
              -1 !== n.navigator.userAgent.indexOf("Windows NT 6.0") && (t = "Windows Vista"),
              -1 !== n.navigator.userAgent.indexOf("Windows NT 5.1") && (t = "Windows XP"),
              -1 !== n.navigator.userAgent.indexOf("Windows NT 5.0") && (t = "Windows 2000"),
              -1 !== n.navigator.userAgent.indexOf("Mac") &&
                (t =
                  (e = /(iPhone OS|Mac OS X)\s+([\d\.]+)/).exec(n.navigator.userAgent)[0] ||
                  e.exec(navigator.appVersion)[0]),
              -1 !== n.navigator.userAgent.indexOf("X11") && (t = "UNIX"),
              -1 !== n.navigator.userAgent.indexOf("Linux") && (t = "Linux"),
              -1 !== n.navigator.userAgent.indexOf("Android") &&
                (t = (e = /Android\s+([\d\.]+)/).exec(n.navigator.appVersion)[1]),
              t
            )
          } catch (e) {}
        }),
        (lmSMTObj.checkBrowser = function () {
          let e
          var t,
            n,
            i,
            a = navigator.userAgent
          return (
            a.indexOf("Firefox") > -1
              ? (e = "Firefox")
              : a.indexOf("MSIE") > -1 || a.indexOf("rv:") > -1
              ? (e = "Internet Explorer")
              : a.indexOf("Edg") > -1
              ? (e = "Egde")
              : a.indexOf("OP") > -1
              ? ((e = "Opera"), (i = !0))
              : a.indexOf("Chrome") > -1
              ? ((n = !0), (e = "Chrome"))
              : a.indexOf("Safari") > -1 && ((e = "Safari"), (t = !0)),
            n && t && ((t = !1), (e = "chrome")),
            n && i && ((n = !1), (e = "Opera")),
            e
          )
        }),
        (lmSMTObj.getCookie = function (e) {
          var t = document.cookie
          if (!e) return ""
          var n = t.split(";")
          for (var i in n)
            if (n.hasOwnProperty(i)) {
              var a = n[i].match(/\s*(.*)=(.*)/)
              if (a && a[1] === e && a[2]) return a[2]
            }
          return ""
        }),
        (lmSMTObj.selectDomain = function () {
          const e = document && document.domain
          if (lmSMTObj.cookieDomain && lmSMTObj.cookieDomain === e) return 1
          const t = lmSMTObj.domainList
          for (let n = 1; n < t.length; n++) if (t[n] === e) return (lmSMTObj.cookieDomain = t[n]), 0
          return (lmSMTObj.cookieDomain = e), -1
        }),
        (lmSMTObj.fireAnalyze = function () {
          var e = "https://pl.dev.hxcd.now.hclsoftware.cloud/analyze/cookieCallback.php?cb=" + lmSMTObj.cookieDomain
          if (!lmSMTObj.pixelFireStatus) {
            var t = "https://pl.dev.hxcd.now.hclsoftware.cloud/analyze/analyze.php"
            if (n.XDomainRequest)
              (xhttp = new XDomainRequest()),
                (xhttp.onload = function () {
                  lmSMTObj.callBackViz(e)
                }),
                xhttp.open("POST", t, !0),
                (xhttp.withCredentials = !0),
                xhttp.send(JSON.stringify(lmSMTObj.jsonData))
            else if (n.XMLHttpRequest) {
              var i = new XMLHttpRequest()
              ;(i.onreadystatechange = function () {
                i.readyState === XMLHttpRequest.DONE && 200 === i.status && lmSMTObj.callBackViz(e)
              }),
                i.open("POST", t, !0),
                (i.withCredentials = !0),
                i.send(JSON.stringify(lmSMTObj.jsonData))
            }
          }
        }),
        (lmSMTObj.detectCampaign = function () {
          return "VIZVRM6527"
        }),
        (lmSMTObj.initialize = function () {
          ;(lmSMTObj.cookieDomain = "hclcdp-insurance-6527.dev.hxcd.now.hclsoftware.cloud"),
            (lmSMTObj.domainList = "hclcdp-insurance-6527.dev.hxcd.now.hclsoftware.cloud".split("|")),
            lmSMTObj.selectDomain && lmSMTObj.selectDomain(),
            (lmSMTObj.clickTrackers = "")
        }),
        (lmSMTObj.OnsiteNotificationTag = function () {
          if (lmSMTObj.vizNotifObject) {
            if (VizuryNotificationObject && "function" == typeof VizuryNotificationObject.createDivElementSinglePage) {
              var e = document.getElementById("vizury-notification-template")
              ;(n.location.href === lmSMTObj.oldUrl && e) || VizuryNotificationObject.createDivElementSinglePage(),
                (lmSMTObj.oldUrl = n.location.href)
            }
          } else
            try {
              var t = document.createElement("script")
              ;(t.type = "text/javascript"),
                (t.async = !0),
                (t.src = "https://cdn25.lemnisk.co/ssp/smtag/GetJsFileEventCapture.js"),
                document.body.appendChild(t),
                (t.onload = function () {
                  try {
                    VizuryNotificationObject.createDivElement(), (lmSMTObj.vizNotifObject = !0)
                  } catch (e) {}
                }),
                (t.onreadystatechange = function () {
                  if ("complete" == t.readyState || "loaded" == t.readyState)
                    try {
                      VizuryNotificationObject.createDivElement(), (lmSMTObj.vizNotifObject = !0)
                    } catch (e) {}
                })
            } catch (e) {}
        }),
        (lmSMTObj.callBackViz = function (e) {
          e = lmSMTObj.isSafari() ? e + "&sf=y" : e
          var t = document.getElementsByTagName("script")[0],
            n = document.createElement("script")
          ;(n.type = "text/javascript"),
            (n.src = e),
            (n.async = !0),
            t.parentNode.insertBefore(n, t),
            (n.onload = function () {
              try {
                lmSMTObj.OnsiteNotificationTag()
              } catch (e) {}
            }),
            (n.onreadystatechange = function () {
              if ("complete" == n.readyState || "loaded" == n.readyState)
                try {
                  lmSMTObj.OnsiteNotificationTag()
                } catch (e) {}
            })
        }),
        (lmSMTObj.vizidCookie = function (e, t) {
          var n = lmSMTObj.getCookie(e)
          return n || ((lmSMTObj.ftu = 1), (n = lmSMTObj.generateVizCookie()), lmSMTObj.setCookie(e, n, 365, t)), n
        }),
        (lmSMTObj.generateVizCookie = function () {
          for (
            var e = lmSMTObj.isSafari() ? "vizSF_" : "viz_",
              t = 7418186,
              n = parseInt(new Date().getTime() / 1e3, 10).toString(16),
              i = Math.floor(Math.random() * t).toString(16);
            i.length < 5;

          )
            i += Math.floor(Math.random() * t).toString(16)
          return e + n + (i = i.slice(i.length - 5))
        }),
        (lmSMTObj.isSafari = function () {
          return (
            Object.prototype.toString.call(n.HTMLElement).indexOf("Constructor") > 0 ||
            "[object SafariRemoteNotification]" === (!n.safari || safari.pushNotification).toString()
          )
        }),
        (lmSMTObj.setCookie = function (e, t, n, i) {
          var a = i ? "; domain=" + i : ""
          if (n > 0) {
            var o = new Date()
            o.setDate(o.getDate() + n)
            var r = encodeURIComponent(t) + (null == n ? "" : "; expires=" + o.toUTCString()) + "; path=/" + a
            document.cookie = e + "=" + r
          } else document.cookie = e + "=" + encodeURIComponent(t)
        }),
        (function () {
          for (; lmSMTObj.length > 0; ) {
            var e = Array.prototype.slice.call(lmSMTObj.shift())
            "callbackEnded" !== e[e.length - 1] && n.lmSMTObj[e[0]].apply(this, e.slice(1))
          }
        })(),
        "undefined" != typeof lmSMTObj && lmSMTObj && void 0 !== lmSMTObj.parse && (lmSMTObj.pixelFireStatus = !1)
    })(window)
})()
