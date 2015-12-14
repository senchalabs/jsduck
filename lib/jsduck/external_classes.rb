module JsDuck

  # Handles patterns of external classes.
  #
  # A pattern can be a simple classname or a one with a wildcard "*".
  #
  # Also one can use a special keyword "@browser" to include all
  # common browser web API class names.
  class ExternalClasses

    def initialize(classnames = [])
      @class_names = {}
      @patterns = []
      classnames.each {|name| add(name) }
    end

    # Adds a classname or pattern to list of external classes.
    def add(name)
      if name =~ /\*/
        @patterns << make_pattern(name)
      elsif name =~ /^@browser$/i
        WEB_APIS.each do |cls|
          @class_names[cls] = true
        end
      else
        @class_names[name] = true
      end
    end

    # True if the classname matches an external class pattern.
    def is?(classname)
      @class_names[classname] || @patterns.any? {|p| classname =~ p }
    end

    private

    def make_pattern(pattern)
      Regexp.new("^" + pattern.split(/\*/, -1).map {|s| Regexp.escape(s) }.join(".*") + "$")
    end

    # List taken from: https://developer.mozilla.org/en-US/docs/Web/API
    # Excluding experimental, obsolete, deprecated and non-standardized APIs.
    WEB_APIS = %w(
      AbstractWorker
      ArrayBuffer
      ArrayBufferView
      Attr

      BatteryManager
      Blob
      BluetoothAdapter
      BluetoothManager

      CanvasGradient
      CanvasImageSource
      CanvasPattern
      CanvasRenderingContext2D
      CharacterData
      CloseEvent
      Comment
      CompositionEvent
      ContactManager
      Coordinates
      CSS
      CSSConditionRule
      CSSGroupingRule
      CSSMediaRule
      CSSPageRule
      CSSRule
      CSSRuleList
      CSSStyleDeclaration
      CSSStyleRule
      CSSStyleSheet
      CSSSupportsRule
      CustomEvent

      DataTransfer
      DataView
      DedicatedWorkerGlobalScope
      Document
      DocumentFragment
      DocumentTouch
      DocumentType
      DOMError
      DOMException
      DOMHighResTimeStamp
      DOMImplementation
      DOMImplementationRegistry
      DOMString
      DOMStringList
      DOMStringMap
      DOMTimeStamp
      DOMTokenList

      Element
      ErrorEvent
      Event
      EventListener
      EventSource
      EventTarget
      Extensions

      File
      FileHandle
      FileList
      FileReader
      FileReaderSync
      FileRequest
      Float32Array
      Float64Array
      FormData

      Geolocation
      GlobalEventHandlers

      History
      HTMLAnchorElement
      HTMLAreaElement
      HTMLAudioElement
      HTMLBaseElement
      HTMLBodyElement
      HTMLBRElement
      HTMLButtonElement
      HTMLCanvasElement
      HTMLCollection
      HTMLDataElement
      HTMLDataListElement
      HTMLDivElement
      HTMLDListElement
      HTMLDocument
      HTMLElement
      HTMLEmbedElement
      HTMLFieldSetElement
      HTMLFormControlsCollection
      HTMLFormElement
      HTMLHeadElement
      HTMLHeadingElement
      HTMLHRElement
      HTMLHtmlElement
      HTMLIFrameElement
      HTMLImageElement
      HTMLInputElement
      HTMLKeygenElement
      HTMLLabelElement
      HTMLLegendElement
      HTMLLIElement
      HTMLLinkElement
      HTMLMapElement
      HTMLMediaElement
      HTMLMetaElement
      HTMLMeterElement
      HTMLModElement
      HTMLObjectElement
      HTMLOListElement
      HTMLOptGroupElement
      HTMLOptionElement
      HTMLOptionsCollection
      HTMLOutputElement
      HTMLParagraphElement
      HTMLParamElement
      HTMLPreElement
      HTMLProgressElement
      HTMLQuoteElement
      HTMLScriptElement
      HTMLSelectElement
      HTMLSourceElement
      HTMLSpanElement
      HTMLStyleElement
      HTMLTableCaptionElement
      HTMLTableCellElement
      HTMLTableColElement
      HTMLTableDataCellElement
      HTMLTableElement
      HTMLTableHeaderCellElement
      HTMLTableRowElement
      HTMLTableSectionElement
      HTMLTextAreaElement
      HTMLTimeElement
      HTMLTitleElement
      HTMLTrackElement
      HTMLUListElement
      HTMLUnknownElement
      HTMLVideoElement

      IDBCursor
      IDBCursorSync
      IDBCursorWithValue
      IDBDatabase
      IDBDatabaseSync
      IDBEnvironment
      IDBEnvironmentSync
      IDBFactory
      IDBFactorySync
      IDBIndex
      IDBIndexSync
      IDBKeyRange
      IDBObjectStore
      IDBObjectStoreSync
      IDBOpenDBRequest
      IDBRequest
      IDBTransaction
      IDBTransactionSync
      IDBVersionChangeEvent
      IDBVersionChangeRequest
      ImageData
      Int16Array
      Int32Array
      Int8Array

      KeyboardEvent

      LinkStyle
      Location
      LockedFile

      MessageEvent
      MouseEvent

      Navigator
      NavigatorGeolocation
      NavigatorID
      NavigatorLanguage
      NavigatorOnLine
      Node
      NodeFilter
      NodeIterator
      NodeList
      Notification
      NotifyAudioAvailableEvent

      Performance
      PerformanceNavigation
      PerformanceTiming
      PermissionSettings
      Plugin
      Position
      PositionError
      PositionOptions
      ProcessingInstruction
      ProgressEvent

      Range
      RTCPeerConnection

      SharedWorker
      StorageEvent
      StyleSheet
      StyleSheetList
      SVGAElement
      SVGAngle
      SVGAnimateColorElement
      SVGAnimatedAngle
      SVGAnimatedBoolean
      SVGAnimatedEnumeration
      SVGAnimatedInteger
      SVGAnimatedLength
      SVGAnimatedLengthList
      SVGAnimatedNumber
      SVGAnimatedNumberList
      SVGAnimatedPoints
      SVGAnimatedPreserveAspectRatio
      SVGAnimatedRect
      SVGAnimatedString
      SVGAnimatedTransformList
      SVGAnimateElement
      SVGAnimateMotionElement
      SVGAnimateTransformElement
      SVGAnimationElement
      SVGCircleElement
      SVGClipPathElement
      SVGCursorElement
      SVGDefsElement
      SVGDescElement
      SVGElement
      SVGEllipseElement
      SVGFilterElement
      SVGFontElement
      SVGFontFaceElement
      SVGFontFaceFormatElement
      SVGFontFaceNameElement
      SVGFontFaceSrcElement
      SVGFontFaceUriElement
      SVGForeignObjectElement
      SVGGElement
      SVGGlyphElement
      SVGGradientElement
      SVGHKernElement
      SVGImageElement
      SVGLength
      SVGLengthList
      SVGLinearGradientElement
      SVGLineElement
      SVGMaskElement
      SVGMatrix
      SVGMissingGlyphElement
      SVGMPathElement
      SVGNumber
      SVGNumberList
      SVGPathElement
      SVGPatternElement
      SVGPoint
      SVGPolygonElement
      SVGPolylineElement
      SVGPreserveAspectRatio
      SVGRadialGradientElement
      SVGRect
      SVGRectElement
      SVGScriptElement
      SVGSetElement
      SVGStopElement
      SVGStringList
      SVGStylable
      SVGStyleElement
      SVGSVGElement
      SVGSwitchElement
      SVGSymbolElement
      SVGTests
      SVGTextElement
      SVGTextPositioningElement
      SVGTitleElement
      SVGTransform
      SVGTransformable
      SVGTransformList
      SVGTRefElement
      SVGTSpanElement
      SVGUseElement
      SVGViewElement
      SVGVKernElement

      TCPServerSocket
      Text
      TextMetrics
      TimeRanges
      Touch
      TouchEvent
      TouchList
      Transferable
      TreeWalker

      UIEvent
      Uint16Array
      Uint32Array
      Uint8Array
      Uint8ClampedArray

      ValidityState

      WebGLRenderingContext
      WebSocket
      WheelEvent
      Window
      Worker
      WorkerLocation
      WorkerNavigator

      XMLHttpRequest
      XMLHttpRequestEventTarget
    )

  end

end
