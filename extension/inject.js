/**
 * @typedef {{
 *  url: string
 *  method: string
 *  header:  Record<string, string>
 *  status: number
 *  requestBody?: any
 *  responseBody?: any
 *  responseHeader: Record<string, string>
 * }} InjectRequestData
 *
 * @typedef {"beforeRequest"|"afterRequest"|"afterImageLoad"} InjectEvent
 */

class Inject {
  /**
   * @type {Object.<string, Function[]>}
   */
  cb;

  /**
   * Creates an instance of SimpleEvent.
   */
  constructor() {
    /**
     * @type {Object.<string, Function[]>}
     */
    this.cb = {};
    this.xhrInject();
    this.fetchInject();
    this.imageInject();
    this.sendBeaconInject();
  }

  /**
   * Listen to an event.
   * @template K - Type of the event
   * @param {InjectEvent} eventName - The name of the event
   * @param {(data: InjectRequestData) => void} cb - Callback function
   */
  on(eventName, cb) {
    if (typeof cb !== "function") {
      console.warn(
        `Event on ${String(
          eventName
        )} failed , Parameter 'callback' expects to get a function, actually get ${typeof cb}`
      );
      return;
    }
    const cbList = this.cb[eventName];
    if (cbList) {
      cbList.push(cb);
    } else {
      this.cb[eventName] = [cb];
    }
  }

  /**
   * Unbind an event listener.
   * @param {InjectEvent} eventName - The name of the event
   * @param {(data: InjectRequestData) => void} cb - Callback function
   */
  off(eventName, cb) {
    const cbList = this.cb[eventName];
    if (!cbList) return;
    const index = cbList.findIndex((el) => el === cb);
    cbList.splice(index, 1);
  }

  /**
   * Trigger an event.
   * @template K - Type of the event
   * @param {InjectEvent} eventName - The name of the event
   * @param {InjectRequestData} eventData - Data to be passed to the event listeners
   */
  trigger(eventName, eventData) {
    const cbList = this.cb[eventName];
    if (cbList) {
      for (let i = 0; i < cbList.length; i++) {
        const cb = cbList[i];
        if (typeof cb === "function") {
          try {
            cb(eventData);
          } catch (error) {
            const errMessage = `event callback ${String(eventName)} run fail: ${
              error.message
            }`;
            error.message = errMessage;
            console.error(error);
          }
        }
      }
    }
  }

  xhrInject() {
    const _ExtInjectOldXHR = window.XMLHttpRequest;
    const _inject = this;

    window.XMLHttpRequest = function xhr() {
      const realXHR = new _ExtInjectOldXHR();

      realXHR.addEventListener(
        "readystatechange",
        function () {
          try {
            // 判断是否成功
            if (realXHR.readyState === 4) {
              _inject.trigger("afterRequest", {
                url: realXHR._url,
                method: realXHR._method,
                header: realXHR._headers,
                status: realXHR.status,
                requestBody: realXHR._sendData,
                responseBody: realXHR.responseText,
                responseHeader: realXHR._responseHeaders,
              });
            }
          } catch (error) {
            console.log("inject response error", error);
          }
        },
        false
      );

      const send = realXHR.send;
      const open = realXHR.open;

      realXHR.open = function () {
        this._url = arguments[1];
        this._method = arguments[0];
        open.apply(realXHR, arguments);
      };

      realXHR.send = function (data) {
        try {
          var sendData = arguments[0];
          if (data instanceof FormData) {
            sendData = Object.fromEntries(data);
          } else if (typeof data === "string") {
            sendData = JSON.parse(data);
          } else {
            // 获取url中的参数
            const url = new URL(this._url);
            const params = url.searchParams;
            // 将参数转为对象
            const paramsObj = {};
            for (const [key, value] of params) {
              paramsObj[key] = value;
            }
            sendData = paramsObj;
          }

          this._sendData = sendData;

          _inject.trigger("beforeRequest", {
            url: realXHR._url,
            method: realXHR._method,
            header: realXHR._headers,
            status: realXHR.status,
            requestBody: realXHR._sendData,
          });
        } catch (error) {
          console.log("inject send error", error);
        }

        send.apply(realXHR, arguments);
      };

      return realXHR;
    };
  }

  fetchInject() {
    const _inject = this;

    const _ExtInjectOldFetch = window.fetch;

    window.fetch = function (url, init) {
      const requestInit = init ? { ...init } : {};

      if (_inject) {
        try {
          const requestBody = requestInit.body
            ? requestInit.body.toString()
            : null;
          _inject.trigger("beforeRequest", {
            url,
            method: requestInit.method || "GET",
            header: requestInit.headers || {},
            status: null, // Status not available before the request is sent
            requestBody,
          });
        } catch (error) {
          console.log("inject beforeRequest error", error);
        }
      }

      return _ExtInjectOldFetch.apply(this, arguments).then((response) => {
        const clonedResponse = response.clone();

        try {
          clonedResponse.text().then((responseText) => {
            if (_inject) {
              _inject.trigger("afterRequest", {
                url,
                method: requestInit.method || "GET",
                header: requestInit.headers || {},
                status: response.status,
                requestBody: requestInit.body,
                responseBody: responseText,
                responseHeader: response.headers,
              });
            }
          });
        } catch (error) {
          console.log("inject afterRequest error", error);
        }

        return response;
      });
    };
  }

  imageInject() {
    const _inject = this;

    const _ExtInjectOldImage = window.Image;

    window.Image = function () {
      const realImage = new _ExtInjectOldImage();

      realImage.addEventListener(
        "load",
        function () {
          try {
            _inject.trigger("afterImageLoad", {
              url: realImage.src,
              status: 200,
            });
          } catch (error) {
            console.log("inject image load success error", error);
          }
        },
        false
      );

      realImage.addEventListener(
        "error",
        function () {
          try {
            _inject.trigger("afterImageLoad", {
              src: realImage.src,
              status: 500,
            });
          } catch (error) {
            console.log("inject image load error error", error);
          }
        },
        false
      );

      // Pass through any additional parameters to the original Image constructor
      if (arguments.length > 0) {
        _ExtInjectOldImage.apply(realImage, arguments);
      }

      return realImage;
    };
  }

  sendBeaconInject() {
    const _ExtInjectSendBeacon = window.navigator.sendBeacon;
    const _inject = this;
    window.navigator.sendBeacon = function (url, data) {
      try {
        let sendData = data;
        if (data instanceof FormData) {
          sendData = Object.fromEntries(data);
        } else if (typeof sendData === "string") {
          try {
            sendData = JSON.parse(data);
          } catch (error) {
            // unkonw data string
          }
        } else if (!data) {
          sendData = {};
          // 获取url中的参数
          const urlObj = new URL(url);
          const params = urlObj.searchParams;
          // 将参数转为对象
          for (const [key, value] of params) {
            sendData[key] = value;
          }
        }

        _inject.trigger("beforeRequest", {
            url,
            data: sendData,
            method: "sendBeacon",
            header: {}
        })
      } catch (error) {
        console.error("beforeRequest sendBeacon inject error", error);
      }
      return _ExtInjectSendBeacon.apply(window.navigator, arguments);
    };
  }
}
