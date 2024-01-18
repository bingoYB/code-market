const _ExtInjectOldXHR = window.XMLHttpRequest;

/**
 * @typedef {{
 *  url: string
 *  method: string
 *  header:  Record<string, string>
 *  status: number
 *  requestBody?: any
 *  responseBody?: any
 *  responseHeader: Record<string, string>
 * }} RequestData
 */

const Inject = {
  /**
   * 请求前
   * @param {RequestData} data
   */
  beforeReuqest: function (data) {
    window.postMessage(
      {
        type: "InjectBeforeRequest",
        data,
      },
      "*"
    );
  },
  /**
   * 请求后
   * @param {RequestData} data
   */
  afterRequest: function (data) {
    window.postMessage(
      {
        type: "InjectBeforeRequest",
        data,
      },
      "*"
    );
  },
};

window.XMLHttpRequest = function xhr() {
  const realXHR = new _ExtInjectOldXHR();

  realXHR.addEventListener(
    "readystatechange",
    function () {
      try {
        // 判断是否成功
        if (realXHR.readyState === 4) {
          Inject.afterRequest({
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

      Inject.beforeReuqest({
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

// 拦截图片请求
const __HBINJECTOLDIMAGE = window.Image;
window.Image = function () {
  const realImage = new __HBINJECTOLDIMAGE();
  try {
    realImage.addEventListener(
      "load",
      function () {
        if (!realImage.src.includes("wind.hlgdata.com/wind")) {
          return;
        }

        // 获取url中的参数
        const url = new URL(realImage.src);
        const params = url.searchParams;
        // 将参数转为对象
        const sendData = {};
        for (const [key, value] of params) {
          sendData[key] = value;
        }

        window.postMessage(
          {
            type: "InjectBeforeRequest",
            send: sendData,
            url: realImage.src,
            isImage: true,
          },
          "*"
        );
      },
      false
    );

    realImage.addEventListener(
      "error",
      function () {
        if (!realImage.src.includes("wind.hlgdata.com/wind")) {
          return;
        }

        // 获取url中的参数
        const url = new URL(realImage.src);
        const params = url.searchParams;
        // 将参数转为对象
        const sendData = {};
        for (const [key, value] of params) {
          sendData[key] = value;
        }

        window.postMessage(
          {
            type: "InjectBeforeRequest",
            send: sendData,
            url: realImage.src,
            isImage: true,
          },
          "*"
        );
      },
      false
    );
  } catch (error) {
    console.error("花瓣助手：Image load error");
    console.error(error);
  }
  return realImage;
};

const __HBINJECTOLDSENDBEACON = window.navigator.sendBeacon;
window.navigator.sendBeacon = function (url, data) {
  try {
    if (!url.includes("wind.hlgdata.com/wind")) {
      return __HBINJECTOLDSENDBEACON.apply(window.navigator, arguments);
    }

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

    window.postMessage(
      {
        type: "InjectBeforeRequest",
        send: sendData,
        url: url,
        isBeacon: true,
      },
      "*"
    );
  } catch (error) {
    console.error("花瓣助手：sendBeacon error");
    console.error(error);
  }
  return __HBINJECTOLDSENDBEACON.apply(window.navigator, arguments);
};

Object.assign(window.XMLHttpRequest, __HBINJECTOLDXHR);
(function historyWrap() {
  const fnMap = ["pushState", "replaceState"];

  function handleFn() {
    const event = new CustomEvent("pageChange");
    window.dispatchEvent(event);
  }

  // 存在  popstate事件 和 window.history 方法都触发的情况，所以需要加一个状态避免触发两次
  let popstateEventFlag = false;

  fnMap.forEach((fn) => {
    try {
      const oldFn = "__HBAS_" + fn;

      if (window.history[oldFn]) return;

      window.history[oldFn] = window.history[fn];
      window.history[fn] = function (...args) {
        const result = window.history[oldFn].apply(this, args);
        popstateEventFlag = true;
        handleFn();
        return result;
      };

      window.addEventListener("popstate", function () {
        if (popstateEventFlag) {
          popstateEventFlag = false;
          return;
        }
        handleFn();
      });
    } catch (error) {}
  });
})();
