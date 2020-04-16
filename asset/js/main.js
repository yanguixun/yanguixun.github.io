(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":1,"timers":2}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var dataFormat = function dataFormat(obj) {
  if (_typeof(obj) !== 'object') {
    return '';
  }

  var arr = [];

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var element = obj[key];
      arr.push(window.encodeURIComponent(key) + '=' + window.encodeURIComponent(element));
    }
  }

  return arr.join('&');
};
/**
 * AJAX
 * 
 * @param {Object} options 
 */


var _default = function _default(options) {
  if (!options.method || !options.url) return;
  var request = new XMLHttpRequest();
  request.open(options.method, options.url + '?' + dataFormat(options.data));
  request.timeout = 30000;

  if (options.method.toLowerCase() === 'post') {
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  }

  if (options.headers) {
    for (var key in options.headers) {
      if (options.headers.hasOwnProperty(key)) {
        request.setRequestHeader(key, options.headers[key]);
      }
    }
  }

  if (options.timeout) {
    request.timeout = options.timeout;
  }

  if (options.dataType) {
    request.responseType = options.dataType;
  }

  request.addEventListener('readystatechange', function () {
    if (request.readyState === 4 && request.status === 200 && request.response) {
      options.success && options.success(request.response);
    } else if (request.status > 400) {
      options.error(request.status);
    }
  });

  if (options.error) {
    request.addEventListener('error', function (e) {
      options.error(e);
    });
    request.addEventListener('timeout', function (e) {
      options.error(e);
    });
  }

  request.send(options.data ? options.data : null);
};

exports["default"] = _default;

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _ajax = _interopRequireDefault(require("./ajax.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var store = {};
/**
 * Get data from api
 * 
 * @param {String} apiPath 
 * @param {Function} callback 
 */

var _default = function _default(apiPath, callback) {
  if (store[apiPath]) {
    callback && callback(store[apiPath]);
  } else {
    (0, _ajax["default"])({
      url: "/api/".concat(apiPath, ".json"),
      method: 'get',
      dataType: 'json',
      success: function success(data) {
        store[apiPath] = data;
        callback && callback(store[apiPath]);
      }
    });
  }
};

exports["default"] = _default;

},{"./ajax.js":3}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _storage = _interopRequireDefault(require("./storage.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var isMobile = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(window.navigator.userAgent);
var isChinese = /^(zh)/i.test(window.navigator.browserLanguage || window.navigator.language || 'zh');
var config = Object.assign({
  closeDrawer: isMobile,
  closeAside: false,
  skin: 'default',
  langshift: !isChinese,
  night: false,
  transfigure: false,
  lyride: true,
  autoplay: false
}, _storage["default"].get('config'));

var get = function get(key) {
  return config[key];
};

var set = function set(key, value) {
  if (Object.keys(config).includes(key)) {
    config[key] = value;

    _storage["default"].set('config', config);
  }
};

var _default = {
  get: get,
  set: set
};
exports["default"] = _default;

},{"./storage.js":9}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

/**
 * Fetch
 * 
 * @param {String} url 
 * @param {Object} params 
 * @param {Function} callback 
 * @param {Boolean} flush 
 * @param {Number} timeout 
 */
var _default = function _default(url, params, callback) {
  var flush = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var timeout = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 5000;
  var script = document.createElement('script');
  var data = '';
  var cb = null;
  var result = null;
  var isTimeout = true;
  var isNotResulted = true;

  if (params) {
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        var value = params[key];

        if (data === '') {
          data += '?' + key + '=' + value;
        } else {
          data += '&' + key + '=' + value;
        }

        if (/(jsonp|callback)/.test(key.toLowerCase())) {
          cb = value;
        }
      }
    }
  }

  if (cb) {
    window[cb] = function (obj) {
      result = obj;
    };
  }

  script.onload = function () {
    if (result && isNotResulted) {
      isTimeout = false;
      callback && callback(result);
    }

    flush && script.remove();
  };

  script.onerror = function (e) {
    if (isNotResulted) {
      isTimeout = false;
      callback && callback(e);
    }

    flush && script.remove();
  };

  window.setTimeout(function (o) {
    if (isTimeout) {
      isNotResulted = false;
      callback && callback(null);
    }
  }, timeout);
  script.src = url + data;
  document.head.appendChild(script);
};

exports["default"] = _default;

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _ajax = _interopRequireDefault(require("./ajax.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var store = {};

var _update = function _update(language, callback) {
  var els = document.querySelectorAll('[data-lang]');
  var step = 8; // Set text appear step time

  var currentIndex = 0;
  var looper = window.setInterval(function (e) {
    if (currentIndex < els.length) {
      if (els[currentIndex].getAttribute('data-lang-sign') !== language) {
        var keys = els[currentIndex].getAttribute('data-lang').split('.');
        var text = null;
        keys.forEach(function (key) {
          // get language string
          if (text === null) {
            text = store[language][key];
          } else {
            text = text[key];
          }
        });

        if (els[currentIndex].hasAttribute('data-lang-params')) {
          // pass params into %s in the language string
          var params = els[currentIndex].getAttribute('data-lang-params');

          if (els[currentIndex].hasAttribute('data-lang-encoded')) {
            params = window.decodeURI(params);
          }

          try {
            // pass in an array
            params = JSON.parse(params);

            if (params.length) {
              params.forEach(function (p) {
                if (els[currentIndex].hasAttribute('data-lang-encoded')) {
                  text = text.replace('%s', window.decodeURI(p));
                } else {
                  text = text.replace('%s', p);
                }
              });
            } else if (!isNaN(params)) {
              if (els[currentIndex].hasAttribute('data-lang-encoded')) {
                text = text.replace('%s', window.decodeURI(params));
              } else {
                text = text.replace('%s', params);
              }
            }
          } catch (error) {
            // pass in a string
            if (els[currentIndex].hasAttribute('data-lang-encoded')) {
              text = text.replace('%s', window.decodeURI(params));
            } else {
              text = text.replace('%s', params);
            }
          }
        }

        if (els[currentIndex].hasAttribute('data-lang-titled')) {
          // set to attribute 'title'
          els[currentIndex].title = text;
        } else if (els[currentIndex].hasAttribute('data-lang-placeholdered')) {
          // set to attribute 'placeholder'
          els[currentIndex].placeholder = text;
        } else {
          els[currentIndex].innerHTML = "<span>".concat(text, "</span>");
        }

        els[currentIndex].setAttribute('data-lang-sign', language);
      }

      currentIndex += 1;
    } else {
      window.clearInterval(looper);
      callback && callback(store[language]);
    }
  }, step);
};

var _default = function _default(language, callback) {
  var isUpdate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  if (language === 'zh-cn' || language === 'en') {
    if (store[language]) {
      if (isUpdate) {
        _update(language, callback);
      } else {
        callback && callback(store[language]);
      }
    } else {
      (0, _ajax["default"])({
        url: "/asset/lang/".concat(language, ".json"),
        method: 'get',
        dataType: 'json',
        success: function success(data) {
          store[language] = data;

          if (isUpdate) {
            _update(language, callback);
          } else {
            callback && callback(store[language]);
          }
        }
      });
    }
  }
};

exports["default"] = _default;

},{"./ajax.js":3}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _ajax = _interopRequireDefault(require("./ajax.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
const factory = {
  queue: [],
  isWorking: false,
  work(){
    if (!this.isWorking) {
      this.queue.shift()();
    }
  },
  next(){
    if (this.queue.length) {
      window.setTimeout(this.queue.shift(), 16);
    }
  }
};
*/

/**
 * Get part
 * 
 * @param {String} tag 
 * @param {Function} callback 
 */
function _default(tag, callback) {
  /*
  factory.queue.push(o => {
    factory.isWorking = true;
    ajax({
      url: `/asset/part/${tag}.html`,
      method: 'get',
      dataType: 'document',
      success(data) {
        callback && callback(data.body.firstElementChild);
        factory.isWorking = false;
        factory.next();
      }
    });
  });
  factory.work();
  */
  (0, _ajax["default"])({
    url: "/asset/part/".concat(tag, ".html"),
    method: 'get',
    dataType: 'document',
    success: function success(data) {
      callback && callback(data.body.firstElementChild);
    }
  });
}

},{"./ajax.js":3}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var self = window.localStorage;

var get = function get(key) {
  var value = self.getItem(key);

  if (value) {
    try {
      value = JSON.parse(value);
    } catch (error) {
      if (!isNaN(value)) {
        value = parseFloat(value);
      }
    }
  }

  return value;
};

var set = function set(key, value) {
  try {
    self.setItem(key, JSON.stringify(value));
  } catch (error) {
    self.setItem(key, value);
  }
};

var clear = function clear(o) {
  self.clear();
};

var _default = {
  self: self,
  get: get,
  set: set,
  clear: clear
};
exports["default"] = _default;

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fetch = _interopRequireDefault(require("./fetch.js"));

var _md5Min = _interopRequireDefault(require("../plugin/md5.min.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(0, _md5Min["default"])();
var mobileRegex = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i;

var delay = function delay(time, callback) {
  window.setTimeout(callback, time);
};

var run = function run(DnM, next, _final) {
  DnM(function (o) {
    // NEXT
    if (!next) return;

    if (mobileRegex.test(window.navigator.userAgent)) {
      next.mobile && next.mobile(_final);
    } else {
      next.desktop && next.desktop(_final);
    }
  });
};

var runOnMobile = function runOnMobile(mobile) {
  if (mobileRegex.test(window.navigator.userAgent)) {
    mobile && mobile(window.navigator.userAgent);
  }
};

var runOnDesktop = function runOnDesktop(desktop) {
  if (!mobileRegex.test(window.navigator.userAgent)) {
    desktop && desktop(window.navigator.userAgent);
  }
};

var getPageKey = function getPageKey(o) {
  var key = '';
  var pathname = window.location.pathname;

  if (/^\/(archives|categories|tags)\//.test(pathname)) {
    key = 'archive';
  } else if (/^(\/|\/index.html)$/.test(pathname)) {
    key = 'home';
  } else {
    var matches = pathname.match(/^\/([a-zA-Z0-9_\-]+)/);

    if (matches.length === 2) {
      key = matches[1];
    }
  }

  return key;
};

var forEach = function forEach(array, callback) {
  if (_typeof(array) === 'object' && array.length) {
    for (var i = 0; i < array.length; i++) {
      if (callback && callback(array[i], i)) {
        break;
      }
    }
  }
};

var forIn = function forIn(object, callback) {
  if (_typeof(object) === 'object') {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        if (callback && callback(object[key], key)) {
          break;
        }
      }
    }
  }
};

var layoutParts = function layoutParts(callback) {
  var target = document.querySelector('meta[name="layout-parts"]');

  if (target) {
    var content = target.getAttribute('content');

    try {
      callback && callback(JSON.parse(content));
    } catch (error) {
      callback && callback([]);
    }
  }
};
/**
 * Decode pass
 * 
 * @param {String} string 
 * @param {Number} seat appid length
 */


function decodePass(string, seat) {
  if (isNaN(seat)) return {
    appid: '',
    appkey: ''
  };
  var result = '';
  var temp = string.split(':');

  if (temp[1]) {
    var even = temp[1].substr(0, parseInt(temp[0])).split('');
    var odd = temp[1].substr(parseInt(temp[0])).split('');

    for (var i = 0; i < temp[1].length; i++) {
      if (i % 2 === 0) {
        result += even.shift();
      } else {
        result += odd.shift();
      }
    }
  }

  return {
    appid: result.substr(0, seat),
    appkey: result.substr(seat)
  };
}

;
/**
* Baidu Translate
* 
* @param {String} baidu_translate 
* @param {String} query 
* @param {String} lang 
* @param {Function} callback 
*/

function baiduTranslate(baidu_translate, query, lang, callback) {
  if (typeof callback != 'function') return false;
  if (typeof query != 'string' || typeof lang != 'string') return callback({
    error: 'PARAMS ERROR / 参数错误'
  });
  var url = '//api.fanyi.baidu.com/api/trans/vip/translate';

  if (window.location.protocol.includes('https')) {
    url = '//fanyi-api.baidu.com/api/trans/vip/translate';
  }

  var salt = Date.now();
  var from = 'auto';
  var sign = md5(baidu_translate.appid + query + salt + baidu_translate.appkey);

  if (query.length === 0) {
    callback({
      error: '<p class="error">EMPTY QUERY / 空查询</p>'
    });
  } else if (query.length < 100) {
    (0, _fetch["default"])(url, {
      'q': query,
      'appid': baidu_translate.appid,
      'salt': salt,
      'from': from,
      'to': lang,
      'sign': sign,
      'callback': 'baiduTranslate' + salt
    }, function (result) {
      if (result && result.trans_result) {
        callback({
          result: '<p class="result">RESULT / 翻译结果：</p><p class="content">' + result.trans_result[0].dst + '</p>'
        });
      } else {
        callback({
          error: '<p class="error">WRONG QUERY / 错查询</p>'
        });
      }
    }, true);
  } else {
    callback({
      error: '<p class="error">HUGE QUERY / 巨查询</p>'
    });
  }
}

var _default = {
  delay: delay,
  run: run,
  runOnMobile: runOnMobile,
  runOnDesktop: runOnDesktop,
  getPageKey: getPageKey,
  forEach: forEach,
  forIn: forIn,
  layoutParts: layoutParts,
  decodePass: decodePass,
  baiduTranslate: baiduTranslate
};
exports["default"] = _default;

},{"../plugin/md5.min.js":45,"./fetch.js":6}],11:[function(require,module,exports){
"use strict";

var _L2DwidgetMin = require("./plugin/L2Dwidget.min.js");

var _APlayerMin = _interopRequireDefault(require("./plugin/APlayer.min.js"));

var _MetingMin = _interopRequireDefault(require("./plugin/Meting.min.js"));

var _avMin = _interopRequireDefault(require("./plugin/av-min.js"));

var _ValineMin = _interopRequireDefault(require("./plugin/Valine.min.js"));

var _evanyou = _interopRequireDefault(require("./plugin/evanyou.js"));

var _util = _interopRequireDefault(require("./common/util.js"));

var _lang = _interopRequireDefault(require("./common/lang.js"));

var _fetch = _interopRequireDefault(require("./common/fetch.js"));

var _api = _interopRequireDefault(require("./common/api.js"));

var _config = _interopRequireDefault(require("./common/config.js"));

var _ajax = _interopRequireDefault(require("./common/ajax.js"));

var _storage = _interopRequireDefault(require("./common/storage.js"));

var _goingto = _interopRequireDefault(require("./part/goingto.js"));

var _extension = _interopRequireDefault(require("./part/extension.js"));

var _search = _interopRequireDefault(require("./part/search.js"));

var _xdrawer = _interopRequireDefault(require("./part/xdrawer.js"));

var _xaside = _interopRequireDefault(require("./part/xaside.js"));

var _xsearch = _interopRequireDefault(require("./part/xsearch.js"));

var _sitename = _interopRequireDefault(require("./part/sitename.js"));

var _brand = _interopRequireDefault(require("./part/brand.js"));

var _menus = _interopRequireDefault(require("./part/menus.js"));

var _skin = _interopRequireDefault(require("./part/skin.js"));

var _settings = _interopRequireDefault(require("./part/settings.js"));

var _footer = _interopRequireDefault(require("./part/footer.js"));

var _pather = _interopRequireDefault(require("./part/pather.js"));

var _panels = _interopRequireDefault(require("./part/panels.js"));

var _audioplayer = _interopRequireDefault(require("./part/audioplayer.js"));

var _toc = _interopRequireDefault(require("./part/toc.js"));

var _comment = _interopRequireDefault(require("./part/comment.js"));

var _translater = _interopRequireDefault(require("./part/translater.js"));

var _hitokoto = _interopRequireDefault(require("./part/hitokoto.js"));

var _recentposts = _interopRequireDefault(require("./part/recentposts.js"));

var _timeline = _interopRequireDefault(require("./part/timeline.js"));

var _post = _interopRequireDefault(require("./part/post.js"));

var _page = _interopRequireDefault(require("./part/page.js"));

var _codelib = _interopRequireDefault(require("./part/codelib.js"));

var _records = _interopRequireDefault(require("./part/records.js"));

var _gallery = _interopRequireDefault(require("./part/gallery.js"));

var _xcanvas = _interopRequireDefault(require("./part/xcanvas.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

(0, _APlayerMin["default"])();
(0, _avMin["default"])();
(0, _ValineMin["default"])();
var lock_wait = 600;
var history = window.history;
var navigator = window.navigator;

var registerServiceWorker = function registerServiceWorker(swPath) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(swPath).then(function () {
      console.log('ServiceWorker Register Successfully.');
    })["catch"](function (e) {
      console.error(e);
    });
  }
};

var baiduPush = function baiduPush(o) {
  var curProtocol = window.location.protocol.split(':')[0],
      url;

  if (curProtocol === 'https') {
    url = 'https://zz.bdstatic.com/linksubmit/push.js';
  } else {
    url = 'http://push.zhanzhang.baidu.com/push.js';
  }

  (0, _fetch["default"])(url, null, null, true);
};

var noCanvas = {
  value: function (o) {
    var v = _storage["default"].get('noCanvas');

    if (v === null) {
      return false; // default
    }

    return v;
  }(),
  update: function update(newValue) {
    this.value = newValue;

    _storage["default"].set('noCanvas', newValue);
  }
};

var live2d = function live2d(callback) {
  _util["default"].runOnMobile(callback);

  _util["default"].runOnDesktop(function (x) {
    if (noCanvas.value) {
      callback && callback();
    } else {
      _L2DwidgetMin.L2Dwidget.on('create-canvas', function (name) {
        callback && callback(name);
      }).init({
        model: {
          scale: 1,
          jsonPath: '/asset/live2d/haruto.model.json'
        },
        display: {
          width: 200,
          height: 400,
          position: 'right',
          hOffset: 50,
          vOffset: 0
        },
        mobile: {
          show: false
        }
      });
    }
  });
};

var root = document.querySelector(':root');

var pathname = function pathname(o) {
  return window.location.pathname;
};

var topping = function topping(o) {
  return root.querySelector('.m-center').offsetTop + root.querySelector('.m-header').offsetTop;
};

var launch = {
  _close: null,
  disable: function disable(flag) {
    if (flag) {
      var that = this;
      var hidden;

      if (typeof document.hidden !== 'undefined') {
        // Opera 12.10 and Firefox 18 and later support 
        hidden = 'hidden';
      } else if (typeof document.msHidden !== 'undefined') {
        hidden = 'msHidden';
      } else if (typeof document.webkitHidden !== 'undefined') {
        hidden = 'webkitHidden';
      } else {
        hidden = 'nohiddren';
      }

      if (!document[hidden]) {
        root.querySelector('.m-launch').classList.add('disabled');
      } else {
        that._close = window.setInterval(function (e) {
          if (!document[hidden]) {
            root.querySelector('.m-launch').classList.add('disabled');
            window.clearInterval(that._close);
            that._close = null;
          }
        }, lock_wait);
      }
    } else {
      root.querySelector('.m-launch').classList.remove('disabled');
    }
  }
};

var activateSpinner = function activateSpinner(flag) {
  flag ? root.querySelector('.m-spinner').classList.add('active') : root.querySelector('.m-spinner').classList.remove('active');
};

var progress = {
  current: 0,
  to: function to(num) {
    if (num < 0 || num > 100) return;
    root.querySelector('.m-progress-current').style.width = num + '%';
    this.current = num;
  },
  step: function step(num) {
    var next = this.current + num;
    if (next < 0 || next > 100) return;
    root.querySelector('.m-progress-current').style.width = next + '%';
    this.current = next;
  }
};

var applyConfig = function applyConfig(o) {
  _settings["default"].set('night', _config["default"].get('night'));

  _settings["default"].set('langshift', _config["default"].get('langshift'));

  _settings["default"].set('transfigure', _config["default"].get('transfigure'));

  _settings["default"].set('lyride', _config["default"].get('lyride'));

  _settings["default"].set('autoplay', _config["default"].get('autoplay'));

  _config["default"].get('closeDrawer') ? _xdrawer["default"].on() : _xdrawer["default"].off();

  _util["default"].runOnDesktop(function (d) {
    _config["default"].get('closeAside') ? _xaside["default"].on() : _xaside["default"].off();

    _skin["default"].set(_config["default"].get('skin'));
  });
};

var sticky = function sticky(e) {
  var main = root.querySelector('.m-main');
  var drawer = root.querySelector('.m-drawer');
  var aside = root.querySelector('.m-aside');
  var topOffset = topping();
  drawer.classList.remove('sticky');
  aside.classList.remove('sticky-top');
  aside.classList.remove('sticky-bottom');

  if (main.offsetHeight >= drawer.offsetHeight && main.offsetHeight >= aside.offsetHeight) {
    var totalDrawerHeight = drawer.offsetHeight + topOffset;

    if (totalDrawerHeight > window.innerHeight) {
      if (totalDrawerHeight < window.scrollY + window.innerHeight) {
        drawer.classList.add('sticky');
      } else {
        drawer.classList.remove('sticky');
      }
    }

    var totalAsideHeight = aside.offsetHeight + topOffset;

    if (totalAsideHeight > window.innerHeight) {
      aside.classList.remove('sticky-top');

      if (totalAsideHeight < window.scrollY + window.innerHeight) {
        aside.classList.add('sticky-bottom');
      } else {
        aside.classList.remove('sticky-bottom');
      }
    } else {
      aside.classList.add('sticky-top');
    }
  }
};

var setSticky = function setSticky(o) {
  document.removeEventListener('scroll', sticky);
  document.addEventListener('scroll', sticky);
};

var fixMainHeight = function fixMainHeight(o) {
  _util["default"].runOnDesktop(function (p) {
    var main = root.querySelector('.m-main');
    var drawer = root.querySelector('.m-drawer');
    var aside = root.querySelector('.m-aside');
    var footer = root.querySelector('.m-footer');
    var maxHeight = drawer.scrollHeight > aside.scrollHeight ? drawer.scrollHeight : aside.scrollHeight;
    main.style.minHeight = (maxHeight - footer.offsetHeight) * 1.35 + 'px';
  });
};

var scrolling = function scrolling(e) {
  _util["default"].runOnDesktop(function (o) {
    var aside = root.querySelector('.m-aside');
    aside.scrollTop = window.scrollY * 0.65; // offset 0.35

    var drawer = root.querySelector('.m-drawer'); //let content = root.querySelector('.m-content');
    //let drawerTop = (drawer.scrollHeight - drawer.offsetHeight) * window.scrollY / (content.offsetHeight + content.offsetTop - window.innerHeight);

    var drawerTop = window.scrollY * 0.65; // offset 0.35

    drawer.scrollTop = drawerTop;
  });
};

var setScrolling = function setScrolling(o) {
  document.removeEventListener('scroll', scrolling);
  document.addEventListener('scroll', scrolling);
};

var final_load = function final_load(o) {
  return _util["default"].layoutParts(function (parts) {
    var checklist = function (o) {
      var result = {};
      parts.forEach(function (name) {
        result[name] = false;
      });
      return result;
    }();

    var looper = window.setInterval(function (o) {
      var flag = true;

      _util["default"].forIn(checklist, function (value) {
        if (value === false) {
          flag = false;
          return true;
        }
      });

      if (flag) {
        window.clearInterval(looper);
        listen2Links();

        _util["default"].runOnMobile(function (p) {
          launch.disable(true);
        });

        activateSpinner(false);
        applyConfig();
        baiduPush();
      }
    }, lock_wait);
    var stepping = 30 / Object.keys(checklist).length;

    if (!/^\/(posts)\//.test(pathname())) {
      _toc["default"].hide();
    }

    if (/^\/(index.html)?$/.test(pathname())) {
      parts.includes('hitokoto') && _hitokoto["default"].init(null, function (el) {
        _hitokoto["default"].update();

        checklist.hitokoto = true;
        progress.step(stepping);
      });
      (0, _api["default"])('posts', function (pdata) {
        parts.includes('recentposts') && _recentposts["default"].init({
          posts: pdata,
          onMore: function onMore() {
            listen2Links();
          }
        }, function (el) {
          checklist.recentposts = true;
          progress.step(stepping);
        });
      });
    } else if (/^\/(posts)\//.test(pathname())) {
      (0, _api["default"])(pathname().substring(1, pathname().lastIndexOf('/')), function (pdata) {
        parts.includes('post') && _post["default"].init({
          post: pdata,
          offset: topping(),
          onFriend: function onFriend() {
            scrolling();
          }
        }, function (el) {
          checklist.post = true;

          _toc["default"].show();

          _toc["default"].update(pdata.toc, topping());

          progress.step(stepping);
        });
      });
    } else if (/^\/(categories|tags)\//.test(pathname())) {
      (0, _api["default"])(pathname().substring(1, pathname().lastIndexOf('/')), function (pdata) {
        parts.includes('timeline') && _timeline["default"].init({
          posts: pdata.postlist
        }, function (el) {
          checklist.timeline = true;
          progress.step(stepping);
        });
      });
    } else if (/^\/(archives)\//.test(pathname())) {
      (0, _api["default"])('posts', function (pdata) {
        parts.includes('timeline') && _timeline["default"].init({
          posts: pdata
        }, function (el) {
          checklist.timeline = true;
          progress.step(stepping);
        });
      });
    } else {
      // Additional Pages
      var matches = pathname().match(/^\/([a-zA-Z0-9_\-]+)/);

      if (matches.length === 2) {
        (0, _api["default"])("pages/".concat(matches[1]), function (padata) {
          parts.includes('page') && _page["default"].init({
            title: padata.title,
            content: padata.content
          }, function (el) {
            checklist.page = true;
            progress.step(stepping);
          });
        });
      }
    } // Extra Operations


    if (/^\/(library)\//.test(pathname())) {
      (0, _ajax["default"])({
        url: '//api.github.com/repos/jinyaoMa/code-lib/readme',
        method: 'get',
        headers: {
          accept: 'application/vnd.github.v3.html'
        },
        success: function success(data) {
          parts.includes('codelib') && _codelib["default"].init({
            readme: data,
            onstart: function onstart() {
              activateSpinner(true);
            },
            onended: function onended() {
              activateSpinner(false);
            }
          }, function (el) {
            (0, _ajax["default"])({
              url: '//api.github.com/repos/jinyaoMa/code-lib/contents',
              method: 'get',
              dataType: 'json',
              headers: {
                accept: 'application/vnd.github+json'
              },
              success: function success(list) {
                _codelib["default"].update(list);

                checklist.codelib = true;
                progress.step(stepping);
              }
            });
          });
        }
      });
    }

    if (/^\/(records)\//.test(pathname())) {
      (0, _ajax["default"])({
        url: "/records/content.json",
        method: 'get',
        dataType: 'json',
        success: function success(data) {
          parts.includes('records') && _records["default"].init({
            data: data
          }, function (el) {
            checklist.records = true;
            progress.step(stepping);
          });
        }
      });
    }

    if (/^\/(gallery)\//.test(pathname())) {
      (0, _ajax["default"])({
        url: "/gallery/content.json",
        method: 'get',
        dataType: 'json',
        success: function success(data) {
          parts.includes('gallery') && _gallery["default"].init({
            data: data
          }, function (el) {
            checklist.gallery = true;
            progress.step(stepping);
          });
        }
      });
    }
  });
};

var pjax = {
  isRunning: false,
  queue: [],
  _run: function _run() {
    var _this = this;

    if (this.queue.length) {
      this.isRunning = true;

      var _do = this.queue.shift();

      _do.work(function (o) {
        _this._run();
      });
    } else {
      this.isRunning = false;
    }
  },
  run: function run(url, callback) {
    var that = this;
    that.queue.push({
      callback: callback,
      work: function work(cb) {
        var _that = this;

        var mainContent = root.querySelector('.m-content');
        var parts = root.querySelector('meta[name="layout-parts"]');
        var keywords = root.querySelector('meta[name="keywords"]');
        var description = root.querySelector('meta[name="description"]');
        progress.to(60);
        activateSpinner(true);
        (0, _ajax["default"])({
          url: url,
          method: 'get',
          dataType: 'document',
          success: function success(data) {
            _that.callback && _that.callback(data);
            cb && cb(data);

            if (that.queue.length === 0) {
              document.title = data.title;
              parts.setAttribute('content', data.querySelector('meta[name="layout-parts"]').getAttribute('content'));
              keywords.setAttribute('content', data.querySelector('meta[name="keywords"]').getAttribute('content'));
              description.setAttribute('content', data.querySelector('meta[name="description"]').getAttribute('content'));
              mainContent.innerHTML = data.querySelector('.m-content').innerHTML;
              final_load();
            }
          }
        });
      }
    });
    !that.isRunning && that._run();
  }
};
var linksStore = {
  noPopState: true,
  setClick: function setClick(e) {
    e.preventDefault();
    var url = this.href;

    if (url !== window.location.href) {
      pjax.run(url, function (data) {
        history.pushState({
          url: url
        }, data.title, url);
      });
    }

    _xsearch["default"].off();
  }
};

var listen2Links = function listen2Links(o) {
  if (linksStore.noPopState) {
    window.onpopstate = function (e) {
      history.state && history.state.url && pjax.run(history.state.url);
    };

    linksStore.noPopState = false;
  }

  root.querySelectorAll('.highlight a:not([target="_blank"])').forEach(function (link) {
    link.target = "_blank";
  });
  root.querySelectorAll('a:not([target="_blank"]):not([href*="extension/"]):not([data-listened="true"]):not(.toc-link):not(.footnote):not([rel*="external"])').forEach(function (link) {
    link.onclick = linksStore.setClick;
    link.setAttribute('data-listened', true);
  });
};

var listen2Title = function listen2Title(o) {
  var origin = document.title;
  var timer = null;

  document.onvisibilitychange = function () {
    if (document.hidden) {
      document.title = _config["default"].get('langshift') ? '╭(°A°`)╮ Opps, page crashes ~' : '╭(°A°`)╮ 页面崩溃啦 ~';
      window.clearTimeout(timer);
    } else {
      document.title = (_config["default"].get('langshift') ? '(ฅ>ω<*ฅ) Eh, restore again~ ' : '(ฅ>ω<*ฅ) 噫又好了~ ') + origin;
      timer = window.setTimeout(function (e) {
        document.title = origin;
      }, 2000);
    }
  };
};

live2d(function (z) {
  _util["default"].run(function (next) {
    // DEFAULT
    progress.to(10);
    activateSpinner(true);

    _util["default"].runOnDesktop(function (p) {
      launch.disable(true);
    });

    var checklist = {
      xsearch: false,
      sitename: false,
      brand: false,
      footer: false,
      comment: false,
      menus: false,
      panels: false,
      toc: false,
      search: false
    };
    var looper = window.setInterval(function (o) {
      var flag = true;

      _util["default"].forIn(checklist, function (value) {
        if (value === false) {
          flag = false;
          return true;
        }
      });

      if (flag) {
        window.clearInterval(looper);
        progress.to(20); //setSticky();

        setScrolling();
        next();
      }
    }, lock_wait);

    _xsearch["default"].init({
      onclick: function onclick(state) {
        state ? _search["default"].on() : _search["default"].off();
      }
    }, function (el) {
      checklist.xsearch = true;
    });

    _sitename["default"].init(null, function (el) {
      checklist.sitename = true;
    });

    (0, _api["default"])('site', function (sdata) {
      registerServiceWorker(sdata.swPath);

      _brand["default"].init({
        numOfPosts: sdata.numOfPosts,
        numOfCategories: sdata.numOfCategories,
        numOfTags: sdata.numOfTags
      }, function (el) {
        checklist.brand = true;
      });

      _footer["default"].init(null, function (el) {
        (0, _fetch["default"])("//busuanzi.ibruce.info/busuanzi", {
          jsonpCallback: "BusuanziCallback_" + Math.floor(1099511627776 * Math.random())
        }, function (result) {
          _footer["default"].update({
            site_pv: result && result.site_pv ? result.site_pv : '∞',
            site_uv: result && result.site_uv ? result.site_uv : '∞',
            site_wd: sdata && sdata.word4site ? sdata.word4site : '∞'
          });
        }, true);
        checklist.footer = true;
      });

      _comment["default"].init({
        valine: {
          pass: sdata.valine.pass,
          pointer: sdata.valine.pointer
        },
        onupdate: function onupdate(appid, appkey, languageData, valineId) {
          var language = _config["default"].get('langshift') ? 'en' : 'zh-cn';

          if (languageData) {
            new Valine({
              av: AV,
              el: "#".concat(valineId),
              notify: false,
              verify: false,
              app_id: appid,
              app_key: appkey,
              placeholder: languageData.comment.placeholder,
              lang: language,
              path: pathname().replace(/index.html$/, ''),
              visitor: true
            });
          }
        }
      }, function (el) {
        checklist.comment = true;
      });
    });

    _menus["default"].init(null, function (el) {
      checklist.menus = true;
    });

    (0, _api["default"])('categories', function (cdata) {
      (0, _api["default"])('tags', function (tdata) {
        _panels["default"].init({
          categories: cdata,
          tags: tdata
        }, function (el) {
          checklist.panels = true;
        });
      });
    });

    _toc["default"].init(null, function (el) {
      checklist.toc = true;
    });

    (0, _api["default"])('search', function (sdata) {
      _search["default"].init({
        search: sdata,
        onsearch: function onsearch(k) {
          listen2Links();
        }
      }, function (el) {
        checklist.search = true;
      });
    });
  }, {
    // NEXT
    desktop: function desktop(_final) {
      // DESKTOP
      var checklist = {
        goingto: false,
        extension: false,
        xdrawer: false,
        xaside: false,
        translater: false,
        skin: false,
        settings: false,
        pather: false,
        audioplayer: false,
        xcanvas: false
      };
      var looper = window.setInterval(function (o) {
        var flag = true;

        _util["default"].forIn(checklist, function (value) {
          if (value === false) {
            flag = false;
            return true;
          }
        });

        if (flag) {
          window.clearInterval(looper);
          progress.to(60);

          _final();
        }
      }, lock_wait);

      _evanyou["default"].init('.m-evanyou-canvas');

      _xcanvas["default"].init({
        noCanvas: noCanvas.value,
        onchange: function onchange(flag, el) {
          noCanvas.update(flag);
          var l2d = root.querySelector('#live2d-widget');
          var header = root.querySelector('.m-header');

          if (flag) {
            el.classList.add('active');
            header.classList.add('shadow');

            _evanyou["default"].hide();

            l2d && (l2d.style.visibility = 'hidden');
          } else {
            el.classList.remove('active');
            header.classList.remove('shadow');

            _evanyou["default"].draw(root.classList.contains('night') ? 'evanyou' : 'wave');

            if (l2d) {
              l2d.style.visibility = 'visible';
            } else {
              activateSpinner(true);
              live2d(function (y) {
                activateSpinner(false);
              });
            }
          }
        }
      }, function (el) {
        checklist.xcanvas = true;
      });

      _audioplayer["default"].init(null, function (el) {
        (0, _MetingMin["default"])();
        checklist.audioplayer = true;
      });

      _goingto["default"].init(null, function (el) {
        checklist.goingto = true;
      });

      (0, _ajax["default"])({
        url: "/extension/content.json",
        method: 'get',
        dataType: 'json',
        success: function success(data) {
          _extension["default"].init({
            data: data
          }, function (el) {
            checklist.extension = true;
          });
        },
        error: function error() {
          checklist.extension = true;
        }
      });

      _xdrawer["default"].init({
        onclick: function onclick(state) {
          _config["default"].set('closeDrawer', state);
        }
      }, function (el) {
        checklist.xdrawer = true;
      });

      _xaside["default"].init({
        onclick: function onclick(state) {
          _config["default"].set('closeAside', state);
        }
      }, function (el) {
        checklist.xaside = true;
      });

      (0, _api["default"])('site', function (sdata) {
        _translater["default"].init({
          baidu_translate: {
            pass: sdata.baidu_translate.pass,
            pointer: sdata.baidu_translate.pointer
          },
          onstart: function onstart(el) {
            activateSpinner(true);
          },
          onended: function onended() {
            activateSpinner(false);
          }
        }, function (el) {
          checklist.translater = true;
        });

        _pather["default"].init({
          abbrMatch: sdata.abbrMatch,
          menus: sdata.menus
        }, function (el) {
          checklist.pather = true;
        });
      });

      _skin["default"].init({
        onclick: function onclick(newKey) {
          _config["default"].set('skin', newKey);
        }
      }, function (el) {
        checklist.skin = true;
      });

      _settings["default"].init({
        onclick: function onclick(key, flag) {
          if (key === 'night') {
            flag ? root.classList.add('night') : root.classList.remove('night');
            !noCanvas.value && _evanyou["default"].draw(flag ? 'evanyou' : 'wave');
          } else if (key === 'langshift') {
            progress.to(90);

            _menus["default"].update();

            _pather["default"].update();

            (0, _lang["default"])(flag ? 'en' : 'zh-cn', function (ldata) {
              _comment["default"].update(ldata);

              _post["default"].updateShare(ldata); //sticky();


              scrolling();
              fixMainHeight();
              listen2Links();
              listen2Title();
              progress.to(100);
            });
          } else if (key === 'transfigure') {
            flag ? root.classList.add('transfigure') : root.classList.remove('transfigure');
          } else if (key === 'lyride') {
            flag ? root.classList.add('lyride') : root.classList.remove('lyride');
            scrolling();
            fixMainHeight();
          } else if (key === 'autoplay') {
            flag && _audioplayer["default"].play();
          }

          _config["default"].set(key, flag);
        }
      }, function (el) {
        checklist.settings = true;
      });
    },
    mobile: function mobile(_final2) {
      // MOBILE
      var checklist = {
        xdrawer: false,
        settings: false
      };
      var looper = window.setInterval(function (o) {
        var flag = true;

        _util["default"].forIn(checklist, function (value) {
          if (value === false) {
            flag = false;
            return true;
          }
        });

        if (flag) {
          window.clearInterval(looper);
          progress.to(60);

          _final2();
        }
      }, lock_wait);

      _xdrawer["default"].init({
        onclick: function onclick(state) {
          _config["default"].set('closeDrawer', state);

          root.scrollTop = 0;
        }
      }, function (el) {
        checklist.xdrawer = true;
      });

      _settings["default"].init({
        onclick: function onclick(key, flag) {
          if (key === 'night') {
            flag ? root.classList.add('night') : root.classList.remove('night');
          } else if (key === 'langshift') {
            progress.to(90);

            _menus["default"].update();

            (0, _lang["default"])(flag ? 'en' : 'zh-cn', function (ldata) {
              _comment["default"].update(ldata);

              _post["default"].updateShare(ldata);

              listen2Links();
              progress.to(100);
            });
          } else if (key === 'lyride') {
            flag ? root.classList.add('lyride') : root.classList.remove('lyride');
          }

          _config["default"].set(key, flag);
        }
      }, function (el) {
        checklist.settings = true;
      });
    }
  }, function (_final3) {
    // FINAL
    history.replaceState({
      url: window.location.href
    }, document.title, window.location.href);
    final_load();
  });
});

},{"./common/ajax.js":3,"./common/api.js":4,"./common/config.js":5,"./common/fetch.js":6,"./common/lang.js":7,"./common/storage.js":9,"./common/util.js":10,"./part/audioplayer.js":12,"./part/brand.js":13,"./part/codelib.js":14,"./part/comment.js":15,"./part/extension.js":16,"./part/footer.js":17,"./part/gallery.js":18,"./part/goingto.js":19,"./part/hitokoto.js":20,"./part/menus.js":21,"./part/page.js":22,"./part/panels.js":23,"./part/pather.js":24,"./part/post.js":25,"./part/recentposts.js":26,"./part/records.js":27,"./part/search.js":28,"./part/settings.js":29,"./part/sitename.js":30,"./part/skin.js":31,"./part/timeline.js":32,"./part/toc.js":33,"./part/translater.js":34,"./part/xaside.js":35,"./part/xcanvas.js":36,"./part/xdrawer.js":37,"./part/xsearch.js":38,"./plugin/APlayer.min.js":39,"./plugin/L2Dwidget.min.js":40,"./plugin/Meting.min.js":41,"./plugin/Valine.min.js":42,"./plugin/av-min.js":43,"./plugin/evanyou.js":44}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'audioplayer';
var element = null;

var _check = function _check(o) {
  if (!element) return;
  var timeout = 19999;
  var step = 600;
  var looper = window.setInterval(function (o) {
    var mjs = element.querySelector('meting-js');

    if (!mjs.aplayer) {
      timeout -= step;
    }

    if (timeout < 0) {
      window.clearInterval(looper);
      mjs.innerText = 'Σ(っ °Д °;)っ [ METING API ERROR ]！';
      mjs.style.cssText = 'display:block;padding:12px;font-size:0.88em;color:brown;text-align:center;white-space:nowrap';
    }
  }, step);
};

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);
    callback && callback(element);

    _check();
  });
};

var play = function play(o) {
  if (element && element.querySelector('meting-js').aplayer) {
    element.querySelector('meting-js').aplayer.play();
    return;
  }

  var looper = window.setInterval(function (o) {
    if (element && element.querySelector('meting-js').aplayer) {
      element.querySelector('meting-js').aplayer.play();
      window.clearInterval(looper);
    }
  }, 16);
};

var pause = function pause(o) {
  if (element && element.querySelector('meting-js').aplayer) {
    element.querySelector('meting-js').aplayer.pause();
    return;
  }

  var looper = window.setInterval(function (o) {
    if (element && element.querySelector('meting-js').aplayer) {
      element.querySelector('meting-js').aplayer.pause();
      window.clearInterval(looper);
    }
  }, 16);
};

var _default = {
  tag: tag,
  init: init,
  play: play,
  pause: pause
};
exports["default"] = _default;

},{"../common/part.js":8}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'brand';
var element = null;

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);

    if (params) {
      element.querySelector('.p-brand-posts-count').innerText = params.numOfPosts;
      element.querySelector('.p-brand-categories-count').innerText = params.numOfCategories;
      element.querySelector('.p-brand-tags-count').innerText = params.numOfTags;
    }

    callback && callback(element);
  });
};

var _default = {
  tag: tag,
  init: init
};
exports["default"] = _default;

},{"../common/part.js":8}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

var _ajax = _interopRequireDefault(require("../common/ajax.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'codelib';
var element = null;
var onstart = null;
var onended = null; // fontawesome icon - <i class="fas fa-file-code fa-fw"></i>

var fileicon = document.createElement('i');
fileicon.className = 'far fa-file-code';

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);

    if (params) {
      if (params.readme) {
        var dom = new DOMParser().parseFromString(params.readme, 'text/html');
        dom.querySelectorAll('a[aria-hidden]').forEach(function (a) {
          a.remove();
        });
        dom.querySelectorAll('a:not([aria-hidden])').forEach(function (a) {
          a.target = '_blank';
        });
        var readme = element.querySelector('.p-codelib-readme');
        var more = element.querySelector('.p-codelib-more');

        more.onclick = function (e) {
          if (readme.classList.contains('active')) {
            readme.classList.remove('active');
          } else {
            readme.classList.add('active');
          }
        };

        readme.insertBefore(dom.body.firstElementChild, more);
      }

      params.onstart && (onstart = params.onstart);
      params.onended && (onended = params.onended);
    }

    callback && callback(element);
  });
};

var update = function update(list) {
  if (!element) return;

  if (list && list.length) {
    var container = element.querySelector('.p-codelib-list');
    list.forEach(function (item) {
      if (item.type === 'dir') {
        var li = document.createElement('li');
        li.setAttribute('data-git-path', item.path);
        var div = document.createElement('div');
        div.classList.add('codelib-cat');
        div.innerText = item.name;
        li.appendChild(div);
        var ul = document.createElement('ul');
        ul.classList.add('codelib-inner');
        ul.setAttribute('data-git-cat', item.name);
        li.appendChild(ul);
        container.appendChild(li);

        div.onclick = function (e) {
          if (li.classList.contains('active')) {
            ul.innerHTML = '';
            li.classList.remove('active');
          } else {
            onstart && onstart();
            (0, _ajax["default"])({
              url: "//api.github.com/repos/jinyaoMa/code-lib/contents/".concat(encodeURIComponent(item.path)),
              method: 'get',
              dataType: 'json',
              headers: {
                accept: 'application/vnd.github+json'
              },
              success: function success(data) {
                if (data && data.length) {
                  data.forEach(function (itm) {
                    if (itm.type === 'file') {
                      var inLi = document.createElement('li');
                      var inA = document.createElement('a');
                      inA.target = '_blank';
                      inA.innerText = itm.name;
                      inA.href = itm.html_url;
                      inLi.appendChild(fileicon.cloneNode(true));
                      inLi.appendChild(inA);
                      ul.appendChild(inLi);
                    }
                  });
                  li.classList.add('active');
                  onended && onended();
                }
              }
            });
          }
        };
      }
    });
  }
};

var _default = {
  tag: tag,
  init: init,
  update: update
};
exports["default"] = _default;

},{"../common/ajax.js":3,"../common/part.js":8}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

var _util = _interopRequireDefault(require("../common/util.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'comment';
var element = null;
var appid = '';
var appkey = '';
var onupdate = null;
var valine = {
  _dom: null,
  newDom: function newDom() {
    if (this._dom) {
      this._dom.remove();
    }

    this._dom = document.createElement('div');
    this._dom.id = "valine_".concat(Date.now());
    element.querySelector('.p-comment-valine').appendChild(this._dom);
    return this._dom.id;
  }
};

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);

    if (params) {
      var result = _util["default"].decodePass(params.valine.pass, params.valine.pointer);

      appid = result.appid;
      appkey = result.appkey;
      params.onupdate && (onupdate = params.onupdate);
    }

    callback && callback(element);
  });
};

var update = function update(langData) {
  if (!element) return;
  var v = document.querySelector('.leancloud_visitors');

  if (v) {
    v.id = window.location.pathname.replace(/\/[^\/]+.html$/, '/');
    v.setAttribute('data-flag-title', document.title.replace(/ - [^-]+$/, '').trim());
    onupdate && onupdate(appid, appkey, langData, valine.newDom());
  } else {
    onupdate && onupdate(appid, appkey, langData, valine.newDom());
  }
};

var _default = {
  tag: tag,
  init: init,
  update: update
};
exports["default"] = _default;

},{"../common/part.js":8,"../common/util.js":10}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'extension';
var element = null;

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);

    if (params && params.data && params.data.length) {
      var content = element.querySelector('.p-extension-content');
      params.data.forEach(function (item) {
        var img = document.createElement('img');
        img.src = item.icon;
        var span = document.createElement('span');
        var a = document.createElement('a');
        a.target = '_blank';
        a.href = item.link;
        span.innerText = a.title = item.name;
        a.appendChild(img);
        a.appendChild(span);
        content.appendChild(a);
      });
    }

    callback && callback(element);
  });
};

var _default = {
  tag: tag,
  init: init
};
exports["default"] = _default;

},{"../common/part.js":8}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'footer';
var element = null;

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);
    callback && callback(element);
  });
};

var update = function update(data) {
  if (!element) return;
  element.querySelector('.p-footer-pv').innerText = data.site_pv;
  element.querySelector('.p-footer-uv').innerText = data.site_uv;
  element.querySelector('.p-footer-wd').innerText = data.site_wd;
};

var _default = {
  tag: tag,
  init: init,
  update: update
};
exports["default"] = _default;

},{"../common/part.js":8}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'gallery';
var element = null;

var _setRecord = function _setRecord(dom, image) {
  var name = dom.querySelector('.p-gallery-caption span');
  var a = dom.querySelector('.p-gallery-image a');
  var img = a.querySelector('img');
  a.title = name.innerText = image.name;
  img.src = a.href = image.url;
};

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);

    if (params && params.data && params.data.length) {
      var cache = element.querySelector('.p-gallery-item');
      params.data.forEach(function (image, i) {
        if (i + 1 === params.data.length) {
          _setRecord(cache, image);
        } else {
          var temp = cache.cloneNode(true);

          _setRecord(temp, image);

          cache.before(temp);
        }
      });
    }

    callback && callback(element);
  });
};

var _default = {
  tag: tag,
  init: init
};
exports["default"] = _default;

},{"../common/part.js":8}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'goingto';
var element = null;
var timerTop = null;
var timerBottom = null;
var go2Top = null;
var go2Bottom = null;

var setup = function setup(o) {
  var goingtoTop = element.querySelector('.p-goingto-top');
  var goingtoBottom = element.querySelector('.p-goingto-bottom');
  cancelAnimationFrame(timerTop);
  cancelAnimationFrame(timerBottom);
  timerTop = null;
  timerBottom = null; // Set go2Top

  goingtoTop.removeEventListener('click', go2Top);

  go2Top = function go2Top() {
    var decay = 0.9;
    cancelAnimationFrame(timerBottom);
    timerBottom = null;
    cancelAnimationFrame(timerTop);
    timerTop = requestAnimationFrame(function fn() {
      if (window.scrollY > 1) {
        window.scrollTo(0, window.scrollY * decay);
        timerTop = requestAnimationFrame(fn);
      } else {
        window.scrollTo(0, 0);
        cancelAnimationFrame(timerTop);
        timerTop = null; //console.log('TOP!');
      }
    });
  };

  goingtoTop.addEventListener('click', go2Top); // Set go2Bottom

  goingtoBottom.removeEventListener('click', go2Bottom);

  go2Bottom = function go2Bottom() {
    var growth = 0.1;
    var min = 1;
    var total = document.body.scrollHeight - window.innerHeight;
    var left = total;
    cancelAnimationFrame(timerTop);
    timerTop = null;
    cancelAnimationFrame(timerBottom);
    timerBottom = requestAnimationFrame(function fn() {
      if (left > 1) {
        window.scrollTo(0, window.scrollY + left * growth + min);
        left = total - window.scrollY;
        timerBottom = requestAnimationFrame(fn);
      } else {
        window.scrollTo(0, document.body.scrollHeight);
        cancelAnimationFrame(timerBottom);
        timerBottom = null; //console.log('BOTTOM!');
      }
    });
  };

  goingtoBottom.addEventListener('click', go2Bottom);
};

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);
    setup();
    callback && callback(element);
  });
};

var _default = {
  tag: tag,
  init: init
};
exports["default"] = _default;

},{"../common/part.js":8}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

var _ajax = _interopRequireDefault(require("../common/ajax.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'hitokoto';
var element = null;

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);
    callback && callback(element);
  });
};

var update = function update(o) {
  if (!element) return;
  var type = element.getAttribute('data-type');
  (0, _ajax["default"])({
    url: element.getAttribute('data-api'),
    method: 'get',
    dataType: 'json',
    data: {
      c: type === null || type === 'r' ? '' : type
    },
    success: function success(data) {
      element.querySelector('.p-hitokoto-content').innerText = data.hitokoto;
      element.querySelector('.p-hitokoto-name').innerText = data.from;
    }
  });
};

var _default = {
  tag: tag,
  init: init,
  update: update
};
exports["default"] = _default;

},{"../common/ajax.js":3,"../common/part.js":8}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

var _util = _interopRequireDefault(require("../common/util.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'menus';
var element = null;

var update = function update(o) {
  if (!element) return;
  var active = element.querySelector('[data-menu-key].active');
  active && active.classList.remove('active');

  var currentKey = _util["default"].getPageKey();

  _util["default"].forEach(element.querySelectorAll('[data-menu-key]'), function (el) {
    if (currentKey === el.getAttribute('data-menu-key')) {
      el.classList.add('active');
      return true;
    }
  });
};

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);
    callback && callback(element);
  });
};

var _default = {
  tag: tag,
  init: init,
  update: update
};
exports["default"] = _default;

},{"../common/part.js":8,"../common/util.js":10}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'page';
var element = null;

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);

    if (params) {
      params.title && (element.querySelector('.p-page-title').innerText = params.title);

      if (params.content && params.content.trim() !== '') {
        element.querySelector('.p-page-main').innerHTML = params.content;
      } else {
        element.querySelector('.p-page-title').style.borderWidth = 0;
        element.querySelector('.p-page-main').style.display = 'none';
      }

      var scripts = element.querySelectorAll('script');
      var currentIndex = 0;

      (function run() {
        if (currentIndex < scripts.length) {
          var s = document.createElement('script');

          if (scripts[currentIndex].src === '') {
            s.innerHTML = scripts[currentIndex].innerHTML;
            scripts[currentIndex].parentElement.append(s);
            scripts[currentIndex].remove();
            currentIndex += 1;
            run();
          } else {
            s.async = true;
            s.src = scripts[currentIndex].src;

            s.onload = function (o) {
              currentIndex += 1;
              run();
            };

            scripts[currentIndex].parentElement.append(s);
            scripts[currentIndex].remove();
          }
        }
      })();

      element.querySelectorAll('link[rel~="stylesheet"]').forEach(function (style) {
        var s = document.createElement('link');
        s.ref = "stylesheet";
        s.href = style.href;
        style.parentElement.append(s);
        style.remove();
      });
    }

    callback && callback(element);
  });
};

var _default = {
  tag: tag,
  init: init
};
exports["default"] = _default;

},{"../common/part.js":8}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'panels';
var element = null;

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);

    if (params && params.categories && params.tags) {
      var categories = element.querySelector('[data-key="categories"] .p-panel-items');
      var tags = element.querySelector('[data-key="tags"] .p-panel-items'); // Categories

      var maxLen = 0;
      params.categories.forEach(function (cat) {
        if (cat.count > maxLen) maxLen = cat.count;
      });
      var minLen = maxLen;
      params.categories.forEach(function (cat) {
        if (cat.count < minLen) minLen = cat.count;
      });
      var len = maxLen - minLen;
      params.categories.forEach(function (cat) {
        var size = parseFloat(((cat.count - minLen) / len).toFixed(2));
        var a = document.createElement('a');
        a.innerText = cat.name;
        a.href = cat.url;
        a.style.fontSize = 1 + 0.5 * size + 'em';
        a.style.opacity = 0.5 + 0.5 * size;
        categories.appendChild(a);
      }); // Tags

      maxLen = 0;
      params.tags.forEach(function (tag) {
        if (tag.count > maxLen) maxLen = tag.count;
      });
      minLen = maxLen;
      params.tags.forEach(function (tag) {
        if (tag.count < minLen) minLen = tag.count;
      });
      len = maxLen - minLen;
      params.tags.forEach(function (tag) {
        var size = parseFloat(((tag.count - minLen) / len).toFixed(2));
        var a = document.createElement('a');
        a.innerText = tag.name;
        a.href = tag.url;
        a.style.fontSize = 1 + 0.5 * size + 'em';
        a.style.opacity = 0.5 + 0.5 * size;
        tags.appendChild(a);
      });
    }

    callback && callback(element);
  });
};

var _default = {
  tag: tag,
  init: init
};
exports["default"] = _default;

},{"../common/part.js":8}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

var _util = _interopRequireDefault(require("../common/util.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'pather';
var element = null;
var abbrMatch = null;
var menus = null;

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);

    if (params) {
      params.abbrMatch && (abbrMatch = params.abbrMatch);
      params.menus && (menus = params.menus);
    }

    callback && callback(element);
  });
};

var update = function update(o) {
  if (!element || !menus || !abbrMatch) return;
  var queue = element.querySelector('.p-pather-queue');
  var pathname = window.location.pathname;
  queue.innerHTML = '';
  var a = document.createElement('a');

  if (/^\/(archives|posts)\//.test(pathname)) {
    a.href = menus.main.archive.url;
    a.setAttribute('data-lang', 'pather.archive');
  } else if (/^\/(categories)\//.test(pathname)) {
    a.href = menus.main.archive.url;
    a.setAttribute('data-lang', 'pather.catarchive');
  } else if (/^\/(tags)\//.test(pathname)) {
    a.href = menus.main.archive.url;
    a.setAttribute('data-lang', 'pather.tagarchive');
  } else if (/^(\/|\/index.html)$/.test(pathname)) {
    a.href = menus.main.home.url;
    a.setAttribute('data-lang', 'pather.home');
  } else {
    var matches = pathname.match(/^\/([a-zA-Z0-9_\-]+)/);

    if (matches.length === 2) {
      _util["default"].forIn(menus, function (menu) {
        if (menu.hasOwnProperty(matches[1])) {
          a.href = menu[matches[1]].url;
          return true;
        }
      });

      a.setAttribute('data-lang', "pather.".concat(matches[1]));
    }
  }

  queue.appendChild(a);

  if (/^\/(posts)\//.test(pathname)) {
    var match = pathname.match(/^\/posts\/(\d+)\//);

    if (match) {
      var _a = document.createElement('a');

      _a.href = pathname;
      _a.innerText = _a.title = abbrMatch[match[1]];
      queue.appendChild(_a);
    }
  }

  if (/^\/(categories)\//.test(pathname)) {
    var names = pathname.replace(/([^\/]+)$/, '').replace(/^\/(categories)\//, '').split('/');
    var current = '/categories/';
    names.forEach(function (name) {
      if (name.trim() !== '') {
        var _a2 = document.createElement('a');

        _a2.href = current = current + name + '/';
        _a2.innerText = _a2.title = name.replace('-', ' ');
        queue.appendChild(_a2);
      }
    });
  }

  if (/^\/(tags)\//.test(pathname)) {
    var _names = pathname.replace(/([^\/]+)$/, '').replace(/^\/(tags)\//, '').split('/');

    var _current = '/tags/';

    _names.forEach(function (name) {
      if (name.trim() !== '') {
        var _a3 = document.createElement('a');

        _a3.href = _current = _current + name + '/';
        _a3.innerText = _a3.title = name.replace('-', ' ');
        queue.appendChild(_a3);
      }
    });
  }
};

var _default = {
  tag: tag,
  init: init,
  update: update
};
exports["default"] = _default;

},{"../common/part.js":8,"../common/util.js":10}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

var _util = _interopRequireDefault(require("../common/util.js"));

var _socialShareMin = _interopRequireDefault(require("../plugin/socialShare.min.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'post';
var element = null;

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);
    (0, _socialShareMin["default"])();

    if (params && params.post) {
      var post = params.post;
      element.querySelector('.p-post-title').innerText = post.title;
      element.querySelector('.p-post-date span').innerText = post.date;
      element.querySelector('.p-post-updated span').innerText = post.updated;
      element.querySelector('.p-post-wordcount span').innerText = post.word4post;
      element.querySelector('.p-post-min2read span').setAttribute('data-lang-params', post.min2read);
      element.querySelector('.p-post-content').innerHTML = post.content;
      var categories = element.querySelector('.p-post-categories span');
      post.categories.forEach(function (cat, j) {
        var a = document.createElement('a');
        a.href = cat.url;
        a.innerText = cat.name;
        j !== 0 && categories.append(' , ');
        categories.appendChild(a);
      });

      if (!post.categories.length) {
        var c = element.querySelector('.p-post-categories');
        c && (c.style.display = 'none');
      }

      element.querySelector('.p-post-friend-button').onclick = function (e) {
        var qrcode = element.querySelector('.p-post-friend-qrcode');

        if (qrcode.classList.contains('active')) {
          qrcode.classList.remove('active');
        } else {
          qrcode.classList.add('active');
        }

        params.onFriend && params.onFriend();
      };

      var a = document.createElement('a');
      a.innerText = window.location.href;
      a.href = post.url;
      element.querySelector('.p-post-license-link-text').appendChild(a);
      var tags = element.querySelector('.p-post-tags');
      post.tags.forEach(function (tag) {
        var a = document.createElement('a');
        a.href = tag.url;
        a.innerText = tag.name;
        tags.appendChild(a);
      });
      var navigator = element.querySelector('.p-post-navigator');

      if (post.prev_post) {
        var _a = document.createElement('a');

        _a.href = post.prev_post.url;
        _a.innerText = _a.title = post.prev_post.title;
        navigator.querySelector('.p-post-navigator-prev').appendChild(_a);
      } else {
        _util["default"].runOnDesktop(function (d) {
          navigator.querySelector('.p-post-navigator-prev').style.opacity = 0;
        });

        _util["default"].runOnMobile(function (m) {
          navigator.querySelector('.p-post-navigator-prev').style.display = 'none';
        });
      }

      if (post.next_post) {
        var _a2 = document.createElement('a');

        _a2.href = post.next_post.url;
        _a2.innerText = _a2.title = post.next_post.title;
        navigator.querySelector('.p-post-navigator-next').appendChild(_a2);
      } else {
        _util["default"].runOnDesktop(function (d) {
          navigator.querySelector('.p-post-navigator-next').style.opacity = 0;
        });

        _util["default"].runOnMobile(function (m) {
          navigator.querySelector('.p-post-navigator-next').style.display = 'none';
        });
      }

      var scripts = element.querySelectorAll('script');
      var currentIndex = 0;

      (function run() {
        if (currentIndex < scripts.length) {
          var s = document.createElement('script');

          if (scripts[currentIndex].src === '') {
            s.innerHTML = scripts[currentIndex].innerHTML;
            scripts[currentIndex].parentElement.append(s);
            scripts[currentIndex].remove();
            currentIndex += 1;
            run();
          } else {
            s.async = true;
            s.src = scripts[currentIndex].src;

            s.onload = function (o) {
              currentIndex += 1;
              run();
            };

            scripts[currentIndex].parentElement.append(s);
            scripts[currentIndex].remove();
          }
        }
      })();

      element.querySelectorAll('link[rel~="stylesheet"]').forEach(function (style) {
        var s = document.createElement('link');
        s.ref = "stylesheet";
        s.href = style.href;
        style.parentElement.append(s);
        style.remove();
      });
      var fns = element.querySelectorAll('[href^="#fn"]');
      fns.forEach(function (fn) {
        fn.classList.add('footnote');
        fn.href = "javascript:scrollTo(0, document.querySelector('".concat(fn.href.replace(window.location.href, ''), "').offsetTop - ").concat(params.offset || 96, ")");
      });
    }

    callback && callback(element);
  });
};

var updateShare = function updateShare(languageData) {
  if (element && element.querySelector('.p-post-share')) {
    var div = document.createElement('div');
    var img = element.querySelector('.p-post-content img');
    var description = document.querySelector('meta[name="description"]');
    var config = {
      url: window.location.href,
      source: window.location.origin,
      title: document.title,
      description: description ? description.getAttribute('content') : document.title,
      image: img ? img.src : document.querySelector('img').src,
      wechatQrcodeTitle: languageData.post.share.title,
      wechatQrcodeHelper: languageData.post.share.helper
    };
    element.querySelector('.p-post-share').innerHTML = '';
    element.querySelector('.p-post-share').appendChild(div);

    _util["default"].delay(600, function (o) {
      window.socialShare(div, config);
    });
  }
};

var _default = {
  tag: tag,
  init: init,
  updateShare: updateShare
};
exports["default"] = _default;

},{"../common/part.js":8,"../common/util.js":10,"../plugin/socialShare.min.js":46}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'recentposts';
var element = null;
var posts = [];
var count = 5;

var setPost = function setPost(post, dom) {
  var cover = dom.querySelector('.p-recentpost-cover span');
  cover.innerHTML = '';

  if (post.cover) {
    var img = document.createElement('img');

    img.onload = function (o) {
      var cTemp = dom.querySelector('.p-recentpost-cover');

      if (cTemp && img.offsetWidth > cTemp.offsetWidth && img.offsetHeight > cTemp.offsetHeight) {
        img.style.height = cTemp.offsetHeight + 'px';
      }
    };

    img.src = post.cover;
    cover.appendChild(img);
  } else {
    dom.classList.add('nocover');
  }

  var title = dom.querySelector('.p-recentpost-title-link');
  title.href = post.url;
  title.innerText = title.title = post.title;
  var date = dom.querySelector('.p-recentpost-date span');
  date.innerText = post.date;
  var updated = dom.querySelector('.p-recentpost-updated span');
  updated.innerText = post.updated;
  var categories = dom.querySelector('.p-recentpost-categories span');
  categories.innerHTML = '';
  post.categories.forEach(function (cat, j) {
    var a = document.createElement('a');
    a.href = cat.url;
    a.innerText = cat.name;
    j !== 0 && categories.append(' , ');
    categories.appendChild(a);
  });

  if (!post.categories.length) {
    var c = dom.querySelector('.p-recentpost-categories');
    c && (c.style.display = 'none');
  }

  var excerpt = dom.querySelector('.p-recentpost-excerpt');
  excerpt.innerHTML = post.excerpt;
};

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);

    if (params && params.posts && params.posts.length) {
      posts = params.posts.concat();
      var items = element.querySelector('.p-recentposts-items');
      var item = element.querySelector('.p-recentpost');
      var more = element.querySelector('.p-recentposts-more');
      var visible = posts.splice(0, count);
      visible.forEach(function (p, i) {
        if (i + 1 === visible.length) {
          setPost(p, item);
        } else {
          var cache = item.cloneNode(true);
          setPost(p, cache);
          item.before(cache);
        }
      });

      if (posts.length === 0) {
        more.style.display = 'none';
      }

      more.onclick = function (e) {
        var newPosts = posts.splice(0, count);
        newPosts.forEach(function (p) {
          var cache = item.cloneNode(true);
          setPost(p, cache);
          items.appendChild(cache);
          cache.querySelectorAll('a').forEach(function (link) {
            link.removeAttribute('data-listened'); // reset signal For listen2Links()
          });
        });

        if (posts.length === 0) {
          more.style.display = 'none';
        }

        params.onMore && params.onMore(more);
      };
    }

    callback && callback(element);
  });
};

var _default = {
  tag: tag,
  init: init
};
exports["default"] = _default;

},{"../common/part.js":8}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'records';
var element = null;

var _setRecord = function _setRecord(dom, record) {
  var cover = dom.querySelector('.p-record-cover img');
  var date = dom.querySelector('.p-record-date');
  var title = dom.querySelector('.p-record-title .p-record-inner');
  var type = dom.querySelector('.p-record-type .p-record-inner');
  var author = dom.querySelector('.p-record-author .p-record-inner');
  var source = dom.querySelector('.p-record-source .p-record-inner');
  var summary = dom.querySelector('.p-record-summary .p-record-inner');
  var progress = dom.querySelector('.p-record-progress .p-record-inner');
  record.cover && (cover.src = record.cover);
  record.date && (date.innerText = record.date.replace(/\s/g, ''));
  record.title && (title.innerText = record.title);
  type.setAttribute('data-lang', "records.types.".concat(record.type ? record.type : 'default'));
  record.author && (author.innerText = record.author);
  record.source && (source.innerText = record.source);
  record.summary && (summary.innerText = record.summary);
  var progressCurrent = progress.querySelector('.p-record-progress-current');

  if (record.progress && progressCurrent) {
    var newProgress = record.progress.replace(/\s/g, ''); // clean space

    var isNT = /^[0-9]+\/[0-9]+$/.test(newProgress); // format 'number/total'

    var isPercent = /^[0-9]{1,3}%$/.test(newProgress); // format '100%'

    if (isNT) {
      var divis = newProgress.split('/');
      var result = parseInt(divis[0]) / parseInt(divis[1]) * 100;
      progressCurrent.style.width = result.toFixed() + '%';
      progressCurrent.innerText = newProgress.replace('/', ' / ');
      progressCurrent.classList.add(result < 50 ? 'low' : 'high');
    } else if (isPercent) {
      progressCurrent.style.width = newProgress;
      progressCurrent.innerText = newProgress;
      progressCurrent.classList.add(parseFloat(newProgress.replace('%', '')) < 50 ? 'low' : 'high');
    } else {
      // isWords
      progressCurrent.innerText = record.progress.trim();
      progressCurrent.classList.add('high');
    }
  } else {
    progressCurrent.style.width = 0;
  }
};

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);

    if (params && params.data && params.data.length) {
      var cache = element.querySelector('.p-record');
      params.data.forEach(function (record, i) {
        if (i + 1 === params.data.length) {
          _setRecord(cache, record);
        } else {
          var temp = cache.cloneNode(true);

          _setRecord(temp, record);

          cache.before(temp);
        }
      });
    }

    callback && callback(element);
  });
};

var _default = {
  tag: tag,
  init: init
};
exports["default"] = _default;

},{"../common/part.js":8}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'search';
var element = null;
var search = null;
var setClick = null;
var onsearch = null;
var messages = {
  initial: '(..•˘_˘•..)',
  empty: '(╯°Д°)╯︵ ┻━┻'
};

var setup = function setup(o) {
  var searchResult = element.querySelector('.p-search-dialog-result');
  var input = element.querySelector('.p-search-dialog-input');
  var button = element.querySelector('.p-search-dialog-button');

  input.onkeydown = function (e) {
    if (e.code === 'Enter' || e.key === 'Enter') {
      input.blur();
      setClick();
    }
  };

  button.removeEventListener('click', setClick);

  setClick = function setClick(e) {
    if (input.value.trim().length <= 0) return;
    searchResult.innerHTML = '';
    var keywords = input.value.trim().toLowerCase().split(/[\s\-]+/);
    search.forEach(function (item) {
      var isMatched = true;
      var title = item.title.trim().toLowerCase();
      var content = item.content.trim().toLowerCase();
      var url = item.url;
      var titleIndex = -1;
      var contentIndex = -1;
      var firstOccur = -1;

      if (title !== '' && content !== '') {
        keywords.forEach(function (keyword, j) {
          titleIndex = title.indexOf(keyword);
          contentIndex = content.indexOf(keyword);

          if (titleIndex < 0 && contentIndex < 0) {
            isMatched = false;
          } else {
            if (contentIndex < 0) {
              contentIndex = 0;
            }

            if (j === 0) {
              firstOccur = contentIndex;
            }
          }
        });
      }

      if (isMatched) {
        var _item = document.createElement('div');

        var match_title = item.title.trim();

        if (titleIndex >= 0) {
          keywords.forEach(function (keyword) {
            var regS = new RegExp(keyword, "gi");
            match_title = match_title.replace(regS, "<strong>" + keyword + "</strong>");
          });
        }

        _item.innerHTML += "<a title='" + item.title.trim() + "' href='" + url + "'>" + match_title + "</a>";
        var match_content = item.content.trim();

        if (firstOccur >= 0) {
          var start = firstOccur - 128;
          var end = firstOccur + 128;

          if (start < 0) {
            start = 0;
          }

          if (start === 0) {
            end = 256;
          }

          if (end > match_content.length) {
            end = match_content.length;
          }

          match_content = match_content.substr(start, end);
          keywords.forEach(function (keyword) {
            var regS = new RegExp(keyword, "gi");
            match_content = match_content.replace(regS, "<strong>" + keyword + "</strong>");
          });
          _item.innerHTML += "<p>... " + match_content + " ...</p>";
        }

        searchResult.appendChild(_item);
      }
    });

    if (searchResult.innerHTML === '') {
      var div = document.createElement('div');
      div.innerText = messages.empty;
      div.classList.add('message');
      searchResult.appendChild(div);
    } else {
      onsearch && onsearch(keywords);
    }
  };

  button.addEventListener('click', setClick);
};

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);

    if (params) {
      params.search && (search = params.search);
      params.onsearch && (onsearch = params.onsearch);
      setup();
    }

    callback && callback(element);
  });
};

var on = function on(o) {
  if (element) {
    var result = element.querySelector('.p-search-dialog-result');
    var div = document.createElement('div');
    div.innerText = messages.initial;
    div.classList.add('message');
    result.innerHTML = '';
    result.appendChild(div);
    element.classList.add('active');
  }
};

var off = function off(o) {
  if (element) {
    element.classList.remove('active');
    element.querySelector('.p-search-dialog-input').value = '';
  }
};

var _default = {
  tag: tag,
  init: init,
  on: on,
  off: off
};
exports["default"] = _default;

},{"../common/part.js":8}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'settings';
var element = null;
var listener = null;
var setClick = null;

var setup = function setup(o) {
  // SetClick
  element.querySelectorAll('[data-settings-key]').forEach(function (el) {
    el.removeEventListener('click', setClick);
  });

  setClick = function setClick(e) {
    var newKey = this.getAttribute('data-settings-key');
    set(newKey, !e.srcElement.classList.contains('active'));
  };

  element.querySelectorAll('[data-settings-key]').forEach(function (el) {
    el.addEventListener('click', setClick);
  });
};

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);
    setup();

    if (params) {
      params.onclick && (listener = params.onclick);
    }

    callback && callback(element);
  });
};

var set = function set(key, flag) {
  var target = element.querySelector("[data-settings-key=\"".concat(key, "\"]"));
  flag ? target.classList.add('active') : target.classList.remove('active');
  listener && listener(key, flag);
};

var _default = {
  tag: tag,
  init: init,
  set: set
};
exports["default"] = _default;

},{"../common/part.js":8}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'sitename';
var element = null;

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);
    callback && callback(element);
  });
};

var _default = {
  tag: tag,
  init: init
};
exports["default"] = _default;

},{"../common/part.js":8}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'skin';
var element = null;
var listener = null;
var setClick = null;

var setup = function setup(o) {
  element.querySelectorAll('[data-skin-color]').forEach(function (item) {
    item.style.background = item.getAttribute('data-skin-color');
  }); // SetClick

  element.querySelectorAll('[data-skin-key]').forEach(function (el) {
    el.removeEventListener('click', setClick);
  });

  setClick = function setClick(e) {
    var newKey = this.getAttribute('data-skin-key');
    set(newKey);
  };

  element.querySelectorAll('[data-skin-key]').forEach(function (el) {
    el.addEventListener('click', setClick);
  });
};

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);
    setup();

    if (params) {
      params.onclick && (listener = params.onclick);
    }

    callback && callback(element);
  });
};

var set = function set(key) {
  element.querySelectorAll('[data-skin-key].active').forEach(function (el) {
    el.classList.remove('active');
  });
  element.querySelector("[data-skin-key=\"".concat(key, "\"]")).classList.add('active');
  var root = document.querySelector(':root');

  if (key === 'default') {
    colorIcons.clear();
    root.classList.remove('gray');
    root.classList.remove('colorful');
  } else if (key === 'gray') {
    colorIcons.clear();
    root.classList.remove('colorful');
    root.classList.add('gray');
  } else if (key === 'colorful') {
    colorIcons.run();
    root.classList.remove('gray');
    root.classList.add('colorful');
  }

  listener && listener(key);
};

var colorIcons = {
  queue: function (o) {
    var result = [];

    for (var i = 1; i <= 5; i++) {
      // 5 colors, 1 - 5
      result.push(i);
    }

    return result;
  }(),
  run: function run() {
    var that = this;
    var is = document.querySelectorAll('i.fas:not([data-colored="true"]), i.fab:not([data-colored="true"]), i.far:not([data-colored="true"])');
    is.forEach(function (i) {
      var next = that.queue.shift();
      i.classList.add('color_' + next);
      i.setAttribute('data-colored', true);
      that.queue.push(next);
    });
  },
  clear: function clear() {
    var is = document.querySelectorAll('i[data-colored="true"]');
    is.forEach(function (i) {
      i.className = i.className.replace(/\scolor_[1-5]/, ''); // 5 colors, 1 - 5

      i.setAttribute('data-colored', false);
    });
  }
};
var _default = {
  tag: tag,
  init: init,
  set: set,
  colorIcons: colorIcons
};
exports["default"] = _default;

},{"../common/part.js":8}],32:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'timeline';
var element = null;

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);

    if (params && params.posts && params.posts.length) {
      var items = element.querySelector('.p-timeline-items');
      var item = items.querySelector('.p-timeline-item');
      var currentYear = '9999';
      var currentYearCount = 0;
      var currentItem = null;
      params.posts.forEach(function (post, i) {
        if (post.date.startsWith(currentYear)) {
          var currentRow = currentItem.querySelector('.p-timeline-row').cloneNode(true);
          currentRow.querySelector('.p-timeline-date').innerText = post.date;
          var a = currentRow.querySelector('.p-timeline-title a');
          a.href = post.url;
          a.innerText = a.title = post.title;
          currentRow.querySelector('.p-timeline-excerpt').innerHTML = post.excerpt;

          if (currentItem) {
            currentYearCount += 1;
            currentItem.querySelector('.p-timeline-count').setAttribute('data-lang-params', currentYearCount);
            currentItem.appendChild(currentRow);
          }
        } else {
          // New item
          currentItem = item.cloneNode(true);
          currentItem.querySelector('.p-timeline-year').innerText = currentYear = post.date.substr(0, 4);
          currentYearCount = 1;
          currentItem.querySelector('.p-timeline-count').setAttribute('data-lang-params', currentYearCount);

          var _currentRow = currentItem.querySelector('.p-timeline-row');

          _currentRow.querySelector('.p-timeline-date').innerText = post.date;

          var _a = document.createElement('a');

          _a.href = post.url;
          _a.innerText = _a.title = post.title;

          _currentRow.querySelector('.p-timeline-title').appendChild(_a);

          _currentRow.querySelector('.p-timeline-excerpt').innerHTML = post.excerpt;
          items.appendChild(currentItem);
        }

        if (i + 1 === params.posts.length) {
          item.remove();
        }
      });
    }

    callback && callback(element);
  });
};

var _default = {
  tag: tag,
  init: init
};
exports["default"] = _default;

},{"../common/part.js":8}],33:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

var _util = _interopRequireDefault(require("../common/util.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'toc';
var element = null;
var setScroll = null;
var highlightId = null;

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);
    callback && callback(element);
  });
};

var hide = function hide(o) {
  element && (element.style.display = 'none');
};

var show = function show(o) {
  element && (element.style.display = 'block');
};

var update = function update(content, offset) {
  var message = element.querySelector('.p-toc-message');
  var main = element.querySelector('.p-toc-list');

  if (element && element.style.display !== 'none' && content) {
    message.style.display = 'none';
    main.innerHTML = content;
    var as = main.querySelectorAll('.toc-link');

    if (as.length) {
      as.forEach(function (a) {
        var id = a.getAttribute('data-id');
        a.href = "javascript:scrollTo(0, document.querySelector('[id=\"".concat(id, "\"]').offsetTop - ").concat(offset, ")");
      });
      highlightId = null;
      document.removeEventListener('scroll', setScroll);

      setScroll = function setScroll(e) {
        var headerlinks = document.querySelectorAll('.headerlink');
        headerlinks && _util["default"].forEach(headerlinks, function (h, i) {
          var position = h.offsetTop - offset + 1;

          if (position > window.scrollY && position < window.scrollY + window.innerHeight) {
            var match = h.href.match(/#(.+)$/);

            if (match) {
              var id = window.decodeURI(match[1]).trim();

              if (highlightId) {
                var highlight = main.querySelector(".toc-link[data-id=\"".concat(highlightId, "\"]"));
                highlight && highlight.classList.remove('active');
              }

              var target = main.querySelector(".toc-link[data-id=\"".concat(id, "\"]"));
              target && target.classList.add('active');
              highlightId = id;
            }

            return true;
          } else if (position > window.scrollY + window.innerHeight && i - 1 >= 0) {
            var _match = headerlinks[i - 1].href.match(/#(.+)$/);

            if (_match) {
              var _id = window.decodeURI(_match[1]).trim();

              if (highlightId) {
                var _highlight = main.querySelector(".toc-link[data-id=\"".concat(highlightId, "\"]"));

                _highlight && _highlight.classList.remove('active');
              }

              var _target = main.querySelector(".toc-link[data-id=\"".concat(_id, "\"]"));

              _target && _target.classList.add('active');
              highlightId = _id;
            }

            return true;
          }
        });
      };

      document.addEventListener('scroll', setScroll);
    }
  } else {
    message.style.display = 'block';
    main.innerHTML = '';
  }
};

var _default = {
  tag: tag,
  init: init,
  hide: hide,
  show: show,
  update: update
};
exports["default"] = _default;

},{"../common/part.js":8,"../common/util.js":10}],34:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

var _util = _interopRequireDefault(require("../common/util.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'translater';
var element = null;
var credential = {};
var onstart = null;
var onended = null;
var data = {
  isInside: false,
  isPathIn: function isPathIn(path, el) {
    var flag = false;

    if (path) {
      for (var i = 0; i < path.length; i++) {
        if (path[i] === el) {
          flag = true;
          break;
        }
      }
    }

    return flag;
  },
  setMousedown: null,
  setMouseup: null
};

var setContent = function setContent(show, content) {
  if (element) {
    var translaterResult = element.querySelector('.p-translater-result');

    if (show) {
      translaterResult.style.display = 'block';
      translaterResult.innerHTML = content;
      element.classList.add('active');
    } else {
      translaterResult.style.display = 'none';
      translaterResult.innerHTML = '';
      element.classList.remove('active');
    }
  }
};

var setup = function setup(o) {
  var target = document.querySelector('.m-main');
  target.removeEventListener('mousedown', data.setMousedown);

  data.setMousedown = function (e) {
    data.isInside = true;
    setContent(false);
    var epath = e.path || e.composedPath && e.composedPath();

    if (!data.isPathIn(epath, element)) {
      window.getSelection().empty();
    }
  };

  target.addEventListener('mousedown', data.setMousedown);
  document.removeEventListener('mouseup', data.setMouseup);

  data.setMouseup = function (e) {
    var query = window.getSelection().toString().trim();

    if (data.isInside && query.length > 0) {
      var epath = e.path || e.composedPath && e.composedPath();
      var rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
      element.style.transform = 'translateY(' + (window.scrollY + rect.y + rect.height - element.offsetTop + 8) + 'px)'; // set offset to target e.g. 8px

      if (data.isPathIn(epath, element.querySelector('.p-translater-bar-copy')) && query.length > 0) {
        if (document.execCommand('copy')) {
          setContent(true, '<p>Copied! 复制成功！</p>');
        }
      } else if (data.isPathIn(epath, element.querySelector('.p-translater-bar-zh'))) {
        onstart(element);

        _util["default"].baiduTranslate(credential, query, 'zh', function (data) {
          onended(element);

          if (data.error) {
            setContent(true, data.error);
          } else if (data.result) {
            setContent(true, data.result);
          }
        });
      } else if (data.isPathIn(epath, element.querySelector('.p-translater-bar-en'))) {
        onstart(element);

        _util["default"].baiduTranslate(credential, query, 'en', function (data) {
          onended(element);

          if (data.error) {
            setContent(true, data.error);
          } else if (data.result) {
            setContent(true, data.result);
          }
        });
      } else if (data.isPathIn(epath, element.querySelector('.p-translater-bar-jp'))) {
        onstart(element);

        _util["default"].baiduTranslate(credential, query, 'jp', function (data) {
          onended(element);

          if (data.error) {
            setContent(true, data.error);
          } else if (data.result) {
            setContent(true, data.result);
          }
        });
      } else {
        setContent(false);
      }
    } else {
      element.style.transform = 'translateY(0)';
      setContent(false);
    }

    data.isInside = false;
  };

  document.addEventListener('mouseup', data.setMouseup);
};

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);

    if (params) {
      credential = _util["default"].decodePass(params.baidu_translate.pass, params.baidu_translate.pointer);
      params.onstart && (onstart = params.onstart);
      params.onended && (onended = params.onended);
      setup();
    }

    callback && callback(element);
  });
};

var _default = {
  tag: tag,
  init: init
};
exports["default"] = _default;

},{"../common/part.js":8,"../common/util.js":10}],35:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'xaside';
var element = null;
var setClick = null;
var listener = null;

var setup = function setup(o) {
  var target = document.querySelector(':root'); // SetClick

  element.removeEventListener('click', setClick);

  setClick = function setClick() {
    if (target.classList.contains('closeAside')) {
      target.classList.remove('closeAside');
      element.classList.remove('active');
      listener && listener(false);
    } else {
      target.classList.add('closeAside');
      element.classList.add('active');
      listener && listener(true);
    }
  };

  element.addEventListener('click', setClick);
};

var on = function on(o) {
  document.querySelector(':root').classList.add('closeAside');
  element && element.classList.add('active');
};

var off = function off(o) {
  document.querySelector(':root').classList.remove('closeAside');
  element && element.classList.remove('active');
};

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);
    setup();

    if (params) {
      params.onclick && (listener = params.onclick);
    }

    callback && callback(element);
  });
};

var _default = {
  tag: tag,
  on: on,
  off: off,
  init: init
};
exports["default"] = _default;

},{"../common/part.js":8}],36:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'xcanvas';
var element = null;
var noCanvas = false;

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);

    if (params && typeof params.noCanvas === 'boolean' && typeof params.onchange === 'function') {
      noCanvas = params.noCanvas;
      params.onchange(noCanvas, element);

      element.onclick = function (e) {
        noCanvas = !noCanvas;
        params.onchange(noCanvas, element);
      };
    }

    callback && callback(element);
  });
};

var _default = {
  tag: tag,
  init: init
};
exports["default"] = _default;

},{"../common/part.js":8}],37:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'xdrawer';
var element = null;
var setClick = null;
var listener = null;

var setup = function setup(o) {
  var target = document.querySelector(':root'); // SetClick

  element.removeEventListener('click', setClick);

  setClick = function setClick() {
    if (target.classList.contains('closeDrawer')) {
      target.classList.remove('closeDrawer');
      element.classList.remove('active');
      listener && listener(false);
    } else {
      target.classList.add('closeDrawer');
      element.classList.add('active');
      listener && listener(true);
    }
  };

  element.addEventListener('click', setClick);
};

var on = function on(o) {
  document.querySelector(':root').classList.add('closeDrawer');
  element && element.classList.add('active');
};

var off = function off(o) {
  document.querySelector(':root').classList.remove('closeDrawer');
  element && element.classList.remove('active');
};

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);
    setup();

    if (params) {
      params.onclick && (listener = params.onclick);
    }

    callback && callback(element);
  });
};

var _default = {
  tag: tag,
  on: on,
  off: off,
  init: init
};
exports["default"] = _default;

},{"../common/part.js":8}],38:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _part = _interopRequireDefault(require("../common/part.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var tag = 'xsearch';
var element = null;
var setClick = null;
var listener = null;
var state = false;
var preventScroll = null;

var setup = function setup(o) {
  // PreventScroll
  preventScroll = function preventScroll(e) {
    e.preventDefault();
  }; // SetClick


  element.removeEventListener('click', setClick);

  setClick = function setClick() {
    state = !state;
    state ? on() : off();
  };

  element.addEventListener('click', setClick);
};

var init = function init(params, callback) {
  (0, _part["default"])(tag, function (el) {
    element = el;
    document.querySelector(tag).replaceWith(element);
    setup();

    if (params) {
      params.onclick && (listener = params.onclick);
    }

    callback && callback(element);
  });
};

var on = function on(o) {
  state = true;
  document.body.addEventListener('touchmove', preventScroll, false);
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  element && element.classList.add('active');
  listener && listener(state);
};

var off = function off(o) {
  state = false;
  document.body.removeEventListener('touchmove', preventScroll, false);
  document.body.style.position = 'initial';
  document.body.style.width = 'auto';
  element && element.classList.remove('active');
  listener && listener(state);
};

var _default = {
  tag: tag,
  init: init,
  on: on,
  off: off
};
exports["default"] = _default;

},{"../common/part.js":8}],39:[function(require,module,exports){
(function (setImmediate,clearImmediate){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _default = function _default(o) {
  !function (e, t) {
    window.APlayer = t();
  }(window, function () {
    return function (e) {
      var t = {};

      function n(i) {
        if (t[i]) return t[i].exports;
        var a = t[i] = {
          i: i,
          l: !1,
          exports: {}
        };
        return e[i].call(a.exports, a, a.exports, n), a.l = !0, a.exports;
      }

      return n.m = e, n.c = t, n.d = function (e, t, i) {
        n.o(e, t) || Object.defineProperty(e, t, {
          configurable: !1,
          enumerable: !0,
          get: i
        });
      }, n.r = function (e) {
        Object.defineProperty(e, "__esModule", {
          value: !0
        });
      }, n.n = function (e) {
        var t = e && e.__esModule ? function () {
          return e["default"];
        } : function () {
          return e;
        };
        return n.d(t, "a", t), t;
      }, n.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t);
      }, n.p = "/", n(n.s = 41);
    }([function (e, t, n) {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: !0
      });
      var i = /mobile/i.test(window.navigator.userAgent),
          a = {
        secondToTime: function secondToTime(e) {
          var t = Math.floor(e / 3600),
              n = Math.floor((e - 3600 * t) / 60),
              i = Math.floor(e - 3600 * t - 60 * n);
          return (t > 0 ? [t, n, i] : [n, i]).map(function (e) {
            return e < 10 ? "0" + e : "" + e;
          }).join(":");
        },
        getElementViewLeft: function getElementViewLeft(e) {
          var t = e.offsetLeft,
              n = e.offsetParent,
              i = document.body.scrollLeft + document.documentElement.scrollLeft;
          if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) for (; null !== n && n !== e;) {
            t += n.offsetLeft, n = n.offsetParent;
          } else for (; null !== n;) {
            t += n.offsetLeft, n = n.offsetParent;
          }
          return t - i;
        },
        getElementViewTop: function getElementViewTop(e, t) {
          for (var n, i = e.offsetTop, a = e.offsetParent; null !== a;) {
            i += a.offsetTop, a = a.offsetParent;
          }

          return n = document.body.scrollTop + document.documentElement.scrollTop, t ? i : i - n;
        },
        isMobile: i,
        storage: {
          set: function set(e, t) {
            localStorage.setItem(e, t);
          },
          get: function get(e) {
            return localStorage.getItem(e);
          }
        },
        nameMap: {
          dragStart: i ? "touchstart" : "mousedown",
          dragMove: i ? "touchmove" : "mousemove",
          dragEnd: i ? "touchend" : "mouseup"
        },
        randomOrder: function randomOrder(e) {
          return function (e) {
            for (var t = e.length - 1; t >= 0; t--) {
              var n = Math.floor(Math.random() * (t + 1)),
                  i = e[n];
              e[n] = e[t], e[t] = i;
            }

            return e;
          }([].concat(function (e) {
            if (Array.isArray(e)) {
              for (var t = 0, n = Array(e.length); t < e.length; t++) {
                n[t] = e[t];
              }

              return n;
            }

            return Array.from(e);
          }(Array(e))).map(function (e, t) {
            return t;
          }));
        }
      };
      t["default"] = a;
    }, function (e, t, n) {
      var i = n(2);

      e.exports = function (e) {
        "use strict";

        e = e || {};
        var t = "",
            n = i.$each,
            a = e.audio,
            r = (e.$value, e.$index, i.$escape),
            o = e.theme,
            s = e.index;
        return n(a, function (e, n) {
          t += '\n<li>\n    <span class="aplayer-list-cur" style="background-color: ', t += r(e.theme || o), t += ';"></span>\n    <span class="aplayer-list-index">', t += r(n + s), t += '</span>\n    <span class="aplayer-list-title">', t += r(e.name), t += '</span>\n    <span class="aplayer-list-author">', t += r(e.artist), t += "</span>\n</li>\n";
        }), t;
      };
    }, function (e, t, n) {
      "use strict";

      e.exports = n(15);
    }, function (e, t, n) {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: !0
      });
      var i = g(n(33)),
          a = g(n(32)),
          r = g(n(31)),
          o = g(n(30)),
          s = g(n(29)),
          l = g(n(28)),
          u = g(n(27)),
          c = g(n(26)),
          p = g(n(25)),
          d = g(n(24)),
          h = g(n(23)),
          y = g(n(22)),
          f = g(n(21)),
          v = g(n(20)),
          m = g(n(19));

      function g(e) {
        return e && e.__esModule ? e : {
          "default": e
        };
      }

      var w = {
        play: i["default"],
        pause: a["default"],
        volumeUp: r["default"],
        volumeDown: o["default"],
        volumeOff: s["default"],
        orderRandom: l["default"],
        orderList: u["default"],
        menu: c["default"],
        loopAll: p["default"],
        loopOne: d["default"],
        loopNone: h["default"],
        loading: y["default"],
        right: f["default"],
        skip: v["default"],
        lrc: m["default"]
      };
      t["default"] = w;
    }, function (e, t, n) {
      "use strict";

      var i,
          a = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (e) {
        return _typeof(e);
      } : function (e) {
        return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : _typeof(e);
      };

      i = function () {
        return this;
      }();

      try {
        i = i || Function("return this")() || (0, eval)("this");
      } catch (e) {
        "object" === ("undefined" == typeof window ? "undefined" : a(window)) && (i = window);
      }

      e.exports = i;
    }, function (e, t, n) {
      "use strict";

      var i,
          a,
          r = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (e) {
        return _typeof(e);
      } : function (e) {
        return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : _typeof(e);
      };
      void 0 === (a = "function" == typeof (i = function i() {
        if ("object" === ("undefined" == typeof window ? "undefined" : r(window)) && void 0 !== document.querySelectorAll && void 0 !== window.pageYOffset && void 0 !== history.pushState) {
          var e = function e(_e, t, n, i) {
            return n > i ? t : _e + (t - _e) * ((a = n / i) < .5 ? 4 * a * a * a : (a - 1) * (2 * a - 2) * (2 * a - 2) + 1);
            var a;
          },
              t = function t(_t, n, i, a) {
            n = n || 500;
            var r = (a = a || window).scrollTop || window.pageYOffset;
            if ("number" == typeof _t) var o = parseInt(_t);else var o = function (e, t) {
              return "HTML" === e.nodeName ? -t : e.getBoundingClientRect().top + t;
            }(_t, r);

            var s = Date.now(),
                l = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function (e) {
              window.setTimeout(e, 15);
            };

            !function u() {
              var c = Date.now() - s;
              a !== window ? a.scrollTop = e(r, o, c, n) : window.scroll(0, e(r, o, c, n)), c > n ? "function" == typeof i && i(_t) : l(u);
            }();
          },
              n = function n(e) {
            if (!e.defaultPrevented) {
              e.preventDefault(), location.hash !== this.hash && window.history.pushState(null, null, this.hash);
              var n = document.getElementById(this.hash.substring(1));
              if (!n) return;
              t(n, 500, function (e) {
                location.replace("#" + e.id);
              });
            }
          };

          return document.addEventListener("DOMContentLoaded", function () {
            for (var e, t = document.querySelectorAll('a[href^="#"]:not([href="#"])'), i = t.length; e = t[--i];) {
              e.addEventListener("click", n, !1);
            }
          }), t;
        }
      }) ? i.call(t, n, t, e) : i) || (e.exports = a);
    }, function (e, t, n) {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: !0
      });

      var i = function () {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var i = t[n];
            i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(e, i.key, i);
          }
        }

        return function (t, n, i) {
          return n && e(t.prototype, n), i && e(t, i), t;
        };
      }(),
          a = s(n(1)),
          r = s(n(0)),
          o = s(n(5));

      function s(e) {
        return e && e.__esModule ? e : {
          "default": e
        };
      }

      var l = function () {
        function e(t) {
          !function (e, t) {
            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
          }(this, e), this.player = t, this.index = 0, this.audios = this.player.options.audio, this.bindEvents();
        }

        return i(e, [{
          key: "bindEvents",
          value: function value() {
            var e = this;
            this.player.template.list.addEventListener("click", function (t) {
              var n = void 0;
              n = "LI" === t.target.tagName.toUpperCase() ? t.target : t.target.parentElement;
              var i = parseInt(n.getElementsByClassName("aplayer-list-index")[0].innerHTML) - 1;
              i !== e.index ? (e["switch"](i), e.player.play()) : e.player.toggle();
            });
          }
        }, {
          key: "show",
          value: function value() {
            this.player.events.trigger("listshow"), this.player.template.list.classList.remove("aplayer-list-hide"), this.player.template.listOl.scrollTop = 33 * this.index;
          }
        }, {
          key: "hide",
          value: function value() {
            this.player.events.trigger("listhide"), this.player.template.list.classList.add("aplayer-list-hide");
          }
        }, {
          key: "toggle",
          value: function value() {
            this.player.template.list.classList.contains("aplayer-list-hide") ? this.show() : this.hide();
          }
        }, {
          key: "add",
          value: function value(e) {
            this.player.events.trigger("listadd", {
              audios: e
            }), "[object Array]" !== Object.prototype.toString.call(e) && (e = [e]), e.map(function (e) {
              return e.name = e.name || e.title || "Audio name", e.artist = e.artist || e.author || "Audio artist", e.cover = e.cover || e.pic, e.type = e.type || "normal", e;
            });
            var t = !(this.audios.length > 1),
                n = 0 === this.audios.length;
            this.player.template.listOl.innerHTML += (0, a["default"])({
              theme: this.player.options.theme,
              audio: e,
              index: this.audios.length + 1
            }), this.audios = this.audios.concat(e), t && this.audios.length > 1 && this.player.container.classList.add("aplayer-withlist"), this.player.randomOrder = r["default"].randomOrder(this.audios.length), this.player.template.listCurs = this.player.container.querySelectorAll(".aplayer-list-cur"), this.player.template.listCurs[this.audios.length - 1].style.backgroundColor = e.theme || this.player.options.theme, n && ("random" === this.player.options.order ? this["switch"](this.player.randomOrder[0]) : this["switch"](0));
          }
        }, {
          key: "remove",
          value: function value(e) {
            if (this.player.events.trigger("listremove", {
              index: e
            }), this.audios[e]) if (this.audios.length > 1) {
              var t = this.player.container.querySelectorAll(".aplayer-list li");
              t[e].remove(), this.audios.splice(e, 1), this.player.lrc && this.player.lrc.remove(e), e === this.index && (this.audios[e] ? this["switch"](e) : this["switch"](e - 1)), this.index > e && this.index--;

              for (var n = e; n < t.length; n++) {
                t[n].getElementsByClassName("aplayer-list-index")[0].textContent = n;
              }

              1 === this.audios.length && this.player.container.classList.remove("aplayer-withlist"), this.player.template.listCurs = this.player.container.querySelectorAll(".aplayer-list-cur");
            } else this.clear();
          }
        }, {
          key: "switch",
          value: function value(e) {
            if (this.player.events.trigger("listswitch", {
              index: e
            }), void 0 !== e && this.audios[e]) {
              this.index = e;
              var t = this.audios[this.index];
              this.player.template.pic.style.backgroundImage = t.cover ? "url('" + t.cover + "')" : "", this.player.theme(this.audios[this.index].theme || this.player.options.theme, this.index, !1), this.player.template.title.innerHTML = t.name, this.player.template.author.innerHTML = t.artist ? " - " + t.artist : "";
              var n = this.player.container.getElementsByClassName("aplayer-list-light")[0];
              n && n.classList.remove("aplayer-list-light"), this.player.container.querySelectorAll(".aplayer-list li")[this.index].classList.add("aplayer-list-light"), (0, o["default"])(33 * this.index, 500, null, this.player.template.listOl), this.player.setAudio(t), this.player.lrc && this.player.lrc["switch"](this.index), this.player.lrc && this.player.lrc.update(0), 1 !== this.player.duration && (this.player.template.dtime.innerHTML = r["default"].secondToTime(this.player.duration));
            }
          }
        }, {
          key: "clear",
          value: function value() {
            this.player.events.trigger("listclear"), this.index = 0, this.player.container.classList.remove("aplayer-withlist"), this.player.pause(), this.audios = [], this.player.lrc && this.player.lrc.clear(), this.player.audio.src = "", this.player.template.listOl.innerHTML = "", this.player.template.pic.style.backgroundImage = "", this.player.theme(this.player.options.theme, this.index, !1), this.player.template.title.innerHTML = "No audio", this.player.template.author.innerHTML = "", this.player.bar.set("loaded", 0, "width"), this.player.template.dtime.innerHTML = r["default"].secondToTime(0);
          }
        }]), e;
      }();

      t["default"] = l;
    }, function (e, t, n) {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: !0
      });

      var i = function () {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var i = t[n];
            i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(e, i.key, i);
          }
        }

        return function (t, n, i) {
          return n && e(t.prototype, n), i && e(t, i), t;
        };
      }();

      var a = function () {
        function e() {
          !function (e, t) {
            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
          }(this, e), this.events = {}, this.audioEvents = ["abort", "canplay", "canplaythrough", "durationchange", "emptied", "ended", "error", "loadeddata", "loadedmetadata", "loadstart", "mozaudioavailable", "pause", "play", "playing", "progress", "ratechange", "seeked", "seeking", "stalled", "suspend", "timeupdate", "volumechange", "waiting"], this.playerEvents = ["destroy", "listshow", "listhide", "listadd", "listremove", "listswitch", "listclear", "noticeshow", "noticehide", "lrcshow", "lrchide"];
        }

        return i(e, [{
          key: "on",
          value: function value(e, t) {
            this.type(e) && "function" == typeof t && (this.events[e] || (this.events[e] = []), this.events[e].push(t));
          }
        }, {
          key: "trigger",
          value: function value(e, t) {
            if (this.events[e] && this.events[e].length) for (var n = 0; n < this.events[e].length; n++) {
              this.events[e][n](t);
            }
          }
        }, {
          key: "type",
          value: function value(e) {
            return -1 !== this.playerEvents.indexOf(e) ? "player" : -1 !== this.audioEvents.indexOf(e) ? "audio" : (console.error("Unknown event name: " + e), null);
          }
        }]), e;
      }();

      t["default"] = a;
    }, function (e, t, n) {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: !0
      });

      var i = function () {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var i = t[n];
            i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(e, i.key, i);
          }
        }

        return function (t, n, i) {
          return n && e(t.prototype, n), i && e(t, i), t;
        };
      }();

      var a = function () {
        function e(t) {
          !function (e, t) {
            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
          }(this, e), this.player = t, window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (e) {
            window.setTimeout(e, 1e3 / 60);
          }, this.types = ["loading"], this.init();
        }

        return i(e, [{
          key: "init",
          value: function value() {
            var e = this;
            this.types.forEach(function (t) {
              e["init" + t + "Checker"]();
            });
          }
        }, {
          key: "initloadingChecker",
          value: function value() {
            var e = this,
                t = 0,
                n = 0,
                i = !1;
            this.loadingChecker = setInterval(function () {
              e.enableloadingChecker && (n = e.player.audio.currentTime, i || n !== t || e.player.audio.paused || (e.player.container.classList.add("aplayer-loading"), i = !0), i && n > t && !e.player.audio.paused && (e.player.container.classList.remove("aplayer-loading"), i = !1), t = n);
            }, 100);
          }
        }, {
          key: "enable",
          value: function value(e) {
            this["enable" + e + "Checker"] = !0, "fps" === e && this.initfpsChecker();
          }
        }, {
          key: "disable",
          value: function value(e) {
            this["enable" + e + "Checker"] = !1;
          }
        }, {
          key: "destroy",
          value: function value() {
            var e = this;
            this.types.forEach(function (t) {
              e["enable" + t + "Checker"] = !1, e[t + "Checker"] && clearInterval(e[t + "Checker"]);
            });
          }
        }]), e;
      }();

      t["default"] = a;
    }, function (e, t, n) {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: !0
      });

      var i = function () {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var i = t[n];
            i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(e, i.key, i);
          }
        }

        return function (t, n, i) {
          return n && e(t.prototype, n), i && e(t, i), t;
        };
      }(),
          a = o(n(0)),
          r = o(n(3));

      function o(e) {
        return e && e.__esModule ? e : {
          "default": e
        };
      }

      var s = function () {
        function e(t) {
          !function (e, t) {
            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
          }(this, e), this.player = t, this.initPlayButton(), this.initPlayBar(), this.initOrderButton(), this.initLoopButton(), this.initMenuButton(), a["default"].isMobile || this.initVolumeButton(), this.initMiniSwitcher(), this.initSkipButton(), this.initLrcButton();
        }

        return i(e, [{
          key: "initPlayButton",
          value: function value() {
            var e = this;
            this.player.template.pic.addEventListener("click", function () {
              e.player.toggle();
            });
          }
        }, {
          key: "initPlayBar",
          value: function value() {
            var e = this,
                t = function t(_t2) {
              var n = ((_t2.clientX || _t2.changedTouches[0].clientX) - a["default"].getElementViewLeft(e.player.template.barWrap)) / e.player.template.barWrap.clientWidth;
              n = Math.max(n, 0), n = Math.min(n, 1), e.player.bar.set("played", n, "width"), e.player.lrc && e.player.lrc.update(n * e.player.duration), e.player.template.ptime.innerHTML = a["default"].secondToTime(n * e.player.duration);
            },
                n = function n(i) {
              document.removeEventListener(a["default"].nameMap.dragEnd, n), document.removeEventListener(a["default"].nameMap.dragMove, t);
              var r = ((i.clientX || i.changedTouches[0].clientX) - a["default"].getElementViewLeft(e.player.template.barWrap)) / e.player.template.barWrap.clientWidth;
              r = Math.max(r, 0), r = Math.min(r, 1), e.player.bar.set("played", r, "width"), e.player.seek(e.player.bar.get("played", "width") * e.player.duration), e.player.disableTimeupdate = !1;
            };

            this.player.template.barWrap.addEventListener(a["default"].nameMap.dragStart, function () {
              e.player.disableTimeupdate = !0, document.addEventListener(a["default"].nameMap.dragMove, t), document.addEventListener(a["default"].nameMap.dragEnd, n);
            });
          }
        }, {
          key: "initVolumeButton",
          value: function value() {
            var e = this;
            this.player.template.volumeButton.addEventListener("click", function () {
              e.player.audio.muted ? (e.player.audio.muted = !1, e.player.switchVolumeIcon(), e.player.bar.set("volume", e.player.volume(), "height")) : (e.player.audio.muted = !0, e.player.switchVolumeIcon(), e.player.bar.set("volume", 0, "height"));
            });

            var t = function t(_t3) {
              var n = 1 - ((_t3.clientY || _t3.changedTouches[0].clientY) - a["default"].getElementViewTop(e.player.template.volumeBar, e.player.options.fixed)) / e.player.template.volumeBar.clientHeight;
              n = Math.max(n, 0), n = Math.min(n, 1), e.player.volume(n);
            },
                n = function n(i) {
              e.player.template.volumeBarWrap.classList.remove("aplayer-volume-bar-wrap-active"), document.removeEventListener(a["default"].nameMap.dragEnd, n), document.removeEventListener(a["default"].nameMap.dragMove, t);
              var r = 1 - ((i.clientY || i.changedTouches[0].clientY) - a["default"].getElementViewTop(e.player.template.volumeBar, e.player.options.fixed)) / e.player.template.volumeBar.clientHeight;
              r = Math.max(r, 0), r = Math.min(r, 1), e.player.volume(r);
            };

            this.player.template.volumeBarWrap.addEventListener(a["default"].nameMap.dragStart, function () {
              e.player.template.volumeBarWrap.classList.add("aplayer-volume-bar-wrap-active"), document.addEventListener(a["default"].nameMap.dragMove, t), document.addEventListener(a["default"].nameMap.dragEnd, n);
            });
          }
        }, {
          key: "initOrderButton",
          value: function value() {
            var e = this;
            this.player.template.order.addEventListener("click", function () {
              "list" === e.player.options.order ? (e.player.options.order = "random", e.player.template.order.innerHTML = r["default"].orderRandom) : "random" === e.player.options.order && (e.player.options.order = "list", e.player.template.order.innerHTML = r["default"].orderList);
            });
          }
        }, {
          key: "initLoopButton",
          value: function value() {
            var e = this;
            this.player.template.loop.addEventListener("click", function () {
              e.player.list.audios.length > 1 ? "one" === e.player.options.loop ? (e.player.options.loop = "none", e.player.template.loop.innerHTML = r["default"].loopNone) : "none" === e.player.options.loop ? (e.player.options.loop = "all", e.player.template.loop.innerHTML = r["default"].loopAll) : "all" === e.player.options.loop && (e.player.options.loop = "one", e.player.template.loop.innerHTML = r["default"].loopOne) : "one" === e.player.options.loop || "all" === e.player.options.loop ? (e.player.options.loop = "none", e.player.template.loop.innerHTML = r["default"].loopNone) : "none" === e.player.options.loop && (e.player.options.loop = "all", e.player.template.loop.innerHTML = r["default"].loopAll);
            });
          }
        }, {
          key: "initMenuButton",
          value: function value() {
            var e = this;
            this.player.template.menu.addEventListener("click", function () {
              e.player.list.toggle();
            });
          }
        }, {
          key: "initMiniSwitcher",
          value: function value() {
            var e = this;
            this.player.template.miniSwitcher.addEventListener("click", function () {
              e.player.setMode("mini" === e.player.mode ? "normal" : "mini");
            });
          }
        }, {
          key: "initSkipButton",
          value: function value() {
            var e = this;
            this.player.template.skipBackButton.addEventListener("click", function () {
              e.player.skipBack();
            }), this.player.template.skipForwardButton.addEventListener("click", function () {
              e.player.skipForward();
            }), this.player.template.skipPlayButton.addEventListener("click", function () {
              e.player.toggle();
            });
          }
        }, {
          key: "initLrcButton",
          value: function value() {
            var e = this;
            this.player.template.lrcButton.addEventListener("click", function () {
              e.player.template.lrcButton.classList.contains("aplayer-icon-lrc-inactivity") ? (e.player.template.lrcButton.classList.remove("aplayer-icon-lrc-inactivity"), e.player.lrc && e.player.lrc.show()) : (e.player.template.lrcButton.classList.add("aplayer-icon-lrc-inactivity"), e.player.lrc && e.player.lrc.hide());
            });
          }
        }]), e;
      }();

      t["default"] = s;
    }, function (e, t, n) {
      var i = n(2);

      e.exports = function (e) {
        "use strict";

        e = e || {};
        var t = "",
            n = i.$each,
            a = e.lyrics,
            r = (e.$value, e.$index, i.$escape);
        return n(a, function (e, n) {
          t += "\n    <p", 0 === n && (t += ' class="aplayer-lrc-current"'), t += ">", t += r(e[1]), t += "</p>\n";
        }), t;
      };
    }, function (e, t, n) {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: !0
      });

      var i,
          a = function () {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var i = t[n];
            i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(e, i.key, i);
          }
        }

        return function (t, n, i) {
          return n && e(t.prototype, n), i && e(t, i), t;
        };
      }(),
          r = n(10),
          o = (i = r) && i.__esModule ? i : {
        "default": i
      };

      var s = function () {
        function e(t) {
          !function (e, t) {
            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
          }(this, e), this.container = t.container, this.async = t.async, this.player = t.player, this.parsed = [], this.index = 0, this.current = [];
        }

        return a(e, [{
          key: "show",
          value: function value() {
            this.player.events.trigger("lrcshow"), this.player.template.lrcWrap.classList.remove("aplayer-lrc-hide");
          }
        }, {
          key: "hide",
          value: function value() {
            this.player.events.trigger("lrchide"), this.player.template.lrcWrap.classList.add("aplayer-lrc-hide");
          }
        }, {
          key: "toggle",
          value: function value() {
            this.player.template.lrcWrap.classList.contains("aplayer-lrc-hide") ? this.show() : this.hide();
          }
        }, {
          key: "update",
          value: function value() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.player.audio.currentTime;
            if (this.index > this.current.length - 1 || e < this.current[this.index][0] || !this.current[this.index + 1] || e >= this.current[this.index + 1][0]) for (var t = 0; t < this.current.length; t++) {
              e >= this.current[t][0] && (!this.current[t + 1] || e < this.current[t + 1][0]) && (this.index = t, this.container.style.transform = "translateY(" + 16 * -this.index + "px)", this.container.style.webkitTransform = "translateY(" + 16 * -this.index + "px)", this.container.getElementsByClassName("aplayer-lrc-current")[0].classList.remove("aplayer-lrc-current"), this.container.getElementsByTagName("p")[t] && this.container.getElementsByTagName("p")[t].classList.add("aplayer-lrc-current"));
            }
          }
        }, {
          key: "switch",
          value: function value(e) {
            var t = this;
            if (!this.parsed[e]) if (this.async) {
              this.parsed[e] = [["00:00", "Loading"]];
              var n = new XMLHttpRequest();

              n.onreadystatechange = function () {
                e === t.player.list.index && 4 === n.readyState && (n.status >= 200 && n.status < 300 || 304 === n.status ? t.parsed[e] = t.parse(n.responseText) : (t.player.notice("LRC file request fails: status " + n.status), t.parsed[e] = [["00:00", "Not available"]]), t.container.innerHTML = (0, o["default"])({
                  lyrics: t.parsed[e]
                }), t.update(0), t.current = t.parsed[e]);
              };

              var i = this.player.list.audios[e].lrc;
              n.open("get", i, !0), n.send(null);
            } else this.player.list.audios[e].lrc ? this.parsed[e] = this.parse(this.player.list.audios[e].lrc) : this.parsed[e] = [["00:00", "Not available"]];
            this.container.innerHTML = (0, o["default"])({
              lyrics: this.parsed[e]
            }), this.update(0), this.current = this.parsed[e];
          }
        }, {
          key: "parse",
          value: function value(e) {
            if (e) {
              for (var t = (e = e.replace(/([^\]^\n])\[/g, function (e, t) {
                return t + "\n[";
              })).split("\n"), n = [], i = t.length, a = 0; a < i; a++) {
                var r = t[a].match(/\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g),
                    o = t[a].replace(/.*\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g, "").replace(/<(\d{2}):(\d{2})(\.(\d{2,3}))?>/g, "").replace(/^\s+|\s+$/g, "");
                if (r) for (var s = r.length, l = 0; l < s; l++) {
                  var u = /\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/.exec(r[l]),
                      c = 60 * u[1] + parseInt(u[2]) + (u[4] ? parseInt(u[4]) / (2 === (u[4] + "").length ? 100 : 1e3) : 0);
                  n.push([c, o]);
                }
              }

              return (n = n.filter(function (e) {
                return e[1];
              })).sort(function (e, t) {
                return e[0] - t[0];
              }), n;
            }

            return [];
          }
        }, {
          key: "remove",
          value: function value(e) {
            this.parsed.splice(e, 1);
          }
        }, {
          key: "clear",
          value: function value() {
            this.parsed = [], this.container.innerHTML = "";
          }
        }]), e;
      }();

      t["default"] = s;
    }, function (e, t, n) {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: !0
      });

      var i,
          a = function () {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var i = t[n];
            i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(e, i.key, i);
          }
        }

        return function (t, n, i) {
          return n && e(t.prototype, n), i && e(t, i), t;
        };
      }(),
          r = n(0),
          o = (i = r) && i.__esModule ? i : {
        "default": i
      };

      var s = function () {
        function e(t) {
          !function (e, t) {
            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
          }(this, e), this.storageName = t.options.storageName, this.data = JSON.parse(o["default"].storage.get(this.storageName)), this.data || (this.data = {}), this.data.volume = this.data.volume || t.options.volume;
        }

        return a(e, [{
          key: "get",
          value: function value(e) {
            return this.data[e];
          }
        }, {
          key: "set",
          value: function value(e, t) {
            this.data[e] = t, o["default"].storage.set(this.storageName, JSON.stringify(this.data));
          }
        }]), e;
      }();

      t["default"] = s;
    }, function (e, t, n) {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: !0
      });

      var i = function () {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var i = t[n];
            i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(e, i.key, i);
          }
        }

        return function (t, n, i) {
          return n && e(t.prototype, n), i && e(t, i), t;
        };
      }();

      var a = function () {
        function e(t) {
          !function (e, t) {
            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
          }(this, e), this.elements = {}, this.elements.volume = t.volume, this.elements.played = t.played, this.elements.loaded = t.loaded;
        }

        return i(e, [{
          key: "set",
          value: function value(e, t, n) {
            t = Math.max(t, 0), t = Math.min(t, 1), this.elements[e].style[n] = 100 * t + "%";
          }
        }, {
          key: "get",
          value: function value(e, t) {
            return parseFloat(this.elements[e].style[t]) / 100;
          }
        }]), e;
      }();

      t["default"] = a;
    }, function (e, t, n) {
      "use strict";

      (function (t) {
        e.exports = !1;

        try {
          e.exports = "[object process]" === Object.prototype.toString.call(t.process);
        } catch (e) {}
      }).call(this, n(4));
    }, function (e, t, n) {
      "use strict";

      (function (t) {
        var i = n(14),
            a = Object.create(i ? t : window),
            r = /["&'<>]/;
        a.$escape = function (e) {
          return function (e) {
            var t = "" + e,
                n = r.exec(t);
            if (!n) return e;
            var i = "",
                a = void 0,
                o = void 0,
                s = void 0;

            for (a = n.index, o = 0; a < t.length; a++) {
              switch (t.charCodeAt(a)) {
                case 34:
                  s = "&#34;";
                  break;

                case 38:
                  s = "&#38;";
                  break;

                case 39:
                  s = "&#39;";
                  break;

                case 60:
                  s = "&#60;";
                  break;

                case 62:
                  s = "&#62;";
                  break;

                default:
                  continue;
              }

              o !== a && (i += t.substring(o, a)), o = a + 1, i += s;
            }

            return o !== a ? i + t.substring(o, a) : i;
          }(function e(t) {
            "string" != typeof t && (t = void 0 === t || null === t ? "" : "function" == typeof t ? e(t.call(t)) : JSON.stringify(t));
            return t;
          }(e));
        }, a.$each = function (e, t) {
          if (Array.isArray(e)) for (var n = 0, i = e.length; n < i; n++) {
            t(e[n], n);
          } else for (var a in e) {
            t(e[a], a);
          }
        }, e.exports = a;
      }).call(this, n(4));
    }, function (e, t, n) {
      var i = n(2);

      e.exports = function (e) {
        "use strict";

        var t = "",
            a = (e = e || {}).options,
            r = e.cover,
            o = i.$escape,
            s = e.icons,
            l = (arguments[1], function (e) {
          return t += e;
        }),
            u = e.getObject;
        e.theme, e.audio, e.index;
        return a.fixed ? (t += '\n<div class="aplayer-list', a.listFolded && (t += " aplayer-list-hide"), t += '"', a.listMaxHeight && (t += ' style="max-height: ', t += o(a.listMaxHeight), t += '"'), t += ">\n    <ol", a.listMaxHeight && (t += ' style="max-height: ', t += o(a.listMaxHeight), t += '"'), t += ">\n        ", l(n(1)(u({
          theme: a.theme,
          audio: a.audio,
          index: 1
        }))), t += '\n    </ol>\n</div>\n<div class="aplayer-body">\n    <div class="aplayer-pic" style="', r && (t += "background-image: url(&quot;", t += o(r), t += "&quot;);"), t += "background-color: ", t += o(a.theme), t += ';">\n        <div class="aplayer-button aplayer-play">', t += s.play, t += '</div>\n    </div>\n    <div class="aplayer-info" style="display: none;">\n        <div class="aplayer-music">\n            <span class="aplayer-title">No audio</span>\n            <span class="aplayer-author"></span>\n        </div>\n        <div class="aplayer-controller">\n            <div class="aplayer-bar-wrap">\n                <div class="aplayer-bar">\n                    <div class="aplayer-loaded" style="width: 0"></div>\n                    <div class="aplayer-played" style="width: 0; background: ', t += o(a.theme), t += ';">\n                        <span class="aplayer-thumb" style="background: ', t += o(a.theme), t += ';">\n                            <span class="aplayer-loading-icon">', t += s.loading, t += '</span>\n                        </span>\n                    </div>\n                </div>\n            </div>\n            <div class="aplayer-time">\n                <span class="aplayer-time-inner">\n                    <span class="aplayer-ptime">00:00</span> / <span class="aplayer-dtime">00:00</span>\n                </span>\n                <span class="aplayer-icon aplayer-icon-back">\n                    ', t += s.skip, t += '\n                </span>\n                <span class="aplayer-icon aplayer-icon-play">\n                    ', t += s.play, t += '\n                </span>\n                <span class="aplayer-icon aplayer-icon-forward">\n                    ', t += s.skip, t += '\n                </span>\n                <div class="aplayer-volume-wrap">\n                    <button type="button" class="aplayer-icon aplayer-icon-volume-down">\n                        ', t += s.volumeDown, t += '\n                    </button>\n                    <div class="aplayer-volume-bar-wrap">\n                        <div class="aplayer-volume-bar">\n                            <div class="aplayer-volume" style="height: 80%; background: ', t += o(a.theme), t += ';"></div>\n                        </div>\n                    </div>\n                </div>\n                <button type="button" class="aplayer-icon aplayer-icon-order">\n                    ', "list" === a.order ? t += s.orderList : "random" === a.order && (t += s.orderRandom), t += '\n                </button>\n                <button type="button" class="aplayer-icon aplayer-icon-loop">\n                    ', "one" === a.loop ? t += s.loopOne : "all" === a.loop ? t += s.loopAll : "none" === a.loop && (t += s.loopNone), t += '\n                </button>\n                <button type="button" class="aplayer-icon aplayer-icon-menu">\n                    ', t += s.menu, t += '\n                </button>\n                <button type="button" class="aplayer-icon aplayer-icon-lrc">\n                    ', t += s.lrc, t += '\n                </button>\n            </div>\n        </div>\n    </div>\n    <div class="aplayer-notice"></div>\n    <div class="aplayer-miniswitcher"><button class="aplayer-icon">', t += s.right, t += '</button></div>\n</div>\n<div class="aplayer-lrc">\n    <div class="aplayer-lrc-contents" style="transform: translateY(0); -webkit-transform: translateY(0);"></div>\n</div>\n') : (t += '\n<div class="aplayer-body">\n    <div class="aplayer-pic" style="', r && (t += "background-image: url(&quot;", t += o(r), t += "&quot;);"), t += "background-color: ", t += o(a.theme), t += ';">\n        <div class="aplayer-button aplayer-play">', t += s.play, t += '</div>\n    </div>\n    <div class="aplayer-info">\n        <div class="aplayer-music">\n            <span class="aplayer-title">No audio</span>\n            <span class="aplayer-author"></span>\n        </div>\n        <div class="aplayer-lrc">\n            <div class="aplayer-lrc-contents" style="transform: translateY(0); -webkit-transform: translateY(0);"></div>\n        </div>\n        <div class="aplayer-controller">\n            <div class="aplayer-bar-wrap">\n                <div class="aplayer-bar">\n                    <div class="aplayer-loaded" style="width: 0"></div>\n                    <div class="aplayer-played" style="width: 0; background: ', t += o(a.theme), t += ';">\n                        <span class="aplayer-thumb" style="background: ', t += o(a.theme), t += ';">\n                            <span class="aplayer-loading-icon">', t += s.loading, t += '</span>\n                        </span>\n                    </div>\n                </div>\n            </div>\n            <div class="aplayer-time">\n                <span class="aplayer-time-inner">\n                    <span class="aplayer-ptime">00:00</span> / <span class="aplayer-dtime">00:00</span>\n                </span>\n                <span class="aplayer-icon aplayer-icon-back">\n                    ', t += s.skip, t += '\n                </span>\n                <span class="aplayer-icon aplayer-icon-play">\n                    ', t += s.play, t += '\n                </span>\n                <span class="aplayer-icon aplayer-icon-forward">\n                    ', t += s.skip, t += '\n                </span>\n                <div class="aplayer-volume-wrap">\n                    <button type="button" class="aplayer-icon aplayer-icon-volume-down">\n                        ', t += s.volumeDown, t += '\n                    </button>\n                    <div class="aplayer-volume-bar-wrap">\n                        <div class="aplayer-volume-bar">\n                            <div class="aplayer-volume" style="height: 80%; background: ', t += o(a.theme), t += ';"></div>\n                        </div>\n                    </div>\n                </div>\n                <button type="button" class="aplayer-icon aplayer-icon-order">\n                    ', "list" === a.order ? t += s.orderList : "random" === a.order && (t += s.orderRandom), t += '\n                </button>\n                <button type="button" class="aplayer-icon aplayer-icon-loop">\n                    ', "one" === a.loop ? t += s.loopOne : "all" === a.loop ? t += s.loopAll : "none" === a.loop && (t += s.loopNone), t += '\n                </button>\n                <button type="button" class="aplayer-icon aplayer-icon-menu">\n                    ', t += s.menu, t += '\n                </button>\n                <button type="button" class="aplayer-icon aplayer-icon-lrc">\n                    ', t += s.lrc, t += '\n                </button>\n            </div>\n        </div>\n    </div>\n    <div class="aplayer-notice"></div>\n    <div class="aplayer-miniswitcher"><button class="aplayer-icon">', t += s.right, t += '</button></div>\n</div>\n<div class="aplayer-list', a.listFolded && (t += " aplayer-list-hide"), t += '"', a.listMaxHeight && (t += ' style="max-height: ', t += o(a.listMaxHeight), t += '"'), t += ">\n    <ol", a.listMaxHeight && (t += ' style="max-height: ', t += o(a.listMaxHeight), t += '"'), t += ">\n        ", l(n(1)(u({
          theme: a.theme,
          audio: a.audio,
          index: 1
        }))), t += "\n    </ol>\n</div>\n"), t;
      };
    }, function (e, t, n) {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: !0
      });

      var i = function () {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var i = t[n];
            i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(e, i.key, i);
          }
        }

        return function (t, n, i) {
          return n && e(t.prototype, n), i && e(t, i), t;
        };
      }(),
          a = o(n(3)),
          r = o(n(16));

      function o(e) {
        return e && e.__esModule ? e : {
          "default": e
        };
      }

      var s = function () {
        function e(t) {
          !function (e, t) {
            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
          }(this, e), this.container = t.container, this.options = t.options, this.randomOrder = t.randomOrder, this.init();
        }

        return i(e, [{
          key: "init",
          value: function value() {
            var e = "";
            this.options.audio.length && (e = "random" === this.options.order ? this.options.audio[this.randomOrder[0]].cover : this.options.audio[0].cover), this.container.innerHTML = (0, r["default"])({
              options: this.options,
              icons: a["default"],
              cover: e,
              getObject: function getObject(e) {
                return e;
              }
            }), this.lrc = this.container.querySelector(".aplayer-lrc-contents"), this.lrcWrap = this.container.querySelector(".aplayer-lrc"), this.ptime = this.container.querySelector(".aplayer-ptime"), this.info = this.container.querySelector(".aplayer-info"), this.time = this.container.querySelector(".aplayer-time"), this.barWrap = this.container.querySelector(".aplayer-bar-wrap"), this.button = this.container.querySelector(".aplayer-button"), this.body = this.container.querySelector(".aplayer-body"), this.list = this.container.querySelector(".aplayer-list"), this.listOl = this.container.querySelector(".aplayer-list ol"), this.listCurs = this.container.querySelectorAll(".aplayer-list-cur"), this.played = this.container.querySelector(".aplayer-played"), this.loaded = this.container.querySelector(".aplayer-loaded"), this.thumb = this.container.querySelector(".aplayer-thumb"), this.volume = this.container.querySelector(".aplayer-volume"), this.volumeBar = this.container.querySelector(".aplayer-volume-bar"), this.volumeButton = this.container.querySelector(".aplayer-time button"), this.volumeBarWrap = this.container.querySelector(".aplayer-volume-bar-wrap"), this.loop = this.container.querySelector(".aplayer-icon-loop"), this.order = this.container.querySelector(".aplayer-icon-order"), this.menu = this.container.querySelector(".aplayer-icon-menu"), this.pic = this.container.querySelector(".aplayer-pic"), this.title = this.container.querySelector(".aplayer-title"), this.author = this.container.querySelector(".aplayer-author"), this.dtime = this.container.querySelector(".aplayer-dtime"), this.notice = this.container.querySelector(".aplayer-notice"), this.miniSwitcher = this.container.querySelector(".aplayer-miniswitcher"), this.skipBackButton = this.container.querySelector(".aplayer-icon-back"), this.skipForwardButton = this.container.querySelector(".aplayer-icon-forward"), this.skipPlayButton = this.container.querySelector(".aplayer-icon-play"), this.lrcButton = this.container.querySelector(".aplayer-icon-lrc");
          }
        }]), e;
      }();

      t["default"] = s;
    }, function (e, t, n) {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: !0
      }), t["default"] = function (e) {
        var t = {
          container: e.element || document.getElementsByClassName("aplayer")[0],
          mini: e.narrow || e.fixed || !1,
          fixed: !1,
          autoplay: !1,
          mutex: !0,
          lrcType: e.showlrc || e.lrc || 0,
          preload: "auto",
          theme: "#b7daff",
          loop: "all",
          order: "list",
          volume: .7,
          listFolded: e.fixed,
          listMaxHeight: e.listmaxheight || "250px",
          audio: e.music || [],
          storageName: "aplayer-setting"
        };

        for (var n in t) {
          t.hasOwnProperty(n) && !e.hasOwnProperty(n) && (e[n] = t[n]);
        }

        return "[object Array]" !== Object.prototype.toString.call(e.audio) && (e.audio = [e.audio]), e.audio.map(function (e) {
          return e.name = e.name || e.title || "Audio name", e.artist = e.artist || e.author || "Audio artist", e.cover = e.cover || e.pic, e.type = e.type || "normal", e;
        }), e.audio.length <= 1 && "one" === e.loop && (e.loop = "all"), e;
      };
    }, function (e, t) {
      e.exports = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32"><path d="M26.667 5.333h-21.333c-0 0-0.001 0-0.001 0-1.472 0-2.666 1.194-2.666 2.666 0 0 0 0.001 0 0.001v-0 16c0 0 0 0.001 0 0.001 0 1.472 1.194 2.666 2.666 2.666 0 0 0.001 0 0.001 0h21.333c0 0 0.001 0 0.001 0 1.472 0 2.666-1.194 2.666-2.666 0-0 0-0.001 0-0.001v0-16c0-0 0-0.001 0-0.001 0-1.472-1.194-2.666-2.666-2.666-0 0-0.001 0-0.001 0h0zM5.333 16h5.333v2.667h-5.333v-2.667zM18.667 24h-13.333v-2.667h13.333v2.667zM26.667 24h-5.333v-2.667h5.333v2.667zM26.667 18.667h-13.333v-2.667h13.333v2.667z"></path></svg>';
    }, function (e, t) {
      e.exports = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32"><path d="M25.468 6.947c-0.326-0.172-0.724-0.151-1.030 0.057l-6.438 4.38v-3.553c0-0.371-0.205-0.71-0.532-0.884-0.326-0.172-0.724-0.151-1.030 0.057l-12 8.164c-0.274 0.186-0.438 0.496-0.438 0.827s0.164 0.641 0.438 0.827l12 8.168c0.169 0.115 0.365 0.174 0.562 0.174 0.16 0 0.321-0.038 0.468-0.116 0.327-0.173 0.532-0.514 0.532-0.884v-3.556l6.438 4.382c0.169 0.115 0.365 0.174 0.562 0.174 0.16 0 0.321-0.038 0.468-0.116 0.327-0.173 0.532-0.514 0.532-0.884v-16.333c0-0.371-0.205-0.71-0.532-0.884z"></path></svg>';
    }, function (e, t) {
      e.exports = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32"><path d="M22 16l-10.105-10.6-1.895 1.987 8.211 8.613-8.211 8.612 1.895 1.988 8.211-8.613z"></path></svg>';
    }, function (e, t) {
      e.exports = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32"><path d="M4 16c0-6.6 5.4-12 12-12s12 5.4 12 12c0 1.2-0.8 2-2 2s-2-0.8-2-2c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8c1.2 0 2 0.8 2 2s-0.8 2-2 2c-6.6 0-12-5.4-12-12z"></path></svg>';
    }, function (e, t) {
      e.exports = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 29 32"><path d="M2.667 7.027l1.707-1.693 22.293 22.293-1.693 1.707-4-4h-11.64v4l-5.333-5.333 5.333-5.333v4h8.973l-8.973-8.973v0.973h-2.667v-3.64l-4-4zM22.667 17.333h2.667v5.573l-2.667-2.667v-2.907zM22.667 6.667v-4l5.333 5.333-5.333 5.333v-4h-10.907l-2.667-2.667h13.573z"></path></svg>';
    }, function (e, t) {
      e.exports = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 33 32"><path d="M9.333 9.333h13.333v4l5.333-5.333-5.333-5.333v4h-16v8h2.667v-5.333zM22.667 22.667h-13.333v-4l-5.333 5.333 5.333 5.333v-4h16v-8h-2.667v5.333zM17.333 20v-8h-1.333l-2.667 1.333v1.333h2v5.333h2z"></path></svg>';
    }, function (e, t) {
      e.exports = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 29 32"><path d="M9.333 9.333h13.333v4l5.333-5.333-5.333-5.333v4h-16v8h2.667v-5.333zM22.667 22.667h-13.333v-4l-5.333 5.333 5.333 5.333v-4h16v-8h-2.667v5.333z"></path></svg>';
    }, function (e, t) {
      e.exports = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 22 32"><path d="M20.8 14.4q0.704 0 1.152 0.48t0.448 1.12-0.48 1.12-1.12 0.48h-19.2q-0.64 0-1.12-0.48t-0.48-1.12 0.448-1.12 1.152-0.48h19.2zM1.6 11.2q-0.64 0-1.12-0.48t-0.48-1.12 0.448-1.12 1.152-0.48h19.2q0.704 0 1.152 0.48t0.448 1.12-0.48 1.12-1.12 0.48h-19.2zM20.8 20.8q0.704 0 1.152 0.48t0.448 1.12-0.48 1.12-1.12 0.48h-19.2q-0.64 0-1.12-0.48t-0.48-1.12 0.448-1.12 1.152-0.48h19.2z"></path></svg>';
    }, function (e, t) {
      e.exports = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32"><path d="M0.622 18.334h19.54v7.55l11.052-9.412-11.052-9.413v7.549h-19.54v3.725z"></path></svg>';
    }, function (e, t) {
      e.exports = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32"><path d="M22.667 4l7 6-7 6 7 6-7 6v-4h-3.653l-3.76-3.76 2.827-2.827 2.587 2.587h2v-8h-2l-12 12h-6v-4h4.347l12-12h3.653v-4zM2.667 8h6l3.76 3.76-2.827 2.827-2.587-2.587h-4.347v-4z"></path></svg>';
    }, function (e, t) {
      e.exports = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 28 32"><path d="M13.728 6.272v19.456q0 0.448-0.352 0.8t-0.8 0.32-0.8-0.32l-5.952-5.952h-4.672q-0.48 0-0.8-0.352t-0.352-0.8v-6.848q0-0.48 0.352-0.8t0.8-0.352h4.672l5.952-5.952q0.32-0.32 0.8-0.32t0.8 0.32 0.352 0.8z"></path></svg>';
    }, function (e, t) {
      e.exports = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 28 32"><path d="M13.728 6.272v19.456q0 0.448-0.352 0.8t-0.8 0.32-0.8-0.32l-5.952-5.952h-4.672q-0.48 0-0.8-0.352t-0.352-0.8v-6.848q0-0.48 0.352-0.8t0.8-0.352h4.672l5.952-5.952q0.32-0.32 0.8-0.32t0.8 0.32 0.352 0.8zM20.576 16q0 1.344-0.768 2.528t-2.016 1.664q-0.16 0.096-0.448 0.096-0.448 0-0.8-0.32t-0.32-0.832q0-0.384 0.192-0.64t0.544-0.448 0.608-0.384 0.512-0.64 0.192-1.024-0.192-1.024-0.512-0.64-0.608-0.384-0.544-0.448-0.192-0.64q0-0.48 0.32-0.832t0.8-0.32q0.288 0 0.448 0.096 1.248 0.48 2.016 1.664t0.768 2.528z"></path></svg>';
    }, function (e, t) {
      e.exports = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 28 32"><path d="M13.728 6.272v19.456q0 0.448-0.352 0.8t-0.8 0.32-0.8-0.32l-5.952-5.952h-4.672q-0.48 0-0.8-0.352t-0.352-0.8v-6.848q0-0.48 0.352-0.8t0.8-0.352h4.672l5.952-5.952q0.32-0.32 0.8-0.32t0.8 0.32 0.352 0.8zM20.576 16q0 1.344-0.768 2.528t-2.016 1.664q-0.16 0.096-0.448 0.096-0.448 0-0.8-0.32t-0.32-0.832q0-0.384 0.192-0.64t0.544-0.448 0.608-0.384 0.512-0.64 0.192-1.024-0.192-1.024-0.512-0.64-0.608-0.384-0.544-0.448-0.192-0.64q0-0.48 0.32-0.832t0.8-0.32q0.288 0 0.448 0.096 1.248 0.48 2.016 1.664t0.768 2.528zM25.152 16q0 2.72-1.536 5.056t-4 3.36q-0.256 0.096-0.448 0.096-0.48 0-0.832-0.352t-0.32-0.8q0-0.704 0.672-1.056 1.024-0.512 1.376-0.8 1.312-0.96 2.048-2.4t0.736-3.104-0.736-3.104-2.048-2.4q-0.352-0.288-1.376-0.8-0.672-0.352-0.672-1.056 0-0.448 0.32-0.8t0.8-0.352q0.224 0 0.48 0.096 2.496 1.056 4 3.36t1.536 5.056zM29.728 16q0 4.096-2.272 7.552t-6.048 5.056q-0.224 0.096-0.448 0.096-0.48 0-0.832-0.352t-0.32-0.8q0-0.64 0.704-1.056 0.128-0.064 0.384-0.192t0.416-0.192q0.8-0.448 1.44-0.896 2.208-1.632 3.456-4.064t1.216-5.152-1.216-5.152-3.456-4.064q-0.64-0.448-1.44-0.896-0.128-0.096-0.416-0.192t-0.384-0.192q-0.704-0.416-0.704-1.056 0-0.448 0.32-0.8t0.832-0.352q0.224 0 0.448 0.096 3.776 1.632 6.048 5.056t2.272 7.552z"></path></svg>';
    }, function (e, t) {
      e.exports = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 17 32"><path d="M14.080 4.8q2.88 0 2.88 2.048v18.24q0 2.112-2.88 2.112t-2.88-2.112v-18.24q0-2.048 2.88-2.048zM2.88 4.8q2.88 0 2.88 2.048v18.24q0 2.112-2.88 2.112t-2.88-2.112v-18.24q0-2.048 2.88-2.048z"></path></svg>';
    }, function (e, t) {
      e.exports = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 16 31"><path d="M15.552 15.168q0.448 0.32 0.448 0.832 0 0.448-0.448 0.768l-13.696 8.512q-0.768 0.512-1.312 0.192t-0.544-1.28v-16.448q0-0.96 0.544-1.28t1.312 0.192z"></path></svg>';
    }, function (e, t, n) {
      "use strict";

      var i,
          a,
          r = e.exports = {};

      function o() {
        throw new Error("setTimeout has not been defined");
      }

      function s() {
        throw new Error("clearTimeout has not been defined");
      }

      function l(e) {
        if (i === setTimeout) return setTimeout(e, 0);
        if ((i === o || !i) && setTimeout) return i = setTimeout, setTimeout(e, 0);

        try {
          return i(e, 0);
        } catch (t) {
          try {
            return i.call(null, e, 0);
          } catch (t) {
            return i.call(this, e, 0);
          }
        }
      }

      !function () {
        try {
          i = "function" == typeof setTimeout ? setTimeout : o;
        } catch (e) {
          i = o;
        }

        try {
          a = "function" == typeof clearTimeout ? clearTimeout : s;
        } catch (e) {
          a = s;
        }
      }();
      var u,
          c = [],
          p = !1,
          d = -1;

      function h() {
        p && u && (p = !1, u.length ? c = u.concat(c) : d = -1, c.length && y());
      }

      function y() {
        if (!p) {
          var e = l(h);
          p = !0;

          for (var t = c.length; t;) {
            for (u = c, c = []; ++d < t;) {
              u && u[d].run();
            }

            d = -1, t = c.length;
          }

          u = null, p = !1, function (e) {
            if (a === clearTimeout) return clearTimeout(e);
            if ((a === s || !a) && clearTimeout) return a = clearTimeout, clearTimeout(e);

            try {
              a(e);
            } catch (t) {
              try {
                return a.call(null, e);
              } catch (t) {
                return a.call(this, e);
              }
            }
          }(e);
        }
      }

      function f(e, t) {
        this.fun = e, this.array = t;
      }

      function v() {}

      r.nextTick = function (e) {
        var t = new Array(arguments.length - 1);
        if (arguments.length > 1) for (var n = 1; n < arguments.length; n++) {
          t[n - 1] = arguments[n];
        }
        c.push(new f(e, t)), 1 !== c.length || p || l(y);
      }, f.prototype.run = function () {
        this.fun.apply(null, this.array);
      }, r.title = "browser", r.browser = !0, r.env = {}, r.argv = [], r.version = "", r.versions = {}, r.on = v, r.addListener = v, r.once = v, r.off = v, r.removeListener = v, r.removeAllListeners = v, r.emit = v, r.prependListener = v, r.prependOnceListener = v, r.listeners = function (e) {
        return [];
      }, r.binding = function (e) {
        throw new Error("process.binding is not supported");
      }, r.cwd = function () {
        return "/";
      }, r.chdir = function (e) {
        throw new Error("process.chdir is not supported");
      }, r.umask = function () {
        return 0;
      };
    }, function (e, t, n) {
      "use strict";

      (function (e, t) {
        !function (e, n) {
          if (!e.setImmediate) {
            var i,
                a,
                r,
                o,
                s,
                l = 1,
                u = {},
                c = !1,
                p = e.document,
                d = Object.getPrototypeOf && Object.getPrototypeOf(e);
            d = d && d.setTimeout ? d : e, "[object process]" === {}.toString.call(e.process) ? i = function i(e) {
              t.nextTick(function () {
                y(e);
              });
            } : !function () {
              if (e.postMessage && !e.importScripts) {
                var t = !0,
                    n = e.onmessage;
                return e.onmessage = function () {
                  t = !1;
                }, e.postMessage("", "*"), e.onmessage = n, t;
              }
            }() ? e.MessageChannel ? ((r = new MessageChannel()).port1.onmessage = function (e) {
              y(e.data);
            }, i = function i(e) {
              r.port2.postMessage(e);
            }) : p && "onreadystatechange" in p.createElement("script") ? (a = p.documentElement, i = function i(e) {
              var t = p.createElement("script");
              t.onreadystatechange = function () {
                y(e), t.onreadystatechange = null, a.removeChild(t), t = null;
              }, a.appendChild(t);
            }) : i = function i(e) {
              setTimeout(y, 0, e);
            } : (o = "setImmediate$" + Math.random() + "$", s = function s(t) {
              t.source === e && "string" == typeof t.data && 0 === t.data.indexOf(o) && y(+t.data.slice(o.length));
            }, e.addEventListener ? e.addEventListener("message", s, !1) : e.attachEvent("onmessage", s), i = function i(t) {
              e.postMessage(o + t, "*");
            }), d.setImmediate = function (e) {
              "function" != typeof e && (e = new Function("" + e));

              for (var t = new Array(arguments.length - 1), n = 0; n < t.length; n++) {
                t[n] = arguments[n + 1];
              }

              var a = {
                callback: e,
                args: t
              };
              return u[l] = a, i(l), l++;
            }, d.clearImmediate = h;
          }

          function h(e) {
            delete u[e];
          }

          function y(e) {
            if (c) setTimeout(y, 0, e);else {
              var t = u[e];

              if (t) {
                c = !0;

                try {
                  !function (e) {
                    var t = e.callback,
                        i = e.args;

                    switch (i.length) {
                      case 0:
                        t();
                        break;

                      case 1:
                        t(i[0]);
                        break;

                      case 2:
                        t(i[0], i[1]);
                        break;

                      case 3:
                        t(i[0], i[1], i[2]);
                        break;

                      default:
                        t.apply(n, i);
                    }
                  }(t);
                } finally {
                  h(e), c = !1;
                }
              }
            }
          }
        }("undefined" == typeof self ? void 0 === e ? void 0 : e : self);
      }).call(this, n(4), n(34));
    }, function (e, t, n) {
      "use strict";

      var i = Function.prototype.apply;

      function a(e, t) {
        this._id = e, this._clearFn = t;
      }

      t.setTimeout = function () {
        return new a(i.call(setTimeout, window, arguments), clearTimeout);
      }, t.setInterval = function () {
        return new a(i.call(setInterval, window, arguments), clearInterval);
      }, t.clearTimeout = t.clearInterval = function (e) {
        e && e.close();
      }, a.prototype.unref = a.prototype.ref = function () {}, a.prototype.close = function () {
        this._clearFn.call(window, this._id);
      }, t.enroll = function (e, t) {
        clearTimeout(e._idleTimeoutId), e._idleTimeout = t;
      }, t.unenroll = function (e) {
        clearTimeout(e._idleTimeoutId), e._idleTimeout = -1;
      }, t._unrefActive = t.active = function (e) {
        clearTimeout(e._idleTimeoutId);
        var t = e._idleTimeout;
        t >= 0 && (e._idleTimeoutId = setTimeout(function () {
          e._onTimeout && e._onTimeout();
        }, t));
      }, n(35), t.setImmediate = setImmediate, t.clearImmediate = clearImmediate;
    }, function (e, t, n) {
      "use strict";

      (function (t) {
        var n = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (e) {
          return _typeof(e);
        } : function (e) {
          return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : _typeof(e);
        },
            i = setTimeout;

        function a() {}

        function r(e) {
          if (!(this instanceof r)) throw new TypeError("Promises must be constructed via new");
          if ("function" != typeof e) throw new TypeError("not a function");
          this._state = 0, this._handled = !1, this._value = void 0, this._deferreds = [], c(e, this);
        }

        function o(e, t) {
          for (; 3 === e._state;) {
            e = e._value;
          }

          0 !== e._state ? (e._handled = !0, r._immediateFn(function () {
            var n = 1 === e._state ? t.onFulfilled : t.onRejected;

            if (null !== n) {
              var i;

              try {
                i = n(e._value);
              } catch (e) {
                return void l(t.promise, e);
              }

              s(t.promise, i);
            } else (1 === e._state ? s : l)(t.promise, e._value);
          })) : e._deferreds.push(t);
        }

        function s(e, t) {
          try {
            if (t === e) throw new TypeError("A promise cannot be resolved with itself.");

            if (t && ("object" === (void 0 === t ? "undefined" : n(t)) || "function" == typeof t)) {
              var i = t.then;
              if (t instanceof r) return e._state = 3, e._value = t, void u(e);
              if ("function" == typeof i) return void c((a = i, o = t, function () {
                a.apply(o, arguments);
              }), e);
            }

            e._state = 1, e._value = t, u(e);
          } catch (t) {
            l(e, t);
          }

          var a, o;
        }

        function l(e, t) {
          e._state = 2, e._value = t, u(e);
        }

        function u(e) {
          2 === e._state && 0 === e._deferreds.length && r._immediateFn(function () {
            e._handled || r._unhandledRejectionFn(e._value);
          });

          for (var t = 0, n = e._deferreds.length; t < n; t++) {
            o(e, e._deferreds[t]);
          }

          e._deferreds = null;
        }

        function c(e, t) {
          var n = !1;

          try {
            e(function (e) {
              n || (n = !0, s(t, e));
            }, function (e) {
              n || (n = !0, l(t, e));
            });
          } catch (e) {
            if (n) return;
            n = !0, l(t, e);
          }
        }

        r.prototype["catch"] = function (e) {
          return this.then(null, e);
        }, r.prototype.then = function (e, t) {
          var n = new this.constructor(a);
          return o(this, new function (e, t, n) {
            this.onFulfilled = "function" == typeof e ? e : null, this.onRejected = "function" == typeof t ? t : null, this.promise = n;
          }(e, t, n)), n;
        }, r.prototype["finally"] = function (e) {
          var t = this.constructor;
          return this.then(function (n) {
            return t.resolve(e()).then(function () {
              return n;
            });
          }, function (n) {
            return t.resolve(e()).then(function () {
              return t.reject(n);
            });
          });
        }, r.all = function (e) {
          return new r(function (t, i) {
            if (!e || void 0 === e.length) throw new TypeError("Promise.all accepts an array");
            var a = Array.prototype.slice.call(e);
            if (0 === a.length) return t([]);
            var r = a.length;

            function o(e, s) {
              try {
                if (s && ("object" === (void 0 === s ? "undefined" : n(s)) || "function" == typeof s)) {
                  var l = s.then;
                  if ("function" == typeof l) return void l.call(s, function (t) {
                    o(e, t);
                  }, i);
                }

                a[e] = s, 0 == --r && t(a);
              } catch (e) {
                i(e);
              }
            }

            for (var s = 0; s < a.length; s++) {
              o(s, a[s]);
            }
          });
        }, r.resolve = function (e) {
          return e && "object" === (void 0 === e ? "undefined" : n(e)) && e.constructor === r ? e : new r(function (t) {
            t(e);
          });
        }, r.reject = function (e) {
          return new r(function (t, n) {
            n(e);
          });
        }, r.race = function (e) {
          return new r(function (t, n) {
            for (var i = 0, a = e.length; i < a; i++) {
              e[i].then(t, n);
            }
          });
        }, r._immediateFn = "function" == typeof t && function (e) {
          t(e);
        } || function (e) {
          i(e, 0);
        }, r._unhandledRejectionFn = function (e) {
          "undefined" != typeof console && console && console.warn("Possible Unhandled Promise Rejection:", e);
        }, e.exports = r;
      }).call(this, n(36).setImmediate);
    }, function (e, t, n) {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: !0
      });

      var i = function () {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var i = t[n];
            i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(e, i.key, i);
          }
        }

        return function (t, n, i) {
          return n && e(t.prototype, n), i && e(t, i), t;
        };
      }(),
          a = v(n(37)),
          r = v(n(0)),
          o = v(n(3)),
          s = v(n(18)),
          l = v(n(17)),
          u = v(n(13)),
          c = v(n(12)),
          p = v(n(11)),
          d = v(n(9)),
          h = v(n(8)),
          y = v(n(7)),
          f = v(n(6));

      function v(e) {
        return e && e.__esModule ? e : {
          "default": e
        };
      }

      var m = [],
          g = function () {
        function e(t) {
          if (function (e, t) {
            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
          }(this, e), this.options = (0, s["default"])(t), this.container = this.options.container, this.paused = !0, this.playedPromise = a["default"].resolve(), this.mode = "normal", this.randomOrder = r["default"].randomOrder(this.options.audio.length), this.container.classList.add("aplayer"), this.options.lrcType && !this.options.fixed && this.container.classList.add("aplayer-withlrc"), this.options.audio.length > 1 && this.container.classList.add("aplayer-withlist"), r["default"].isMobile && this.container.classList.add("aplayer-mobile"), this.arrow = this.container.offsetWidth <= 300, this.arrow && this.container.classList.add("aplayer-arrow"), this.container = this.options.container, 2 === this.options.lrcType || !0 === this.options.lrcType) for (var n = this.container.getElementsByClassName("aplayer-lrc-content"), i = 0; i < n.length; i++) {
            this.options.audio[i] && (this.options.audio[i].lrc = n[i].innerHTML);
          }
          this.template = new l["default"]({
            container: this.container,
            options: this.options,
            randomOrder: this.randomOrder
          }), this.options.fixed && (this.container.classList.add("aplayer-fixed"), this.template.body.style.width = this.template.body.offsetWidth - 18 + "px"), this.options.mini && (this.setMode("mini"), this.template.info.style.display = "block"), this.template.info.offsetWidth < 200 && this.template.time.classList.add("aplayer-time-narrow"), this.options.lrcType && (this.lrc = new p["default"]({
            container: this.template.lrc,
            async: 3 === this.options.lrcType,
            player: this
          })), this.events = new y["default"](), this.storage = new c["default"](this), this.bar = new u["default"](this.template), this.controller = new d["default"](this), this.timer = new h["default"](this), this.list = new f["default"](this), this.initAudio(), this.bindEvents(), "random" === this.options.order ? this.list["switch"](this.randomOrder[0]) : this.list["switch"](0), this.options.autoplay && this.play(), m.push(this);
        }

        return i(e, [{
          key: "initAudio",
          value: function value() {
            var e = this;
            this.audio = document.createElement("audio"), this.audio.preload = this.options.preload;

            for (var t = function t(_t4) {
              e.audio.addEventListener(e.events.audioEvents[_t4], function (n) {
                e.events.trigger(e.events.audioEvents[_t4], n);
              });
            }, n = 0; n < this.events.audioEvents.length; n++) {
              t(n);
            }

            this.volume(this.storage.get("volume"), !0);
          }
        }, {
          key: "bindEvents",
          value: function value() {
            var e = this;
            this.on("play", function () {
              e.paused && e.setUIPlaying();
            }), this.on("pause", function () {
              e.paused || e.setUIPaused();
            }), this.on("timeupdate", function () {
              if (!e.disableTimeupdate) {
                e.bar.set("played", e.audio.currentTime / e.duration, "width"), e.lrc && e.lrc.update();
                var t = r["default"].secondToTime(e.audio.currentTime);
                e.template.ptime.innerHTML !== t && (e.template.ptime.innerHTML = t);
              }
            }), this.on("durationchange", function () {
              1 !== e.duration && (e.template.dtime.innerHTML = r["default"].secondToTime(e.duration));
            }), this.on("progress", function () {
              var t = e.audio.buffered.length ? e.audio.buffered.end(e.audio.buffered.length - 1) / e.duration : 0;
              e.bar.set("loaded", t, "width");
            });
            var t = void 0;
            this.on("error", function () {
              e.list.audios.length > 1 ? (e.notice("An audio error has occurred, player will skip forward in 2 seconds."), t = setTimeout(function () {
                e.skipForward(), e.paused || e.play();
              }, 2e3)) : 1 === e.list.audios.length && e.notice("An audio error has occurred.");
            }), this.events.on("listswitch", function () {
              t && clearTimeout(t);
            }), this.on("ended", function () {
              "none" === e.options.loop ? "list" === e.options.order ? e.list.index < e.list.audios.length - 1 ? (e.list["switch"]((e.list.index + 1) % e.list.audios.length), e.play()) : (e.list["switch"]((e.list.index + 1) % e.list.audios.length), e.pause()) : "random" === e.options.order && (e.randomOrder.indexOf(e.list.index) < e.randomOrder.length - 1 ? (e.list["switch"](e.nextIndex()), e.play()) : (e.list["switch"](e.nextIndex()), e.pause())) : "one" === e.options.loop ? (e.list["switch"](e.list.index), e.play()) : "all" === e.options.loop && (e.skipForward(), e.play());
            });
          }
        }, {
          key: "setAudio",
          value: function value(e) {
            this.hls && (this.hls.destroy(), this.hls = null);
            var t = e.type;
            this.options.customAudioType && this.options.customAudioType[t] ? "[object Function]" === Object.prototype.toString.call(this.options.customAudioType[t]) ? this.options.customAudioType[t](this.audio, e, this) : console.error("Illegal customType: " + t) : (t && "auto" !== t || (t = /m3u8(#|\?|$)/i.exec(e.url) ? "hls" : "normal"), "hls" === t ? Hls.isSupported() ? (this.hls = new Hls(), this.hls.loadSource(e.url), this.hls.attachMedia(this.audio)) : this.audio.canPlayType("application/x-mpegURL") || this.audio.canPlayType("application/vnd.apple.mpegURL") ? this.audio.src = e.url : this.notice("Error: HLS is not supported.") : "normal" === t && (this.audio.src = e.url)), this.seek(0), this.paused || this.audio.play();
          }
        }, {
          key: "theme",
          value: function value() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.list.audios[this.list.index].theme || this.options.theme,
                t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.list.index;
            (!(arguments.length > 2 && void 0 !== arguments[2]) || arguments[2]) && this.list.audios[t] && (this.list.audios[t].theme = e), this.template.listCurs[t] && (this.template.listCurs[t].style.backgroundColor = e), t === this.list.index && (this.template.pic.style.backgroundColor = e, this.template.played.style.background = e, this.template.thumb.style.background = e, this.template.volume.style.background = e);
          }
        }, {
          key: "seek",
          value: function value(e) {
            e = Math.max(e, 0), e = Math.min(e, this.duration), this.audio.currentTime = e, this.bar.set("played", e / this.duration, "width"), this.template.ptime.innerHTML = r["default"].secondToTime(e);
          }
        }, {
          key: "setUIPlaying",
          value: function value() {
            var e = this;
            if (this.paused && (this.paused = !1, this.template.button.classList.remove("aplayer-play"), this.template.button.classList.add("aplayer-pause"), this.template.button.innerHTML = "", setTimeout(function () {
              e.template.button.innerHTML = o["default"].pause;
            }, 100), this.template.skipPlayButton.innerHTML = o["default"].pause), this.timer.enable("loading"), this.options.mutex) for (var t = 0; t < m.length; t++) {
              this !== m[t] && m[t].pause();
            }
          }
        }, {
          key: "play",
          value: function value() {
            var e = this;
            this.setUIPlaying();
            var t = this.audio.play();
            t && t["catch"](function (t) {
              console.warn(t), "NotAllowedError" === t.name && e.setUIPaused();
            });
          }
        }, {
          key: "setUIPaused",
          value: function value() {
            var e = this;
            this.paused || (this.paused = !0, this.template.button.classList.remove("aplayer-pause"), this.template.button.classList.add("aplayer-play"), this.template.button.innerHTML = "", setTimeout(function () {
              e.template.button.innerHTML = o["default"].play;
            }, 100), this.template.skipPlayButton.innerHTML = o["default"].play), this.container.classList.remove("aplayer-loading"), this.timer.disable("loading");
          }
        }, {
          key: "pause",
          value: function value() {
            this.setUIPaused(), this.audio.pause();
          }
        }, {
          key: "switchVolumeIcon",
          value: function value() {
            this.volume() >= .95 ? this.template.volumeButton.innerHTML = o["default"].volumeUp : this.volume() > 0 ? this.template.volumeButton.innerHTML = o["default"].volumeDown : this.template.volumeButton.innerHTML = o["default"].volumeOff;
          }
        }, {
          key: "volume",
          value: function value(e, t) {
            return e = parseFloat(e), isNaN(e) || (e = Math.max(e, 0), e = Math.min(e, 1), this.bar.set("volume", e, "height"), t || this.storage.set("volume", e), this.audio.volume = e, this.audio.muted && (this.audio.muted = !1), this.switchVolumeIcon()), this.audio.muted ? 0 : this.audio.volume;
          }
        }, {
          key: "on",
          value: function value(e, t) {
            this.events.on(e, t);
          }
        }, {
          key: "toggle",
          value: function value() {
            this.template.button.classList.contains("aplayer-play") ? this.play() : this.template.button.classList.contains("aplayer-pause") && this.pause();
          }
        }, {
          key: "switchAudio",
          value: function value(e) {
            this.list["switch"](e);
          }
        }, {
          key: "addAudio",
          value: function value(e) {
            this.list.add(e);
          }
        }, {
          key: "removeAudio",
          value: function value(e) {
            this.list.remove(e);
          }
        }, {
          key: "destroy",
          value: function value() {
            m.splice(m.indexOf(this), 1), this.pause(), this.container.innerHTML = "", this.audio.src = "", this.timer.destroy(), this.events.trigger("destroy");
          }
        }, {
          key: "setMode",
          value: function value() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "normal";
            this.mode = e, "mini" === e ? this.container.classList.add("aplayer-narrow") : "normal" === e && this.container.classList.remove("aplayer-narrow");
          }
        }, {
          key: "notice",
          value: function value(e) {
            var t = this,
                n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 2e3,
                i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : .8;
            this.template.notice.innerHTML = e, this.template.notice.style.opacity = i, this.noticeTime && clearTimeout(this.noticeTime), this.events.trigger("noticeshow", {
              text: e
            }), n && (this.noticeTime = setTimeout(function () {
              t.template.notice.style.opacity = 0, t.events.trigger("noticehide");
            }, n));
          }
        }, {
          key: "prevIndex",
          value: function value() {
            if (!(this.list.audios.length > 1)) return 0;
            if ("list" === this.options.order) return this.list.index - 1 < 0 ? this.list.audios.length - 1 : this.list.index - 1;

            if ("random" === this.options.order) {
              var e = this.randomOrder.indexOf(this.list.index);
              return 0 === e ? this.randomOrder[this.randomOrder.length - 1] : this.randomOrder[e - 1];
            }
          }
        }, {
          key: "nextIndex",
          value: function value() {
            if (!(this.list.audios.length > 1)) return 0;
            if ("list" === this.options.order) return (this.list.index + 1) % this.list.audios.length;

            if ("random" === this.options.order) {
              var e = this.randomOrder.indexOf(this.list.index);
              return e === this.randomOrder.length - 1 ? this.randomOrder[0] : this.randomOrder[e + 1];
            }
          }
        }, {
          key: "skipBack",
          value: function value() {
            this.list["switch"](this.prevIndex());
          }
        }, {
          key: "skipForward",
          value: function value() {
            this.list["switch"](this.nextIndex());
          }
        }, {
          key: "duration",
          get: function get() {
            return isNaN(this.audio.duration) ? 0 : this.audio.duration;
          }
        }], [{
          key: "version",
          get: function get() {
            return "1.10.1";
          }
        }]), e;
      }();

      t["default"] = g;
    },, function (e, t, n) {}, function (e, t, n) {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: !0
      }), n(40);
      var i,
          a = n(38),
          r = (i = a) && i.__esModule ? i : {
        "default": i
      };
      console.log("\n %c APlayer v1.10.1 af84efb %c http://aplayer.js.org \n", "color: #fadfa3; background: #030307; padding:5px 0;", "background: #fadfa3; padding:5px 0;"), t["default"] = r["default"];
    }])["default"];
  });
};

exports["default"] = _default;

}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"timers":2}],40:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.L2Dwidget = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*! https://github.com/xiazeyu/live2d-widget.js built@2019-4-6 09:38:17 */
var L2Dwidget = function (t) {
  var n = window.webpackJsonpL2Dwidget;

  window.webpackJsonpL2Dwidget = function (e, o, i) {
    for (var c, u, a = 0, s = []; a < e.length; a++) {
      u = e[a], r[u] && s.push(r[u][0]), r[u] = 0;
    }

    for (c in o) {
      Object.prototype.hasOwnProperty.call(o, c) && (t[c] = o[c]);
    }

    for (n && n(e, o, i); s.length;) {
      s.shift()();
    }
  };

  var e = {},
      r = {
    1: 0
  };

  function o(n) {
    if (e[n]) return e[n].exports;
    var r = e[n] = {
      i: n,
      l: !1,
      exports: {}
    };
    return t[n].call(r.exports, r, r.exports, o), r.l = !0, r.exports;
  }

  return o.e = function (t) {
    var n = r[t];
    if (0 === n) return new Promise(function (t) {
      t();
    });
    if (n) return n[2];
    var e = new Promise(function (e, o) {
      n = r[t] = [e, o];
    });
    n[2] = e;
    var i = document.getElementsByTagName("head")[0],
        c = document.createElement("script");
    c.type = "text/javascript", c.charset = "utf-8", c.async = !0, c.timeout = 12e4, o.nc && c.setAttribute("nonce", o.nc), c.src = "/asset/js/plugin/L2Dwidget." + t + ".min.js";
    var u = setTimeout(a, 12e4);
    c.onerror = c.onload = a;

    function a() {
      c.onerror = c.onload = null, clearTimeout(u);
      var n = r[t];
      0 !== n && (n && n[1](new Error("Loading chunk " + t + " failed.")), r[t] = void 0);
    }

    return i.appendChild(c), e;
  }, o.m = t, o.c = e, o.d = function (t, n, e) {
    o.o(t, n) || Object.defineProperty(t, n, {
      configurable: !1,
      enumerable: !0,
      get: e
    });
  }, o.n = function (t) {
    var n = t && t.__esModule ? function () {
      return t["default"];
    } : function () {
      return t;
    };
    return o.d(n, "a", n), n;
  }, o.o = function (t, n) {
    return Object.prototype.hasOwnProperty.call(t, n);
  }, o.p = "", o.oe = function (t) {
    throw console.error(t), t;
  }, o(o.s = 40);
}([function (t, n, e) {
  var r = e(24)("wks"),
      o = e(16),
      i = e(1).Symbol,
      c = "function" == typeof i;
  (t.exports = function (t) {
    return r[t] || (r[t] = c && i[t] || (c ? i : o)("Symbol." + t));
  }).store = r;
}, function (t, n) {
  var e = t.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")();
  "number" == typeof __g && (__g = e);
}, function (t, n, e) {
  var r = e(6);

  t.exports = function (t) {
    if (!r(t)) throw TypeError(t + " is not an object!");
    return t;
  };
}, function (t, n, e) {
  var r = e(11),
      o = e(26);
  t.exports = e(7) ? function (t, n, e) {
    return r.f(t, n, o(1, e));
  } : function (t, n, e) {
    return t[n] = e, t;
  };
}, function (t, n) {
  var e = t.exports = {
    version: "2.5.3"
  };
  "number" == typeof __e && (__e = e);
}, function (t, n, e) {
  var r = e(1),
      o = e(3),
      i = e(8),
      c = e(16)("src"),
      u = "toString",
      a = Function[u],
      s = ("" + a).split(u);
  e(4).inspectSource = function (t) {
    return a.call(t);
  }, (t.exports = function (t, n, e, u) {
    var a = "function" == typeof e;
    a && (i(e, "name") || o(e, "name", n)), t[n] !== e && (a && (i(e, c) || o(e, c, t[n] ? "" + t[n] : s.join(String(n)))), t === r ? t[n] = e : u ? t[n] ? t[n] = e : o(t, n, e) : (delete t[n], o(t, n, e)));
  })(Function.prototype, u, function () {
    return "function" == typeof this && this[c] || a.call(this);
  });
}, function (t, n) {
  t.exports = function (t) {
    return "object" == _typeof(t) ? null !== t : "function" == typeof t;
  };
}, function (t, n, e) {
  t.exports = !e(25)(function () {
    return 7 != Object.defineProperty({}, "a", {
      get: function get() {
        return 7;
      }
    }).a;
  });
}, function (t, n) {
  var e = {}.hasOwnProperty;

  t.exports = function (t, n) {
    return e.call(t, n);
  };
}, function (t, n) {
  t.exports = {};
}, function (t, n) {
  var e = {}.toString;

  t.exports = function (t) {
    return e.call(t).slice(8, -1);
  };
}, function (t, n, e) {
  var r = e(2),
      o = e(43),
      i = e(44),
      c = Object.defineProperty;
  n.f = e(7) ? Object.defineProperty : function (t, n, e) {
    if (r(t), n = i(n, !0), r(e), o) try {
      return c(t, n, e);
    } catch (t) {}
    if ("get" in e || "set" in e) throw TypeError("Accessors not supported!");
    return "value" in e && (t[n] = e.value), t;
  };
}, function (t, n, e) {
  var r = e(1),
      o = e(4),
      i = e(3),
      c = e(5),
      u = e(13),
      a = "prototype",
      s = function s(t, n, e) {
    var f,
        l,
        p,
        d,
        v = t & s.F,
        h = t & s.G,
        y = t & s.S,
        m = t & s.P,
        b = t & s.B,
        w = h ? r : y ? r[n] || (r[n] = {}) : (r[n] || {})[a],
        g = h ? o : o[n] || (o[n] = {}),
        x = g[a] || (g[a] = {});
    h && (e = n);

    for (f in e) {
      p = ((l = !v && w && void 0 !== w[f]) ? w : e)[f], d = b && l ? u(p, r) : m && "function" == typeof p ? u(Function.call, p) : p, w && c(w, f, p, t & s.U), g[f] != p && i(g, f, d), m && x[f] != p && (x[f] = p);
    }
  };

  r.core = o, s.F = 1, s.G = 2, s.S = 4, s.P = 8, s.B = 16, s.W = 32, s.U = 64, s.R = 128, t.exports = s;
}, function (t, n, e) {
  var r = e(14);

  t.exports = function (t, n, e) {
    if (r(t), void 0 === n) return t;

    switch (e) {
      case 1:
        return function (e) {
          return t.call(n, e);
        };

      case 2:
        return function (e, r) {
          return t.call(n, e, r);
        };

      case 3:
        return function (e, r, o) {
          return t.call(n, e, r, o);
        };
    }

    return function () {
      return t.apply(n, arguments);
    };
  };
}, function (t, n) {
  t.exports = function (t) {
    if ("function" != typeof t) throw TypeError(t + " is not a function!");
    return t;
  };
}, function (t, n, e) {
  var r = e(10),
      o = e(0)("toStringTag"),
      i = "Arguments" == r(function () {
    return arguments;
  }());

  t.exports = function (t) {
    var n, e, c;
    return void 0 === t ? "Undefined" : null === t ? "Null" : "string" == typeof (e = function (t, n) {
      try {
        return t[n];
      } catch (t) {}
    }(n = Object(t), o)) ? e : i ? r(n) : "Object" == (c = r(n)) && "function" == typeof n.callee ? "Arguments" : c;
  };
}, function (t, n) {
  var e = 0,
      r = Math.random();

  t.exports = function (t) {
    return "Symbol(".concat(void 0 === t ? "" : t, ")_", (++e + r).toString(36));
  };
}, function (t, n, e) {
  var r = e(6),
      o = e(1).document,
      i = r(o) && r(o.createElement);

  t.exports = function (t) {
    return i ? o.createElement(t) : {};
  };
}, function (t, n) {
  var e = Math.ceil,
      r = Math.floor;

  t.exports = function (t) {
    return isNaN(t = +t) ? 0 : (t > 0 ? r : e)(t);
  };
}, function (t, n) {
  t.exports = function (t) {
    if (void 0 == t) throw TypeError("Can't call method on  " + t);
    return t;
  };
}, function (t, n, e) {
  var r = e(51),
      o = e(19);

  t.exports = function (t) {
    return r(o(t));
  };
}, function (t, n, e) {
  var r = e(24)("keys"),
      o = e(16);

  t.exports = function (t) {
    return r[t] || (r[t] = o(t));
  };
}, function (t, n, e) {
  var r = e(11).f,
      o = e(8),
      i = e(0)("toStringTag");

  t.exports = function (t, n, e) {
    t && !o(t = e ? t : t.prototype, i) && r(t, i, {
      configurable: !0,
      value: n
    });
  };
}, function (t, n, e) {
  "use strict";

  var r = e(14);

  t.exports.f = function (t) {
    return new function (t) {
      var n, e;
      this.promise = new t(function (t, r) {
        if (void 0 !== n || void 0 !== e) throw TypeError("Bad Promise constructor");
        n = t, e = r;
      }), this.resolve = r(n), this.reject = r(e);
    }(t);
  };
}, function (t, n, e) {
  var r = e(1),
      o = "__core-js_shared__",
      i = r[o] || (r[o] = {});

  t.exports = function (t) {
    return i[t] || (i[t] = {});
  };
}, function (t, n) {
  t.exports = function (t) {
    try {
      return !!t();
    } catch (t) {
      return !0;
    }
  };
}, function (t, n) {
  t.exports = function (t, n) {
    return {
      enumerable: !(1 & t),
      configurable: !(2 & t),
      writable: !(4 & t),
      value: n
    };
  };
}, function (t, n, e) {
  "use strict";

  var r = e(28),
      o = e(12),
      i = e(5),
      c = e(3),
      u = e(8),
      a = e(9),
      s = e(47),
      f = e(22),
      l = e(54),
      p = e(0)("iterator"),
      d = !([].keys && "next" in [].keys()),
      v = "values",
      h = function h() {
    return this;
  };

  t.exports = function (t, n, e, y, m, b, w) {
    s(e, n, y);

    var g,
        x,
        _,
        S = function S(t) {
      if (!d && t in O) return O[t];

      switch (t) {
        case "keys":
        case v:
          return function () {
            return new e(this, t);
          };
      }

      return function () {
        return new e(this, t);
      };
    },
        k = n + " Iterator",
        P = m == v,
        j = !1,
        O = t.prototype,
        T = O[p] || O["@@iterator"] || m && O[m],
        L = !d && T || S(m),
        E = m ? P ? S("entries") : L : void 0,
        M = "Array" == n ? O.entries || T : T;

    if (M && (_ = l(M.call(new t()))) !== Object.prototype && _.next && (f(_, k, !0), r || u(_, p) || c(_, p, h)), P && T && T.name !== v && (j = !0, L = function L() {
      return T.call(this);
    }), r && !w || !d && !j && O[p] || c(O, p, L), a[n] = L, a[k] = h, m) if (g = {
      values: P ? L : S(v),
      keys: b ? L : S("keys"),
      entries: E
    }, w) for (x in g) {
      x in O || i(O, x, g[x]);
    } else o(o.P + o.F * (d || j), n, g);
    return g;
  };
}, function (t, n) {
  t.exports = !1;
}, function (t, n, e) {
  var r = e(50),
      o = e(31);

  t.exports = Object.keys || function (t) {
    return r(t, o);
  };
}, function (t, n, e) {
  var r = e(18),
      o = Math.min;

  t.exports = function (t) {
    return t > 0 ? o(r(t), 9007199254740991) : 0;
  };
}, function (t, n) {
  t.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");
}, function (t, n, e) {
  var r = e(1).document;
  t.exports = r && r.documentElement;
}, function (t, n, e) {
  var r = e(2),
      o = e(14),
      i = e(0)("species");

  t.exports = function (t, n) {
    var e,
        c = r(t).constructor;
    return void 0 === c || void 0 == (e = r(c)[i]) ? n : o(e);
  };
}, function (t, n, e) {
  var r,
      o,
      i,
      c = e(13),
      u = e(66),
      a = e(32),
      s = e(17),
      f = e(1),
      l = f.process,
      p = f.setImmediate,
      d = f.clearImmediate,
      v = f.MessageChannel,
      h = f.Dispatch,
      y = 0,
      m = {},
      b = "onreadystatechange",
      w = function w() {
    var t = +this;

    if (m.hasOwnProperty(t)) {
      var n = m[t];
      delete m[t], n();
    }
  },
      g = function g(t) {
    w.call(t.data);
  };

  p && d || (p = function p(t) {
    for (var n = [], e = 1; arguments.length > e;) {
      n.push(arguments[e++]);
    }

    return m[++y] = function () {
      u("function" == typeof t ? t : Function(t), n);
    }, r(y), y;
  }, d = function d(t) {
    delete m[t];
  }, "process" == e(10)(l) ? r = function r(t) {
    l.nextTick(c(w, t, 1));
  } : h && h.now ? r = function r(t) {
    h.now(c(w, t, 1));
  } : v ? (i = (o = new v()).port2, o.port1.onmessage = g, r = c(i.postMessage, i, 1)) : f.addEventListener && "function" == typeof postMessage && !f.importScripts ? (r = function r(t) {
    f.postMessage(t + "", "*");
  }, f.addEventListener("message", g, !1)) : r = b in s("script") ? function (t) {
    a.appendChild(s("script"))[b] = function () {
      a.removeChild(this), w.call(t);
    };
  } : function (t) {
    setTimeout(c(w, t, 1), 0);
  }), t.exports = {
    set: p,
    clear: d
  };
}, function (t, n) {
  t.exports = function (t) {
    try {
      return {
        e: !1,
        v: t()
      };
    } catch (t) {
      return {
        e: !0,
        v: t
      };
    }
  };
}, function (t, n, e) {
  var r = e(2),
      o = e(6),
      i = e(23);

  t.exports = function (t, n) {
    if (r(t), o(n) && n.constructor === t) return n;
    var e = i.f(t);
    return (0, e.resolve)(n), e.promise;
  };
}, function (t, n, e) {
  "use strict";

  Object.defineProperty(n, "__esModule", {
    value: !0
  }), n.L2Dwidget = void 0;

  var r,
      o = function () {
    function t(t, n) {
      for (var e = 0; e < n.length; e++) {
        var r = n[e];
        r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(t, r.key, r);
      }
    }

    return function (n, e, r) {
      return e && t(n.prototype, e), r && t(n, r), n;
    };
  }(),
      i = e(39),
      c = (r = i, r && r.__esModule ? r : {
    "default": r
  }),
      u = e(38);

  var a = void 0,
      s = new (function () {
    function t() {
      !function (t, n) {
        if (!(t instanceof n)) throw new TypeError("Cannot call a class as a function");
      }(this, t), this.eventHandlers = {}, this.config = u.config;
    }

    return o(t, [{
      key: "on",
      value: function value(t, n) {
        if ("function" != typeof n) throw new TypeError("Event handler is not a function.");
        return this.eventHandlers[t] || (this.eventHandlers[t] = []), this.eventHandlers[t].push(n), this;
      }
    }, {
      key: "emit",
      value: function value(t) {
        for (var n = arguments.length, e = Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++) {
          e[r - 1] = arguments[r];
        }

        return this.eventHandlers[t] && this.eventHandlers[t].forEach(function (t) {
          "function" == typeof t && t.apply(void 0, e);
        }), this.eventHandlers["*"] && this.eventHandlers["*"].forEach(function (n) {
          "function" == typeof n && n.apply(void 0, [t].concat(e));
        }), this;
      }
    }, {
      key: "init",
      value: function value() {
        var t = this,
            n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        (0, u.configApplyer)(n), this.emit("config", this.config), !u.config.mobile.show && c["default"].mobile() || e.e(0).then(e.bind(null, 76)).then(function (n) {
          (a = n).theRealInit(t);
        })["catch"](function (t) {
          console.error(t);
        });
      }
    }, {
      key: "captureFrame",
      value: function value(t) {
        return a.captureFrame(t);
      }
    }, {
      key: "downloadFrame",
      value: function value() {
        this.captureFrame(function (t) {
          var n = document.createElement("a");
          document.body.appendChild(n), n.setAttribute("type", "hidden"), n.href = t, n.download = "live2d.png", n.click();
        });
      }
    }]), t;
  }())();
  n.L2Dwidget = s;
}, function (t, n, e) {
  "use strict";

  Object.defineProperty(n, "__esModule", {
    value: !0
  }), n.config = n.configApplyer = void 0;
  var r = i(e(74)),
      o = i(e(75));

  function i(t) {
    return t && t.__esModule ? t : {
      "default": t
    };
  }

  var c = {};
  n.configApplyer = function (t) {
    (0, o["default"])(c, t, r["default"]);
  }, n.config = c;
}, function (t, n, e) {
  "use strict";

  Object.defineProperty(n, "__esModule", {
    value: !0
  });
  var r = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (t) {
    return _typeof(t);
  } : function (t) {
    return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : _typeof(t);
  },
      o = window.device,
      i = {},
      c = [];
  window.device = i;
  var u = window.document.documentElement,
      a = window.navigator.userAgent.toLowerCase(),
      s = ["googletv", "viera", "smarttv", "internet.tv", "netcast", "nettv", "appletv", "boxee", "kylo", "roku", "dlnadoc", "roku", "pov_tv", "hbbtv", "ce-html"];
  i.macos = function () {
    return f("mac");
  }, i.ios = function () {
    return i.iphone() || i.ipod() || i.ipad();
  }, i.iphone = function () {
    return !i.windows() && f("iphone");
  }, i.ipod = function () {
    return f("ipod");
  }, i.ipad = function () {
    return f("ipad");
  }, i.android = function () {
    return !i.windows() && f("android");
  }, i.androidPhone = function () {
    return i.android() && f("mobile");
  }, i.androidTablet = function () {
    return i.android() && !f("mobile");
  }, i.blackberry = function () {
    return f("blackberry") || f("bb10") || f("rim");
  }, i.blackberryPhone = function () {
    return i.blackberry() && !f("tablet");
  }, i.blackberryTablet = function () {
    return i.blackberry() && f("tablet");
  }, i.windows = function () {
    return f("windows");
  }, i.windowsPhone = function () {
    return i.windows() && f("phone");
  }, i.windowsTablet = function () {
    return i.windows() && f("touch") && !i.windowsPhone();
  }, i.fxos = function () {
    return (f("(mobile") || f("(tablet")) && f(" rv:");
  }, i.fxosPhone = function () {
    return i.fxos() && f("mobile");
  }, i.fxosTablet = function () {
    return i.fxos() && f("tablet");
  }, i.meego = function () {
    return f("meego");
  }, i.cordova = function () {
    return window.cordova && "file:" === location.protocol;
  }, i.nodeWebkit = function () {
    return "object" === r(window.process);
  }, i.mobile = function () {
    return i.androidPhone() || i.iphone() || i.ipod() || i.windowsPhone() || i.blackberryPhone() || i.fxosPhone() || i.meego();
  }, i.tablet = function () {
    return i.ipad() || i.androidTablet() || i.blackberryTablet() || i.windowsTablet() || i.fxosTablet();
  }, i.desktop = function () {
    return !i.tablet() && !i.mobile();
  }, i.television = function () {
    for (var t = 0; t < s.length;) {
      if (f(s[t])) return !0;
      t++;
    }

    return !1;
  }, i.portrait = function () {
    return window.innerHeight / window.innerWidth > 1;
  }, i.landscape = function () {
    return window.innerHeight / window.innerWidth < 1;
  }, i.noConflict = function () {
    return window.device = o, this;
  };

  function f(t) {
    return -1 !== a.indexOf(t);
  }

  function l(t) {
    return u.className.match(new RegExp(t, "i"));
  }

  function p(t) {
    var n = null;
    l(t) || (n = u.className.replace(/^\s+|\s+$/g, ""), u.className = n + " " + t);
  }

  function d(t) {
    l(t) && (u.className = u.className.replace(" " + t, ""));
  }

  i.ios() ? i.ipad() ? p("ios ipad tablet") : i.iphone() ? p("ios iphone mobile") : i.ipod() && p("ios ipod mobile") : i.macos() ? p("macos desktop") : i.android() ? i.androidTablet() ? p("android tablet") : p("android mobile") : i.blackberry() ? i.blackberryTablet() ? p("blackberry tablet") : p("blackberry mobile") : i.windows() ? i.windowsTablet() ? p("windows tablet") : i.windowsPhone() ? p("windows mobile") : p("windows desktop") : i.fxos() ? i.fxosTablet() ? p("fxos tablet") : p("fxos mobile") : i.meego() ? p("meego mobile") : i.nodeWebkit() ? p("node-webkit") : i.television() ? p("television") : i.desktop() && p("desktop"), i.cordova() && p("cordova");

  function v() {
    i.landscape() ? (d("portrait"), p("landscape"), h("landscape")) : (d("landscape"), p("portrait"), h("portrait")), b();
  }

  function h(t) {
    for (var n in c) {
      c[n](t);
    }
  }

  i.onChangeOrientation = function (t) {
    "function" == typeof t && c.push(t);
  };

  var y = "resize";
  Object.prototype.hasOwnProperty.call(window, "onorientationchange") && (y = "onorientationchange"), window.addEventListener ? window.addEventListener(y, v, !1) : window.attachEvent ? window.attachEvent(y, v) : window[y] = v, v();

  function m(t) {
    for (var n = 0; n < t.length; n++) {
      if (i[t[n]]()) return t[n];
    }

    return "unknown";
  }

  i.type = m(["mobile", "tablet", "desktop"]), i.os = m(["ios", "iphone", "ipad", "ipod", "android", "blackberry", "windows", "fxos", "meego", "television"]);

  function b() {
    i.orientation = m(["portrait", "landscape"]);
  }

  b(), n["default"] = i;
}, function (t, n, e) {
  e(41), e(73), t.exports = e(37);
}, function (t, n, e) {
  e(42), e(45), e(56), e(60), e(71), e(72), t.exports = e(4).Promise;
}, function (t, n, e) {
  "use strict";

  var r = e(15),
      o = {};
  o[e(0)("toStringTag")] = "z", o + "" != "[object z]" && e(5)(Object.prototype, "toString", function () {
    return "[object " + r(this) + "]";
  }, !0);
}, function (t, n, e) {
  t.exports = !e(7) && !e(25)(function () {
    return 7 != Object.defineProperty(e(17)("div"), "a", {
      get: function get() {
        return 7;
      }
    }).a;
  });
}, function (t, n, e) {
  var r = e(6);

  t.exports = function (t, n) {
    if (!r(t)) return t;
    var e, o;
    if (n && "function" == typeof (e = t.toString) && !r(o = e.call(t))) return o;
    if ("function" == typeof (e = t.valueOf) && !r(o = e.call(t))) return o;
    if (!n && "function" == typeof (e = t.toString) && !r(o = e.call(t))) return o;
    throw TypeError("Can't convert object to primitive value");
  };
}, function (t, n, e) {
  "use strict";

  var r = e(46)(!0);
  e(27)(String, "String", function (t) {
    this._t = String(t), this._i = 0;
  }, function () {
    var t,
        n = this._t,
        e = this._i;
    return e >= n.length ? {
      value: void 0,
      done: !0
    } : (t = r(n, e), this._i += t.length, {
      value: t,
      done: !1
    });
  });
}, function (t, n, e) {
  var r = e(18),
      o = e(19);

  t.exports = function (t) {
    return function (n, e) {
      var i,
          c,
          u = String(o(n)),
          a = r(e),
          s = u.length;
      return a < 0 || a >= s ? t ? "" : void 0 : (i = u.charCodeAt(a)) < 55296 || i > 56319 || a + 1 === s || (c = u.charCodeAt(a + 1)) < 56320 || c > 57343 ? t ? u.charAt(a) : i : t ? u.slice(a, a + 2) : c - 56320 + (i - 55296 << 10) + 65536;
    };
  };
}, function (t, n, e) {
  "use strict";

  var r = e(48),
      o = e(26),
      i = e(22),
      c = {};
  e(3)(c, e(0)("iterator"), function () {
    return this;
  }), t.exports = function (t, n, e) {
    t.prototype = r(c, {
      next: o(1, e)
    }), i(t, n + " Iterator");
  };
}, function (t, n, e) {
  var r = e(2),
      o = e(49),
      i = e(31),
      c = e(21)("IE_PROTO"),
      u = function u() {},
      a = "prototype",
      _s = function s() {
    var t,
        n = e(17)("iframe"),
        r = i.length;

    for (n.style.display = "none", e(32).appendChild(n), n.src = "javascript:", (t = n.contentWindow.document).open(), t.write("<script>document.F=Object<\/script>"), t.close(), _s = t.F; r--;) {
      delete _s[a][i[r]];
    }

    return _s();
  };

  t.exports = Object.create || function (t, n) {
    var e;
    return null !== t ? (u[a] = r(t), e = new u(), u[a] = null, e[c] = t) : e = _s(), void 0 === n ? e : o(e, n);
  };
}, function (t, n, e) {
  var r = e(11),
      o = e(2),
      i = e(29);
  t.exports = e(7) ? Object.defineProperties : function (t, n) {
    o(t);

    for (var e, c = i(n), u = c.length, a = 0; u > a;) {
      r.f(t, e = c[a++], n[e]);
    }

    return t;
  };
}, function (t, n, e) {
  var r = e(8),
      o = e(20),
      i = e(52)(!1),
      c = e(21)("IE_PROTO");

  t.exports = function (t, n) {
    var e,
        u = o(t),
        a = 0,
        s = [];

    for (e in u) {
      e != c && r(u, e) && s.push(e);
    }

    for (; n.length > a;) {
      r(u, e = n[a++]) && (~i(s, e) || s.push(e));
    }

    return s;
  };
}, function (t, n, e) {
  var r = e(10);
  t.exports = Object("z").propertyIsEnumerable(0) ? Object : function (t) {
    return "String" == r(t) ? t.split("") : Object(t);
  };
}, function (t, n, e) {
  var r = e(20),
      o = e(30),
      i = e(53);

  t.exports = function (t) {
    return function (n, e, c) {
      var u,
          a = r(n),
          s = o(a.length),
          f = i(c, s);

      if (t && e != e) {
        for (; s > f;) {
          if ((u = a[f++]) != u) return !0;
        }
      } else for (; s > f; f++) {
        if ((t || f in a) && a[f] === e) return t || f || 0;
      }

      return !t && -1;
    };
  };
}, function (t, n, e) {
  var r = e(18),
      o = Math.max,
      i = Math.min;

  t.exports = function (t, n) {
    return (t = r(t)) < 0 ? o(t + n, 0) : i(t, n);
  };
}, function (t, n, e) {
  var r = e(8),
      o = e(55),
      i = e(21)("IE_PROTO"),
      c = Object.prototype;

  t.exports = Object.getPrototypeOf || function (t) {
    return t = o(t), r(t, i) ? t[i] : "function" == typeof t.constructor && t instanceof t.constructor ? t.constructor.prototype : t instanceof Object ? c : null;
  };
}, function (t, n, e) {
  var r = e(19);

  t.exports = function (t) {
    return Object(r(t));
  };
}, function (t, n, e) {
  for (var r = e(57), o = e(29), i = e(5), c = e(1), u = e(3), a = e(9), s = e(0), f = s("iterator"), l = s("toStringTag"), p = a.Array, d = {
    CSSRuleList: !0,
    CSSStyleDeclaration: !1,
    CSSValueList: !1,
    ClientRectList: !1,
    DOMRectList: !1,
    DOMStringList: !1,
    DOMTokenList: !0,
    DataTransferItemList: !1,
    FileList: !1,
    HTMLAllCollection: !1,
    HTMLCollection: !1,
    HTMLFormElement: !1,
    HTMLSelectElement: !1,
    MediaList: !0,
    MimeTypeArray: !1,
    NamedNodeMap: !1,
    NodeList: !0,
    PaintRequestList: !1,
    Plugin: !1,
    PluginArray: !1,
    SVGLengthList: !1,
    SVGNumberList: !1,
    SVGPathSegList: !1,
    SVGPointList: !1,
    SVGStringList: !1,
    SVGTransformList: !1,
    SourceBufferList: !1,
    StyleSheetList: !0,
    TextTrackCueList: !1,
    TextTrackList: !1,
    TouchList: !1
  }, v = o(d), h = 0; h < v.length; h++) {
    var y,
        m = v[h],
        b = d[m],
        w = c[m],
        g = w && w.prototype;
    if (g && (g[f] || u(g, f, p), g[l] || u(g, l, m), a[m] = p, b)) for (y in r) {
      g[y] || i(g, y, r[y], !0);
    }
  }
}, function (t, n, e) {
  "use strict";

  var r = e(58),
      o = e(59),
      i = e(9),
      c = e(20);
  t.exports = e(27)(Array, "Array", function (t, n) {
    this._t = c(t), this._i = 0, this._k = n;
  }, function () {
    var t = this._t,
        n = this._k,
        e = this._i++;
    return !t || e >= t.length ? (this._t = void 0, o(1)) : o(0, "keys" == n ? e : "values" == n ? t[e] : [e, t[e]]);
  }, "values"), i.Arguments = i.Array, r("keys"), r("values"), r("entries");
}, function (t, n, e) {
  var r = e(0)("unscopables"),
      o = Array.prototype;
  void 0 == o[r] && e(3)(o, r, {}), t.exports = function (t) {
    o[r][t] = !0;
  };
}, function (t, n) {
  t.exports = function (t, n) {
    return {
      value: n,
      done: !!t
    };
  };
}, function (t, n, e) {
  "use strict";

  var r,
      o,
      i,
      c,
      u = e(28),
      a = e(1),
      s = e(13),
      f = e(15),
      l = e(12),
      p = e(6),
      d = e(14),
      v = e(61),
      h = e(62),
      y = e(33),
      m = e(34).set,
      b = e(67)(),
      w = e(23),
      g = e(35),
      x = e(36),
      _ = "Promise",
      S = a.TypeError,
      k = a.process,
      _P = a[_],
      j = "process" == f(k),
      O = function O() {},
      T = o = w.f,
      L = !!function () {
    try {
      var t = _P.resolve(1),
          n = (t.constructor = {})[e(0)("species")] = function (t) {
        t(O, O);
      };

      return (j || "function" == typeof PromiseRejectionEvent) && t.then(O) instanceof n;
    } catch (t) {}
  }(),
      E = function E(t) {
    var n;
    return !(!p(t) || "function" != typeof (n = t.then)) && n;
  },
      M = function M(t, n) {
    if (!t._n) {
      t._n = !0;
      var e = t._c;
      b(function () {
        for (var r = t._v, o = 1 == t._s, i = 0, c = function c(n) {
          var e,
              i,
              c = o ? n.ok : n.fail,
              u = n.resolve,
              a = n.reject,
              s = n.domain;

          try {
            c ? (o || (2 == t._h && F(t), t._h = 1), !0 === c ? e = r : (s && s.enter(), e = c(r), s && s.exit()), e === n.promise ? a(S("Promise-chain cycle")) : (i = E(e)) ? i.call(e, u, a) : u(e)) : a(r);
          } catch (t) {
            a(t);
          }
        }; e.length > i;) {
          c(e[i++]);
        }

        t._c = [], t._n = !1, n && !t._h && A(t);
      });
    }
  },
      A = function A(t) {
    m.call(a, function () {
      var n,
          e,
          r,
          o = t._v,
          i = C(t);
      if (i && (n = g(function () {
        j ? k.emit("unhandledRejection", o, t) : (e = a.onunhandledrejection) ? e({
          promise: t,
          reason: o
        }) : (r = a.console) && r.error && r.error("Unhandled promise rejection", o);
      }), t._h = j || C(t) ? 2 : 1), t._a = void 0, i && n.e) throw n.v;
    });
  },
      C = function C(t) {
    return 1 !== t._h && 0 === (t._a || t._c).length;
  },
      F = function F(t) {
    m.call(a, function () {
      var n;
      j ? k.emit("rejectionHandled", t) : (n = a.onrejectionhandled) && n({
        promise: t,
        reason: t._v
      });
    });
  },
      N = function N(t) {
    var n = this;
    n._d || (n._d = !0, (n = n._w || n)._v = t, n._s = 2, n._a || (n._a = n._c.slice()), M(n, !0));
  },
      R = function R(t) {
    var n,
        e = this;

    if (!e._d) {
      e._d = !0, e = e._w || e;

      try {
        if (e === t) throw S("Promise can't be resolved itself");
        (n = E(t)) ? b(function () {
          var r = {
            _w: e,
            _d: !1
          };

          try {
            n.call(t, s(R, r, 1), s(N, r, 1));
          } catch (t) {
            N.call(r, t);
          }
        }) : (e._v = t, e._s = 1, M(e, !1));
      } catch (t) {
        N.call({
          _w: e,
          _d: !1
        }, t);
      }
    }
  };

  L || (_P = function P(t) {
    v(this, _P, _, "_h"), d(t), r.call(this);

    try {
      t(s(R, this, 1), s(N, this, 1));
    } catch (t) {
      N.call(this, t);
    }
  }, (r = function r(t) {
    this._c = [], this._a = void 0, this._s = 0, this._d = !1, this._v = void 0, this._h = 0, this._n = !1;
  }).prototype = e(68)(_P.prototype, {
    then: function then(t, n) {
      var e = T(y(this, _P));
      return e.ok = "function" != typeof t || t, e.fail = "function" == typeof n && n, e.domain = j ? k.domain : void 0, this._c.push(e), this._a && this._a.push(e), this._s && M(this, !1), e.promise;
    },
    "catch": function _catch(t) {
      return this.then(void 0, t);
    }
  }), i = function i() {
    var t = new r();
    this.promise = t, this.resolve = s(R, t, 1), this.reject = s(N, t, 1);
  }, w.f = T = function T(t) {
    return t === _P || t === c ? new i(t) : o(t);
  }), l(l.G + l.W + l.F * !L, {
    Promise: _P
  }), e(22)(_P, _), e(69)(_), c = e(4)[_], l(l.S + l.F * !L, _, {
    reject: function reject(t) {
      var n = T(this);
      return (0, n.reject)(t), n.promise;
    }
  }), l(l.S + l.F * (u || !L), _, {
    resolve: function resolve(t) {
      return x(u && this === c ? _P : this, t);
    }
  }), l(l.S + l.F * !(L && e(70)(function (t) {
    _P.all(t)["catch"](O);
  })), _, {
    all: function all(t) {
      var n = this,
          e = T(n),
          r = e.resolve,
          o = e.reject,
          i = g(function () {
        var e = [],
            i = 0,
            c = 1;
        h(t, !1, function (t) {
          var u = i++,
              a = !1;
          e.push(void 0), c++, n.resolve(t).then(function (t) {
            a || (a = !0, e[u] = t, --c || r(e));
          }, o);
        }), --c || r(e);
      });
      return i.e && o(i.v), e.promise;
    },
    race: function race(t) {
      var n = this,
          e = T(n),
          r = e.reject,
          o = g(function () {
        h(t, !1, function (t) {
          n.resolve(t).then(e.resolve, r);
        });
      });
      return o.e && r(o.v), e.promise;
    }
  });
}, function (t, n) {
  t.exports = function (t, n, e, r) {
    if (!(t instanceof n) || void 0 !== r && r in t) throw TypeError(e + ": incorrect invocation!");
    return t;
  };
}, function (t, n, e) {
  var r = e(13),
      o = e(63),
      i = e(64),
      c = e(2),
      u = e(30),
      a = e(65),
      s = {},
      f = {};
  (n = t.exports = function (t, n, e, l, p) {
    var d,
        v,
        h,
        y,
        m = p ? function () {
      return t;
    } : a(t),
        b = r(e, l, n ? 2 : 1),
        w = 0;
    if ("function" != typeof m) throw TypeError(t + " is not iterable!");

    if (i(m)) {
      for (d = u(t.length); d > w; w++) {
        if ((y = n ? b(c(v = t[w])[0], v[1]) : b(t[w])) === s || y === f) return y;
      }
    } else for (h = m.call(t); !(v = h.next()).done;) {
      if ((y = o(h, b, v.value, n)) === s || y === f) return y;
    }
  }).BREAK = s, n.RETURN = f;
}, function (t, n, e) {
  var r = e(2);

  t.exports = function (t, n, e, o) {
    try {
      return o ? n(r(e)[0], e[1]) : n(e);
    } catch (n) {
      var i = t["return"];
      throw void 0 !== i && r(i.call(t)), n;
    }
  };
}, function (t, n, e) {
  var r = e(9),
      o = e(0)("iterator"),
      i = Array.prototype;

  t.exports = function (t) {
    return void 0 !== t && (r.Array === t || i[o] === t);
  };
}, function (t, n, e) {
  var r = e(15),
      o = e(0)("iterator"),
      i = e(9);

  t.exports = e(4).getIteratorMethod = function (t) {
    if (void 0 != t) return t[o] || t["@@iterator"] || i[r(t)];
  };
}, function (t, n) {
  t.exports = function (t, n, e) {
    var r = void 0 === e;

    switch (n.length) {
      case 0:
        return r ? t() : t.call(e);

      case 1:
        return r ? t(n[0]) : t.call(e, n[0]);

      case 2:
        return r ? t(n[0], n[1]) : t.call(e, n[0], n[1]);

      case 3:
        return r ? t(n[0], n[1], n[2]) : t.call(e, n[0], n[1], n[2]);

      case 4:
        return r ? t(n[0], n[1], n[2], n[3]) : t.call(e, n[0], n[1], n[2], n[3]);
    }

    return t.apply(e, n);
  };
}, function (t, n, e) {
  var r = e(1),
      o = e(34).set,
      i = r.MutationObserver || r.WebKitMutationObserver,
      c = r.process,
      u = r.Promise,
      a = "process" == e(10)(c);

  t.exports = function () {
    var t,
        n,
        e,
        s = function s() {
      var r, o;

      for (a && (r = c.domain) && r.exit(); t;) {
        o = t.fn, t = t.next;

        try {
          o();
        } catch (r) {
          throw t ? e() : n = void 0, r;
        }
      }

      n = void 0, r && r.enter();
    };

    if (a) e = function e() {
      c.nextTick(s);
    };else if (!i || r.navigator && r.navigator.standalone) {
      if (u && u.resolve) {
        var f = u.resolve();

        e = function e() {
          f.then(s);
        };
      } else e = function e() {
        o.call(r, s);
      };
    } else {
      var l = !0,
          p = document.createTextNode("");
      new i(s).observe(p, {
        characterData: !0
      }), e = function e() {
        p.data = l = !l;
      };
    }
    return function (r) {
      var o = {
        fn: r,
        next: void 0
      };
      n && (n.next = o), t || (t = o, e()), n = o;
    };
  };
}, function (t, n, e) {
  var r = e(5);

  t.exports = function (t, n, e) {
    for (var o in n) {
      r(t, o, n[o], e);
    }

    return t;
  };
}, function (t, n, e) {
  "use strict";

  var r = e(1),
      o = e(11),
      i = e(7),
      c = e(0)("species");

  t.exports = function (t) {
    var n = r[t];
    i && n && !n[c] && o.f(n, c, {
      configurable: !0,
      get: function get() {
        return this;
      }
    });
  };
}, function (t, n, e) {
  var r = e(0)("iterator"),
      o = !1;

  try {
    var i = [7][r]();
    i["return"] = function () {
      o = !0;
    }, Array.from(i, function () {
      throw 2;
    });
  } catch (t) {}

  t.exports = function (t, n) {
    if (!n && !o) return !1;
    var e = !1;

    try {
      var i = [7],
          c = i[r]();
      c.next = function () {
        return {
          done: e = !0
        };
      }, i[r] = function () {
        return c;
      }, t(i);
    } catch (t) {}

    return e;
  };
}, function (t, n, e) {
  "use strict";

  var r = e(12),
      o = e(4),
      i = e(1),
      c = e(33),
      u = e(36);
  r(r.P + r.R, "Promise", {
    "finally": function _finally(t) {
      var n = c(this, o.Promise || i.Promise),
          e = "function" == typeof t;
      return this.then(e ? function (e) {
        return u(n, t()).then(function () {
          return e;
        });
      } : t, e ? function (e) {
        return u(n, t()).then(function () {
          throw e;
        });
      } : t);
    }
  });
}, function (t, n, e) {
  "use strict";

  var r = e(12),
      o = e(23),
      i = e(35);
  r(r.S, "Promise", {
    "try": function _try(t) {
      var n = o.f(this),
          e = i(t);
      return (e.e ? n.reject : n.resolve)(e.v), n.promise;
    }
  });
}, function (t, n, e) {
  "use strict";

  Object.defineProperty(n, "__esModule", {
    value: !0
  });

  function r() {
    try {
      return document.currentScript.src;
    } catch (n) {
      var t = document.getElementsByTagName("script");
      return t[t.length - 1].src;
    }
  }

  e.p = r().replace(/[^/\\\\]+$/, ""), n.getCurrentPath = r;
}, function (t, n, e) {
  "use strict";

  t.exports = {
    model: {
      jsonPath: "https://unpkg.com/live2d-widget-model-shizuku@latest/assets/shizuku.model.json",
      scale: 1
    },
    display: {
      superSample: 2,
      width: 200,
      height: 400,
      position: "right",
      hOffset: 0,
      vOffset: -20
    },
    mobile: {
      show: !0,
      scale: .8,
      motion: !0
    },
    name: {
      canvas: "live2dcanvas",
      div: "live2d-widget"
    },
    react: {
      opacity: 1
    },
    dev: {
      border: !1
    },
    dialog: {
      enable: !1,
      hitokoto: !1
    }
  };
}, function (t, n, e) {
  "use strict";

  var r = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (t) {
    return _typeof(t);
  } : function (t) {
    return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : _typeof(t);
  };

  t.exports = function t(n, e) {
    n = n || {};

    function o(n, e) {
      for (var o in e) {
        if (e.hasOwnProperty(o)) {
          var i = e[o];
          if ("__proto__" === o) continue;
          var c = n[o];
          null == c ? n[o] = i : "object" === (void 0 === c ? "undefined" : r(c)) && null !== c && "object" === (void 0 === i ? "undefined" : r(i)) && null !== i && t(c, i);
        }
      }
    }

    for (var i = arguments.length, c = 0; c < i;) {
      var u = arguments[c++];
      u && o(n, u);
    }

    return n;
  };
}]).L2Dwidget; // EDIT by jinyaoMa
// Purpose: use as module
// Change ^var to ^export const
// Change o.p+"plugin/L2Dwidget." to "/asset/js/plugin/L2Dwidget."


exports.L2Dwidget = L2Dwidget;

},{}],41:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { return function () { var Super = _getPrototypeOf(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var _default = function _default(o) {
  function _objectSpread(a) {
    for (var b = 1; b < arguments.length; b++) {
      var c = null == arguments[b] ? {} : arguments[b],
          d = Object.keys(c);
      "function" == typeof Object.getOwnPropertySymbols && (d = d.concat(Object.getOwnPropertySymbols(c).filter(function (a) {
        return Object.getOwnPropertyDescriptor(c, a).enumerable;
      }))), d.forEach(function (b) {
        _defineProperty(a, b, c[b]);
      });
    }

    return a;
  }

  function _defineProperty(a, b, c) {
    return b in a ? Object.defineProperty(a, b, {
      value: c,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }) : a[b] = c, a;
  }

  var MetingJSElement = /*#__PURE__*/function (_HTMLElement) {
    _inherits(MetingJSElement, _HTMLElement);

    var _super = _createSuper(MetingJSElement);

    function MetingJSElement() {
      _classCallCheck(this, MetingJSElement);

      return _super.apply(this, arguments);
    }

    _createClass(MetingJSElement, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        window.APlayer && window.fetch && (this._init(), this._parse());
      }
    }, {
      key: "disconnectedCallback",
      value: function disconnectedCallback() {
        this.lock || this.aplayer.destroy();
      }
    }, {
      key: "_camelize",
      value: function _camelize(a) {
        return a.replace(/^[_.\- ]+/, "").toLowerCase().replace(/[_.\- ]+(\w|$)/g, function (a, b) {
          return b.toUpperCase();
        });
      }
    }, {
      key: "_init",
      value: function _init() {
        var a = {};

        for (var _b = 0; _b < this.attributes.length; _b += 1) {
          a[this._camelize(this.attributes[_b].name)] = this.attributes[_b].value;
        }

        var b = ["server", "type", "id", "api", "auth", "auto", "lock", "name", "title", "artist", "author", "url", "cover", "pic", "lyric", "lrc"];
        this.meta = {};

        for (var c = 0; c < b.length; c++) {
          var d = b[c];
          this.meta[d] = a[d], delete a[d];
        }

        this.config = a, this.api = this.meta.api || window.meting_api || "https://api.i-meto.com/meting/api?server=:server&type=:type&id=:id&r=:r", this.meta.auto && this._parse_link();
      }
    }, {
      key: "_parse_link",
      value: function _parse_link() {
        var a = [["music.163.com.*song.*id=(\\d+)", "netease", "song"], ["music.163.com.*album.*id=(\\d+)", "netease", "album"], ["music.163.com.*artist.*id=(\\d+)", "netease", "artist"], ["music.163.com.*playlist.*id=(\\d+)", "netease", "playlist"], ["music.163.com.*discover/toplist.*id=(\\d+)", "netease", "playlist"], ["y.qq.com.*song/(\\w+).html", "tencent", "song"], ["y.qq.com.*album/(\\w+).html", "tencent", "album"], ["y.qq.com.*singer/(\\w+).html", "tencent", "artist"], ["y.qq.com.*playsquare/(\\w+).html", "tencent", "playlist"], ["y.qq.com.*playlist/(\\w+).html", "tencent", "playlist"], ["xiami.com.*song/(\\w+)", "xiami", "song"], ["xiami.com.*album/(\\w+)", "xiami", "album"], ["xiami.com.*artist/(\\w+)", "xiami", "artist"], ["xiami.com.*collect/(\\w+)", "xiami", "playlist"]];

        for (var b = 0; b < a.length; b++) {
          var c = a[b],
              d = new RegExp(c[0]),
              e = d.exec(this.meta.auto);
          if (null !== e) return this.meta.server = c[1], this.meta.type = c[2], void (this.meta.id = e[1]);
        }
      }
    }, {
      key: "_parse",
      value: function _parse() {
        var _this = this;

        if (this.meta.url) {
          var _a = {
            name: this.meta.name || this.meta.title || "Audio name",
            artist: this.meta.artist || this.meta.author || "Audio artist",
            url: this.meta.url,
            cover: this.meta.cover || this.meta.pic,
            lrc: this.meta.lrc || this.meta.lyric || "",
            type: this.meta.type || "auto"
          };
          return _a.lrc || (this.meta.lrcType = 0), this.innerText && (_a.lrc = this.innerText, this.meta.lrcType = 2), void this._loadPlayer([_a]);
        }

        var a = this.api.replace(":server", this.meta.server).replace(":type", this.meta.type).replace(":id", this.meta.id).replace(":auth", this.meta.auth).replace(":r", Math.random());
        fetch(a).then(function (a) {
          return a.json();
        }).then(function (a) {
          return _this._loadPlayer(a);
        });
      }
    }, {
      key: "_loadPlayer",
      value: function _loadPlayer(a) {
        var b = {
          audio: a,
          mutex: !0,
          lrcType: this.meta.lrcType || 3,
          storageName: "metingjs"
        };

        if (a.length) {
          var _a2 = _objectSpread({}, b, this.config);

          for (var _b2 in _a2) {
            ("true" === _a2[_b2] || "false" === _a2[_b2]) && (_a2[_b2] = "true" === _a2[_b2]);
          }

          var c = document.createElement("div");
          _a2.container = c, this.appendChild(c), this.aplayer = new APlayer(_a2);
        }
      }
    }]);

    return MetingJSElement;
  }( /*#__PURE__*/_wrapNativeSuper(HTMLElement));

  console.log("\n %c MetingJS v2.0.1 %c https://github.com/metowolf/MetingJS \n", "color: #fadfa3; background: #030307; padding:5px 0;", "background: #fadfa3; padding:5px 0;"), window.customElements && !window.customElements.get("meting-js") && (window.MetingJSElement = MetingJSElement, window.customElements.define("meting-js", MetingJSElement));
};

exports["default"] = _default;

},{}],42:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _this = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*!
 * Valine v1.3.10
 * (c) 2017-2019 xCss
 * Released under the GPL-2.0 License.
 * Last Update: 2019-08-29 10:10:02
 */
var _default = function _default(o) {
  !function (e, t) {
    window.Valine = t();
  }(_this, function () {
    return function (e) {
      function t(r) {
        if (n[r]) return n[r].exports;
        var i = n[r] = {
          i: r,
          l: !1,
          exports: {}
        };
        return e[r].call(i.exports, i, i.exports, t), i.l = !0, i.exports;
      }

      var n = {};
      return t.m = e, t.c = n, t.i = function (e) {
        return e;
      }, t.d = function (e, n, r) {
        t.o(e, n) || Object.defineProperty(e, n, {
          configurable: !1,
          enumerable: !0,
          get: r
        });
      }, t.n = function (e) {
        var n = e && e.__esModule ? function () {
          return e["default"];
        } : function () {
          return e;
        };
        return t.d(n, "a", n), n;
      }, t.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t);
      }, t.p = "", t(t.s = 17);
    }([function (e, t, n) {
      var r, i, o;
      /*!
      autosize 4.0.2
      license: MIT
      http://www.jacklmoore.com/autosize
      */

      !function (n, a) {
        i = [e, t], r = a, void 0 !== (o = "function" == typeof r ? r.apply(t, i) : r) && (e.exports = o);
      }(0, function (e, t) {
        "use strict";

        function n(e) {
          function t(t) {
            var n = e.style.width;
            e.style.width = "0px", e.offsetWidth, e.style.width = n, e.style.overflowY = t;
          }

          function n(e) {
            for (var t = []; e && e.parentNode && e.parentNode instanceof Element;) {
              e.parentNode.scrollTop && t.push({
                node: e.parentNode,
                scrollTop: e.parentNode.scrollTop
              }), e = e.parentNode;
            }

            return t;
          }

          function r() {
            if (0 !== e.scrollHeight) {
              var t = n(e),
                  r = document.documentElement && document.documentElement.scrollTop;
              e.style.height = "", e.style.height = e.scrollHeight + s + "px", l = e.clientWidth, t.forEach(function (e) {
                e.node.scrollTop = e.scrollTop;
              }), r && (document.documentElement.scrollTop = r);
            }
          }

          function i() {
            r();
            var n = Math.round(parseFloat(e.style.height)),
                i = window.getComputedStyle(e, null),
                o = "content-box" === i.boxSizing ? Math.round(parseFloat(i.height)) : e.offsetHeight;

            if (o < n ? "hidden" === i.overflowY && (t("scroll"), r(), o = "content-box" === i.boxSizing ? Math.round(parseFloat(window.getComputedStyle(e, null).height)) : e.offsetHeight) : "hidden" !== i.overflowY && (t("hidden"), r(), o = "content-box" === i.boxSizing ? Math.round(parseFloat(window.getComputedStyle(e, null).height)) : e.offsetHeight), c !== o) {
              c = o;
              var s = a("autosize:resized");

              try {
                e.dispatchEvent(s);
              } catch (e) {}
            }
          }

          if (e && e.nodeName && "TEXTAREA" === e.nodeName && !o.has(e)) {
            var s = null,
                l = null,
                c = null,
                d = function d() {
              e.clientWidth !== l && i();
            },
                u = function (t) {
              window.removeEventListener("resize", d, !1), e.removeEventListener("input", i, !1), e.removeEventListener("keyup", i, !1), e.removeEventListener("autosize:destroy", u, !1), e.removeEventListener("autosize:update", i, !1), Object.keys(t).forEach(function (n) {
                e.style[n] = t[n];
              }), o["delete"](e);
            }.bind(e, {
              height: e.style.height,
              resize: e.style.resize,
              overflowY: e.style.overflowY,
              overflowX: e.style.overflowX,
              wordWrap: e.style.wordWrap
            });

            e.addEventListener("autosize:destroy", u, !1), "onpropertychange" in e && "oninput" in e && e.addEventListener("keyup", i, !1), window.addEventListener("resize", d, !1), e.addEventListener("input", i, !1), e.addEventListener("autosize:update", i, !1), e.style.overflowX = "hidden", e.style.wordWrap = "break-word", o.set(e, {
              destroy: u,
              update: i
            }), function () {
              var t = window.getComputedStyle(e, null);
              "vertical" === t.resize ? e.style.resize = "none" : "both" === t.resize && (e.style.resize = "horizontal"), s = "content-box" === t.boxSizing ? -(parseFloat(t.paddingTop) + parseFloat(t.paddingBottom)) : parseFloat(t.borderTopWidth) + parseFloat(t.borderBottomWidth), isNaN(s) && (s = 0), i();
            }();
          }
        }

        function r(e) {
          var t = o.get(e);
          t && t.destroy();
        }

        function i(e) {
          var t = o.get(e);
          t && t.update();
        }

        var o = "function" == typeof Map ? new Map() : function () {
          var e = [],
              t = [];
          return {
            has: function has(t) {
              return e.indexOf(t) > -1;
            },
            get: function get(n) {
              return t[e.indexOf(n)];
            },
            set: function set(n, r) {
              -1 === e.indexOf(n) && (e.push(n), t.push(r));
            },
            "delete": function _delete(n) {
              var r = e.indexOf(n);
              r > -1 && (e.splice(r, 1), t.splice(r, 1));
            }
          };
        }(),
            a = function a(e) {
          return new Event(e, {
            bubbles: !0
          });
        };

        try {
          new Event("test");
        } catch (e) {
          a = function a(e) {
            var t = document.createEvent("Event");
            return t.initEvent(e, !0, !1), t;
          };
        }

        var s = null;
        "undefined" == typeof window || "function" != typeof window.getComputedStyle ? (s = function s(e) {
          return e;
        }, s.destroy = function (e) {
          return e;
        }, s.update = function (e) {
          return e;
        }) : (s = function s(e, t) {
          return e && Array.prototype.forEach.call(e.length ? e : [e], function (e) {
            return n(e);
          }), e;
        }, s.destroy = function (e) {
          return e && Array.prototype.forEach.call(e.length ? e : [e], r), e;
        }, s.update = function (e) {
          return e && Array.prototype.forEach.call(e.length ? e : [e], i), e;
        }), t["default"] = s, e.exports = t["default"];
      });
    }, function (e, t, n) {
      "use strict";

      function r(e) {
        var t = this;
        return t.init(e), t;
      }

      function i(e) {
        return new r(e);
      }

      var o = n(9).version,
          a = n(6),
          s = n(8),
          l = n(0),
          c = n(5),
          d = n(3),
          u = n(4),
          p = n(2),
          f = n(7),
          h = /^https?\:\/\//,
          v = {
        comment: "",
        nick: "Anonymous",
        mail: "",
        link: "",
        ua: navigator.userAgent,
        url: ""
      },
          g = {
        "zh-cn": {
          head: {
            nick: "昵称",
            mail: "邮箱",
            link: "网址(http://)"
          },
          tips: {
            comments: "评论",
            sofa: "快来做第一个评论的人吧~",
            busy: "还在提交中，请稍候...",
            again: "这么简单也能错，也是没谁了."
          },
          ctrl: {
            reply: "回复",
            ok: "好的",
            sure: "确认",
            cancel: "取消",
            confirm: "确认",
            "continue": "继续",
            more: "查看更多...",
            "try": "再试试?",
            preview: "预览",
            emoji: "表情"
          },
          error: {
            99: "初始化失败，请检查init中的`el`元素.",
            100: "初始化失败，请检查你的AppId和AppKey.",
            401: "未经授权的操作，请检查你的AppId和AppKey.",
            403: "访问被api域名白名单拒绝，请检查你的安全域名设置."
          },
          timeago: {
            seconds: "秒前",
            minutes: "分钟前",
            hours: "小时前",
            days: "天前",
            now: "刚刚"
          }
        },
        en: {
          head: {
            nick: "NickName",
            mail: "E-Mail",
            link: "Website(http://)"
          },
          tips: {
            comments: "Comments",
            sofa: "No comments yet.",
            busy: "Submit is busy, please wait...",
            again: "Sorry, this is a wrong calculation."
          },
          ctrl: {
            reply: "Reply",
            ok: "Ok",
            sure: "Sure",
            cancel: "Cancel",
            confirm: "Confirm",
            "continue": "Continue",
            more: "Load More...",
            "try": "Once More?",
            preview: "Preview",
            emoji: "Emoji"
          },
          error: {
            99: "Initialization failed, Please check the `el` element in the init method.",
            100: "Initialization failed, Please check your appId and appKey.",
            401: "Unauthorized operation, Please check your appId and appKey.",
            403: "Access denied by api domain white list, Please check your security domain."
          },
          timeago: {
            seconds: "seconds ago",
            minutes: "minutes ago",
            hours: "hours ago",
            days: "days ago",
            now: "just now"
          }
        }
      },
          m = {
        cdn: "https://gravatar.loli.net/avatar/",
        ds: ["mp", "identicon", "monsterid", "wavatar", "robohash", "retro", ""],
        params: "",
        hide: !1
      },
          b = ["nick", "mail", "link"],
          x = Storage && localStorage && localStorage instanceof Storage && localStorage,
          y = location.pathname.replace(/index\.html?$/, "");
      r.prototype.init = function (e) {
        var t = this;
        if (t.config = e, "undefined" == typeof document) return void console;
        "undefined" == typeof AV ? u.dynamicLoadSource("script", {
          src: "//cdn.jsdelivr.net/npm/leancloud-storage/dist/av-min.js"
        }, function () {
          if ("undefined" == typeof AV) return void setTimeout(function () {
            t.init(e);
          }, 300);
          !!e && t._init();
        }) : !!e && t._init();
        return u.dynamicLoadSource("script", {
          src: "//js.fundebug.cn/fundebug.1.9.0.min.js",
          apikey: "2c7e5b30c7cf402cb7fb35d14b62e7f778babbb70d054160af750065a180fdcd",
          async: !0
        }), t;
      }, r.prototype._init = function () {
        var e = this;

        try {
          var t = e.config,
              n = t.lang,
              r = t.langMode,
              i = t.avatar,
              a = t.avatarForce,
              l = t.avatar_cdn,
              c = t.notify,
              d = t.verify,
              p = t.visitor,
              x = t.pageSize,
              w = t.recordIP,
              _ = t.clazzName,
              A = void 0 === _ ? "Comment" : _;
          e.config.clazzName = A;
          var O = m.ds,
              S = a ? "&q=" + Math.random().toString(32).substring(2) : "";
          n && r && e.installLocale(n, r), e.locale = e.locale || g[n || "zh-cn"], e.notify = c || !1, e.verify = d || !1, m.params = "?d=" + (O.indexOf(i) > -1 ? i : "mp") + "&v=" + o + S, m.hide = "hide" === i, m.cdn = h.test(l) ? l : m.cdn, y = e.config.path || y;
          var $ = Number(x || 10);

          if (e.config.pageSize = isNaN($) ? 10 : $ < 1 ? 10 : $, s.setOptions({
            renderer: new s.Renderer(),
            highlight: !1 === e.config.highlight ? null : f,
            gfm: !0,
            tables: !0,
            breaks: !0,
            pedantic: !1,
            sanitize: !1,
            smartLists: !0,
            smartypants: !0
          }), w) {
            var E = u.create("script", "src", "//api.ip.sb/jsonip?callback=getIP"),
                L = document.getElementsByTagName("script")[0];
            L.parentNode.insertBefore(E, L), window.getIP = function (e) {
              v.ip = e.ip;
            };
          }

          var M = e.config.app_id || e.config.appId,
              C = e.config.app_key || e.config.appKey;
          if (!M || !C) throw 99;
          var z = "https://",
              T = "";
          if (!e.config.serverURLs) switch (M.slice(-9)) {
            case "-9Nh9j0Va":
              z += "tab.";
              break;

            case "-MdYXbMMI":
              z += "us.";
          }
          T = e.config.serverURLs || z + "avoscloud.com", M !== AV._config.applicationId && C !== AV._config.applicationKey && AV.init({
            appId: M,
            appKey: C,
            serverURLs: T
          });
          var R = u.findAll(document, ".valine-comment-count");
          u.each(R, function (t, n) {
            if (n) {
              var r = u.attr(n, "data-xid");
              r && e.Q(r).count().then(function (e) {
                n.innerText = e;
              })["catch"](function (e) {
                n.innerText = 0;
              });
            }
          }), p && k.add(AV.Object.extend("Counter"));
          var j = e.config.el || null,
              B = u.findAll(document, j);
          if (!(j = j instanceof HTMLElement ? j : B[B.length - 1] || null)) return;
          e.el = j, e.el.classList.add("v"), m.hide && e.el.classList.add("hide-avatar"), e.config.meta = (e.config.guest_info || e.config.meta || b).filter(function (e) {
            return b.indexOf(e) > -1;
          });
          var P = (0 == e.config.meta.length ? b : e.config.meta).map(function (t) {
            var n = "mail" == t ? "email" : "text";
            return b.indexOf(t) > -1 ? '<input name="' + t + '" placeholder="' + e.locale.head[t] + '" class="v' + t + ' vinput" type="' + n + '">' : "";
          });
          e.placeholder = e.config.placeholder || "Just Go Go", e.el.innerHTML = '<div class="vwrap"><div class="vheader item' + P.length + '">' + P.join("") + '</div><div class="vedit"><textarea id="veditor" class="veditor vinput" placeholder="' + e.placeholder + '"></textarea><div class="vctrl"><span class="vemoji-btn">' + e.locale.ctrl.emoji + '</span> | <span class="vpreview-btn">' + e.locale.ctrl.preview + '</span></div><div class="vemojis" style="display:none;"></div><div class="vinput vpreview" style="display:none;"></div></div><div class="vcontrol"><div class="col col-20" title="Markdown is supported"><a href="https://segmentfault.com/markdown" target="_blank"><svg class="markdown" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15v-7.7C16 3.52 15.48 3 14.85 3zM9 11H7V8L5.5 9.92 4 8v3H2V5h2l1.5 2L7 5h2v6zm2.99.5L9.5 8H11V5h2v3h1.5l-2.51 3.5z"></path></svg></a></div><div class="col col-80 text-right"><button type="button" title="Cmd|Ctrl+Enter" class="vsubmit vbtn">' + e.locale.ctrl.reply + '</button></div></div><div style="display:none;" class="vmark"></div></div><div class="vinfo" style="display:none;"><div class="vcount col"></div></div><div class="vlist"></div><div class="vempty" style="display:none;"></div><div class="vpage txt-center"></div><div class="info"><div class="power txt-right">Powered By <a href="https://valine.js.org" target="_blank">Valine</a><br>v' + o + "</div></div>";
          var U = u.find(e.el, ".vempty");
          e.nodata = {
            show: function show(t) {
              return U.innerHTML = t || e.locale.tips.sofa, u.attr(U, "style", "display:block;"), e;
            },
            hide: function hide() {
              return u.attr(U, "style", "display:none;"), e;
            }
          };
          var I = u.create("div", "class", "vloading"),
              N = u.find(e.el, ".vlist");
          e.loading = {
            show: function show(t) {
              var n = u.findAll(N, ".vcard");
              return t ? N.insertBefore(I, n[0]) : N.appendChild(I), e.nodata.hide(), e;
            },
            hide: function hide() {
              var t = u.find(N, ".vloading");
              return t && u.remove(t), 0 === u.findAll(N, ".vcard").length && e.nodata.show(), e;
            }
          };
          var Q = u.find(e.el, ".vmark");
          e.alert = {
            show: function show(t) {
              Q.innerHTML = '<div class="valert txt-center"><div class="vtext">' + (t && t.text || 1) + '</div><div class="vbtns"></div></div>';
              var n = u.find(Q, ".vbtns"),
                  r = '<button class="vcancel vbtn">' + (t && t.ctxt || e.locale.ctrl.cancel) + "</button>",
                  i = '<button class="vsure vbtn">' + (t && t.otxt || e.locale.ctrl.sure) + "</button>";

              if (n.innerHTML = "" + r + (t && t.type && i), u.on("click", u.find(Q, ".vcancel"), function (t) {
                e.alert.hide();
              }), u.attr(Q, "style", "display:block;"), t && t.type) {
                var o = u.find(Q, ".vsure");
                u.on("click", o, function (n) {
                  e.alert.hide(), t.cb && t.cb();
                });
              }

              return e;
            },
            hide: function hide() {
              return u.attr(Q, "style", "display:none;"), e;
            }
          }, e.bind();
        } catch (t) {
          e.ErrorHandler(t);
        }
      };

      var w = function w(e, t) {
        var n = new e(),
            r = new AV.ACL();
        r.setPublicReadAccess(!0), r.setPublicWriteAccess(!0), n.setACL(r), n.set("url", t.url), n.set("xid", t.xid), n.set("title", t.title), n.set("time", 1), n.save().then(function (e) {
          u.find(t.el, ".leancloud-visitors-count").innerText = 1;
        })["catch"](function (e) {});
      },
          k = {
        add: function add(e) {
          var t = u.findAll(document, ".leancloud_visitors,.leancloud-visitors");

          if (t.length) {
            var n = t[0],
                r = u.attr(n, "id"),
                i = u.attr(n, "data-flag-title"),
                o = encodeURI(r),
                a = {
              el: n,
              url: r,
              xid: o,
              title: i
            };

            if (decodeURI(r) === decodeURI(y)) {
              var s = new AV.Query(e);
              s.equalTo("url", r), s.find().then(function (t) {
                if (t.length > 0) {
                  var r = t[0];
                  r.increment("time"), r.save().then(function (e) {
                    u.find(n, ".leancloud-visitors-count").innerText = e.get("time");
                  })["catch"](function (e) {});
                } else w(e, a);
              })["catch"](function (t) {
                101 == t.code && w(e, a);
              });
            } else k.show(e, t);
          }
        },
        show: function show(e, t) {
          u.each(t, function (e, t) {
            var n = u.find(t, ".leancloud-visitors-count");
            n && (n.innerText = 0);
          });
          var n = [];

          for (var r in t) {
            t.hasOwnProperty(r) && n.push(u.attr(t[r], "id"));
          }

          if (n.length) {
            var i = new AV.Query(e);
            i.containedIn("url", n), i.find().then(function (e) {
              e.length > 0 && u.each(e, function (e, t) {
                var n = t.get("url"),
                    r = t.get("time"),
                    i = u.findAll(document, '.leancloud_visitors[id="' + n + '"],.leancloud-visitors[id="' + n + '"]');
                u.each(i, function (e, t) {
                  var n = u.find(t, ".leancloud-visitors-count");
                  n && (n.innerText = r);
                });
              });
            })["catch"](function (e) {});
          }
        }
      };

      r.prototype.Q = function (e) {
        var t = this;

        if (1 == arguments.length) {
          var n = new AV.Query(t.config.clazzName);
          n.doesNotExist("rid");
          var r = new AV.Query(t.config.clazzName);
          r.equalTo("rid", "");
          var i = AV.Query.or(n, r);
          return "*" === e ? i.exists("url") : i.equalTo("url", decodeURI(e)), i.addDescending("createdAt"), i.addDescending("insertedAt"), i;
        }

        var o = JSON.stringify(arguments[1]).replace(/(\[|\])/g, ""),
            a = "select * from " + t.config.clazzName + " where rid in (" + o + ") order by -createdAt,-createdAt";
        return AV.Query.doCloudQuery(a);
      }, r.prototype.ErrorHandler = function (e) {
        var t = this;

        if (t.el && t.loading.hide().nodata.hide(), "[object Error]" === {}.toString.call(e)) {
          var n = e.code || "",
              r = t.locale.error[n],
              i = r || e.message || e.error || "";
          101 == n ? t.nodata.show() : t.el && t.nodata.show('<pre style="text-align:left;">Code ' + n + ": " + i + "</pre>") || console;
        } else t.el && t.nodata.show('<pre style="text-align:left;">' + JSON.stringify(e) + "</pre>") || console;
      }, r.prototype.installLocale = function (e, t) {
        var n = this;
        return t = t || {}, e && (g[e] = t, n.locale = g[e] || g["zh-cn"]), n;
      }, r.prototype.setPath = function (e) {
        return y = e || y, this;
      }, r.prototype.bind = function (e) {
        var t = this,
            n = u.find(t.el, ".vemojis"),
            r = u.find(t.el, ".vpreview"),
            i = u.find(t.el, ".vemoji-btn"),
            o = u.find(t.el, ".vpreview-btn"),
            f = u.find(t.el, ".veditor"),
            h = p.data;

        for (var g in h) {
          h.hasOwnProperty(g) && function (e, t) {
            var r = u.create("i", {
              name: e,
              title: e
            });
            r.innerHTML = t, n.appendChild(r), u.on("click", r, function (e) {
              E(f, t), w(f);
            });
          }(g, h[g]);
        }

        t.emoji = {
          show: function show() {
            return t.preview.hide(), u.attr(i, "v", 1), u.removeAttr(o, "v"), u.attr(n, "style", "display:block"), t.emoji;
          },
          hide: function hide() {
            return u.removeAttr(i, "v"), u.attr(n, "style", "display:hide"), t.emoji;
          }
        }, t.preview = {
          show: function show() {
            return v.comment && (t.emoji.hide(), u.attr(o, "v", 1), u.removeAttr(i, "v"), r.innerHTML = v.comment, u.attr(r, "style", "display:block"), z()), t.preview;
          },
          hide: function hide() {
            return u.removeAttr(o, "v"), u.attr(r, "style", "display:none"), t.preview;
          },
          empty: function empty() {
            return r.innerHtml = "", t.preview;
          }
        };

        var b = function b(e) {
          var t = u.create("div");
          t.insertAdjacentHTML("afterbegin", e);

          var n = u.findAll(t, "*"),
              r = ["INPUT", "STYLE", "SCRIPT", "IFRAME", "FRAME", "AUDIO", "VIDEO", "EMBED", "META", "TITLE", "LINK"],
              i = function i(e, t) {
            var n = u.attr(e, t);
            n && u.attr(e, t, n.replace(/(javascript|eval)/gi, ""));
          };

          return u.each(n, function (e, t) {
            1 === t.nodeType && (r.indexOf(t.nodeName) > -1 && ("INPUT" === t.nodeName && "checkbox" === u.attr(t, "type") ? u.attr(t, "disabled", "disabled") : u.remove(t)), "A" === t.nodeName && i(t, "href"), u.clearAttr(t));
          }), t.innerHTML;
        },
            w = function w(e) {
          var t = e.value || "";
          t = p.parse(t), e.value = t;
          var n = b(s(t));
          v.comment = n, r.innerHTML = n, t ? l(e) : l.destroy(e);
        };

        u.on("click", i, function (e) {
          u.attr(i, "v") ? t.emoji.hide() : t.emoji.show();
        }), u.on("click", o, function (e) {
          u.attr(o, "v") ? t.preview.hide() : t.preview.show();
        });

        for (var k = t.config.meta, _ = {}, A = {
          veditor: "comment"
        }, O = 0, S = k.length; O < S; O++) {
          A["v" + k[O]] = k[O];
        }

        for (var $ in A) {
          A.hasOwnProperty($) && function () {
            var e = A[$],
                n = u.find(t.el, "." + $);
            _[e] = n, n && u.on("input change blur", n, function (t) {
              "comment" === e ? w(n) : v[e] = u.escape(n.value.replace(/(^\s*)|(\s*$)/g, ""));
            });
          }();
        }

        var E = function E(e, t) {
          if (document.selection) {
            e.focus();
            document.selection.createRange().text = t, e.focus();
          } else if (e.selectionStart || "0" == e.selectionStart) {
            var n = e.selectionStart,
                r = e.selectionEnd,
                i = e.scrollTop;
            e.value = e.value.substring(0, n) + t + e.value.substring(r, e.value.length), e.focus(), e.selectionStart = n + t.length, e.selectionEnd = n + t.length, e.scrollTop = i;
          } else e.focus(), e.value += t;
        },
            L = function L(e) {
          var n = u.find(t.el, ".vh[rootid='" + e + "']"),
              r = u.find(n, ".vquote");
          return r || (r = u.create("div", "class", "vquote"), n.appendChild(r)), r;
        },
            M = function e() {
          var n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1,
              r = t.config.pageSize,
              i = Number(u.find(t.el, ".vnum").innerText);
          t.loading.show();
          var o = t.Q(y);
          o.limit(r), o.skip((n - 1) * r), o.find().then(function (o) {
            for (var a = o.length, s = [], l = 0; l < a; l++) {
              var c = o[l];
              s.push(c.id), C(c, u.find(t.el, ".vlist"), !0);
            }

            t.Q(y, s).then(function (e) {
              for (var t = e && e.results || [], n = 0; n < t.length; n++) {
                var r = t[n];
                C(r, L(r.get("rid")));
              }
            });
            var d = u.find(t.el, ".vpage");
            d.innerHTML = r * n < i ? '<button type="button" class="vmore vbtn">' + t.locale.ctrl.more + "</button>" : "";
            var p = u.find(d, ".vmore");
            p && u.on("click", p, function (t) {
              d.innerHTML = "", e(++n);
            }), t.loading.hide();
          })["catch"](function (e) {
            t.loading.hide().ErrorHandler(e);
          });
        };

        t.Q(y).count().then(function (e) {
          e > 0 ? (u.attr(u.find(t.el, ".vinfo"), "style", "display:block;"), u.find(t.el, ".vcount").innerHTML = '<span class="vnum">' + e + "</span> " + t.locale.tips.comments, M()) : t.loading.hide();
        })["catch"](function (e) {
          t.ErrorHandler(e);
        });

        var C = function C(e, n, r) {
          var i = u.create("div", {
            "class": "vcard",
            id: e.id
          }),
              o = m.hide ? "" : '<img class="vimg" src="' + (m.cdn + a(e.get("mail")) + m.params) + '">',
              s = e.get("ua") || "",
              l = "";

          if (s) {
            s = d(s);
            l = '<span class="vsys">' + s.browser + " " + s.version + "</span>" + " " + ('<span class="vsys">' + s.os + " " + s.osVersion + "</span>");
          }

          "*" === y && (l = '<a href="' + e.get("url") + '" class="vsys">' + e.get("url") + "</a>");
          var p = "",
              f = e.get("link") || "";
          p = f ? '<a class="vnick" rel="nofollow" href="' + f + '" target="_blank" >' + e.get("nick") + "</a>" : '<span class="vnick">' + e.get("nick") + "</span>", i.innerHTML = o + '\n            <div class="vh" rootid=' + (e.get("rid") || e.id) + '>\n                <div class="vhead">' + p + " " + l + '</div>\n                <div class="vmeta">\n                    <span class="vtime">' + c(e.get("insertedAt") || e.createdAt, t.locale) + '</span>\n                    <span class="vat">' + t.locale.ctrl.reply + '</span>\n                </div>\n                <div class="vcontent">\n                    ' + b(e.get("comment")) + "\n                </div>\n            </div>";

          for (var h = u.find(i, ".vat"), v = u.findAll(i, "a"), g = 0, x = v.length; g < x; g++) {
            var w = v[g];
            w && -1 == (u.attr(w, "class") || "").indexOf("at") && u.attr(w, {
              target: "_blank",
              rel: "nofollow"
            });
          }

          var k = u.findAll(n, ".vcard");
          r ? n.appendChild(i) : n.insertBefore(i, k[0]);

          var _ = u.find(i, ".vcontent");

          _ && T(_), h && j(h, e), z();
        },
            z = function z() {
          setTimeout(function () {
            try {
              "undefined" != typeof MathJax && MathJax.Hub.Queue(["Typeset", MathJax.Hub]), "undefined" != typeof hljs && (u.each(u.findAll("pre code"), function (e, t) {
                hljs.highlightBlock(t);
              }), u.each(u.findAll("code.hljs"), function (e, t) {
                hljs.lineNumbersBlock(t);
              }));
            } catch (e) {}
          }, 200);
        },
            T = function T(e) {
          setTimeout(function () {
            e.offsetHeight > 180 && (e.classList.add("expand"), u.on("click", e, function (t) {
              u.attr(e, "class", "vcontent");
            }));
          });
        },
            R = {},
            j = function j(e, t) {
          u.on("click", e, function (e) {
            var n = "@" + u.escape(t.get("nick"));
            R = {
              at: u.escape(n) + " ",
              rid: t.get("rid") || t.id,
              pid: t.id,
              rmail: t.get("mail")
            }, u.attr(_.comment, "placeholder", n), _.comment.focus();
          });
        };

        !function () {
          var e = x && x.ValineCache;

          if (e) {
            e = JSON.parse(e);
            var n = k;

            for (var r in n) {
              var i = n[r];
              u.find(t.el, ".v" + i).value = u.unescape(e[i]), v[i] = e[i];
            }
          }
        }();

        var B = function B() {
          v.comment = "", _.comment.value = "", w(_.comment), u.attr(_.comment, "placeholder", t.placeholder), R = {}, t.preview.empty().hide();
        },
            P = u.find(t.el, ".vsubmit"),
            U = function U(e) {
          return u.attr(P, "disabled") ? void t.alert.show({
            type: 0,
            text: t.locale.tips.busy + 'ヾ(๑╹◡╹)ﾉ"',
            ctxt: t.locale.ctrl.ok
          }) : "" == v.comment ? void _.comment.focus() : (v.nick = v.nick || "Anonymous", void (t.notify || t.verify ? Q(N) : N()));
        },
            I = function I() {
          var e = new AV.ACL();
          return e.setPublicReadAccess(!0), e.setPublicWriteAccess(!1), e;
        },
            N = function N() {
          u.attr(P, "disabled", !0), t.loading.show(!0);
          var e = AV.Object.extend(t.config.clazzName || "Comment"),
              n = new e(),
              r = "*" === y ? location.pathname.replace(/index\.html?$/, "") : y;

          if (v.url = decodeURI(r), v.insertedAt = new Date(), R.rid) {
            var i = R.pid || R.rid;
            n.set("rid", R.rid), n.set("pid", i), v.comment = v.comment.replace("<p>", '<p><a class="at" href="#' + i + '">' + R.at + "</a> , ");
          }

          for (var o in v) {
            if (v.hasOwnProperty(o)) {
              var a = v[o];
              n.set(o, a);
            }
          }

          n.setACL(I()), n.save().then(function (e) {
            "Anonymous" != v.nick && x && x.setItem("ValineCache", JSON.stringify({
              nick: v.nick,
              link: v.link,
              mail: v.mail
            }));
            var n = u.find(t.el, ".vnum"),
                r = 1;

            try {
              if (R.rid) {
                var i = u.find(t.el, '.vquote[rid="' + R.rid + '"]') || L(R.rid);
                C(e, i, !0);
              } else n ? (r = Number(n.innerText) + 1, n.innerText = r) : u.find(t.el, ".vcount").innerHTML = '<span class="num">1</span> ' + t.locale.tips.comments, C(e, u.find(t.el, ".vlist"));

              v.mail && F({
                username: v.nick,
                mail: v.mail
              }), R.at && R.rmail && t.notify && V({
                username: R.at.replace("@", ""),
                mail: R.rmail
              }), u.removeAttr(P, "disabled"), t.loading.hide(), B();
            } catch (e) {
              t.ErrorHandler(e);
            }
          })["catch"](function (e) {
            t.ErrorHandler(e);
          });
        },
            Q = function e(n) {
          var r = Math.floor(10 * Math.random() + 1),
              i = Math.floor(10 * Math.random() + 1),
              o = Math.floor(10 * Math.random() + 1),
              a = ["+", "-", "x"],
              s = a[Math.floor(3 * Math.random())],
              l = a[Math.floor(3 * Math.random())],
              c = "" + r + s + i + l + o,
              d = c + " = <input class='vcode vinput' >";
          t.alert.show({
            type: 1,
            text: d,
            ctxt: t.locale.ctrl.cancel,
            otxt: t.locale.ctrl.ok,
            cb: function cb() {
              var r = +u.find(t.el, ".vcode").value;
              new Function("return " + c.replace(/x/g, "*"))() === r ? n && n() : t.alert.show({
                type: 1,
                text: "(T＿T)" + t.locale.tips.again,
                ctxt: t.locale.ctrl.cancel,
                otxt: t.locale.ctrl["try"],
                cb: function cb() {
                  e(n);
                }
              });
            }
          });
        },
            F = function F(e) {
          var t = new AV.User();
          return t.setUsername(e.username), t.setPassword(e.mail), t.setEmail(e.mail), t.setACL(I()), t.signUp();
        },
            V = function e(n) {
          AV.User.requestPasswordReset(n.mail).then(function (e) {})["catch"](function (r) {
            1 == r.code ? t.alert.show({
              type: 0,
              text: "ヾ(ｏ･ω･)ﾉ At太频繁啦，提醒功能暂时宕机。<br>" + r.error,
              ctxt: t.locale.ctrl.ok
            }) : F(n).then(function (t) {
              e(n);
            })["catch"](function (e) {});
          });
        };

        u.on("click", P, U), u.on("keydown", document, function (e) {
          e = event || e;
          var t = e.keyCode || e.which || e.charCode;
          ((e.ctrlKey || e.metaKey) && 13 === t && U(), 9 === t) && "veditor" == (document.activeElement.id || "") && (e.preventDefault(), E(f, "    "));
        });
      }, e.exports = i, e.exports["default"] = i;
    }, function (e, t, n) {
      "use strict";

      var r = {
        data: n(11),
        parse: function parse(e) {
          return String(e).replace(/:(.+?):/g, function (e, t) {
            return r.data[t] || e;
          });
        }
      };
      e.exports = r;
    }, function (e, t, n) {
      "use strict";

      function r(e) {
        var t = this,
            n = {
          Trident: e.indexOf("Trident") > -1 || e.indexOf("NET CLR") > -1,
          Presto: e.indexOf("Presto") > -1,
          WebKit: e.indexOf("AppleWebKit") > -1,
          Gecko: e.indexOf("Gecko/") > -1,
          Safari: e.indexOf("Safari") > -1,
          Chrome: e.indexOf("Chrome") > -1 || e.indexOf("CriOS") > -1,
          IE: e.indexOf("MSIE") > -1 || e.indexOf("Trident") > -1,
          Edge: e.indexOf("Edge") > -1,
          Firefox: e.indexOf("Firefox") > -1 || e.indexOf("FxiOS") > -1,
          "Firefox Focus": e.indexOf("Focus") > -1,
          Chromium: e.indexOf("Chromium") > -1,
          Opera: e.indexOf("Opera") > -1 || e.indexOf("OPR") > -1,
          Vivaldi: e.indexOf("Vivaldi") > -1,
          Yandex: e.indexOf("YaBrowser") > -1,
          Kindle: e.indexOf("Kindle") > -1 || e.indexOf("Silk/") > -1,
          360: e.indexOf("360EE") > -1 || e.indexOf("360SE") > -1,
          UC: e.indexOf("UC") > -1 || e.indexOf(" UBrowser") > -1,
          QQBrowser: e.indexOf("QQBrowser") > -1,
          QQ: e.indexOf("QQ/") > -1,
          Baidu: e.indexOf("Baidu") > -1 || e.indexOf("BIDUBrowser") > -1,
          Maxthon: e.indexOf("Maxthon") > -1,
          Sogou: e.indexOf("MetaSr") > -1 || e.indexOf("Sogou") > -1,
          LBBROWSER: e.indexOf("LBBROWSER") > -1,
          "2345Explorer": e.indexOf("2345Explorer") > -1,
          TheWorld: e.indexOf("TheWorld") > -1,
          XiaoMi: e.indexOf("MiuiBrowser") > -1,
          Quark: e.indexOf("Quark") > -1,
          Qiyu: e.indexOf("Qiyu") > -1,
          Wechat: e.indexOf("MicroMessenger") > -1,
          Taobao: e.indexOf("AliApp(TB") > -1,
          Alipay: e.indexOf("AliApp(AP") > -1,
          Weibo: e.indexOf("Weibo") > -1,
          Douban: e.indexOf("com.douban.frodo") > -1,
          Suning: e.indexOf("SNEBUY-APP") > -1,
          iQiYi: e.indexOf("IqiyiApp") > -1,
          Windows: e.indexOf("Windows") > -1,
          Linux: e.indexOf("Linux") > -1 || e.indexOf("X11") > -1,
          "Mac OS": e.indexOf("Macintosh") > -1,
          Android: e.indexOf("Android") > -1 || e.indexOf("Adr") > -1,
          Ubuntu: e.indexOf("Ubuntu") > -1,
          FreeBSD: e.indexOf("FreeBSD") > -1,
          Debian: e.indexOf("Debian") > -1,
          "Windows Phone": e.indexOf("IEMobile") > -1 || e.indexOf("Windows Phone") > -1,
          BlackBerry: e.indexOf("BlackBerry") > -1 || e.indexOf("RIM") > -1,
          MeeGo: e.indexOf("MeeGo") > -1,
          Symbian: e.indexOf("Symbian") > -1,
          iOS: e.indexOf("like Mac OS X") > -1,
          "Chrome OS": e.indexOf("CrOS") > -1,
          WebOS: e.indexOf("hpwOS") > -1,
          Mobile: e.indexOf("Mobi") > -1 || e.indexOf("iPh") > -1 || e.indexOf("480") > -1,
          Tablet: e.indexOf("Tablet") > -1 || e.indexOf("Pad") > -1 || e.indexOf("Nexus 7") > -1
        };
        n.Mobile && (n.Mobile = !(e.indexOf("iPad") > -1));
        var r = {
          engine: ["WebKit", "Trident", "Gecko", "Presto"],
          browser: ["Safari", "Chrome", "Edge", "IE", "Firefox", "Firefox Focus", "Chromium", "Opera", "Vivaldi", "Yandex", "Kindle", "360", "UC", "QQBrowser", "QQ", "Baidu", "Maxthon", "Sogou", "LBBROWSER", "2345Explorer", "TheWorld", "XiaoMi", "Quark", "Qiyu", "Wechat", "Taobao", "Alipay", "Weibo", "Douban", "Suning", "iQiYi"],
          os: ["Windows", "Linux", "Mac OS", "Android", "Ubuntu", "FreeBSD", "Debian", "iOS", "Windows Phone", "BlackBerry", "MeeGo", "Symbian", "Chrome OS", "WebOS"],
          device: ["Mobile", "Tablet"]
        };
        t.device = "PC";

        for (var i in r) {
          for (var o = 0; o < r[i].length; o++) {
            var a = r[i][o];
            n[a] && (t[i] = a);
          }
        }

        var s = {
          Windows: function Windows() {
            var t = e.replace(/^.*Windows NT ([\d.]+);.*$/, "$1");
            return {
              6.4: "10",
              6.3: "8.1",
              6.2: "8",
              6.1: "7",
              "6.0": "Vista",
              5.2: "XP",
              5.1: "XP",
              "5.0": "2000"
            }[t] || t;
          },
          Android: function Android() {
            return e.replace(/^.*Android ([\d.]+);.*$/, "$1");
          },
          iOS: function iOS() {
            return e.replace(/^.*OS ([\d_]+) like.*$/, "$1").replace(/_/g, ".");
          },
          Debian: function Debian() {
            return e.replace(/^.*Debian\/([\d.]+).*$/, "$1");
          },
          "Windows Phone": function WindowsPhone() {
            return e.replace(/^.*Windows Phone( OS)? ([\d.]+);.*$/, "$2");
          },
          "Mac OS": function MacOS() {
            return e.replace(/^.*Mac OS X ([\d_]+).*$/, "$1").replace(/_/g, ".");
          },
          WebOS: function WebOS() {
            return e.replace(/^.*hpwOS\/([\d.]+);.*$/, "$1");
          }
        };
        t.osVersion = "", s[t.os] && (t.osVersion = s[t.os](), t.osVersion == e && (t.osVersion = ""));
        var l = {
          Safari: function Safari() {
            return e.replace(/^.*Version\/([\d.]+).*$/, "$1");
          },
          Chrome: function Chrome() {
            return e.replace(/^.*Chrome\/([\d.]+).*$/, "$1").replace(/^.*CriOS\/([\d.]+).*$/, "$1");
          },
          IE: function IE() {
            return e.replace(/^.*MSIE ([\d.]+).*$/, "$1").replace(/^.*rv:([\d.]+).*$/, "$1");
          },
          Edge: function Edge() {
            return e.replace(/^.*Edge\/([\d.]+).*$/, "$1");
          },
          Firefox: function Firefox() {
            return e.replace(/^.*Firefox\/([\d.]+).*$/, "$1").replace(/^.*FxiOS\/([\d.]+).*$/, "$1");
          },
          "Firefox Focus": function FirefoxFocus() {
            return e.replace(/^.*Focus\/([\d.]+).*$/, "$1");
          },
          Chromium: function Chromium() {
            return e.replace(/^.*Chromium\/([\d.]+).*$/, "$1");
          },
          Opera: function Opera() {
            return e.replace(/^.*Opera\/([\d.]+).*$/, "$1").replace(/^.*OPR\/([\d.]+).*$/, "$1");
          },
          Vivaldi: function Vivaldi() {
            return e.replace(/^.*Vivaldi\/([\d.]+).*$/, "$1");
          },
          Yandex: function Yandex() {
            return e.replace(/^.*YaBrowser\/([\d.]+).*$/, "$1");
          },
          Kindle: function Kindle() {
            return e.replace(/^.*Version\/([\d.]+).*$/, "$1");
          },
          Maxthon: function Maxthon() {
            return e.replace(/^.*Maxthon\/([\d.]+).*$/, "$1");
          },
          QQBrowser: function QQBrowser() {
            return e.replace(/^.*QQBrowser\/([\d.]+).*$/, "$1");
          },
          QQ: function QQ() {
            return e.replace(/^.*QQ\/([\d.]+).*$/, "$1");
          },
          Baidu: function Baidu() {
            return e.replace(/^.*BIDUBrowser[\s\/]([\d.]+).*$/, "$1");
          },
          UC: function UC() {
            return e.replace(/^.*UC?Browser\/([\d.]+).*$/, "$1");
          },
          Sogou: function Sogou() {
            return e.replace(/^.*SE ([\d.X]+).*$/, "$1").replace(/^.*SogouMobileBrowser\/([\d.]+).*$/, "$1");
          },
          "2345Explorer": function Explorer() {
            return e.replace(/^.*2345Explorer\/([\d.]+).*$/, "$1");
          },
          TheWorld: function TheWorld() {
            return e.replace(/^.*TheWorld ([\d.]+).*$/, "$1");
          },
          XiaoMi: function XiaoMi() {
            return e.replace(/^.*MiuiBrowser\/([\d.]+).*$/, "$1");
          },
          Quark: function Quark() {
            return e.replace(/^.*Quark\/([\d.]+).*$/, "$1");
          },
          Qiyu: function Qiyu() {
            return e.replace(/^.*Qiyu\/([\d.]+).*$/, "$1");
          },
          Wechat: function Wechat() {
            return e.replace(/^.*MicroMessenger\/([\d.]+).*$/, "$1");
          },
          Taobao: function Taobao() {
            return e.replace(/^.*AliApp\(TB\/([\d.]+).*$/, "$1");
          },
          Alipay: function Alipay() {
            return e.replace(/^.*AliApp\(AP\/([\d.]+).*$/, "$1");
          },
          Weibo: function Weibo() {
            return e.replace(/^.*weibo__([\d.]+).*$/, "$1");
          },
          Douban: function Douban() {
            return e.replace(/^.*com.douban.frodo\/([\d.]+).*$/, "$1");
          },
          Suning: function Suning() {
            return e.replace(/^.*SNEBUY-APP([\d.]+).*$/, "$1");
          },
          iQiYi: function iQiYi() {
            return e.replace(/^.*IqiyiVersion\/([\d.]+).*$/, "$1");
          }
        };
        t.version = "", l[t.browser] && (t.version = l[t.browser](), t.version == e && (t.version = "")), "Edge" == t.browser ? t.engine = "EdgeHTML" : "Chrome" == t.browser && parseInt(t.version) > 27 ? t.engine = "Blink" : "Opera" == t.browser && parseInt(t.version) > 12 ? t.engine = "Blink" : "Yandex" == t.browser ? t.engine = "Blink" : void 0 == t.browser && (t.browser = "Unknow App");
      }

      function i(e) {
        return new r(e);
      }

      e.exports = i;
    }, function (e, t, n) {
      "use strict";

      var r = window,
          i = document,
          o = {},
          a = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "`": "&#x60;",
        "\\": "&#x5c;"
      };

      for (var s in a) {
        o[a[s]] = s;
      }

      var l = /[&<>"'`\\]/g,
          c = RegExp(l.source),
          d = /&(?:amp|lt|gt|quot|#39|#x60|#x5c);/g,
          u = RegExp(d.source),
          p = {
        domReady: function domReady(e) {
          if ("complete" === i.readyState || "loading" !== i.readyState && !i.documentElement.doScroll) setTimeout(function () {
            return e && e();
          }, 0);else {
            var t = function t() {
              i.removeEventListener("DOMContentLoaded", t, !1), r.removeEventListener("load", t, !1), e && e();
            };

            i.addEventListener("DOMContentLoaded", t, !1), r.addEventListener("load", t, !1);
          }
        },
        dynamicLoadSource: function dynamicLoadSource(e, t, n) {
          var r = {
            script: "src",
            link: "href"
          },
              o = r[e];
          if (p.find(i, e + "[" + o + '="' + t[o] + '"]')) "function" == typeof n && n();else {
            var a = p.create(e, t);
            i.getElementsByTagName("head")[0].appendChild(a), a.onload = a.onreadystatechange = function () {
              var e = this;
              e.onload = e.onreadystatechange = null, "function" == typeof n && n();
            };
          }
        },
        on: function on(e, t, n, r) {
          e = e.split(" ");

          for (var i = 0, o = e.length; i < o; i++) {
            p.off(e[i], t, n, r), t.addEventListener ? t.addEventListener(e[i], n, r || !1) : t.attachEvent ? t.attachEvent("on" + e[i], n) : t["on" + e[i]] = n;
          }
        },
        off: function off(e, t, n, r) {
          e = e.split(" ");

          for (var i = 0, o = e.length; i < o; i++) {
            t.removeEventListener ? t.removeEventListener(e, n, r || !1) : t.detachEvent ? t.detachEvent("on" + e, n) : t["on" + e] = null;
          }
        },
        escape: function escape(e) {
          return e && c.test(e) ? e.replace(l, function (e) {
            return a[e];
          }) : e;
        },
        unescape: function unescape(e) {
          return e && u.test(e) ? e.replace(d, function (e) {
            return o[e];
          }) : e;
        },
        create: function create(e, t, n) {
          var r = document.createElement(e);
          return p.attr(r, t, n), r;
        },
        find: function find(e, t) {
          return e.querySelector(t);
        },
        findAll: function findAll(e, t) {
          return e.querySelectorAll(t);
        },
        attr: function attr(e, t, n) {
          if (void 0 === e.getAttribute) return p.prop(e, t, n);
          if (void 0 !== n) null === n ? p.removeAttr(e, t) : e.setAttribute(t, n);else {
            if ("[object Object]" !== {}.toString.call(t)) return e.getAttribute(t);
            p.each(t, function (t, n) {
              e.setAttribute(t, n);
            });
          }
        },
        prop: function prop(e, t, n) {
          return void 0 !== n ? e[t] = n : "[object Object]" !== {}.toString.call(t) ? e[t] : void p.each(t, function (t, n) {
            e[t] = n;
          });
        },
        removeAttr: function removeAttr(e, t) {
          var n = void 0,
              r = 0,
              i = t && t.match(/[^\x20\t\r\n\f\*\/\\]+/g);
          if (i && 1 === e.nodeType) for (; n = i[r++];) {
            e.removeAttribute(n);
          }
          return e;
        },
        clearAttr: function clearAttr(e) {
          var t = e.attributes,
              n = ["align", "alt", "checked", "class", "disabled", "href", "id", "target", "title", "type", "src", "style"];
          return p.each(t, function (t, r) {
            var i = r.name;

            switch (i.toLowerCase()) {
              case "style":
                var o = r.value;
                p.each(o.split(";"), function (t, n) {
                  n.indexOf("color") > -1 ? p.attr(e, "style", n) : p.removeAttr(e, "style");
                });
                break;

              case "class":
                if ("CODE" == e.nodeName) return !1;
                var a = r.value;
                a.indexOf("at") > -1 ? p.attr(e, "class", "at") : a.indexOf("vemoji") > -1 ? p.attr(e, "class", "vemoji") : p.removeAttr(e, "class");
                break;

              default:
                if (n.indexOf(i) > -1) return !0;
                p.removeAttr(e, i);
            }
          }), e;
        },
        remove: function remove(e) {
          try {
            e.parentNode && e.parentNode.removeChild(e);
          } catch (e) {}
        },
        each: function each(e, t) {
          var n = 0,
              r = e.length,
              i = ["[object Array]", "[object NodeList]"],
              o = {}.toString.call(e);
          if (i.indexOf(o) > -1) for (; n < r && (!t || !1 !== t.call(e[n], n, e[n])); n++) {
            ;
          } else for (n in e) {
            if (e.hasOwnProperty(n) && t && !1 === t.call(e[n], n, e[n])) break;
          }
          return e;
        }
      };
      e.exports = p;
    }, function (e, t, n) {
      "use strict";

      var r = function r(e, t) {
        if (e) try {
          var n = e.getTime(),
              r = new Date().getTime(),
              o = r - n,
              a = Math.floor(o / 864e5);

          if (0 === a) {
            var s = o % 864e5,
                l = Math.floor(s / 36e5);

            if (0 === l) {
              var c = s % 36e5,
                  d = Math.floor(c / 6e4);

              if (0 === d) {
                var u = c % 6e4;
                return Math.round(u / 1e3) + " " + t.timeago.seconds;
              }

              return d + " " + t.timeago.minutes;
            }

            return l + " " + t.timeago.hours;
          }

          return a < 0 ? t.timeago.now : a < 8 ? a + " " + t.timeago.days : i(e);
        } catch (e) {}
      },
          i = function i(e) {
        var t = o(e.getDate(), 2),
            n = o(e.getMonth() + 1, 2);
        return o(e.getFullYear(), 2) + "-" + n + "-" + t;
      },
          o = function o(e, t) {
        for (var n = e.toString(); n.length < t;) {
          n = "0" + n;
        }

        return n;
      };

      e.exports = r;
    }, function (e, t, n) {
      var r;
      !function (i) {
        "use strict";

        function o(e, t) {
          var n = (65535 & e) + (65535 & t);
          return (e >> 16) + (t >> 16) + (n >> 16) << 16 | 65535 & n;
        }

        function a(e, t) {
          return e << t | e >>> 32 - t;
        }

        function s(e, t, n, r, i, s) {
          return o(a(o(o(t, e), o(r, s)), i), n);
        }

        function l(e, t, n, r, i, o, a) {
          return s(t & n | ~t & r, e, t, i, o, a);
        }

        function c(e, t, n, r, i, o, a) {
          return s(t & r | n & ~r, e, t, i, o, a);
        }

        function d(e, t, n, r, i, o, a) {
          return s(t ^ n ^ r, e, t, i, o, a);
        }

        function u(e, t, n, r, i, o, a) {
          return s(n ^ (t | ~r), e, t, i, o, a);
        }

        function p(e, t) {
          e[t >> 5] |= 128 << t % 32, e[14 + (t + 64 >>> 9 << 4)] = t;
          var n,
              r,
              i,
              a,
              s,
              p = 1732584193,
              f = -271733879,
              h = -1732584194,
              v = 271733878;

          for (n = 0; n < e.length; n += 16) {
            r = p, i = f, a = h, s = v, p = l(p, f, h, v, e[n], 7, -680876936), v = l(v, p, f, h, e[n + 1], 12, -389564586), h = l(h, v, p, f, e[n + 2], 17, 606105819), f = l(f, h, v, p, e[n + 3], 22, -1044525330), p = l(p, f, h, v, e[n + 4], 7, -176418897), v = l(v, p, f, h, e[n + 5], 12, 1200080426), h = l(h, v, p, f, e[n + 6], 17, -1473231341), f = l(f, h, v, p, e[n + 7], 22, -45705983), p = l(p, f, h, v, e[n + 8], 7, 1770035416), v = l(v, p, f, h, e[n + 9], 12, -1958414417), h = l(h, v, p, f, e[n + 10], 17, -42063), f = l(f, h, v, p, e[n + 11], 22, -1990404162), p = l(p, f, h, v, e[n + 12], 7, 1804603682), v = l(v, p, f, h, e[n + 13], 12, -40341101), h = l(h, v, p, f, e[n + 14], 17, -1502002290), f = l(f, h, v, p, e[n + 15], 22, 1236535329), p = c(p, f, h, v, e[n + 1], 5, -165796510), v = c(v, p, f, h, e[n + 6], 9, -1069501632), h = c(h, v, p, f, e[n + 11], 14, 643717713), f = c(f, h, v, p, e[n], 20, -373897302), p = c(p, f, h, v, e[n + 5], 5, -701558691), v = c(v, p, f, h, e[n + 10], 9, 38016083), h = c(h, v, p, f, e[n + 15], 14, -660478335), f = c(f, h, v, p, e[n + 4], 20, -405537848), p = c(p, f, h, v, e[n + 9], 5, 568446438), v = c(v, p, f, h, e[n + 14], 9, -1019803690), h = c(h, v, p, f, e[n + 3], 14, -187363961), f = c(f, h, v, p, e[n + 8], 20, 1163531501), p = c(p, f, h, v, e[n + 13], 5, -1444681467), v = c(v, p, f, h, e[n + 2], 9, -51403784), h = c(h, v, p, f, e[n + 7], 14, 1735328473), f = c(f, h, v, p, e[n + 12], 20, -1926607734), p = d(p, f, h, v, e[n + 5], 4, -378558), v = d(v, p, f, h, e[n + 8], 11, -2022574463), h = d(h, v, p, f, e[n + 11], 16, 1839030562), f = d(f, h, v, p, e[n + 14], 23, -35309556), p = d(p, f, h, v, e[n + 1], 4, -1530992060), v = d(v, p, f, h, e[n + 4], 11, 1272893353), h = d(h, v, p, f, e[n + 7], 16, -155497632), f = d(f, h, v, p, e[n + 10], 23, -1094730640), p = d(p, f, h, v, e[n + 13], 4, 681279174), v = d(v, p, f, h, e[n], 11, -358537222), h = d(h, v, p, f, e[n + 3], 16, -722521979), f = d(f, h, v, p, e[n + 6], 23, 76029189), p = d(p, f, h, v, e[n + 9], 4, -640364487), v = d(v, p, f, h, e[n + 12], 11, -421815835), h = d(h, v, p, f, e[n + 15], 16, 530742520), f = d(f, h, v, p, e[n + 2], 23, -995338651), p = u(p, f, h, v, e[n], 6, -198630844), v = u(v, p, f, h, e[n + 7], 10, 1126891415), h = u(h, v, p, f, e[n + 14], 15, -1416354905), f = u(f, h, v, p, e[n + 5], 21, -57434055), p = u(p, f, h, v, e[n + 12], 6, 1700485571), v = u(v, p, f, h, e[n + 3], 10, -1894986606), h = u(h, v, p, f, e[n + 10], 15, -1051523), f = u(f, h, v, p, e[n + 1], 21, -2054922799), p = u(p, f, h, v, e[n + 8], 6, 1873313359), v = u(v, p, f, h, e[n + 15], 10, -30611744), h = u(h, v, p, f, e[n + 6], 15, -1560198380), f = u(f, h, v, p, e[n + 13], 21, 1309151649), p = u(p, f, h, v, e[n + 4], 6, -145523070), v = u(v, p, f, h, e[n + 11], 10, -1120210379), h = u(h, v, p, f, e[n + 2], 15, 718787259), f = u(f, h, v, p, e[n + 9], 21, -343485551), p = o(p, r), f = o(f, i), h = o(h, a), v = o(v, s);
          }

          return [p, f, h, v];
        }

        function f(e) {
          var t,
              n = "",
              r = 32 * e.length;

          for (t = 0; t < r; t += 8) {
            n += String.fromCharCode(e[t >> 5] >>> t % 32 & 255);
          }

          return n;
        }

        function h(e) {
          var t,
              n = [];

          for (n[(e.length >> 2) - 1] = void 0, t = 0; t < n.length; t += 1) {
            n[t] = 0;
          }

          var r = 8 * e.length;

          for (t = 0; t < r; t += 8) {
            n[t >> 5] |= (255 & e.charCodeAt(t / 8)) << t % 32;
          }

          return n;
        }

        function v(e) {
          return f(p(h(e), 8 * e.length));
        }

        function g(e, t) {
          var n,
              r,
              i = h(e),
              o = [],
              a = [];

          for (o[15] = a[15] = void 0, i.length > 16 && (i = p(i, 8 * e.length)), n = 0; n < 16; n += 1) {
            o[n] = 909522486 ^ i[n], a[n] = 1549556828 ^ i[n];
          }

          return r = p(o.concat(h(t)), 512 + 8 * t.length), f(p(a.concat(r), 640));
        }

        function m(e) {
          var t,
              n,
              r = "0123456789abcdef",
              i = "";

          for (n = 0; n < e.length; n += 1) {
            t = e.charCodeAt(n), i += r.charAt(t >>> 4 & 15) + r.charAt(15 & t);
          }

          return i;
        }

        function b(e) {
          return unescape(encodeURIComponent(e));
        }

        function x(e) {
          return v(b(e));
        }

        function y(e) {
          return m(x(e));
        }

        function w(e, t) {
          return g(b(e), b(t));
        }

        function k(e, t) {
          return m(w(e, t));
        }

        function _(e, t, n) {
          return t ? n ? w(t, e) : k(t, e) : n ? x(e) : y(e);
        }

        void 0 !== (r = function () {
          return _;
        }.call(t, n, t, e)) && (e.exports = r);
      }();
    }, function (e, t, n) {
      !function (t, n) {
        e.exports = n();
      }(0, function () {
        "use strict";

        function e(e) {
          return '<span style="color: slategray">' + e + "</span>";
        }

        var t = function (e, t) {
          return t = {
            exports: {}
          }, e(t, t.exports), t.exports;
        }(function (e) {
          var t = e.exports = function () {
            return new RegExp("(?:" + t.line().source + ")|(?:" + t.block().source + ")", "gm");
          };

          t.line = function () {
            return /(?:^|\s)\/\/(.+?)$/gm;
          }, t.block = function () {
            return /\/\*([\S\s]*?)\*\//gm;
          };
        }),
            n = ["23AC69", "91C132", "F19726", "E8552D", "1AAB8E", "E1147F", "2980C1", "1BA1E6", "9FA0A0", "F19726", "E30B20", "E30B20", "A3338B"];

        return function (r, i) {
          void 0 === i && (i = {});
          var o = i.colors;
          void 0 === o && (o = n);
          var a = 0,
              s = {},
              l = /[\u4E00-\u9FFF\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af\u0400-\u04FF]+|\w+/,
              c = /</,
              d = new RegExp("(" + l.source + "|" + c.source + ")|(" + t().source + ")", "gmi");
          return r.replace(d, function (t, n, r) {
            if (r) return e(r);
            if ("<" === n) return "&lt;";
            var i;
            s[n] ? i = s[n] : (i = o[a], s[n] = i);
            var l = '<span style="color: #' + i + '">' + n + "</span>";
            return a = ++a % o.length, l;
          });
        };
      });
    }, function (e, t, n) {
      (function (t) {
        !function (t) {
          "use strict";

          function n(e) {
            this.tokens = [], this.tokens.links = {}, this.options = e || h.defaults, this.rules = v.normal, this.options.pedantic ? this.rules = v.pedantic : this.options.gfm && (this.options.tables ? this.rules = v.tables : this.rules = v.gfm);
          }

          function r(e, t) {
            if (this.options = t || h.defaults, this.links = e, this.rules = g.normal, this.renderer = this.options.renderer || new i(), this.renderer.options = this.options, !this.links) throw new Error("Tokens array requires a `links` property.");
            this.options.pedantic ? this.rules = g.pedantic : this.options.gfm && (this.options.breaks ? this.rules = g.breaks : this.rules = g.gfm);
          }

          function i(e) {
            this.options = e || h.defaults;
          }

          function o() {}

          function a(e) {
            this.tokens = [], this.token = null, this.options = e || h.defaults, this.options.renderer = this.options.renderer || new i(), this.renderer = this.options.renderer, this.renderer.options = this.options;
          }

          function s(e, t) {
            return e.replace(t ? /&/g : /&(?!#?\w+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
          }

          function l(e) {
            return e.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi, function (e, t) {
              return t = t.toLowerCase(), "colon" === t ? ":" : "#" === t.charAt(0) ? "x" === t.charAt(1) ? String.fromCharCode(parseInt(t.substring(2), 16)) : String.fromCharCode(+t.substring(1)) : "";
            });
          }

          function c(e, t) {
            return e = e.source || e, t = t || "", {
              replace: function replace(t, n) {
                return n = n.source || n, n = n.replace(/(^|[^\[])\^/g, "$1"), e = e.replace(t, n), this;
              },
              getRegex: function getRegex() {
                return new RegExp(e, t);
              }
            };
          }

          function d(e, t) {
            return m[" " + e] || (/^[^:]+:\/*[^\/]*$/.test(e) ? m[" " + e] = e + "/" : m[" " + e] = e.replace(/[^\/]*$/, "")), e = m[" " + e], "//" === t.slice(0, 2) ? e.replace(/:[\s\S]*/, ":") + t : "/" === t.charAt(0) ? e.replace(/(:\/*[^\/]*)[\s\S]*/, "$1") + t : e + t;
          }

          function u() {}

          function p(e) {
            for (var t, n, r = 1; r < arguments.length; r++) {
              t = arguments[r];

              for (n in t) {
                Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
              }
            }

            return e;
          }

          function f(e, t) {
            var n = e.replace(/([^\\])\|/g, "$1 |").split(/ +\| */),
                r = 0;
            if (n.length > t) n.splice(t);else for (; n.length < t;) {
              n.push("");
            }

            for (; r < n.length; r++) {
              n[r] = n[r].replace(/\\\|/g, "|");
            }

            return n;
          }

          function h(e, t, r) {
            if (void 0 === e || null === e) throw new Error("marked(): input parameter is undefined or null");
            if ("string" != typeof e) throw new Error("marked(): input parameter is of type " + Object.prototype.toString.call(e) + ", string expected");

            if (r || "function" == typeof t) {
              r || (r = t, t = null), t = p({}, h.defaults, t || {});
              var i,
                  o,
                  l = t.highlight,
                  c = 0;

              try {
                i = n.lex(e, t);
              } catch (e) {
                return r(e);
              }

              o = i.length;

              var d = function d(e) {
                if (e) return t.highlight = l, r(e);
                var n;

                try {
                  n = a.parse(i, t);
                } catch (t) {
                  e = t;
                }

                return t.highlight = l, e ? r(e) : r(null, n);
              };

              if (!l || l.length < 3) return d();
              if (delete t.highlight, !o) return d();

              for (; c < i.length; c++) {
                !function (e) {
                  "code" !== e.type ? --o || d() : l(e.text, e.lang, function (t, n) {
                    return t ? d(t) : null == n || n === e.text ? --o || d() : (e.text = n, e.escaped = !0, void (--o || d()));
                  });
                }(i[c]);
              }
            } else try {
              return t && (t = p({}, h.defaults, t)), a.parse(n.lex(e, t), t);
            } catch (e) {
              if (e.message += "\nPlease report this to https://github.com/markedjs/marked.", (t || h.defaults).silent) return "<p>An error occurred:</p><pre>" + s(e.message + "", !0) + "</pre>";
              throw e;
            }
          }

          var v = {
            newline: /^\n+/,
            code: /^( {4}[^\n]+\n*)+/,
            fences: u,
            hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
            heading: /^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,
            nptable: u,
            blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
            list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
            html: "^ {0,3}(?:<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?\\?>\\n*|<![A-Z][\\s\\S]*?>\\n*|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=\\h*\\n)[\\s\\S]*?(?:\\n{2,}|$)|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=\\h*\\n)[\\s\\S]*?(?:\\n{2,}|$))",
            def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
            table: u,
            lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
            paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading| {0,3}>|<\/?(?:tag)(?: +|\n|\/?>)|<(?:script|pre|style|!--))[^\n]+)*)/,
            text: /^[^\n]+/
          };
          v._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/, v._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/, v.def = c(v.def).replace("label", v._label).replace("title", v._title).getRegex(), v.bullet = /(?:[*+-]|\d+\.)/, v.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/, v.item = c(v.item, "gm").replace(/bull/g, v.bullet).getRegex(), v.list = c(v.list).replace(/bull/g, v.bullet).replace("hr", "\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))").replace("def", "\\n+(?=" + v.def.source + ")").getRegex(), v._tag = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", v._comment = /<!--(?!-?>)[\s\S]*?-->/, v.html = c(v.html, "i").replace("comment", v._comment).replace("tag", v._tag).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), v.paragraph = c(v.paragraph).replace("hr", v.hr).replace("heading", v.heading).replace("lheading", v.lheading).replace("tag", v._tag).getRegex(), v.blockquote = c(v.blockquote).replace("paragraph", v.paragraph).getRegex(), v.normal = p({}, v), v.gfm = p({}, v.normal, {
            fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\n? *\1 *(?:\n+|$)/,
            paragraph: /^/,
            heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
          }), v.gfm.paragraph = c(v.paragraph).replace("(?!", "(?!" + v.gfm.fences.source.replace("\\1", "\\2") + "|" + v.list.source.replace("\\1", "\\3") + "|").getRegex(), v.tables = p({}, v.gfm, {
            nptable: /^ *([^|\n ].*\|.*)\n *([-:]+ *\|[-| :]*)(?:\n((?:.*[^>\n ].*(?:\n|$))*)\n*|$)/,
            table: /^ *\|(.+)\n *\|?( *[-:]+[-| :]*)(?:\n((?: *[^>\n ].*(?:\n|$))*)\n*|$)/
          }), v.pedantic = p({}, v.normal, {
            html: c("^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:\"[^\"]*\"|'[^']*'|\\s[^'\"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))").replace("comment", v._comment).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
            def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/
          }), n.rules = v, n.lex = function (e, t) {
            return new n(t).lex(e);
          }, n.prototype.lex = function (e) {
            return e = e.replace(/\r\n|\r/g, "\n").replace(/\t/g, "    ").replace(/\u00a0/g, " ").replace(/\u2424/g, "\n"), this.token(e, !0);
          }, n.prototype.token = function (e, t) {
            e = e.replace(/^ +$/gm, "");

            for (var n, r, i, o, a, s, l, c, d, u, p, h, g; e;) {
              if ((i = this.rules.newline.exec(e)) && (e = e.substring(i[0].length), i[0].length > 1 && this.tokens.push({
                type: "space"
              })), i = this.rules.code.exec(e)) e = e.substring(i[0].length), i = i[0].replace(/^ {4}/gm, ""), this.tokens.push({
                type: "code",
                text: this.options.pedantic ? i : i.replace(/\n+$/, "")
              });else if (i = this.rules.fences.exec(e)) e = e.substring(i[0].length), this.tokens.push({
                type: "code",
                lang: i[2],
                text: i[3] || ""
              });else if (i = this.rules.heading.exec(e)) e = e.substring(i[0].length), this.tokens.push({
                type: "heading",
                depth: i[1].length,
                text: i[2]
              });else if (t && (i = this.rules.nptable.exec(e)) && (s = {
                type: "table",
                header: f(i[1].replace(/^ *| *\| *$/g, "")),
                align: i[2].replace(/^ *|\| *$/g, "").split(/ *\| */),
                cells: i[3] ? i[3].replace(/\n$/, "").split("\n") : []
              }, s.header.length === s.align.length)) {
                for (e = e.substring(i[0].length), c = 0; c < s.align.length; c++) {
                  /^ *-+: *$/.test(s.align[c]) ? s.align[c] = "right" : /^ *:-+: *$/.test(s.align[c]) ? s.align[c] = "center" : /^ *:-+ *$/.test(s.align[c]) ? s.align[c] = "left" : s.align[c] = null;
                }

                for (c = 0; c < s.cells.length; c++) {
                  s.cells[c] = f(s.cells[c], s.header.length);
                }

                this.tokens.push(s);
              } else if (i = this.rules.hr.exec(e)) e = e.substring(i[0].length), this.tokens.push({
                type: "hr"
              });else if (i = this.rules.blockquote.exec(e)) e = e.substring(i[0].length), this.tokens.push({
                type: "blockquote_start"
              }), i = i[0].replace(/^ *> ?/gm, ""), this.token(i, t), this.tokens.push({
                type: "blockquote_end"
              });else if (i = this.rules.list.exec(e)) {
                for (e = e.substring(i[0].length), o = i[2], p = o.length > 1, this.tokens.push({
                  type: "list_start",
                  ordered: p,
                  start: p ? +o : ""
                }), i = i[0].match(this.rules.item), n = !1, u = i.length, c = 0; c < u; c++) {
                  s = i[c], l = s.length, s = s.replace(/^ *([*+-]|\d+\.) +/, ""), ~s.indexOf("\n ") && (l -= s.length, s = this.options.pedantic ? s.replace(/^ {1,4}/gm, "") : s.replace(new RegExp("^ {1," + l + "}", "gm"), "")), this.options.smartLists && c !== u - 1 && (a = v.bullet.exec(i[c + 1])[0], o === a || o.length > 1 && a.length > 1 || (e = i.slice(c + 1).join("\n") + e, c = u - 1)), r = n || /\n\n(?!\s*$)/.test(s), c !== u - 1 && (n = "\n" === s.charAt(s.length - 1), r || (r = n)), h = /^\[[ xX]\] /.test(s), g = void 0, h && (g = " " !== s[1], s = s.replace(/^\[[ xX]\] +/, "")), this.tokens.push({
                    type: r ? "loose_item_start" : "list_item_start",
                    task: h,
                    checked: g
                  }), this.token(s, !1), this.tokens.push({
                    type: "list_item_end"
                  });
                }

                this.tokens.push({
                  type: "list_end"
                });
              } else if (i = this.rules.html.exec(e)) e = e.substring(i[0].length), this.tokens.push({
                type: this.options.sanitize ? "paragraph" : "html",
                pre: !this.options.sanitizer && ("pre" === i[1] || "script" === i[1] || "style" === i[1]),
                text: i[0]
              });else if (t && (i = this.rules.def.exec(e))) e = e.substring(i[0].length), i[3] && (i[3] = i[3].substring(1, i[3].length - 1)), d = i[1].toLowerCase().replace(/\s+/g, " "), this.tokens.links[d] || (this.tokens.links[d] = {
                href: i[2],
                title: i[3]
              });else if (t && (i = this.rules.table.exec(e)) && (s = {
                type: "table",
                header: f(i[1].replace(/^ *| *\| *$/g, "")),
                align: i[2].replace(/^ *|\| *$/g, "").split(/ *\| */),
                cells: i[3] ? i[3].replace(/(?: *\| *)?\n$/, "").split("\n") : []
              }, s.header.length === s.align.length)) {
                for (e = e.substring(i[0].length), c = 0; c < s.align.length; c++) {
                  /^ *-+: *$/.test(s.align[c]) ? s.align[c] = "right" : /^ *:-+: *$/.test(s.align[c]) ? s.align[c] = "center" : /^ *:-+ *$/.test(s.align[c]) ? s.align[c] = "left" : s.align[c] = null;
                }

                for (c = 0; c < s.cells.length; c++) {
                  s.cells[c] = f(s.cells[c].replace(/^ *\| *| *\| *$/g, ""), s.header.length);
                }

                this.tokens.push(s);
              } else if (i = this.rules.lheading.exec(e)) e = e.substring(i[0].length), this.tokens.push({
                type: "heading",
                depth: "=" === i[2] ? 1 : 2,
                text: i[1]
              });else if (t && (i = this.rules.paragraph.exec(e))) e = e.substring(i[0].length), this.tokens.push({
                type: "paragraph",
                text: "\n" === i[1].charAt(i[1].length - 1) ? i[1].slice(0, -1) : i[1]
              });else if (i = this.rules.text.exec(e)) e = e.substring(i[0].length), this.tokens.push({
                type: "text",
                text: i[0]
              });else if (e) throw new Error("Infinite loop on byte: " + e.charCodeAt(0));
            }

            return this.tokens;
          };
          var g = {
            escape: /^\\([!"#$%&'()*+,\-.\/:;<=>?@\[\]\\^_`{|}~])/,
            autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
            url: u,
            tag: "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",
            link: /^!?\[(label)\]\(href(?:\s+(title))?\s*\)/,
            reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
            nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
            strong: /^__([^\s][\s\S]*?[^\s])__(?!_)|^\*\*([^\s][\s\S]*?[^\s])\*\*(?!\*)|^__([^\s])__(?!_)|^\*\*([^\s])\*\*(?!\*)/,
            em: /^_([^\s][\s\S]*?[^\s_])_(?!_)|^_([^\s_][\s\S]*?[^\s])_(?!_)|^\*([^\s][\s\S]*?[^\s*])\*(?!\*)|^\*([^\s*][\s\S]*?[^\s])\*(?!\*)|^_([^\s_])_(?!_)|^\*([^\s*])\*(?!\*)/,
            code: /^(`+)\s*([\s\S]*?[^`]?)\s*\1(?!`)/,
            br: /^ {2,}\n(?!\s*$)/,
            del: u,
            text: /^[\s\S]+?(?=[\\<!\[`*]|\b_| {2,}\n|$)/
          };
          g._escapes = /\\([!"#$%&'()*+,\-.\/:;<=>?@\[\]\\^_`{|}~])/g, g._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/, g._email = /[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/, g.autolink = c(g.autolink).replace("scheme", g._scheme).replace("email", g._email).getRegex(), g._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/, g.tag = c(g.tag).replace("comment", v._comment).replace("attribute", g._attribute).getRegex(), g._label = /(?:\[[^\[\]]*\]|\\[\[\]]?|`[^`]*`|[^\[\]\\])*?/, g._href = /\s*(<(?:\\[<>]?|[^\s<>\\])*>|(?:\\[()]?|\([^\s\x00-\x1f()\\]*\)|[^\s\x00-\x1f()\\])*?)/, g._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/, g.link = c(g.link).replace("label", g._label).replace("href", g._href).replace("title", g._title).getRegex(), g.reflink = c(g.reflink).replace("label", g._label).getRegex(), g.normal = p({}, g), g.pedantic = p({}, g.normal, {
            strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
            em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/,
            link: c(/^!?\[(label)\]\((.*?)\)/).replace("label", g._label).getRegex(),
            reflink: c(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", g._label).getRegex()
          }), g.gfm = p({}, g.normal, {
            escape: c(g.escape).replace("])", "~|])").getRegex(),
            url: c(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("email", g._email).getRegex(),
            _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
            del: /^~~(?=\S)([\s\S]*?\S)~~/,
            text: c(g.text).replace("]|", "~]|").replace("|", "|https?://|ftp://|www\\.|[a-zA-Z0-9.!#$%&'*+/=?^_`{\\|}~-]+@|").getRegex()
          }), g.breaks = p({}, g.gfm, {
            br: c(g.br).replace("{2,}", "*").getRegex(),
            text: c(g.gfm.text).replace("{2,}", "*").getRegex()
          }), r.rules = g, r.output = function (e, t, n) {
            return new r(t, n).output(e);
          }, r.prototype.output = function (e) {
            for (var t, n, i, o, a, l = ""; e;) {
              if (a = this.rules.escape.exec(e)) e = e.substring(a[0].length), l += a[1];else if (a = this.rules.autolink.exec(e)) e = e.substring(a[0].length), "@" === a[2] ? (n = s(this.mangle(a[1])), i = "mailto:" + n) : (n = s(a[1]), i = n), l += this.renderer.link(i, null, n);else if (this.inLink || !(a = this.rules.url.exec(e))) {
                if (a = this.rules.tag.exec(e)) !this.inLink && /^<a /i.test(a[0]) ? this.inLink = !0 : this.inLink && /^<\/a>/i.test(a[0]) && (this.inLink = !1), e = e.substring(a[0].length), l += this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(a[0]) : s(a[0]) : a[0];else if (a = this.rules.link.exec(e)) e = e.substring(a[0].length), this.inLink = !0, i = a[2], this.options.pedantic ? (t = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(i), t ? (i = t[1], o = t[3]) : o = "") : o = a[3] ? a[3].slice(1, -1) : "", i = i.trim().replace(/^<([\s\S]*)>$/, "$1"), l += this.outputLink(a, {
                  href: r.escapes(i),
                  title: r.escapes(o)
                }), this.inLink = !1;else if ((a = this.rules.reflink.exec(e)) || (a = this.rules.nolink.exec(e))) {
                  if (e = e.substring(a[0].length), t = (a[2] || a[1]).replace(/\s+/g, " "), !(t = this.links[t.toLowerCase()]) || !t.href) {
                    l += a[0].charAt(0), e = a[0].substring(1) + e;
                    continue;
                  }

                  this.inLink = !0, l += this.outputLink(a, t), this.inLink = !1;
                } else if (a = this.rules.strong.exec(e)) e = e.substring(a[0].length), l += this.renderer.strong(this.output(a[4] || a[3] || a[2] || a[1]));else if (a = this.rules.em.exec(e)) e = e.substring(a[0].length), l += this.renderer.em(this.output(a[6] || a[5] || a[4] || a[3] || a[2] || a[1]));else if (a = this.rules.code.exec(e)) e = e.substring(a[0].length), l += this.renderer.codespan(s(a[2].trim(), !0));else if (a = this.rules.br.exec(e)) e = e.substring(a[0].length), l += this.renderer.br();else if (a = this.rules.del.exec(e)) e = e.substring(a[0].length), l += this.renderer.del(this.output(a[1]));else if (a = this.rules.text.exec(e)) e = e.substring(a[0].length), l += this.renderer.text(s(this.smartypants(a[0])));else if (e) throw new Error("Infinite loop on byte: " + e.charCodeAt(0));
              } else a[0] = this.rules._backpedal.exec(a[0])[0], e = e.substring(a[0].length), "@" === a[2] ? (n = s(a[0]), i = "mailto:" + n) : (n = s(a[0]), i = "www." === a[1] ? "http://" + n : n), l += this.renderer.link(i, null, n);
            }

            return l;
          }, r.escapes = function (e) {
            return e ? e.replace(r.rules._escapes, "$1") : e;
          }, r.prototype.outputLink = function (e, t) {
            var n = t.href,
                r = t.title ? s(t.title) : null;
            return "!" !== e[0].charAt(0) ? this.renderer.link(n, r, this.output(e[1])) : this.renderer.image(n, r, s(e[1]));
          }, r.prototype.smartypants = function (e) {
            return this.options.smartypants ? e.replace(/---/g, "—").replace(/--/g, "–").replace(/(^|[-\u2014\/(\[{"\s])'/g, "$1‘").replace(/'/g, "’").replace(/(^|[-\u2014\/(\[{\u2018\s])"/g, "$1“").replace(/"/g, "”").replace(/\.{3}/g, "…") : e;
          }, r.prototype.mangle = function (e) {
            if (!this.options.mangle) return e;

            for (var t, n = "", r = e.length, i = 0; i < r; i++) {
              t = e.charCodeAt(i), Math.random() > .5 && (t = "x" + t.toString(16)), n += "&#" + t + ";";
            }

            return n;
          }, i.prototype.code = function (e, t, n) {
            if (this.options.highlight) {
              var r = this.options.highlight(e, t);
              null != r && r !== e && (n = !0, e = r);
            }

            return t ? '<pre><code class="' + this.options.langPrefix + s(t, !0) + '">' + (n ? e : s(e, !0)) + "</code></pre>\n" : "<pre><code>" + (n ? e : s(e, !0)) + "</code></pre>";
          }, i.prototype.blockquote = function (e) {
            return "<blockquote>\n" + e + "</blockquote>\n";
          }, i.prototype.html = function (e) {
            return e;
          }, i.prototype.heading = function (e, t, n) {
            return this.options.headerIds ? "<h" + t + ' id="' + this.options.headerPrefix + n.toLowerCase().replace(/[^\w]+/g, "-") + '">' + e + "</h" + t + ">\n" : "<h" + t + ">" + e + "</h" + t + ">\n";
          }, i.prototype.hr = function () {
            return this.options.xhtml ? "<hr/>\n" : "<hr>\n";
          }, i.prototype.list = function (e, t, n) {
            var r = t ? "ol" : "ul";
            return "<" + r + (t && 1 !== n ? ' start="' + n + '"' : "") + ">\n" + e + "</" + r + ">\n";
          }, i.prototype.listitem = function (e) {
            return "<li>" + e + "</li>\n";
          }, i.prototype.checkbox = function (e) {
            return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox"' + (this.options.xhtml ? " /" : "") + "> ";
          }, i.prototype.paragraph = function (e) {
            return "<p>" + e + "</p>\n";
          }, i.prototype.table = function (e, t) {
            return t && (t = "<tbody>" + t + "</tbody>"), "<table>\n<thead>\n" + e + "</thead>\n" + t + "</table>\n";
          }, i.prototype.tablerow = function (e) {
            return "<tr>\n" + e + "</tr>\n";
          }, i.prototype.tablecell = function (e, t) {
            var n = t.header ? "th" : "td";
            return (t.align ? "<" + n + ' align="' + t.align + '">' : "<" + n + ">") + e + "</" + n + ">\n";
          }, i.prototype.strong = function (e) {
            return "<strong>" + e + "</strong>";
          }, i.prototype.em = function (e) {
            return "<em>" + e + "</em>";
          }, i.prototype.codespan = function (e) {
            return "<code>" + e + "</code>";
          }, i.prototype.br = function () {
            return this.options.xhtml ? "<br/>" : "<br>";
          }, i.prototype.del = function (e) {
            return "<del>" + e + "</del>";
          }, i.prototype.link = function (e, t, n) {
            if (this.options.sanitize) {
              try {
                var r = decodeURIComponent(l(e)).replace(/[^\w:]/g, "").toLowerCase();
              } catch (e) {
                return n;
              }

              if (0 === r.indexOf("javascript:") || 0 === r.indexOf("vbscript:") || 0 === r.indexOf("data:")) return n;
            }

            this.options.baseUrl && !b.test(e) && (e = d(this.options.baseUrl, e));

            try {
              e = encodeURI(e).replace(/%25/g, "%");
            } catch (e) {
              return n;
            }

            var i = '<a href="' + s(e) + '"';
            return t && (i += ' title="' + t + '"'), i += ">" + n + "</a>";
          }, i.prototype.image = function (e, t, n) {
            this.options.baseUrl && !b.test(e) && (e = d(this.options.baseUrl, e));
            var r = '<img src="' + e + '" alt="' + n + '"';
            return t && (r += ' title="' + t + '"'), r += this.options.xhtml ? "/>" : ">";
          }, i.prototype.text = function (e) {
            return e;
          }, o.prototype.strong = o.prototype.em = o.prototype.codespan = o.prototype.del = o.prototype.text = function (e) {
            return e;
          }, o.prototype.link = o.prototype.image = function (e, t, n) {
            return "" + n;
          }, o.prototype.br = function () {
            return "";
          }, a.parse = function (e, t) {
            return new a(t).parse(e);
          }, a.prototype.parse = function (e) {
            this.inline = new r(e.links, this.options), this.inlineText = new r(e.links, p({}, this.options, {
              renderer: new o()
            })), this.tokens = e.reverse();

            for (var t = ""; this.next();) {
              t += this.tok();
            }

            return t;
          }, a.prototype.next = function () {
            return this.token = this.tokens.pop();
          }, a.prototype.peek = function () {
            return this.tokens[this.tokens.length - 1] || 0;
          }, a.prototype.parseText = function () {
            for (var e = this.token.text; "text" === this.peek().type;) {
              e += "\n" + this.next().text;
            }

            return this.inline.output(e);
          }, a.prototype.tok = function () {
            switch (this.token.type) {
              case "space":
                return "";

              case "hr":
                return this.renderer.hr();

              case "heading":
                return this.renderer.heading(this.inline.output(this.token.text), this.token.depth, l(this.inlineText.output(this.token.text)));

              case "code":
                return this.renderer.code(this.token.text, this.token.lang, this.token.escaped);

              case "table":
                var e,
                    t,
                    n,
                    r,
                    i = "",
                    o = "";

                for (n = "", e = 0; e < this.token.header.length; e++) {
                  n += this.renderer.tablecell(this.inline.output(this.token.header[e]), {
                    header: !0,
                    align: this.token.align[e]
                  });
                }

                for (i += this.renderer.tablerow(n), e = 0; e < this.token.cells.length; e++) {
                  for (t = this.token.cells[e], n = "", r = 0; r < t.length; r++) {
                    n += this.renderer.tablecell(this.inline.output(t[r]), {
                      header: !1,
                      align: this.token.align[r]
                    });
                  }

                  o += this.renderer.tablerow(n);
                }

                return this.renderer.table(i, o);

              case "blockquote_start":
                for (o = ""; "blockquote_end" !== this.next().type;) {
                  o += this.tok();
                }

                return this.renderer.blockquote(o);

              case "list_start":
                o = "";

                for (var a = this.token.ordered, s = this.token.start; "list_end" !== this.next().type;) {
                  o += this.tok();
                }

                return this.renderer.list(o, a, s);

              case "list_item_start":
                for (o = "", this.token.task && (o += this.renderer.checkbox(this.token.checked)); "list_item_end" !== this.next().type;) {
                  o += "text" === this.token.type ? this.parseText() : this.tok();
                }

                return this.renderer.listitem(o);

              case "loose_item_start":
                for (o = ""; "list_item_end" !== this.next().type;) {
                  o += this.tok();
                }

                return this.renderer.listitem(o);

              case "html":
                return this.renderer.html(this.token.text);

              case "paragraph":
                return this.renderer.paragraph(this.inline.output(this.token.text));

              case "text":
                return this.renderer.paragraph(this.parseText());
            }
          };
          var m = {},
              b = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
          u.exec = u, h.options = h.setOptions = function (e) {
            return p(h.defaults, e), h;
          }, h.getDefaults = function () {
            return {
              baseUrl: null,
              breaks: !1,
              gfm: !0,
              headerIds: !0,
              headerPrefix: "",
              highlight: null,
              langPrefix: "language-",
              mangle: !0,
              pedantic: !1,
              renderer: new i(),
              sanitize: !1,
              sanitizer: null,
              silent: !1,
              smartLists: !1,
              smartypants: !1,
              tables: !0,
              xhtml: !1
            };
          }, h.defaults = h.getDefaults(), h.Parser = a, h.parser = a.parse, h.Renderer = i, h.TextRenderer = o, h.Lexer = n, h.lexer = n.lex, h.InlineLexer = r, h.inlineLexer = r.output, h.parse = h, e.exports = h;
        }(this || "undefined" != typeof window && window);
      }).call(t, n(10));
    }, function (e, t) {
      e.exports = {
        name: "valine",
        version: "1.3.10",
        description: "A simple comment system based on Leancloud.",
        main: "/dist/Valine.min.js",
        author: "xCss <xioveliu@gmail.com> (https://github.com/xCss)",
        scripts: {
          test: "webpack",
          build: "webpack",
          dev: "webpack-dev-server --env.dev",
          clean: "rm -rf dist/* "
        },
        keywords: ["simple", "easy-to-use", "fast-and-safe", "comment-system"],
        license: "GPL-2.0",
        repository: {
          type: "git",
          url: "git+https://github.com/xcss/Valine.git"
        },
        homepage: "https://github.com/xcss/Valine#readme",
        devDependencies: {
          autoprefixer: "^7.1.1",
          autosize: "^4.0.2",
          "babel-core": "^6.25.0",
          "babel-loader": "^7.1.1",
          "babel-polyfill": "^6.23.0",
          "babel-preset-es2015": "^6.24.1",
          "babel-preset-stage-0": "^6.24.1",
          "blueimp-md5": "^2.8.0",
          "css-loader": "^0.28.4",
          "exports-loader": "^0.6.3",
          "file-loader": "^0.11.2",
          hanabi: "^0.4.0",
          marked: "^0.4.0",
          "node-sass": "^4.9.2",
          "postcss-loader": "^2.0.5",
          "sass-loader": "^6.0.3",
          "style-loader": "^0.18.2",
          "url-loader": "^0.6.2",
          webpack: "^2.6.1",
          "webpack-cli": "^3.3.5",
          "webpack-dev-server": "^2.9.1"
        }
      };
    }, function (e, t) {
      var n;

      n = function () {
        return this;
      }();

      try {
        n = n || Function("return this")() || (0, eval)("this");
      } catch (e) {
        "object" == (typeof window === "undefined" ? "undefined" : _typeof(window)) && (n = window);
      }

      e.exports = n;
    }, function (e, t) {
      e.exports = {
        grinning: "😀",
        smiley: "😃",
        smile: "😄",
        grin: "😁",
        laughing: "😆",
        sweat_smile: "😅",
        joy: "😂",
        blush: "😊",
        innocent: "😇",
        wink: "😉",
        relieved: "😌",
        heart_eyes: "😍",
        kissing_heart: "😘",
        kissing: "😗",
        kissing_smiling_eyes: "😙",
        kissing_closed_eyes: "😚",
        yum: "😋",
        stuck_out_tongue_winking_eye: "😜",
        stuck_out_tongue_closed_eyes: "😝",
        stuck_out_tongue: "😛",
        sunglasses: "😎",
        smirk: "😏",
        unamused: "😒",
        disappointed: "😞",
        pensive: "😔",
        worried: "😟",
        confused: "😕",
        persevere: "😣",
        confounded: "😖",
        tired_face: "😫",
        weary: "😩",
        angry: "😠",
        rage: "😡",
        no_mouth: "😶",
        neutral_face: "😐",
        expressionless: "😑",
        hushed: "😯",
        frowning: "😦",
        anguished: "😧",
        open_mouth: "😮",
        astonished: "😲",
        dizzy_face: "😵",
        flushed: "😳",
        scream: "😱",
        fearful: "😨",
        cold_sweat: "😰",
        cry: "😢",
        disappointed_relieved: "😥",
        sob: "😭",
        sweat: "😓",
        sleepy: "😪",
        sleeping: "😴",
        mask: "😷",
        smiling_imp: "😈",
        smiley_cat: "😺",
        smile_cat: "😸",
        joy_cat: "😹",
        heart_eyes_cat: "😻",
        smirk_cat: "😼",
        kissing_cat: "😽",
        scream_cat: "🙀",
        crying_cat_face: "😿",
        pouting_cat: "😾",
        cat: "🐱",
        mouse: "🐭",
        cow: "🐮",
        monkey_face: "🐵",
        hand: "✋",
        fist: "✊",
        v: "✌️",
        point_up: "👆",
        point_down: "👇",
        point_left: "👈",
        point_right: "👉",
        facepunch: "👊",
        wave: "👋",
        clap: "👏",
        open_hands: "👐",
        "+1": "👍",
        "-1": "👎",
        ok_hand: "👌",
        pray: "🙏",
        ear: "👂",
        eyes: "👀",
        nose: "👃",
        lips: "👄",
        tongue: "👅",
        heart: "❤️",
        cupid: "💘",
        sparkling_heart: "💖",
        star: "⭐️",
        sparkles: "✨",
        zap: "⚡️",
        sunny: "☀️",
        cloud: "☁️",
        snowflake: "❄️",
        umbrella: "☔️",
        coffee: "☕️",
        airplane: "✈️",
        anchor: "⚓️",
        watch: "⌚️",
        phone: "☎️",
        hourglass: "⌛️",
        email: "✉️",
        scissors: "✂️",
        black_nib: "✒️",
        pencil2: "✏️",
        x: "❌",
        recycle: "♻️",
        white_check_mark: "✅",
        negative_squared_cross_mark: "❎",
        m: "Ⓜ️",
        i: "ℹ️",
        tm: "™️",
        copyright: "©️",
        registered: "®️"
      };
    }, function (e, t, n) {
      var r = n(13);
      "string" == typeof r && (r = [[e.i, r, ""]]);
      var i = {};
      i.transform = void 0;
      n(15)(r, i);
      r.locals && (e.exports = r.locals);
    }, function (e, t, n) {
      t = e.exports = n(14)(!1), t.push([e.i, '.v{font-size:16px;text-align:left}.v *{-webkit-box-sizing:border-box;box-sizing:border-box;line-height:2;color:#555;-webkit-transition:all .3s ease;transition:all .3s ease}.v hr{margin:.825em 0;border-color:#f6f6f6;border-style:dashed}.v.hide-avatar .vimg{display:none}.v a{position:relative;cursor:pointer;color:#1abc9c;display:inline-block}.v a:before{content:"";position:absolute;width:0;right:0;bottom:0;height:1px;background:#1abc9c;-webkit-transition:width .3s ease;transition:width .3s ease}.v a:hover{color:#d7191a}.v a:hover:before{width:100%;left:0;right:auto}.v code,.v pre{background-color:#f6f6f6;color:#555;padding:.2em .4em;border-radius:3px;font-size:85%;margin:0;font-family:Source Code Pro,courier new,Input Mono,PT Mono,SFMono-Regular,Consolas,Monaco,Menlo,PingFang SC,Liberation Mono,Microsoft YaHei,Courier，monospace}.v pre{padding:10px;overflow:auto;line-height:1.45}.v pre code{padding:0;background:transparent;white-space:pre-wrap;word-break:keep-all}.v blockquote{color:#666;margin:.5em 0;padding:0 0 0 1em;border-left:8px solid hsla(0,0%,93%,.5)}.v .vinput{border:none;resize:none;outline:none;padding:10px 5px;max-width:100%;font-size:.775em}.v input[type=checkbox],.v input[type=radio]{display:inline-block;vertical-align:middle;margin-top:-2px}.v .vwrap{border:1px solid #f0f0f0;border-radius:4px;margin-bottom:10px;overflow:hidden;position:relative;padding:10px}.v .vwrap input{background:transparent}.v .vwrap .vedit{position:relative;padding-top:10px}.v .vwrap .vedit .vctrl{text-align:right;font-size:12px}.v .vwrap .vedit .vctrl span{padding:10px;display:inline-block;vertical-align:middle;cursor:pointer}.v .vwrap .vedit .vemojis{display:none;font-size:18px;text-align:justify;max-height:145px;overflow:auto;margin-bottom:10px;-webkit-box-shadow:0 0 1px #f0f0f0;box-shadow:0 0 1px #f0f0f0}.v .vwrap .vedit .vemojis i{font-style:normal;padding:7px 0;width:38px;cursor:pointer;text-align:center;display:inline-block;vertical-align:middle}.v .vwrap .vedit .vpreview{padding:7px;-webkit-box-shadow:0 0 1px #f0f0f0;box-shadow:0 0 1px #f0f0f0}.v .vwrap .vedit .vpreview frame,.v .vwrap .vedit .vpreview iframe,.v .vwrap .vedit .vpreview img{max-width:100%;border:none}.v .vwrap .vheader .vinput{width:33.33%;border-bottom:1px dashed #dedede}.v .vwrap .vheader.item2 .vinput{width:50%}.v .vwrap .vheader.item1 .vinput{width:100%}.v .vwrap .vheader .vinput:focus{border-bottom-color:#eb5055}@media screen and (max-width:520px){.v .vwrap .vheader.item2 .vinput,.v .vwrap .vheader .vinput{width:100%}}.v .vwrap .vcontrol{font-size:0;padding-top:15px}.v .vwrap .vcontrol .col{display:inline-block;font-size:16px;vertical-align:middle;color:#ccc}.v .vwrap .vcontrol .col.text-right{text-align:right}.v .vwrap .vcontrol .col svg{margin-right:2px;overflow:hidden;fill:currentColor;vertical-align:middle}.v .vwrap .vcontrol .col.col-20{width:20%}.v .vwrap .vcontrol .col.col-40{width:40%}.v .vwrap .vcontrol .col.col-60{width:60%}.v .vwrap .vcontrol .col.col-80{width:80%}.v .vwrap .vcontrol .col.split{width:50%}.v .vwrap .vmark{position:absolute;background:rgba(0,0,0,.65);width:100%;height:100%;left:0;top:0}.v .vwrap .vmark .valert{padding-top:3em}.v .vwrap .vmark .valert .vtext{color:#fff;padding:1em 0}.v .vwrap .vmark .valert .vcode{width:4.6875em;border-radius:.3125em;padding:.5em;background:#dedede}.v .vwrap .vmark .valert .vcode:focus{border-color:#3090e4;background-color:#fff}@media screen and (max-width:720px){.v .vwrap .vmark .valert{padding-top:5.5em}.v .vwrap .vmark .valert .vtext{color:#fff;padding:1em 0}}.v .power{color:#999;padding:.5em 0}.v .power,.v .power a{font-size:.75em}.v .vinfo{font-size:0;padding:5px}.v .vinfo .col{font-size:16px;display:inline-block;width:50%;vertical-align:middle}.v .vinfo .vcount .vnum{font-weight:600;font-size:1.25em}.v a{text-decoration:none;color:#555}.v a:hover{color:#222}.v ol,.v ul{padding:0;margin-left:1.25em}.v .txt-center{text-align:center}.v .txt-right{text-align:right}.v .pd5{padding:5px}.v .pd10{padding:10px}.v .veditor{width:100%;min-height:8.75em;font-size:.875em;background:transparent;resize:vertical;-webkit-transition:all .25s ease;transition:all .25s ease}.v .vbtn{-webkit-transition-duration:.4s;transition-duration:.4s;text-align:center;color:#313131;border:1px solid #ededed;border-radius:.3em;display:inline-block;background:#ededed;margin-bottom:0;font-weight:400;vertical-align:middle;-ms-touch-action:manipulation;touch-action:manipulation;cursor:pointer;white-space:nowrap;padding:.5em 1.25em;font-size:.875em;line-height:1.42857143;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;outline:none}.v .vbtn+.vbtn{margin-left:1.25em}.v .vbtn:active,.v .vbtn:hover{color:#3090e4;border-color:#3090e4;background-color:#fff}.v .vempty{padding:1.25em;text-align:center;color:#999}.v .vlist{width:100%}.v .vlist .vcard{padding-top:1.5em;position:relative;display:block}.v .vlist .vcard:after{content:"";clear:both;display:block}.v .vlist .vcard .vimg{width:3.125em;height:3.125em;float:left;border-radius:50%;margin-right:.7525em;border:1px solid #f5f5f5;padding:.125em}@media screen and (max-width:720px){.v .vlist .vcard .vimg{width:2.5em;height:2.5em}}.v .vlist .vcard .vhead{line-height:1.5;margin-top:0}.v .vlist .vcard .vhead .vnick{position:relative;font-size:.875em;font-weight:500;margin-right:.875em;cursor:pointer;color:#1abc9c;text-decoration:none;display:inline-block}.v .vlist .vcard .vhead .vnick:before{content:"";position:absolute;width:0;right:0;bottom:0;height:1px;background:#1abc9c;-webkit-transition:width .3s ease;transition:width .3s ease}.v .vlist .vcard .vhead .vnick:hover{color:#d7191a}.v .vlist .vcard .vhead .vnick:hover:before{width:100%;left:0;right:auto}.v .vlist .vcard .vhead .vsys{display:inline-block;padding:.2em .5em;background:#ededed;color:#b3b1b1;font-size:.75em;border-radius:.2em;margin-right:.3em}@media screen and (max-width:520px){.v .vlist .vcard .vhead .vsys{display:none}}.v .vlist .vcard .vh{overflow:hidden;padding-bottom:.5em;border-bottom:1px dashed #f5f5f5}.v .vlist .vcard .vh .vtime{color:#b3b3b3;font-size:.75em;margin-right:.875em}.v .vlist .vcard .vh .vmeta{line-height:1;position:relative}.v .vlist .vcard .vh .vmeta .vat{font-size:.8125em;color:#ef2f11;cursor:pointer;float:right}.v .vlist .vcard:last-child .vh{border-bottom:none}.v .vlist .vcard .vcontent{word-wrap:break-word;word-break:break-all;text-align:justify;color:#4a4a4a;font-size:.875em;line-height:2;position:relative;margin-bottom:.75em;padding-top:.625em}.v .vlist .vcard .vcontent frame,.v .vlist .vcard .vcontent iframe,.v .vlist .vcard .vcontent img{max-width:100%;border:none}.v .vlist .vcard .vcontent.expand{cursor:pointer;max-height:11.25em;overflow:hidden}.v .vlist .vcard .vcontent.expand:before{display:block;content:"";position:absolute;width:100%;left:0;top:0;bottom:3.15em;pointer-events:none;background:-webkit-gradient(linear,left top,left bottom,from(hsla(0,0%,100%,0)),to(hsla(0,0%,100%,.9)));background:linear-gradient(180deg,hsla(0,0%,100%,0),hsla(0,0%,100%,.9))}.v .vlist .vcard .vcontent.expand:after{display:block;content:"Click on expand";text-align:center;color:#828586;position:absolute;width:100%;height:3.15em;line-height:3.15em;left:0;bottom:0;pointer-events:none;background:hsla(0,0%,100%,.9)}.v .vlist .vcard .vquote{color:#666;margin-top:1em;padding-left:1em;border-left:1px dashed hsla(0,0%,93%,.5)}.v .vlist .vcard .vquote .vimg{width:2.225em;height:2.225em}.v .vpage .vmore{margin:1em 0}.v .clear{content:"";display:block;clear:both}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}@keyframes spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}@-webkit-keyframes pulse{50%{background:#dcdcdc}}@keyframes pulse{50%{background:#dcdcdc}}.v .vloading{position:relative;padding:20px;display:block;height:80px}.v .vloading:before{-webkit-box-sizing:border-box;box-sizing:border-box;content:"";position:absolute;display:inline-block;top:20px;left:50%;margin-left:-20px;width:40px;height:40px;border:6px double #a0a0a0;border-top-color:transparent;border-bottom-color:transparent;border-radius:50%;-webkit-animation:spin 1s infinite linear;animation:spin 1s infinite linear}', ""]);
    }, function (e, t) {
      function n(e, t) {
        var n = e[1] || "",
            i = e[3];
        if (!i) return n;

        if (t && "function" == typeof btoa) {
          var o = r(i);
          return [n].concat(i.sources.map(function (e) {
            return "/*# sourceURL=" + i.sourceRoot + e + " */";
          })).concat([o]).join("\n");
        }

        return [n].join("\n");
      }

      function r(e) {
        return "/*# sourceMappingURL=data:application/json;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(e)))) + " */";
      }

      e.exports = function (e) {
        var t = [];
        return t.toString = function () {
          return this.map(function (t) {
            var r = n(t, e);
            return t[2] ? "@media " + t[2] + "{" + r + "}" : r;
          }).join("");
        }, t.i = function (e, n) {
          "string" == typeof e && (e = [[null, e, ""]]);

          for (var r = {}, i = 0; i < this.length; i++) {
            var o = this[i][0];
            "number" == typeof o && (r[o] = !0);
          }

          for (i = 0; i < e.length; i++) {
            var a = e[i];
            "number" == typeof a[0] && r[a[0]] || (n && !a[2] ? a[2] = n : n && (a[2] = "(" + a[2] + ") and (" + n + ")"), t.push(a));
          }
        }, t;
      };
    }, function (e, t, n) {
      function r(e, t) {
        for (var n = 0; n < e.length; n++) {
          var r = e[n],
              i = h[r.id];

          if (i) {
            i.refs++;

            for (var o = 0; o < i.parts.length; o++) {
              i.parts[o](r.parts[o]);
            }

            for (; o < r.parts.length; o++) {
              i.parts.push(d(r.parts[o], t));
            }
          } else {
            for (var a = [], o = 0; o < r.parts.length; o++) {
              a.push(d(r.parts[o], t));
            }

            h[r.id] = {
              id: r.id,
              refs: 1,
              parts: a
            };
          }
        }
      }

      function i(e, t) {
        for (var n = [], r = {}, i = 0; i < e.length; i++) {
          var o = e[i],
              a = t.base ? o[0] + t.base : o[0],
              s = o[1],
              l = o[2],
              c = o[3],
              d = {
            css: s,
            media: l,
            sourceMap: c
          };
          r[a] ? r[a].parts.push(d) : n.push(r[a] = {
            id: a,
            parts: [d]
          });
        }

        return n;
      }

      function o(e, t) {
        var n = g(e.insertInto);
        if (!n) throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
        var r = x[x.length - 1];
        if ("top" === e.insertAt) r ? r.nextSibling ? n.insertBefore(t, r.nextSibling) : n.appendChild(t) : n.insertBefore(t, n.firstChild), x.push(t);else {
          if ("bottom" !== e.insertAt) throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
          n.appendChild(t);
        }
      }

      function a(e) {
        if (null === e.parentNode) return !1;
        e.parentNode.removeChild(e);
        var t = x.indexOf(e);
        t >= 0 && x.splice(t, 1);
      }

      function s(e) {
        var t = document.createElement("style");
        return e.attrs.type = "text/css", c(t, e.attrs), o(e, t), t;
      }

      function l(e) {
        var t = document.createElement("link");
        return e.attrs.type = "text/css", e.attrs.rel = "stylesheet", c(t, e.attrs), o(e, t), t;
      }

      function c(e, t) {
        Object.keys(t).forEach(function (n) {
          e.setAttribute(n, t[n]);
        });
      }

      function d(e, t) {
        var n, r, i, o;

        if (t.transform && e.css) {
          if (!(o = t.transform(e.css))) return function () {};
          e.css = o;
        }

        if (t.singleton) {
          var c = b++;
          n = m || (m = s(t)), r = u.bind(null, n, c, !1), i = u.bind(null, n, c, !0);
        } else e.sourceMap && "function" == typeof URL && "function" == typeof URL.createObjectURL && "function" == typeof URL.revokeObjectURL && "function" == typeof Blob && "function" == typeof btoa ? (n = l(t), r = f.bind(null, n, t), i = function i() {
          a(n), n.href && URL.revokeObjectURL(n.href);
        }) : (n = s(t), r = p.bind(null, n), i = function i() {
          a(n);
        });

        return r(e), function (t) {
          if (t) {
            if (t.css === e.css && t.media === e.media && t.sourceMap === e.sourceMap) return;
            r(e = t);
          } else i();
        };
      }

      function u(e, t, n, r) {
        var i = n ? "" : r.css;
        if (e.styleSheet) e.styleSheet.cssText = w(t, i);else {
          var o = document.createTextNode(i),
              a = e.childNodes;
          a[t] && e.removeChild(a[t]), a.length ? e.insertBefore(o, a[t]) : e.appendChild(o);
        }
      }

      function p(e, t) {
        var n = t.css,
            r = t.media;
        if (r && e.setAttribute("media", r), e.styleSheet) e.styleSheet.cssText = n;else {
          for (; e.firstChild;) {
            e.removeChild(e.firstChild);
          }

          e.appendChild(document.createTextNode(n));
        }
      }

      function f(e, t, n) {
        var r = n.css,
            i = n.sourceMap,
            o = void 0 === t.convertToAbsoluteUrls && i;
        (t.convertToAbsoluteUrls || o) && (r = y(r)), i && (r += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(i)))) + " */");
        var a = new Blob([r], {
          type: "text/css"
        }),
            s = e.href;
        e.href = URL.createObjectURL(a), s && URL.revokeObjectURL(s);
      }

      var h = {},
          v = function (e) {
        var t;
        return function () {
          return void 0 === t && (t = e.apply(this, arguments)), t;
        };
      }(function () {
        return window && document && document.all && !window.atob;
      }),
          g = function (e) {
        var t = {};
        return function (n) {
          return void 0 === t[n] && (t[n] = e.call(this, n)), t[n];
        };
      }(function (e) {
        return document.querySelector(e);
      }),
          m = null,
          b = 0,
          x = [],
          y = n(16);

      e.exports = function (e, t) {
        if ("undefined" != typeof DEBUG && DEBUG && "object" != (typeof document === "undefined" ? "undefined" : _typeof(document))) throw new Error("The style-loader cannot be used in a non-browser environment");
        t = t || {}, t.attrs = "object" == _typeof(t.attrs) ? t.attrs : {}, t.singleton || (t.singleton = v()), t.insertInto || (t.insertInto = "head"), t.insertAt || (t.insertAt = "bottom");
        var n = i(e, t);
        return r(n, t), function (e) {
          for (var o = [], a = 0; a < n.length; a++) {
            var s = n[a],
                l = h[s.id];
            l.refs--, o.push(l);
          }

          if (e) {
            r(i(e, t), t);
          }

          for (var a = 0; a < o.length; a++) {
            var l = o[a];

            if (0 === l.refs) {
              for (var c = 0; c < l.parts.length; c++) {
                l.parts[c]();
              }

              delete h[l.id];
            }
          }
        };
      };

      var w = function () {
        var e = [];
        return function (t, n) {
          return e[t] = n, e.filter(Boolean).join("\n");
        };
      }();
    }, function (e, t) {
      e.exports = function (e) {
        var t = "undefined" != typeof window && window.location;
        if (!t) throw new Error("fixUrls requires window.location");
        if (!e || "string" != typeof e) return e;
        var n = t.protocol + "//" + t.host,
            r = n + t.pathname.replace(/\/[^\/]*$/, "/");
        return e.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function (e, t) {
          var i = t.trim().replace(/^"(.*)"$/, function (e, t) {
            return t;
          }).replace(/^'(.*)'$/, function (e, t) {
            return t;
          });
          if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(i)) return e;
          var o;
          return o = 0 === i.indexOf("//") ? i : 0 === i.indexOf("/") ? n + i : r + i.replace(/^\.\//, ""), "url(" + JSON.stringify(o) + ")";
        });
      };
    }, function (e, t, n) {
      n(12), e.exports = n(1);
    }]);
  });
};

exports["default"] = _default;

},{}],43:[function(require,module,exports){
(function (process){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _this = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _default = function _default(o) {
  !function (t, e) {
    window.AV = e();
  }(_this, function () {
    return function (t) {
      function e(r) {
        if (n[r]) return n[r].exports;
        var i = n[r] = {
          i: r,
          l: !1,
          exports: {}
        };
        return t[r].call(i.exports, i, i.exports, e), i.l = !0, i.exports;
      }

      var n = {};
      return e.m = t, e.c = n, e.i = function (t) {
        return t;
      }, e.d = function (t, n, r) {
        e.o(t, n) || Object.defineProperty(t, n, {
          configurable: !1,
          enumerable: !0,
          get: r
        });
      }, e.n = function (t) {
        var n = t && t.__esModule ? function () {
          return t["default"];
        } : function () {
          return t;
        };
        return e.d(n, "a", n), n;
      }, e.o = function (t, e) {
        return Object.prototype.hasOwnProperty.call(t, e);
      }, e.p = "", e(e.s = 35);
    }([function (t, e, n) {
      var r, i;
      (function () {
        function n(t) {
          function e(e, n, r, i, s, o) {
            for (; s >= 0 && s < o; s += t) {
              var a = i ? i[s] : s;
              r = n(r, e[a], a, e);
            }

            return r;
          }

          return function (n, r, i, s) {
            r = S(r, s, 4);
            var o = !x(n) && O.keys(n),
                a = (o || n).length,
                u = t > 0 ? 0 : a - 1;
            return arguments.length < 3 && (i = n[o ? o[u] : u], u += t), e(n, r, i, o, u, a);
          };
        }

        function s(t) {
          return function (e, n, r) {
            n = A(n, r);

            for (var i = j(e), s = t > 0 ? 0 : i - 1; s >= 0 && s < i; s += t) {
              if (n(e[s], s, e)) return s;
            }

            return -1;
          };
        }

        function o(t, e, n) {
          return function (r, i, s) {
            var o = 0,
                a = j(r);
            if ("number" == typeof s) t > 0 ? o = s >= 0 ? s : Math.max(s + a, o) : a = s >= 0 ? Math.min(s + 1, a) : s + a + 1;else if (n && s && a) return s = n(r, i), r[s] === i ? s : -1;
            if (i !== i) return s = e(p.call(r, o, a), O.isNaN), s >= 0 ? s + o : -1;

            for (s = t > 0 ? o : a - 1; s >= 0 && s < a; s += t) {
              if (r[s] === i) return s;
            }

            return -1;
          };
        }

        function a(t, e) {
          var n = P.length,
              r = t.constructor,
              i = O.isFunction(r) && r.prototype || h,
              s = "constructor";

          for (O.has(t, s) && !O.contains(e, s) && e.push(s); n--;) {
            (s = P[n]) in t && t[s] !== i[s] && !O.contains(e, s) && e.push(s);
          }
        }

        var u = this,
            c = u._,
            l = Array.prototype,
            h = Object.prototype,
            f = Function.prototype,
            d = l.push,
            p = l.slice,
            _ = h.toString,
            v = h.hasOwnProperty,
            m = Array.isArray,
            y = Object.keys,
            g = f.bind,
            b = Object.create,
            w = function w() {},
            O = function O(t) {
          return t instanceof O ? t : this instanceof O ? void (this._wrapped = t) : new O(t);
        };

        void 0 !== t && t.exports && (e = t.exports = O), e._ = O, O.VERSION = "1.8.3";

        var S = function S(t, e, n) {
          if (void 0 === e) return t;

          switch (null == n ? 3 : n) {
            case 1:
              return function (n) {
                return t.call(e, n);
              };

            case 2:
              return function (n, r) {
                return t.call(e, n, r);
              };

            case 3:
              return function (n, r, i) {
                return t.call(e, n, r, i);
              };

            case 4:
              return function (n, r, i, s) {
                return t.call(e, n, r, i, s);
              };
          }

          return function () {
            return t.apply(e, arguments);
          };
        },
            A = function A(t, e, n) {
          return null == t ? O.identity : O.isFunction(t) ? S(t, e, n) : O.isObject(t) ? O.matcher(t) : O.property(t);
        };

        O.iteratee = function (t, e) {
          return A(t, e, 1 / 0);
        };

        var E = function E(t, e) {
          return function (n) {
            var r = arguments.length;
            if (r < 2 || null == n) return n;

            for (var i = 1; i < r; i++) {
              for (var s = arguments[i], o = t(s), a = o.length, u = 0; u < a; u++) {
                var c = o[u];
                e && void 0 !== n[c] || (n[c] = s[c]);
              }
            }

            return n;
          };
        },
            T = function T(t) {
          if (!O.isObject(t)) return {};
          if (b) return b(t);
          w.prototype = t;
          var e = new w();
          return w.prototype = null, e;
        },
            N = function N(t) {
          return function (e) {
            return null == e ? void 0 : e[t];
          };
        },
            C = Math.pow(2, 53) - 1,
            j = N("length"),
            x = function x(t) {
          var e = j(t);
          return "number" == typeof e && e >= 0 && e <= C;
        };

        O.each = O.forEach = function (t, e, n) {
          e = S(e, n);
          var r, i;
          if (x(t)) for (r = 0, i = t.length; r < i; r++) {
            e(t[r], r, t);
          } else {
            var s = O.keys(t);

            for (r = 0, i = s.length; r < i; r++) {
              e(t[s[r]], s[r], t);
            }
          }
          return t;
        }, O.map = O.collect = function (t, e, n) {
          e = A(e, n);

          for (var r = !x(t) && O.keys(t), i = (r || t).length, s = Array(i), o = 0; o < i; o++) {
            var a = r ? r[o] : o;
            s[o] = e(t[a], a, t);
          }

          return s;
        }, O.reduce = O.foldl = O.inject = n(1), O.reduceRight = O.foldr = n(-1), O.find = O.detect = function (t, e, n) {
          var r;
          if (void 0 !== (r = x(t) ? O.findIndex(t, e, n) : O.findKey(t, e, n)) && -1 !== r) return t[r];
        }, O.filter = O.select = function (t, e, n) {
          var r = [];
          return e = A(e, n), O.each(t, function (t, n, i) {
            e(t, n, i) && r.push(t);
          }), r;
        }, O.reject = function (t, e, n) {
          return O.filter(t, O.negate(A(e)), n);
        }, O.every = O.all = function (t, e, n) {
          e = A(e, n);

          for (var r = !x(t) && O.keys(t), i = (r || t).length, s = 0; s < i; s++) {
            var o = r ? r[s] : s;
            if (!e(t[o], o, t)) return !1;
          }

          return !0;
        }, O.some = O.any = function (t, e, n) {
          e = A(e, n);

          for (var r = !x(t) && O.keys(t), i = (r || t).length, s = 0; s < i; s++) {
            var o = r ? r[s] : s;
            if (e(t[o], o, t)) return !0;
          }

          return !1;
        }, O.contains = O.includes = O.include = function (t, e, n, r) {
          return x(t) || (t = O.values(t)), ("number" != typeof n || r) && (n = 0), O.indexOf(t, e, n) >= 0;
        }, O.invoke = function (t, e) {
          var n = p.call(arguments, 2),
              r = O.isFunction(e);
          return O.map(t, function (t) {
            var i = r ? e : t[e];
            return null == i ? i : i.apply(t, n);
          });
        }, O.pluck = function (t, e) {
          return O.map(t, O.property(e));
        }, O.where = function (t, e) {
          return O.filter(t, O.matcher(e));
        }, O.findWhere = function (t, e) {
          return O.find(t, O.matcher(e));
        }, O.max = function (t, e, n) {
          var r,
              i,
              s = -1 / 0,
              o = -1 / 0;

          if (null == e && null != t) {
            t = x(t) ? t : O.values(t);

            for (var a = 0, u = t.length; a < u; a++) {
              (r = t[a]) > s && (s = r);
            }
          } else e = A(e, n), O.each(t, function (t, n, r) {
            ((i = e(t, n, r)) > o || i === -1 / 0 && s === -1 / 0) && (s = t, o = i);
          });

          return s;
        }, O.min = function (t, e, n) {
          var r,
              i,
              s = 1 / 0,
              o = 1 / 0;

          if (null == e && null != t) {
            t = x(t) ? t : O.values(t);

            for (var a = 0, u = t.length; a < u; a++) {
              (r = t[a]) < s && (s = r);
            }
          } else e = A(e, n), O.each(t, function (t, n, r) {
            ((i = e(t, n, r)) < o || i === 1 / 0 && s === 1 / 0) && (s = t, o = i);
          });

          return s;
        }, O.shuffle = function (t) {
          for (var e, n = x(t) ? t : O.values(t), r = n.length, i = Array(r), s = 0; s < r; s++) {
            e = O.random(0, s), e !== s && (i[s] = i[e]), i[e] = n[s];
          }

          return i;
        }, O.sample = function (t, e, n) {
          return null == e || n ? (x(t) || (t = O.values(t)), t[O.random(t.length - 1)]) : O.shuffle(t).slice(0, Math.max(0, e));
        }, O.sortBy = function (t, e, n) {
          return e = A(e, n), O.pluck(O.map(t, function (t, n, r) {
            return {
              value: t,
              index: n,
              criteria: e(t, n, r)
            };
          }).sort(function (t, e) {
            var n = t.criteria,
                r = e.criteria;

            if (n !== r) {
              if (n > r || void 0 === n) return 1;
              if (n < r || void 0 === r) return -1;
            }

            return t.index - e.index;
          }), "value");
        };

        var U = function U(t) {
          return function (e, n, r) {
            var i = {};
            return n = A(n, r), O.each(e, function (r, s) {
              var o = n(r, s, e);
              t(i, r, o);
            }), i;
          };
        };

        O.groupBy = U(function (t, e, n) {
          O.has(t, n) ? t[n].push(e) : t[n] = [e];
        }), O.indexBy = U(function (t, e, n) {
          t[n] = e;
        }), O.countBy = U(function (t, e, n) {
          O.has(t, n) ? t[n]++ : t[n] = 1;
        }), O.toArray = function (t) {
          return t ? O.isArray(t) ? p.call(t) : x(t) ? O.map(t, O.identity) : O.values(t) : [];
        }, O.size = function (t) {
          return null == t ? 0 : x(t) ? t.length : O.keys(t).length;
        }, O.partition = function (t, e, n) {
          e = A(e, n);
          var r = [],
              i = [];
          return O.each(t, function (t, n, s) {
            (e(t, n, s) ? r : i).push(t);
          }), [r, i];
        }, O.first = O.head = O.take = function (t, e, n) {
          if (null != t) return null == e || n ? t[0] : O.initial(t, t.length - e);
        }, O.initial = function (t, e, n) {
          return p.call(t, 0, Math.max(0, t.length - (null == e || n ? 1 : e)));
        }, O.last = function (t, e, n) {
          if (null != t) return null == e || n ? t[t.length - 1] : O.rest(t, Math.max(0, t.length - e));
        }, O.rest = O.tail = O.drop = function (t, e, n) {
          return p.call(t, null == e || n ? 1 : e);
        }, O.compact = function (t) {
          return O.filter(t, O.identity);
        };

        var k = function k(t, e, n, r) {
          for (var i = [], s = 0, o = r || 0, a = j(t); o < a; o++) {
            var u = t[o];

            if (x(u) && (O.isArray(u) || O.isArguments(u))) {
              e || (u = k(u, e, n));
              var c = 0,
                  l = u.length;

              for (i.length += l; c < l;) {
                i[s++] = u[c++];
              }
            } else n || (i[s++] = u);
          }

          return i;
        };

        O.flatten = function (t, e) {
          return k(t, e, !1);
        }, O.without = function (t) {
          return O.difference(t, p.call(arguments, 1));
        }, O.uniq = O.unique = function (t, e, n, r) {
          O.isBoolean(e) || (r = n, n = e, e = !1), null != n && (n = A(n, r));

          for (var i = [], s = [], o = 0, a = j(t); o < a; o++) {
            var u = t[o],
                c = n ? n(u, o, t) : u;
            e ? (o && s === c || i.push(u), s = c) : n ? O.contains(s, c) || (s.push(c), i.push(u)) : O.contains(i, u) || i.push(u);
          }

          return i;
        }, O.union = function () {
          return O.uniq(k(arguments, !0, !0));
        }, O.intersection = function (t) {
          for (var e = [], n = arguments.length, r = 0, i = j(t); r < i; r++) {
            var s = t[r];

            if (!O.contains(e, s)) {
              for (var o = 1; o < n && O.contains(arguments[o], s); o++) {
                ;
              }

              o === n && e.push(s);
            }
          }

          return e;
        }, O.difference = function (t) {
          var e = k(arguments, !0, !0, 1);
          return O.filter(t, function (t) {
            return !O.contains(e, t);
          });
        }, O.zip = function () {
          return O.unzip(arguments);
        }, O.unzip = function (t) {
          for (var e = t && O.max(t, j).length || 0, n = Array(e), r = 0; r < e; r++) {
            n[r] = O.pluck(t, r);
          }

          return n;
        }, O.object = function (t, e) {
          for (var n = {}, r = 0, i = j(t); r < i; r++) {
            e ? n[t[r]] = e[r] : n[t[r][0]] = t[r][1];
          }

          return n;
        }, O.findIndex = s(1), O.findLastIndex = s(-1), O.sortedIndex = function (t, e, n, r) {
          n = A(n, r, 1);

          for (var i = n(e), s = 0, o = j(t); s < o;) {
            var a = Math.floor((s + o) / 2);
            n(t[a]) < i ? s = a + 1 : o = a;
          }

          return s;
        }, O.indexOf = o(1, O.findIndex, O.sortedIndex), O.lastIndexOf = o(-1, O.findLastIndex), O.range = function (t, e, n) {
          null == e && (e = t || 0, t = 0), n = n || 1;

          for (var r = Math.max(Math.ceil((e - t) / n), 0), i = Array(r), s = 0; s < r; s++, t += n) {
            i[s] = t;
          }

          return i;
        };

        var I = function I(t, e, n, r, i) {
          if (!(r instanceof e)) return t.apply(n, i);
          var s = T(t.prototype),
              o = t.apply(s, i);
          return O.isObject(o) ? o : s;
        };

        O.bind = function (t, e) {
          if (g && t.bind === g) return g.apply(t, p.call(arguments, 1));
          if (!O.isFunction(t)) throw new TypeError("Bind must be called on a function");

          var n = p.call(arguments, 2),
              r = function r() {
            return I(t, r, e, this, n.concat(p.call(arguments)));
          };

          return r;
        }, O.partial = function (t) {
          var e = p.call(arguments, 1),
              n = function n() {
            for (var r = 0, i = e.length, s = Array(i), o = 0; o < i; o++) {
              s[o] = e[o] === O ? arguments[r++] : e[o];
            }

            for (; r < arguments.length;) {
              s.push(arguments[r++]);
            }

            return I(t, n, this, this, s);
          };

          return n;
        }, O.bindAll = function (t) {
          var e,
              n,
              r = arguments.length;
          if (r <= 1) throw new Error("bindAll must be passed function names");

          for (e = 1; e < r; e++) {
            n = arguments[e], t[n] = O.bind(t[n], t);
          }

          return t;
        }, O.memoize = function (t, e) {
          var n = function n(r) {
            var i = n.cache,
                s = "" + (e ? e.apply(this, arguments) : r);
            return O.has(i, s) || (i[s] = t.apply(this, arguments)), i[s];
          };

          return n.cache = {}, n;
        }, O.delay = function (t, e) {
          var n = p.call(arguments, 2);
          return setTimeout(function () {
            return t.apply(null, n);
          }, e);
        }, O.defer = O.partial(O.delay, O, 1), O.throttle = function (t, e, n) {
          var r,
              i,
              s,
              o = null,
              a = 0;
          n || (n = {});

          var u = function u() {
            a = !1 === n.leading ? 0 : O.now(), o = null, s = t.apply(r, i), o || (r = i = null);
          };

          return function () {
            var c = O.now();
            a || !1 !== n.leading || (a = c);
            var l = e - (c - a);
            return r = this, i = arguments, l <= 0 || l > e ? (o && (clearTimeout(o), o = null), a = c, s = t.apply(r, i), o || (r = i = null)) : o || !1 === n.trailing || (o = setTimeout(u, l)), s;
          };
        }, O.debounce = function (t, e, n) {
          var r,
              i,
              s,
              o,
              a,
              u = function u() {
            var c = O.now() - o;
            c < e && c >= 0 ? r = setTimeout(u, e - c) : (r = null, n || (a = t.apply(s, i), r || (s = i = null)));
          };

          return function () {
            s = this, i = arguments, o = O.now();
            var c = n && !r;
            return r || (r = setTimeout(u, e)), c && (a = t.apply(s, i), s = i = null), a;
          };
        }, O.wrap = function (t, e) {
          return O.partial(e, t);
        }, O.negate = function (t) {
          return function () {
            return !t.apply(this, arguments);
          };
        }, O.compose = function () {
          var t = arguments,
              e = t.length - 1;
          return function () {
            for (var n = e, r = t[e].apply(this, arguments); n--;) {
              r = t[n].call(this, r);
            }

            return r;
          };
        }, O.after = function (t, e) {
          return function () {
            if (--t < 1) return e.apply(this, arguments);
          };
        }, O.before = function (t, e) {
          var n;
          return function () {
            return --t > 0 && (n = e.apply(this, arguments)), t <= 1 && (e = null), n;
          };
        }, O.once = O.partial(O.before, 2);
        var R = !{
          toString: null
        }.propertyIsEnumerable("toString"),
            P = ["valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];
        O.keys = function (t) {
          if (!O.isObject(t)) return [];
          if (y) return y(t);
          var e = [];

          for (var n in t) {
            O.has(t, n) && e.push(n);
          }

          return R && a(t, e), e;
        }, O.allKeys = function (t) {
          if (!O.isObject(t)) return [];
          var e = [];

          for (var n in t) {
            e.push(n);
          }

          return R && a(t, e), e;
        }, O.values = function (t) {
          for (var e = O.keys(t), n = e.length, r = Array(n), i = 0; i < n; i++) {
            r[i] = t[e[i]];
          }

          return r;
        }, O.mapObject = function (t, e, n) {
          e = A(e, n);

          for (var r, i = O.keys(t), s = i.length, o = {}, a = 0; a < s; a++) {
            r = i[a], o[r] = e(t[r], r, t);
          }

          return o;
        }, O.pairs = function (t) {
          for (var e = O.keys(t), n = e.length, r = Array(n), i = 0; i < n; i++) {
            r[i] = [e[i], t[e[i]]];
          }

          return r;
        }, O.invert = function (t) {
          for (var e = {}, n = O.keys(t), r = 0, i = n.length; r < i; r++) {
            e[t[n[r]]] = n[r];
          }

          return e;
        }, O.functions = O.methods = function (t) {
          var e = [];

          for (var n in t) {
            O.isFunction(t[n]) && e.push(n);
          }

          return e.sort();
        }, O.extend = E(O.allKeys), O.extendOwn = O.assign = E(O.keys), O.findKey = function (t, e, n) {
          e = A(e, n);

          for (var r, i = O.keys(t), s = 0, o = i.length; s < o; s++) {
            if (r = i[s], e(t[r], r, t)) return r;
          }
        }, O.pick = function (t, e, n) {
          var r,
              i,
              s = {},
              o = t;
          if (null == o) return s;
          O.isFunction(e) ? (i = O.allKeys(o), r = S(e, n)) : (i = k(arguments, !1, !1, 1), r = function r(t, e, n) {
            return e in n;
          }, o = Object(o));

          for (var a = 0, u = i.length; a < u; a++) {
            var c = i[a],
                l = o[c];
            r(l, c, o) && (s[c] = l);
          }

          return s;
        }, O.omit = function (t, e, n) {
          if (O.isFunction(e)) e = O.negate(e);else {
            var r = O.map(k(arguments, !1, !1, 1), String);

            e = function e(t, _e) {
              return !O.contains(r, _e);
            };
          }
          return O.pick(t, e, n);
        }, O.defaults = E(O.allKeys, !0), O.create = function (t, e) {
          var n = T(t);
          return e && O.extendOwn(n, e), n;
        }, O.clone = function (t) {
          return O.isObject(t) ? O.isArray(t) ? t.slice() : O.extend({}, t) : t;
        }, O.tap = function (t, e) {
          return e(t), t;
        }, O.isMatch = function (t, e) {
          var n = O.keys(e),
              r = n.length;
          if (null == t) return !r;

          for (var i = Object(t), s = 0; s < r; s++) {
            var o = n[s];
            if (e[o] !== i[o] || !(o in i)) return !1;
          }

          return !0;
        };

        var D = function D(t, e, n, r) {
          if (t === e) return 0 !== t || 1 / t == 1 / e;
          if (null == t || null == e) return t === e;
          t instanceof O && (t = t._wrapped), e instanceof O && (e = e._wrapped);

          var i = _.call(t);

          if (i !== _.call(e)) return !1;

          switch (i) {
            case "[object RegExp]":
            case "[object String]":
              return "" + t == "" + e;

            case "[object Number]":
              return +t != +t ? +e != +e : 0 == +t ? 1 / +t == 1 / e : +t == +e;

            case "[object Date]":
            case "[object Boolean]":
              return +t == +e;
          }

          var s = "[object Array]" === i;

          if (!s) {
            if ("object" != _typeof(t) || "object" != _typeof(e)) return !1;
            var o = t.constructor,
                a = e.constructor;
            if (o !== a && !(O.isFunction(o) && o instanceof o && O.isFunction(a) && a instanceof a) && "constructor" in t && "constructor" in e) return !1;
          }

          n = n || [], r = r || [];

          for (var u = n.length; u--;) {
            if (n[u] === t) return r[u] === e;
          }

          if (n.push(t), r.push(e), s) {
            if ((u = t.length) !== e.length) return !1;

            for (; u--;) {
              if (!D(t[u], e[u], n, r)) return !1;
            }
          } else {
            var c,
                l = O.keys(t);
            if (u = l.length, O.keys(e).length !== u) return !1;

            for (; u--;) {
              if (c = l[u], !O.has(e, c) || !D(t[c], e[c], n, r)) return !1;
            }
          }

          return n.pop(), r.pop(), !0;
        };

        O.isEqual = function (t, e) {
          return D(t, e);
        }, O.isEmpty = function (t) {
          return null == t || (x(t) && (O.isArray(t) || O.isString(t) || O.isArguments(t)) ? 0 === t.length : 0 === O.keys(t).length);
        }, O.isElement = function (t) {
          return !(!t || 1 !== t.nodeType);
        }, O.isArray = m || function (t) {
          return "[object Array]" === _.call(t);
        }, O.isObject = function (t) {
          var e = _typeof(t);

          return "function" === e || "object" === e && !!t;
        }, O.each(["Arguments", "Function", "String", "Number", "Date", "RegExp", "Error"], function (t) {
          O["is" + t] = function (e) {
            return _.call(e) === "[object " + t + "]";
          };
        }), O.isArguments(arguments) || (O.isArguments = function (t) {
          return O.has(t, "callee");
        }), "function" != typeof /./ && "object" != (typeof Int8Array === "undefined" ? "undefined" : _typeof(Int8Array)) && (O.isFunction = function (t) {
          return "function" == typeof t || !1;
        }), O.isFinite = function (t) {
          return isFinite(t) && !isNaN(parseFloat(t));
        }, O.isNaN = function (t) {
          return O.isNumber(t) && t !== +t;
        }, O.isBoolean = function (t) {
          return !0 === t || !1 === t || "[object Boolean]" === _.call(t);
        }, O.isNull = function (t) {
          return null === t;
        }, O.isUndefined = function (t) {
          return void 0 === t;
        }, O.has = function (t, e) {
          return null != t && v.call(t, e);
        }, O.noConflict = function () {
          return u._ = c, this;
        }, O.identity = function (t) {
          return t;
        }, O.constant = function (t) {
          return function () {
            return t;
          };
        }, O.noop = function () {}, O.property = N, O.propertyOf = function (t) {
          return null == t ? function () {} : function (e) {
            return t[e];
          };
        }, O.matcher = O.matches = function (t) {
          return t = O.extendOwn({}, t), function (e) {
            return O.isMatch(e, t);
          };
        }, O.times = function (t, e, n) {
          var r = Array(Math.max(0, t));
          e = S(e, n, 1);

          for (var i = 0; i < t; i++) {
            r[i] = e(i);
          }

          return r;
        }, O.random = function (t, e) {
          return null == e && (e = t, t = 0), t + Math.floor(Math.random() * (e - t + 1));
        }, O.now = Date.now || function () {
          return new Date().getTime();
        };

        var L = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#x27;",
          "`": "&#x60;"
        },
            q = O.invert(L),
            M = function M(t) {
          var e = function e(_e2) {
            return t[_e2];
          },
              n = "(?:" + O.keys(t).join("|") + ")",
              r = RegExp(n),
              i = RegExp(n, "g");

          return function (t) {
            return t = null == t ? "" : "" + t, r.test(t) ? t.replace(i, e) : t;
          };
        };

        O.escape = M(L), O.unescape = M(q), O.result = function (t, e, n) {
          var r = null == t ? void 0 : t[e];
          return void 0 === r && (r = n), O.isFunction(r) ? r.call(t) : r;
        };
        var F = 0;
        O.uniqueId = function (t) {
          var e = ++F + "";
          return t ? t + e : e;
        }, O.templateSettings = {
          evaluate: /<%([\s\S]+?)%>/g,
          interpolate: /<%=([\s\S]+?)%>/g,
          escape: /<%-([\s\S]+?)%>/g
        };

        var J = /(.)^/,
            B = {
          "'": "'",
          "\\": "\\",
          "\r": "r",
          "\n": "n",
          "\u2028": "u2028",
          "\u2029": "u2029"
        },
            Q = /\\|'|\r|\n|\u2028|\u2029/g,
            V = function V(t) {
          return "\\" + B[t];
        };

        O.template = function (t, e, n) {
          !e && n && (e = n), e = O.defaults({}, e, O.templateSettings);
          var r = RegExp([(e.escape || J).source, (e.interpolate || J).source, (e.evaluate || J).source].join("|") + "|$", "g"),
              i = 0,
              s = "__p+='";
          t.replace(r, function (e, n, r, o, a) {
            return s += t.slice(i, a).replace(Q, V), i = a + e.length, n ? s += "'+\n((__t=(" + n + "))==null?'':_.escape(__t))+\n'" : r ? s += "'+\n((__t=(" + r + "))==null?'':__t)+\n'" : o && (s += "';\n" + o + "\n__p+='"), e;
          }), s += "';\n", e.variable || (s = "with(obj||{}){\n" + s + "}\n"), s = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + s + "return __p;\n";

          try {
            var o = new Function(e.variable || "obj", "_", s);
          } catch (t) {
            throw t.source = s, t;
          }

          var a = function a(t) {
            return o.call(this, t, O);
          };

          return a.source = "function(" + (e.variable || "obj") + "){\n" + s + "}", a;
        }, O.chain = function (t) {
          var e = O(t);
          return e._chain = !0, e;
        };

        var W = function W(t, e) {
          return t._chain ? O(e).chain() : e;
        };

        O.mixin = function (t) {
          O.each(O.functions(t), function (e) {
            var n = O[e] = t[e];

            O.prototype[e] = function () {
              var t = [this._wrapped];
              return d.apply(t, arguments), W(this, n.apply(O, t));
            };
          });
        }, O.mixin(O), O.each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (t) {
          var e = l[t];

          O.prototype[t] = function () {
            var n = this._wrapped;
            return e.apply(n, arguments), "shift" !== t && "splice" !== t || 0 !== n.length || delete n[0], W(this, n);
          };
        }), O.each(["concat", "join", "slice"], function (t) {
          var e = l[t];

          O.prototype[t] = function () {
            return W(this, e.apply(this._wrapped, arguments));
          };
        }), O.prototype.value = function () {
          return this._wrapped;
        }, O.prototype.valueOf = O.prototype.toJSON = O.prototype.value, O.prototype.toString = function () {
          return "" + this._wrapped;
        }, r = [], void 0 !== (i = function () {
          return O;
        }.apply(e, r)) && (t.exports = i);
      }).call(this);
    }, function (t, e, n) {
      "use strict";

      var r = (n(0), n(46).Promise);
      r._continueWhile = function (t, e) {
        return t() ? e().then(function () {
          return r._continueWhile(t, e);
        }) : r.resolve();
      }, t.exports = r;
    }, function (t, e, n) {
      "use strict";

      var r = n(50),
          i = n(0),
          s = i.extend,
          o = n(1),
          a = n(4),
          u = n(5),
          c = n(3),
          l = c.getSessionToken,
          h = c.ajax,
          f = function f(t, e) {
        var n = new Date().getTime(),
            i = r(n + t);
        return e ? i + "," + n + ",master" : i + "," + n;
      },
          d = function d(t, e) {
        e ? t["X-LC-Sign"] = f(u.applicationKey) : t["X-LC-Key"] = u.applicationKey;
      },
          p = function p() {
        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
            e = arguments[1],
            n = {
          "X-LC-Id": u.applicationId,
          "Content-Type": "application/json;charset=UTF-8"
        },
            r = !1;
        return "boolean" == typeof t.useMasterKey ? r = t.useMasterKey : "boolean" == typeof u._config.useMasterKey && (r = u._config.useMasterKey), r ? u.masterKey ? e ? n["X-LC-Sign"] = f(u.masterKey, !0) : n["X-LC-Key"] = u.masterKey + ",master" : (console.warn("masterKey is not set, fall back to use appKey"), d(n, e)) : d(n, e), u.hookKey && (n["X-LC-Hook-Key"] = u.hookKey), null !== u._config.production && (n["X-LC-Prod"] = String(u._config.production)), n["X-LC-UA"] = u._sharedConfig.userAgent, o.resolve().then(function () {
          var e = l(t);
          if (e) n["X-LC-Session"] = e;else if (!u._config.disableCurrentUser) return u.User.currentAsync().then(function (t) {
            return t && t._sessionToken && (n["X-LC-Session"] = t._sessionToken), n;
          });
          return n;
        });
      },
          _ = function _(t) {
        var e = t.service,
            n = void 0 === e ? "api" : e,
            r = t.version,
            i = void 0 === r ? "1.1" : r,
            s = t.path,
            o = u._config.serverURLs[n];
        if (!o) throw new Error("undefined server URL for " + n);
        return "/" !== o.charAt(o.length - 1) && (o += "/"), o += i, s && (o += s), o;
      },
          v = function v(t) {
        return new o(function (e, n) {
          var r = {
            code: t.code || -1,
            error: t.message || t.responseText
          };
          if (t.response && t.response.code) r = t.response;else if (t.responseText) try {
            r = JSON.parse(t.responseText);
          } catch (t) {}
          n(new a(r.code, r.error));
        });
      },
          m = function m(t) {
        var e = t.service,
            n = t.version,
            r = t.method,
            i = t.path,
            s = t.query,
            o = t.data,
            a = void 0 === o ? {} : o,
            c = t.authOptions,
            l = t.signKey,
            f = void 0 === l || l;
        if (!u.applicationId || !u.applicationKey && !u.masterKey) throw new Error("Not initialized");

        u._appRouter.refresh();

        var d = _({
          service: e,
          path: i,
          version: n
        });

        return p(c, f).then(function (t) {
          return h({
            method: r,
            url: d,
            query: s,
            data: a,
            headers: t
          })["catch"](v);
        });
      },
          y = function y(t, e, n, r) {
        var i = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : {},
            o = arguments[5],
            a = arguments[6],
            u = "";
        if (t && (u += "/" + t), e && (u += "/" + e), n && (u += "/" + n), i && i._fetchWhenSave) throw new Error("_fetchWhenSave should be in the query");
        if (i && i._where) throw new Error("_where should be in the query");
        return r && "get" === r.toLowerCase() && (a = s({}, a, i), i = null), m({
          method: r,
          path: u,
          query: a,
          data: i,
          authOptions: o
        });
      };

      u.request = m, t.exports = {
        _request: y,
        request: m
      };
    }, function (t, e, n) {
      "use strict";

      function r(t) {
        var e = new RegExp("^([0-9]{1,4})-([0-9]{1,2})-([0-9]{1,2})T([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})(.([0-9]+))?Z$"),
            n = e.exec(t);
        if (!n) return null;
        var r = n[1] || 0,
            i = (n[2] || 1) - 1,
            s = n[3] || 0,
            o = n[4] || 0,
            a = n[5] || 0,
            u = n[6] || 0,
            c = n[8] || 0;
        return new Date(Date.UTC(r, i, s, o, a, u, c));
      }

      var i = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (t) {
        return _typeof(t);
      } : function (t) {
        return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : _typeof(t);
      },
          s = n(0),
          o = n(7),
          a = n(6)("leancloud:request"),
          u = n(1),
          c = 0,
          l = function l(t) {
        var e = t.method,
            n = t.url,
            r = t.query,
            s = t.data,
            l = t.headers,
            h = void 0 === l ? {} : l,
            f = t.onprogress,
            d = c++;
        a("request(" + d + ")", e, n, r, s, h);
        var p = {};
        if (r) for (var _ in r) {
          "object" === i(r[_]) ? p[_] = JSON.stringify(r[_]) : p[_] = r[_];
        }
        return new u(function (t, r) {
          var i = o(e, n).set(h).query(p).send(s);
          f && i.on("progress", f), i.end(function (e, n) {
            return n && a("response(" + d + ")", n.status, n.body || n.text, n.header), e ? (n && (e.statusCode = n.status, e.responseText = n.text, e.response = n.body), r(e)) : t(n.body);
          });
        });
      },
          h = function h(t) {
        return s.isNull(t) || s.isUndefined(t);
      },
          f = function f(t) {
        return s.isArray(t) ? t : void 0 === t || null === t ? [] : [t];
      },
          d = function d() {
        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
            e = t.keys,
            n = t.include,
            r = t.includeACL,
            i = {};
        return e && (i.keys = f(e).join(",")), n && (i.include = f(n).join(",")), r && (i.returnACL = r), i;
      },
          p = function p(t) {
        return t.sessionToken ? t.sessionToken : t.user && "function" == typeof t.user.getSessionToken ? t.user.getSessionToken() : void 0;
      },
          _ = function _(t) {
        return function (e) {
          return t(e), e;
        };
      },
          v = function v() {},
          m = function m(t, e, n) {
        var r;
        return r = e && e.hasOwnProperty("constructor") ? e.constructor : function () {
          t.apply(this, arguments);
        }, s.extend(r, t), v.prototype = t.prototype, r.prototype = new v(), e && s.extend(r.prototype, e), n && s.extend(r, n), r.prototype.constructor = r, r.__super__ = t.prototype, r;
      };

      t.exports = {
        ajax: l,
        isNullOrUndefined: h,
        ensureArray: f,
        transformFetchOptions: d,
        getSessionToken: p,
        tap: _,
        inherits: m,
        parseDate: r
      };
    }, function (t, e, n) {
      "use strict";

      function r(t, e) {
        var n = new Error(e);
        return n.code = t, n;
      }

      n(0).extend(r, {
        OTHER_CAUSE: -1,
        INTERNAL_SERVER_ERROR: 1,
        CONNECTION_FAILED: 100,
        OBJECT_NOT_FOUND: 101,
        INVALID_QUERY: 102,
        INVALID_CLASS_NAME: 103,
        MISSING_OBJECT_ID: 104,
        INVALID_KEY_NAME: 105,
        INVALID_POINTER: 106,
        INVALID_JSON: 107,
        COMMAND_UNAVAILABLE: 108,
        NOT_INITIALIZED: 109,
        INCORRECT_TYPE: 111,
        INVALID_CHANNEL_NAME: 112,
        PUSH_MISCONFIGURED: 115,
        OBJECT_TOO_LARGE: 116,
        OPERATION_FORBIDDEN: 119,
        CACHE_MISS: 120,
        INVALID_NESTED_KEY: 121,
        INVALID_FILE_NAME: 122,
        INVALID_ACL: 123,
        TIMEOUT: 124,
        INVALID_EMAIL_ADDRESS: 125,
        MISSING_CONTENT_TYPE: 126,
        MISSING_CONTENT_LENGTH: 127,
        INVALID_CONTENT_LENGTH: 128,
        FILE_TOO_LARGE: 129,
        FILE_SAVE_ERROR: 130,
        FILE_DELETE_ERROR: 153,
        DUPLICATE_VALUE: 137,
        INVALID_ROLE_NAME: 139,
        EXCEEDED_QUOTA: 140,
        SCRIPT_FAILED: 141,
        VALIDATION_ERROR: 142,
        INVALID_IMAGE_DATA: 150,
        UNSAVED_FILE_ERROR: 151,
        INVALID_PUSH_TIME_ERROR: 152,
        USERNAME_MISSING: 200,
        PASSWORD_MISSING: 201,
        USERNAME_TAKEN: 202,
        EMAIL_TAKEN: 203,
        EMAIL_MISSING: 204,
        EMAIL_NOT_FOUND: 205,
        SESSION_MISSING: 206,
        MUST_CREATE_USER_THROUGH_SIGNUP: 207,
        ACCOUNT_ALREADY_LINKED: 208,
        LINKED_ID_MISSING: 250,
        INVALID_LINKED_SESSION: 251,
        UNSUPPORTED_SERVICE: 252,
        X_DOMAIN_REQUEST: 602
      }), t.exports = r;
    }, function (t, e, n) {
      "use strict";

      (function (e) {
        var r = n(0),
            i = n(37),
            s = n(3),
            o = s.inherits,
            a = s.parseDate,
            u = e.AV || {};
        u._config = {
          serverURLs: {},
          useMasterKey: !1,
          production: null,
          realtime: null
        }, u._sharedConfig = {
          userAgent: i,
          liveQueryRealtime: null
        }, u._getAVPath = function (t) {
          if (!u.applicationId) throw new Error("You need to call AV.initialize before using AV.");
          if (t || (t = ""), !r.isString(t)) throw new Error("Tried to get a localStorage path that wasn't a String.");
          return "/" === t[0] && (t = t.substring(1)), "AV/" + u.applicationId + "/" + t;
        };

        var c = function c() {
          return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
        },
            l = function l() {
          return "" + c() + c() + "-" + c() + "-" + c() + "-" + c() + "-" + c() + c() + c();
        };

        u._installationId = null, u._getInstallationId = function () {
          if (u._installationId) return u.Promise.resolve(u._installationId);

          var t = u._getAVPath("installationId");

          return u.localStorage.getItemAsync(t).then(function (e) {
            return u._installationId = e, u._installationId ? e : (u._installationId = e = l(), u.localStorage.setItemAsync(t, e).then(function () {
              return e;
            }));
          });
        }, u._subscriptionId = null, u._refreshSubscriptionId = function () {
          var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : u._getAVPath("subscriptionId"),
              e = u._subscriptionId = l();
          return u.localStorage.setItemAsync(t, e).then(function () {
            return e;
          });
        }, u._getSubscriptionId = function () {
          if (u._subscriptionId) return u.Promise.resolve(u._subscriptionId);

          var t = u._getAVPath("subscriptionId");

          return u.localStorage.getItemAsync(t).then(function (e) {
            return u._subscriptionId = e, u._subscriptionId || (e = u._refreshSubscriptionId(t)), e;
          });
        }, u._parseDate = a, u._extend = function (t, e) {
          var n = o(this, t, e);
          return n.extend = this.extend, n;
        }, u._encode = function (t, e, n) {
          var i = !(arguments.length > 3 && void 0 !== arguments[3]) || arguments[3];

          if (t instanceof u.Object) {
            if (n) throw new Error("AV.Objects not allowed here");
            return e && !r.include(e, t) && t._hasData ? t._toFullJSON(e.concat(t), i) : t._toPointer();
          }

          if (t instanceof u.ACL) return t.toJSON();
          if (r.isDate(t)) return i ? {
            __type: "Date",
            iso: t.toJSON()
          } : t.toJSON();
          if (t instanceof u.GeoPoint) return t.toJSON();
          if (r.isArray(t)) return r.map(t, function (t) {
            return u._encode(t, e, n, i);
          });
          if (r.isRegExp(t)) return t.source;
          if (t instanceof u.Relation) return t.toJSON();
          if (t instanceof u.Op) return t.toJSON();

          if (t instanceof u.File) {
            if (!t.url() && !t.id) throw new Error("Tried to save an object containing an unsaved file.");
            return t._toFullJSON(e, i);
          }

          return r.isObject(t) ? r.mapObject(t, function (t, r) {
            return u._encode(t, e, n, i);
          }) : t;
        }, u._decode = function (t, e) {
          if (!r.isObject(t) || r.isDate(t)) return t;
          if (r.isArray(t)) return r.map(t, function (t) {
            return u._decode(t);
          });
          if (t instanceof u.Object) return t;
          if (t instanceof u.File) return t;
          if (t instanceof u.Op) return t;
          if (t instanceof u.GeoPoint) return t;
          if (t instanceof u.ACL) return t;
          if ("ACL" === e) return new u.ACL(t);
          if (t.__op) return u.Op._decode(t);
          var n;

          if ("Pointer" === t.__type) {
            n = t.className;

            var i = u.Object._create(n);

            if (Object.keys(t).length > 3) {
              var s = r.clone(t);
              delete s.__type, delete s.className, i._finishFetch(s, !0);
            } else i._finishFetch({
              objectId: t.objectId
            }, !1);

            return i;
          }

          if ("Object" === t.__type) {
            n = t.className;
            var o = r.clone(t);
            delete o.__type, delete o.className;

            var a = u.Object._create(n);

            return a._finishFetch(o, !0), a;
          }

          if ("Date" === t.__type) return u._parseDate(t.iso);
          if ("GeoPoint" === t.__type) return new u.GeoPoint({
            latitude: t.latitude,
            longitude: t.longitude
          });

          if ("Relation" === t.__type) {
            if (!e) throw new Error("key missing decoding a Relation");
            var c = new u.Relation(null, e);
            return c.targetClassName = t.className, c;
          }

          if ("File" === t.__type) {
            var l = new u.File(t.name),
                h = r.clone(t);
            return delete h.__type, l._finishFetch(h), l;
          }

          return r.mapObject(t, u._decode);
        }, u.parseJSON = u._decode, u._encodeObjectOrArray = function (t) {
          var e = function e(t) {
            return t && t._toFullJSON && (t = t._toFullJSON([])), r.mapObject(t, function (t) {
              return u._encode(t, []);
            });
          };

          return r.isArray(t) ? t.map(function (t) {
            return e(t);
          }) : e(t);
        }, u._arrayEach = r.each, u._traverse = function (t, e, n) {
          if (t instanceof u.Object) {
            if (n = n || [], r.indexOf(n, t) >= 0) return;
            return n.push(t), u._traverse(t.attributes, e, n), e(t);
          }

          return t instanceof u.Relation || t instanceof u.File ? e(t) : r.isArray(t) ? (r.each(t, function (r, i) {
            var s = u._traverse(r, e, n);

            s && (t[i] = s);
          }), e(t)) : r.isObject(t) ? (u._each(t, function (r, i) {
            var s = u._traverse(r, e, n);

            s && (t[i] = s);
          }), e(t)) : e(t);
        }, u._objectEach = u._each = function (t, e) {
          r.isObject(t) ? r.each(r.keys(t), function (n) {
            e(t[n], n);
          }) : r.each(t, e);
        }, t.exports = u;
      }).call(e, n(9));
    }, function (t, e, n) {
      function r() {
        return !("undefined" == typeof window || !window.process || "renderer" !== window.process.type) || "undefined" != typeof document && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || "undefined" != typeof window && window.console && (window.console.firebug || window.console.exception && window.console.table) || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
      }

      function i(t) {
        var n = this.useColors;

        if (t[0] = (n ? "%c" : "") + this.namespace + (n ? " %c" : " ") + t[0] + (n ? "%c " : " ") + "+" + e.humanize(this.diff), n) {
          var r = "color: " + this.color;
          t.splice(1, 0, r, "color: inherit");
          var i = 0,
              s = 0;
          t[0].replace(/%[a-zA-Z%]/g, function (t) {
            "%%" !== t && (i++, "%c" === t && (s = i));
          }), t.splice(s, 0, r);
        }
      }

      function s() {
        return "object" == (typeof console === "undefined" ? "undefined" : _typeof(console)) && console.log && Function.prototype.apply.call(console.log, console, arguments);
      }

      function o(t) {
        try {
          null == t ? e.storage.removeItem("debug") : e.storage.debug = t;
        } catch (t) {}
      }

      function a() {
        var t;

        try {
          t = e.storage.debug;
        } catch (t) {}

        return !t && "undefined" != typeof process && "env" in process && (t = process.env.DEBUG), t;
      }

      e = t.exports = n(45), e.log = s, e.formatArgs = i, e.save = o, e.load = a, e.useColors = r, e.storage = "undefined" != typeof chrome && void 0 !== chrome.storage ? chrome.storage.local : function () {
        try {
          return window.localStorage;
        } catch (t) {}
      }(), e.colors = ["lightseagreen", "forestgreen", "goldenrod", "dodgerblue", "darkorchid", "crimson"], e.formatters.j = function (t) {
        try {
          return JSON.stringify(t);
        } catch (t) {
          return "[UnexpectedJSONParseError]: " + t.message;
        }
      }, e.enable(a());
    }, function (t, e, n) {
      function r() {}

      function i(t) {
        if (!_(t)) return t;
        var e = [];

        for (var n in t) {
          s(e, n, t[n]);
        }

        return e.join("&");
      }

      function s(t, e, n) {
        if (null != n) {
          if (Array.isArray(n)) n.forEach(function (n) {
            s(t, e, n);
          });else if (_(n)) for (var r in n) {
            s(t, e + "[" + r + "]", n[r]);
          } else t.push(encodeURIComponent(e) + "=" + encodeURIComponent(n));
        } else null === n && t.push(encodeURIComponent(e));
      }

      function o(t) {
        for (var e, n, r = {}, i = t.split("&"), s = 0, o = i.length; s < o; ++s) {
          e = i[s], n = e.indexOf("="), -1 == n ? r[decodeURIComponent(e)] = "" : r[decodeURIComponent(e.slice(0, n))] = decodeURIComponent(e.slice(n + 1));
        }

        return r;
      }

      function a(t) {
        var e,
            n,
            r,
            i,
            s = t.split(/\r?\n/),
            o = {};
        s.pop();

        for (var a = 0, u = s.length; a < u; ++a) {
          n = s[a], e = n.indexOf(":"), r = n.slice(0, e).toLowerCase(), i = b(n.slice(e + 1)), o[r] = i;
        }

        return o;
      }

      function u(t) {
        return /[\/+]json\b/.test(t);
      }

      function c(t) {
        this.req = t, this.xhr = this.req.xhr, this.text = "HEAD" != this.req.method && ("" === this.xhr.responseType || "text" === this.xhr.responseType) || void 0 === this.xhr.responseType ? this.xhr.responseText : null, this.statusText = this.req.xhr.statusText;
        var e = this.xhr.status;
        1223 === e && (e = 204), this._setStatusProperties(e), this.header = this.headers = a(this.xhr.getAllResponseHeaders()), this.header["content-type"] = this.xhr.getResponseHeader("content-type"), this._setHeaderProperties(this.header), null === this.text && t._responseType ? this.body = this.xhr.response : this.body = "HEAD" != this.req.method ? this._parseBody(this.text ? this.text : this.xhr.response) : null;
      }

      function l(t, e) {
        var n = this;
        this._query = this._query || [], this.method = t, this.url = e, this.header = {}, this._header = {}, this.on("end", function () {
          var t = null,
              e = null;

          try {
            e = new c(n);
          } catch (e) {
            return t = new Error("Parser is unable to parse the response"), t.parse = !0, t.original = e, n.xhr ? (t.rawResponse = void 0 === n.xhr.responseType ? n.xhr.responseText : n.xhr.response, t.status = n.xhr.status ? n.xhr.status : null, t.statusCode = t.status) : (t.rawResponse = null, t.status = null), n.callback(t);
          }

          n.emit("response", e);
          var r;

          try {
            n._isResponseOK(e) || (r = new Error(e.statusText || "Unsuccessful HTTP response"), r.original = t, r.response = e, r.status = e.status);
          } catch (t) {
            r = t;
          }

          r ? n.callback(r, e) : n.callback(null, e);
        });
      }

      function h(t, e, n) {
        var r = g("DELETE", t);
        return "function" == typeof e && (n = e, e = null), e && r.send(e), n && r.end(n), r;
      }

      var f;
      "undefined" != typeof window ? f = window : "undefined" != typeof self ? f = self : (console.warn("Using browser-only version of superagent in non-browser environment"), f = this);

      var d = n(43),
          p = n(53),
          _ = n(8),
          v = n(52),
          m = n(54),
          y = n(55),
          g = e = t.exports = function (t, n) {
        return "function" == typeof n ? new e.Request("GET", t).end(n) : 1 == arguments.length ? new e.Request("GET", t) : new e.Request(t, n);
      };

      e.Request = l, g.getXHR = function () {
        if (!(!f.XMLHttpRequest || f.location && "file:" == f.location.protocol && f.ActiveXObject)) return new XMLHttpRequest();

        try {
          return new ActiveXObject("Microsoft.XMLHTTP");
        } catch (t) {}

        try {
          return new ActiveXObject("Msxml2.XMLHTTP.6.0");
        } catch (t) {}

        try {
          return new ActiveXObject("Msxml2.XMLHTTP.3.0");
        } catch (t) {}

        try {
          return new ActiveXObject("Msxml2.XMLHTTP");
        } catch (t) {}

        throw Error("Browser-only verison of superagent could not find XHR");
      };
      var b = "".trim ? function (t) {
        return t.trim();
      } : function (t) {
        return t.replace(/(^\s*|\s*$)/g, "");
      };
      g.serializeObject = i, g.parseString = o, g.types = {
        html: "text/html",
        json: "application/json",
        xml: "application/xml",
        urlencoded: "application/x-www-form-urlencoded",
        form: "application/x-www-form-urlencoded",
        "form-data": "application/x-www-form-urlencoded"
      }, g.serialize = {
        "application/x-www-form-urlencoded": i,
        "application/json": JSON.stringify
      }, g.parse = {
        "application/x-www-form-urlencoded": o,
        "application/json": JSON.parse
      }, m(c.prototype), c.prototype._parseBody = function (t) {
        var e = g.parse[this.type];
        return this.req._parser ? this.req._parser(this, t) : (!e && u(this.type) && (e = g.parse["application/json"]), e && t && (t.length || t instanceof Object) ? e(t) : null);
      }, c.prototype.toError = function () {
        var t = this.req,
            e = t.method,
            n = t.url,
            r = "cannot " + e + " " + n + " (" + this.status + ")",
            i = new Error(r);
        return i.status = this.status, i.method = e, i.url = n, i;
      }, g.Response = c, d(l.prototype), p(l.prototype), l.prototype.type = function (t) {
        return this.set("Content-Type", g.types[t] || t), this;
      }, l.prototype.accept = function (t) {
        return this.set("Accept", g.types[t] || t), this;
      }, l.prototype.auth = function (t, e, n) {
        switch ("object" == _typeof(e) && null !== e && (n = e), n || (n = {
          type: "function" == typeof btoa ? "basic" : "auto"
        }), n.type) {
          case "basic":
            this.set("Authorization", "Basic " + btoa(t + ":" + e));
            break;

          case "auto":
            this.username = t, this.password = e;
            break;

          case "bearer":
            this.set("Authorization", "Bearer " + t);
        }

        return this;
      }, l.prototype.query = function (t) {
        return "string" != typeof t && (t = i(t)), t && this._query.push(t), this;
      }, l.prototype.attach = function (t, e, n) {
        if (e) {
          if (this._data) throw Error("superagent can't mix .send() and .attach()");

          this._getFormData().append(t, e, n || e.name);
        }

        return this;
      }, l.prototype._getFormData = function () {
        return this._formData || (this._formData = new f.FormData()), this._formData;
      }, l.prototype.callback = function (t, e) {
        if (this._maxRetries && this._retries++ < this._maxRetries && y(t, e)) return this._retry();
        var n = this._callback;
        this.clearTimeout(), t && (this._maxRetries && (t.retries = this._retries - 1), this.emit("error", t)), n(t, e);
      }, l.prototype.crossDomainError = function () {
        var t = new Error("Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.");
        t.crossDomain = !0, t.status = this.status, t.method = this.method, t.url = this.url, this.callback(t);
      }, l.prototype.buffer = l.prototype.ca = l.prototype.agent = function () {
        return console.warn("This is not supported in browser version of superagent"), this;
      }, l.prototype.pipe = l.prototype.write = function () {
        throw Error("Streaming is not supported in browser version of superagent");
      }, l.prototype._appendQueryString = function () {
        var t = this._query.join("&");

        if (t && (this.url += (this.url.indexOf("?") >= 0 ? "&" : "?") + t), this._sort) {
          var e = this.url.indexOf("?");

          if (e >= 0) {
            var n = this.url.substring(e + 1).split("&");
            v(this._sort) ? n.sort(this._sort) : n.sort(), this.url = this.url.substring(0, e) + "?" + n.join("&");
          }
        }
      }, l.prototype._isHost = function (t) {
        return t && "object" == _typeof(t) && !Array.isArray(t) && "[object Object]" !== Object.prototype.toString.call(t);
      }, l.prototype.end = function (t) {
        return this._endCalled && console.warn("Warning: .end() was called twice. This is not supported in superagent"), this._endCalled = !0, this._callback = t || r, this._appendQueryString(), this._end();
      }, l.prototype._end = function () {
        var t = this,
            e = this.xhr = g.getXHR(),
            n = this._formData || this._data;
        this._setTimeouts(), e.onreadystatechange = function () {
          var n = e.readyState;

          if (n >= 2 && t._responseTimeoutTimer && clearTimeout(t._responseTimeoutTimer), 4 == n) {
            var r;

            try {
              r = e.status;
            } catch (t) {
              r = 0;
            }

            if (!r) {
              if (t.timedout || t._aborted) return;
              return t.crossDomainError();
            }

            t.emit("end");
          }
        };

        var r = function r(e, n) {
          n.total > 0 && (n.percent = n.loaded / n.total * 100), n.direction = e, t.emit("progress", n);
        };

        if (this.hasListeners("progress")) try {
          e.onprogress = r.bind(null, "download"), e.upload && (e.upload.onprogress = r.bind(null, "upload"));
        } catch (t) {}

        try {
          this.username && this.password ? e.open(this.method, this.url, !0, this.username, this.password) : e.open(this.method, this.url, !0);
        } catch (t) {
          return this.callback(t);
        }

        if (this._withCredentials && (e.withCredentials = !0), !this._formData && "GET" != this.method && "HEAD" != this.method && "string" != typeof n && !this._isHost(n)) {
          var i = this._header["content-type"],
              s = this._serializer || g.serialize[i ? i.split(";")[0] : ""];
          !s && u(i) && (s = g.serialize["application/json"]), s && (n = s(n));
        }

        for (var o in this.header) {
          null != this.header[o] && this.header.hasOwnProperty(o) && e.setRequestHeader(o, this.header[o]);
        }

        return this._responseType && (e.responseType = this._responseType), this.emit("request", this), e.send(void 0 !== n ? n : null), this;
      }, g.get = function (t, e, n) {
        var r = g("GET", t);
        return "function" == typeof e && (n = e, e = null), e && r.query(e), n && r.end(n), r;
      }, g.head = function (t, e, n) {
        var r = g("HEAD", t);
        return "function" == typeof e && (n = e, e = null), e && r.send(e), n && r.end(n), r;
      }, g.options = function (t, e, n) {
        var r = g("OPTIONS", t);
        return "function" == typeof e && (n = e, e = null), e && r.send(e), n && r.end(n), r;
      }, g.del = h, g["delete"] = h, g.patch = function (t, e, n) {
        var r = g("PATCH", t);
        return "function" == typeof e && (n = e, e = null), e && r.send(e), n && r.end(n), r;
      }, g.post = function (t, e, n) {
        var r = g("POST", t);
        return "function" == typeof e && (n = e, e = null), e && r.send(e), n && r.end(n), r;
      }, g.put = function (t, e, n) {
        var r = g("PUT", t);
        return "function" == typeof e && (n = e, e = null), e && r.send(e), n && r.end(n), r;
      };
    }, function (t, e) {
      function n(t) {
        return null !== t && "object" == _typeof(t);
      }

      t.exports = n;
    }, function (t, e) {
      var n;

      n = function () {
        return this;
      }();

      try {
        n = n || Function("return this")() || (0, eval)("this");
      } catch (t) {
        "object" == (typeof window === "undefined" ? "undefined" : _typeof(window)) && (n = window);
      }

      t.exports = n;
    }, function (t, e, n) {
      "use strict";

      var r = n(11),
          i = n(5),
          s = e.removeAsync = r.removeItemAsync.bind(r),
          o = function o(t, e) {
        try {
          t = JSON.parse(t);
        } catch (t) {
          return null;
        }

        if (t) {
          return t.expiredAt && t.expiredAt < Date.now() ? s(e).then(function () {
            return null;
          }) : t.value;
        }

        return null;
      };

      e.getAsync = function (t) {
        return t = "AV/" + i.applicationId + "/" + t, r.getItemAsync(t).then(function (e) {
          return o(e, t);
        });
      }, e.setAsync = function (t, e, n) {
        var s = {
          value: e
        };
        return "number" == typeof n && (s.expiredAt = Date.now() + n), r.setItemAsync("AV/" + i.applicationId + "/" + t, JSON.stringify(s));
      };
    }, function (t, e, n) {
      "use strict";

      var r = n(0),
          i = n(1),
          s = n(41),
          o = ["getItem", "setItem", "removeItem", "clear"];
      s.async ? r(o).each(function (t) {
        "function" != typeof s[t] && (s[t] = function () {
          var e = new Error("Synchronous API [" + t + "] is not available in this runtime.");
          throw e.code = "SYNC_API_NOT_AVAILABLE", e;
        });
      }) : r(o).each(function (t) {
        "function" == typeof s[t] && (s[t + "Async"] = function () {
          return i.resolve(s[t].apply(s, arguments));
        });
      }), t.exports = s;
    }, function (t, e, n) {
      "use strict";

      t.exports = "3.0.4";
    }, function (t, e) {
      var n = {
        utf8: {
          stringToBytes: function stringToBytes(t) {
            return n.bin.stringToBytes(unescape(encodeURIComponent(t)));
          },
          bytesToString: function bytesToString(t) {
            return decodeURIComponent(escape(n.bin.bytesToString(t)));
          }
        },
        bin: {
          stringToBytes: function stringToBytes(t) {
            for (var e = [], n = 0; n < t.length; n++) {
              e.push(255 & t.charCodeAt(n));
            }

            return e;
          },
          bytesToString: function bytesToString(t) {
            for (var e = [], n = 0; n < t.length; n++) {
              e.push(String.fromCharCode(t[n]));
            }

            return e.join("");
          }
        }
      };
      t.exports = n;
    }, function (t, e, n) {
      "use strict";

      var r = n(0);

      t.exports = function (t) {
        t.ACL = function (e) {
          var n = this;
          if (n.permissionsById = {}, r.isObject(e)) if (e instanceof t.User) n.setReadAccess(e, !0), n.setWriteAccess(e, !0);else {
            if (r.isFunction(e)) throw new Error("AV.ACL() called with a function.  Did you forget ()?");

            t._objectEach(e, function (e, i) {
              if (!r.isString(i)) throw new Error("Tried to create an ACL with an invalid userId.");
              n.permissionsById[i] = {}, t._objectEach(e, function (t, e) {
                if ("read" !== e && "write" !== e) throw new Error("Tried to create an ACL with an invalid permission type.");
                if (!r.isBoolean(t)) throw new Error("Tried to create an ACL with an invalid permission value.");
                n.permissionsById[i][e] = t;
              });
            });
          }
        }, t.ACL.prototype.toJSON = function () {
          return r.clone(this.permissionsById);
        }, t.ACL.prototype._setAccess = function (e, n, i) {
          if (n instanceof t.User ? n = n.id : n instanceof t.Role && (n = "role:" + n.getName()), !r.isString(n)) throw new Error("userId must be a string.");
          if (!r.isBoolean(i)) throw new Error("allowed must be either true or false.");
          var s = this.permissionsById[n];

          if (!s) {
            if (!i) return;
            s = {}, this.permissionsById[n] = s;
          }

          i ? this.permissionsById[n][e] = !0 : (delete s[e], r.isEmpty(s) && delete this.permissionsById[n]);
        }, t.ACL.prototype._getAccess = function (e, n) {
          n instanceof t.User ? n = n.id : n instanceof t.Role && (n = "role:" + n.getName());
          var r = this.permissionsById[n];
          return !!r && !!r[e];
        }, t.ACL.prototype.setReadAccess = function (t, e) {
          this._setAccess("read", t, e);
        }, t.ACL.prototype.getReadAccess = function (t) {
          return this._getAccess("read", t);
        }, t.ACL.prototype.setWriteAccess = function (t, e) {
          this._setAccess("write", t, e);
        }, t.ACL.prototype.getWriteAccess = function (t) {
          return this._getAccess("write", t);
        }, t.ACL.prototype.setPublicReadAccess = function (t) {
          this.setReadAccess("*", t);
        }, t.ACL.prototype.getPublicReadAccess = function () {
          return this.getReadAccess("*");
        }, t.ACL.prototype.setPublicWriteAccess = function (t) {
          this.setWriteAccess("*", t);
        }, t.ACL.prototype.getPublicWriteAccess = function () {
          return this.getWriteAccess("*");
        }, t.ACL.prototype.getRoleReadAccess = function (e) {
          if (e instanceof t.Role && (e = e.getName()), r.isString(e)) return this.getReadAccess("role:" + e);
          throw new Error("role must be a AV.Role or a String");
        }, t.ACL.prototype.getRoleWriteAccess = function (e) {
          if (e instanceof t.Role && (e = e.getName()), r.isString(e)) return this.getWriteAccess("role:" + e);
          throw new Error("role must be a AV.Role or a String");
        }, t.ACL.prototype.setRoleReadAccess = function (e, n) {
          if (e instanceof t.Role && (e = e.getName()), r.isString(e)) return void this.setReadAccess("role:" + e, n);
          throw new Error("role must be a AV.Role or a String");
        }, t.ACL.prototype.setRoleWriteAccess = function (e, n) {
          if (e instanceof t.Role && (e = e.getName()), r.isString(e)) return void this.setWriteAccess("role:" + e, n);
          throw new Error("role must be a AV.Role or a String");
        };
      };
    }, function (t, e, n) {
      "use strict";

      var r = n(3),
          i = r.tap;

      t.exports = function (t) {
        t.Captcha = function (t, e) {
          this._options = t, this._authOptions = e, this.url = void 0, this.captchaToken = void 0, this.validateToken = void 0;
        }, t.Captcha.prototype.refresh = function () {
          var e = this;
          return t.Cloud._requestCaptcha(this._options, this._authOptions).then(function (t) {
            var n = t.captchaToken,
                r = t.url;
            return Object.assign(e, {
              captchaToken: n,
              url: r
            }), r;
          });
        }, t.Captcha.prototype.verify = function (e) {
          var n = this;
          return t.Cloud.verifyCaptcha(e, this.captchaToken).then(i(function (t) {
            return n.validateToken = t;
          }));
        }, t.Captcha.prototype.bind = function (t, e) {
          var n = this,
              r = t.textInput,
              i = t.image,
              s = t.verifyButton,
              o = e.success,
              a = e.error;
          if ("string" == typeof r && !(r = document.getElementById(r))) throw new Error("textInput with id " + r + " not found");
          if ("string" == typeof i && !(i = document.getElementById(i))) throw new Error("image with id " + i + " not found");
          if ("string" == typeof s && !(s = document.getElementById(s))) throw new Error("verifyButton with id " + s + " not found");
          this.__refresh = function () {
            return n.refresh().then(function (t) {
              i.src = t, r && (r.value = "", r.focus());
            })["catch"](function (t) {
              return console.warn("refresh captcha fail: " + t.message);
            });
          }, i && (this.__image = i, i.src = this.url, i.addEventListener("click", this.__refresh)), this.__verify = function () {
            var t = r.value;
            n.verify(t)["catch"](function (t) {
              throw n.__refresh(), t;
            }).then(o, a)["catch"](function (t) {
              return console.warn("verify captcha fail: " + t.message);
            });
          }, r && s && (this.__verifyButton = s, s.addEventListener("click", this.__verify));
        }, t.Captcha.prototype.unbind = function () {
          this.__image && this.__image.removeEventListener("click", this.__refresh), this.__verifyButton && this.__verifyButton.removeEventListener("click", this.__verify);
        }, t.Captcha.request = function (e, n) {
          var r = new t.Captcha(e, n);
          return r.refresh().then(function () {
            return r;
          });
        };
      };
    }, function (t, e, n) {
      "use strict";

      var r = n(0),
          i = n(2),
          s = i._request,
          o = i.request,
          a = n(1);

      t.exports = function (t) {
        t.Cloud = t.Cloud || {}, r.extend(t.Cloud, {
          run: function run(e, n, r) {
            return o({
              service: "engine",
              method: "POST",
              path: "/functions/" + e,
              data: t._encode(n, null, !0),
              authOptions: r
            }).then(function (e) {
              return t._decode(e).result;
            });
          },
          rpc: function rpc(e, n, i) {
            return r.isArray(n) ? a.reject(new Error("Can't pass Array as the param of rpc function in JavaScript SDK.")) : o({
              service: "engine",
              method: "POST",
              path: "/call/" + e,
              data: t._encodeObjectOrArray(n),
              authOptions: i
            }).then(function (e) {
              return t._decode(e).result;
            });
          },
          getServerDate: function getServerDate() {
            return s("date", null, null, "GET").then(function (e) {
              return t._decode(e);
            });
          },
          requestSmsCode: function requestSmsCode(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
            if (r.isString(t) && (t = {
              mobilePhoneNumber: t
            }), !t.mobilePhoneNumber) throw new Error("Missing mobilePhoneNumber.");
            return e.validateToken && (t = r.extend({}, t, {
              validate_token: e.validateToken
            })), s("requestSmsCode", null, null, "POST", t, e);
          },
          verifySmsCode: function verifySmsCode(t, e) {
            if (!t) throw new Error("Missing sms code.");
            var n = {};
            return r.isString(e) && (n.mobilePhoneNumber = e), s("verifySmsCode", t, null, "POST", n);
          },
          _requestCaptcha: function _requestCaptcha(t, e) {
            return s("requestCaptcha", null, null, "GET", t, e).then(function (t) {
              var e = t.captcha_url;
              return {
                captchaToken: t.captcha_token,
                url: e
              };
            });
          },
          requestCaptcha: t.Captcha.request,
          verifyCaptcha: function verifyCaptcha(t, e) {
            return s("verifyCaptcha", null, null, "POST", {
              captcha_code: t,
              captcha_token: e
            }).then(function (t) {
              return t.validate_token;
            });
          }
        });
      };
    }, function (t, e, n) {
      "use strict";

      var r = n(0),
          i = n(2),
          s = i._request,
          o = n(5);
      t.exports = o.Object.extend("_Conversation", {
        constructor: function constructor(t) {
          var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          o.Object.prototype.constructor.call(this, null, null), this.set("name", t), void 0 !== e.isSystem && this.set("sys", !!e.isSystem), void 0 !== e.isTransient && this.set("tr", !!e.isTransient);
        },
        getCreator: function getCreator() {
          return this.get("c");
        },
        getLastMessageAt: function getLastMessageAt() {
          return this.get("lm");
        },
        getMembers: function getMembers() {
          return this.get("m");
        },
        addMember: function addMember(t) {
          return this.add("m", t);
        },
        getMutedMembers: function getMutedMembers() {
          return this.get("mu");
        },
        getName: function getName() {
          return this.get("name");
        },
        isTransient: function isTransient() {
          return this.get("tr");
        },
        isSystem: function isSystem() {
          return this.get("sys");
        },
        send: function send(t, e) {
          var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
              r = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
          "function" == typeof e.toJSON && (e = e.toJSON()), "string" != typeof e && (e = JSON.stringify(e));
          var i = {
            from_peer: t,
            conv_id: this.id,
            "transient": !1,
            message: e
          };
          return void 0 !== n.toClients && (i.to_peers = n.toClients), void 0 !== n["transient"] && (i["transient"] = !!n["transient"]), void 0 !== n.pushData && (i.push_data = n.pushData), s("rtm", "messages", null, "POST", i, r);
        },
        broadcast: function broadcast(t, e) {
          var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
              i = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
          "function" == typeof e.toJSON && (e = e.toJSON()), "string" != typeof e && (e = JSON.stringify(e));
          var o = {
            from_peer: t,
            conv_id: this.id,
            message: e
          };

          if (void 0 !== n.pushData && (o.push = n.pushData), void 0 !== n.validTill) {
            var a = n.validTill;
            r.isDate(a) && (a = a.getTime()), n.valid_till = a;
          }

          return s("rtm", "broadcast", null, "POST", o, i);
        }
      });
    }, function (t, e, n) {
      "use strict";

      var r = n(0);

      t.exports = function (t) {
        var e = /\s+/,
            n = Array.prototype.slice;
        t.Events = {
          on: function on(t, n, r) {
            var i, s, o, a, u;
            if (!n) return this;

            for (t = t.split(e), i = this._callbacks || (this._callbacks = {}), s = t.shift(); s;) {
              u = i[s], o = u ? u.tail : {}, o.next = a = {}, o.context = r, o.callback = n, i[s] = {
                tail: a,
                next: u ? u.next : o
              }, s = t.shift();
            }

            return this;
          },
          off: function off(t, n, i) {
            var s, o, a, u, c, l;

            if (o = this._callbacks) {
              if (!(t || n || i)) return delete this._callbacks, this;

              for (t = t ? t.split(e) : r.keys(o), s = t.shift(); s;) {
                if (a = o[s], delete o[s], a && (n || i)) {
                  for (u = a.tail, a = a.next; a !== u;) {
                    c = a.callback, l = a.context, (n && c !== n || i && l !== i) && this.on(s, c, l), a = a.next;
                  }

                  s = t.shift();
                }
              }

              return this;
            }
          },
          trigger: function trigger(t) {
            var r, i, s, o, a, u, c;
            if (!(s = this._callbacks)) return this;

            for (u = s.all, t = t.split(e), c = n.call(arguments, 1), r = t.shift(); r;) {
              if (i = s[r]) for (o = i.tail; (i = i.next) !== o;) {
                i.callback.apply(i.context || this, c);
              }
              if (i = u) for (o = i.tail, a = [r].concat(c); (i = i.next) !== o;) {
                i.callback.apply(i.context || this, a);
              }
              r = t.shift();
            }

            return this;
          }
        }, t.Events.bind = t.Events.on, t.Events.unbind = t.Events.off;
      };
    }, function (t, e, n) {
      "use strict";

      var r = n(0),
          i = n(38),
          s = n(39),
          o = n(40),
          a = n(4),
          u = n(2)._request,
          c = n(1),
          l = n(3),
          h = l.tap,
          f = l.transformFetchOptions,
          d = n(6)("leancloud:file"),
          p = n(42);

      t.exports = function (t) {
        var e = function e() {
          return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
        },
            n = function n(t) {
          return t.match(/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/)[4];
        },
            l = function l(t) {
          if (t < 26) return String.fromCharCode(65 + t);
          if (t < 52) return String.fromCharCode(t - 26 + 97);
          if (t < 62) return String.fromCharCode(t - 52 + 48);
          if (62 === t) return "+";
          if (63 === t) return "/";
          throw new Error("Tried to encode large digit " + t + " in base64.");
        },
            _ = function _(t) {
          var e = [];
          return e.length = Math.ceil(t.length / 3), r.times(e.length, function (n) {
            var r = t[3 * n],
                i = t[3 * n + 1] || 0,
                s = t[3 * n + 2] || 0,
                o = 3 * n + 1 < t.length,
                a = 3 * n + 2 < t.length;
            e[n] = [l(r >> 2 & 63), l(r << 4 & 48 | i >> 4 & 15), o ? l(i << 2 & 60 | s >> 6 & 3) : "=", a ? l(63 & s) : "="].join("");
          }), e.join("");
        };

        t.File = function (e, i, s) {
          if (this.attributes = {
            name: e,
            url: "",
            metaData: {},
            base64: ""
          }, r.isString(i)) throw new TypeError("Creating an AV.File from a String is not yet supported.");
          r.isArray(i) && (this.attributes.metaData.size = i.length, i = {
            base64: _(i)
          }), this._extName = "", this._data = i, "undefined" != typeof Blob && i instanceof Blob && (i.size && (this.attributes.metaData.size = i.size), i.name && (this._extName = n(i.name)));
          var o = void 0;
          if (i && i.owner) o = i.owner;else if (!t._config.disableCurrentUser) try {
            o = t.User.current();
          } catch (t) {
            if ("SYNC_API_NOT_AVAILABLE" !== t.code) throw t;
            console.warn("Get current user failed. It seems this runtime use an async storage system, please create AV.File in the callback of AV.User.currentAsync().");
          }
          this.attributes.metaData.owner = o ? o.id : "unknown", this.set("mime_type", s);
        }, t.File.withURL = function (e, n, r, i) {
          if (!e || !n) throw new Error("Please provide file name and url");
          var s = new t.File(e, null, i);
          if (r) for (var o in r) {
            s.attributes.metaData[o] || (s.attributes.metaData[o] = r[o]);
          }
          return s.attributes.url = n, s.attributes.metaData.__source = "external", s;
        }, t.File.createWithoutData = function (e) {
          var n = new t.File();
          return n.id = e, n;
        }, r.extend(t.File.prototype, {
          className: "_File",
          _toFullJSON: function _toFullJSON(e) {
            var n = this,
                i = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1],
                s = r.clone(this.attributes);
            return t._objectEach(s, function (n, r) {
              s[r] = t._encode(n, e, void 0, i);
            }), t._objectEach(this._operations, function (t, e) {
              s[e] = t;
            }), r.has(this, "id") && (s.objectId = this.id), r(["createdAt", "updatedAt"]).each(function (t) {
              if (r.has(n, t)) {
                var e = n[t];
                s[t] = r.isDate(e) ? e.toJSON() : e;
              }
            }), i && (s.__type = "File"), s;
          },
          toFullJSON: function toFullJSON() {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
            return this._toFullJSON(t);
          },
          toJSON: function toJSON(t, e) {
            var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : [this];
            return this._toFullJSON(n, !1);
          },
          getACL: function getACL() {
            return this._acl;
          },
          setACL: function setACL(e) {
            if (!(e instanceof t.ACL)) return new a(a.OTHER_CAUSE, "ACL must be a AV.ACL.");
            this._acl = e;
          },
          name: function name() {
            return this.get("name");
          },
          url: function url() {
            return this.get("url");
          },
          get: function get(t) {
            switch (t) {
              case "objectId":
                return this.id;

              case "url":
              case "name":
              case "mime_type":
              case "metaData":
              case "createdAt":
              case "updatedAt":
                return this.attributes[t];

              default:
                return this.attributes.metaData[t];
            }
          },
          set: function set() {
            for (var t = this, e = function e(_e3, n) {
              switch (_e3) {
                case "name":
                case "url":
                case "mime_type":
                case "base64":
                case "metaData":
                  t.attributes[_e3] = n;
                  break;

                default:
                  t.attributes.metaData[_e3] = n;
              }
            }, n = arguments.length, r = Array(n), i = 0; i < n; i++) {
              r[i] = arguments[i];
            }

            switch (r.length) {
              case 1:
                for (var s in r[0]) {
                  e(s, r[0][s]);
                }

                break;

              case 2:
                e(r[0], r[1]);
            }
          },
          metaData: function metaData(t, e) {
            return t && e ? (this.attributes.metaData[t] = e, this) : t && !e ? this.attributes.metaData[t] : this.attributes.metaData;
          },
          thumbnailURL: function thumbnailURL(t, e, n, r, i) {
            var s = this.attributes.url;
            if (!s) throw new Error("Invalid url.");
            if (!t || !e || t <= 0 || e <= 0) throw new Error("Invalid width or height value.");
            if (n = n || 100, r = r || !0, n <= 0 || n > 100) throw new Error("Invalid quality value.");
            return i = i || "png", s + "?imageView/" + (r ? 2 : 1) + "/w/" + t + "/h/" + e + "/q/" + n + "/format/" + i;
          },
          size: function size() {
            return this.metaData().size;
          },
          ownerId: function ownerId() {
            return this.metaData().owner;
          },
          destroy: function destroy(t) {
            return this.id ? u("files", null, this.id, "DELETE", null, t) : c.reject(new Error("The file id is not eixsts."));
          },
          _fileToken: function _fileToken(t) {
            var r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "fileTokens",
                i = this.attributes.name,
                s = n(i);
            !s && this._extName && (i += this._extName, s = this._extName);
            var o = e() + e() + e() + e() + e() + s,
                a = {
              key: o,
              name: i,
              ACL: this._acl,
              mime_type: t,
              metaData: this.attributes.metaData
            };
            return this._qiniu_key = o, u(r, null, null, "POST", a);
          },
          save: function save(t) {
            var e = this;
            if (this.id) throw new Error("File already saved. If you want to manipulate a file, use AV.Query to get it.");
            if (!this._previousSave) if (this._data) {
              var n = this.get("mime_type");
              this._previousSave = this._fileToken(n).then(function (r) {
                return r.mime_type && (n = r.mime_type, e.set("mime_type", n)), e._token = r.token, c.resolve().then(function () {
                  var t = e._data;
                  if (t && t.base64) return p(t.base64, n);
                  if (t && t.blob) return !t.blob.type && n && (t.blob.type = n), t.blob.name || (t.blob.name = e.get("name")), t.blob;
                  if ("undefined" != typeof Blob && t instanceof Blob) return t;
                  throw new TypeError("malformed file data");
                }).then(function (n) {
                  switch (r.provider) {
                    case "s3":
                      return o(r, n, e, t);

                    case "qcloud":
                      return i(r, n, e, t);

                    case "qiniu":
                    default:
                      return s(r, n, e, t);
                  }
                }).then(h(function () {
                  return e._callback(!0);
                }), function (t) {
                  throw e._callback(!1), t;
                });
              });
            } else if (this.attributes.url && "external" === this.attributes.metaData.__source) {
              var r = {
                name: this.attributes.name,
                ACL: this._acl,
                metaData: this.attributes.metaData,
                mime_type: this.mimeType,
                url: this.attributes.url
              };
              this._previousSave = u("files", this.attributes.name, null, "post", r).then(function (t) {
                return e.attributes.name = t.name, e.attributes.url = t.url, e.id = t.objectId, t.size && (e.attributes.metaData.size = t.size), e;
              });
            }
            return this._previousSave;
          },
          _callback: function _callback(t) {
            u("fileCallback", null, null, "post", {
              token: this._token,
              result: t
            })["catch"](d), delete this._token, delete this._data;
          },
          fetch: function fetch(t, e) {
            return u("files", null, this.id, "GET", f(t), e).then(this._finishFetch.bind(this));
          },
          _finishFetch: function _finishFetch(e) {
            var n = t.Object.prototype.parse(e);
            return n.attributes = {
              name: n.name,
              url: n.url,
              mime_type: n.mime_type,
              bucket: n.bucket
            }, n.attributes.metaData = n.metaData || {}, n.id = n.objectId, delete n.objectId, delete n.metaData, delete n.url, delete n.name, delete n.mime_type, delete n.bucket, r.extend(this, n), this;
          }
        });
      };
    }, function (t, e, n) {
      "use strict";

      var r = n(0);

      t.exports = function (t) {
        t.GeoPoint = function (e, n) {
          r.isArray(e) ? (t.GeoPoint._validate(e[0], e[1]), this.latitude = e[0], this.longitude = e[1]) : r.isObject(e) ? (t.GeoPoint._validate(e.latitude, e.longitude), this.latitude = e.latitude, this.longitude = e.longitude) : r.isNumber(e) && r.isNumber(n) ? (t.GeoPoint._validate(e, n), this.latitude = e, this.longitude = n) : (this.latitude = 0, this.longitude = 0);
          var i = this;
          this.__defineGetter__ && this.__defineSetter__ && (this._latitude = this.latitude, this._longitude = this.longitude, this.__defineGetter__("latitude", function () {
            return i._latitude;
          }), this.__defineGetter__("longitude", function () {
            return i._longitude;
          }), this.__defineSetter__("latitude", function (e) {
            t.GeoPoint._validate(e, i.longitude), i._latitude = e;
          }), this.__defineSetter__("longitude", function (e) {
            t.GeoPoint._validate(i.latitude, e), i._longitude = e;
          }));
        }, t.GeoPoint._validate = function (t, e) {
          if (t < -90) throw new Error("AV.GeoPoint latitude " + t + " < -90.0.");
          if (t > 90) throw new Error("AV.GeoPoint latitude " + t + " > 90.0.");
          if (e < -180) throw new Error("AV.GeoPoint longitude " + e + " < -180.0.");
          if (e > 180) throw new Error("AV.GeoPoint longitude " + e + " > 180.0.");
        }, t.GeoPoint.current = function () {
          return new t.Promise(function (e, n) {
            navigator.geolocation.getCurrentPosition(function (n) {
              e(new t.GeoPoint({
                latitude: n.coords.latitude,
                longitude: n.coords.longitude
              }));
            }, n);
          });
        }, r.extend(t.GeoPoint.prototype, {
          toJSON: function toJSON() {
            return t.GeoPoint._validate(this.latitude, this.longitude), {
              __type: "GeoPoint",
              latitude: this.latitude,
              longitude: this.longitude
            };
          },
          radiansTo: function radiansTo(t) {
            var e = Math.PI / 180,
                n = this.latitude * e,
                r = this.longitude * e,
                i = t.latitude * e,
                s = t.longitude * e,
                o = n - i,
                a = r - s,
                u = Math.sin(o / 2),
                c = Math.sin(a / 2),
                l = u * u + Math.cos(n) * Math.cos(i) * c * c;
            return l = Math.min(1, l), 2 * Math.asin(Math.sqrt(l));
          },
          kilometersTo: function kilometersTo(t) {
            return 6371 * this.radiansTo(t);
          },
          milesTo: function milesTo(t) {
            return 3958.8 * this.radiansTo(t);
          }
        });
      };
    }, function (t, e, n) {
      "use strict";

      function r(t, e) {
        if ("us" === e) return h("https://us-api.leancloud.cn");
        var n = void 0;

        switch (t.slice(-9)) {
          case "-9Nh9j0Va":
            return h("https://e1-api.leancloud.cn");

          case "-MdYXbMMI":
            return h("https://us-api.leancloud.cn");

          default:
            return n = t.slice(0, 8).toLowerCase(), {
              push: "https://" + n + ".push.lncld.net",
              stats: "https://" + n + ".stats.lncld.net",
              engine: "https://" + n + ".engine.lncld.net",
              api: "https://" + n + ".api.lncld.net"
            };
        }
      }

      var i = n(5),
          s = n(34),
          o = n(3),
          a = o.isNullOrUndefined,
          u = n(0),
          c = u.extend,
          l = u.isObject,
          h = function h(t) {
        return {
          push: t,
          stats: t,
          engine: t,
          api: t
        };
      },
          f = !1;

      i.init = function (t) {
        if (!l(t)) return i.init({
          appId: t,
          appKey: arguments.length <= 1 ? void 0 : arguments[1],
          masterKey: arguments.length <= 2 ? void 0 : arguments[2],
          region: arguments.length <= 3 ? void 0 : arguments[3]
        });
        var e = t.appId,
            n = t.appKey,
            o = t.masterKey,
            a = (t.hookKey, t.region),
            u = void 0 === a ? "cn" : a,
            h = t.serverURLs,
            d = t.disableCurrentUser,
            p = t.production,
            _ = t.realtime;
        if (i.applicationId) throw new Error("SDK is already initialized.");
        o && console.warn("MasterKey is not supposed to be used in browser."), i._config.applicationId = e, i._config.applicationKey = n, i._config.masterKey = o, void 0 !== p && (i._config.production = p), void 0 !== d && (i._config.disableCurrentUser = d), i._appRouter = new s(i);
        var v = f || void 0 !== h || "cn" !== u;
        i._setServerURLs(c({}, r(e, u), i._config.serverURLs, h), v), _ ? i._config.realtime = _ : i._sharedConfig.liveQueryRealtime && (i._config.realtime = new i._sharedConfig.liveQueryRealtime({
          appId: e,
          region: u
        }));
      }, i.setProduction = function (t) {
        a(t) ? i._config.production = null : i._config.production = t ? 1 : 0;
      }, i._setServerURLs = function (t) {
        var e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
        "string" != typeof t ? c(i._config.serverURLs, t) : i._config.serverURLs = h(t), e && (i._appRouter ? i._appRouter.disable() : f = !0);
      }, i.setServerURLs = function (t) {
        return i._setServerURLs(t);
      }, i.initialize = i.init, ["applicationId", "applicationKey", "masterKey", "hookKey"].forEach(function (t) {
        return Object.defineProperty(i, t, {
          get: function get() {
            return i._config[t];
          },
          set: function set(e) {
            i._config[t] = e;
          }
        });
      });
    }, function (t, e, n) {
      "use strict";

      var r = n(0),
          i = n(4),
          s = n(2),
          o = s.request;

      t.exports = function (t) {
        t.Insight = t.Insight || {}, r.extend(t.Insight, {
          startJob: function startJob(e, n) {
            if (!e || !e.sql) throw new Error("Please provide the sql to run the job.");
            var r = {
              jobConfig: e,
              appId: t.applicationId
            };
            return o({
              path: "/bigquery/jobs",
              method: "POST",
              data: t._encode(r, null, !0),
              authOptions: n,
              signKey: !1
            }).then(function (e) {
              return t._decode(e).id;
            });
          },
          on: function on(t, e) {}
        }), t.Insight.JobQuery = function (t, e) {
          if (!t) throw new Error("Please provide the job id.");
          this.id = t, this.className = e, this._skip = 0, this._limit = 100;
        }, r.extend(t.Insight.JobQuery.prototype, {
          skip: function skip(t) {
            return this._skip = t, this;
          },
          limit: function limit(t) {
            return this._limit = t, this;
          },
          find: function find(e) {
            var n = {
              skip: this._skip,
              limit: this._limit
            };
            return o({
              path: "/bigquery/jobs/" + this.id,
              method: "GET",
              query: n,
              authOptions: e,
              signKey: !1
            }).then(function (e) {
              return e.error ? t.Promise.reject(new i(e.code, e.error)) : t.Promise.resolve(e);
            });
          }
        });
      };
    }, function (t, e, n) {
      "use strict";

      var r = n(47),
          i = n(1),
          s = n(3),
          o = s.inherits,
          a = n(2),
          u = a.request;

      t.exports = function (t) {
        t.LiveQuery = o(r, {
          constructor: function constructor(t, e) {
            r.apply(this), this.id = t, this._client = e, this._client.register(this), e.on("message", this._dispatch.bind(this));
          },
          _dispatch: function _dispatch(e) {
            var n = this;
            e.forEach(function (e) {
              var r = e.op,
                  i = e.object,
                  s = e.query_id,
                  o = e.updatedKeys;

              if (s === n.id) {
                var a = t.parseJSON(Object.assign({
                  __type: "_File" === i.className ? "File" : "Object"
                }, i));
                o ? n.emit(r, a, o) : n.emit(r, a);
              }
            });
          },
          unsubscribe: function unsubscribe() {
            return this._client.deregister(this), u({
              method: "POST",
              path: "/LiveQuery/unsubscribe",
              data: {
                id: this._client.id,
                query_id: this.id
              }
            });
          }
        }, {
          init: function init(e) {
            var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                r = n.subscriptionId,
                s = void 0 === r ? t._getSubscriptionId() : r;
            if (!t._config.realtime) throw new Error("LiveQuery not supported. Please use the LiveQuery bundle. https://url.leanapp.cn/enable-live-query");
            if (!(e instanceof t.Query)) throw new TypeError("LiveQuery must be inited with a Query");
            var o = e.toJSON(),
                a = o.where,
                c = o.keys,
                l = o.returnACL;
            return i.resolve(s).then(function (n) {
              return u({
                method: "POST",
                path: "/LiveQuery/subscribe",
                data: {
                  query: {
                    where: a,
                    keys: c,
                    returnACL: l,
                    className: e.className
                  },
                  id: n
                }
              }).then(function (e) {
                var r = e.query_id;
                return t._config.realtime.createLiveQueryClient(n).then(function (e) {
                  return new t.LiveQuery(r, e);
                });
              });
            });
          }
        });
      };
    }, function (t, e, n) {
      "use strict";

      function r(t, e) {
        return t && t[e] ? i.isFunction(t[e]) ? t[e]() : t[e] : null;
      }

      var i = n(0),
          s = n(4),
          o = n(2),
          a = o._request,
          u = n(3),
          c = u.isNullOrUndefined,
          l = u.ensureArray,
          h = u.transformFetchOptions,
          f = ["objectId", "createdAt", "updatedAt"],
          d = function d(t) {
        if (-1 !== f.indexOf(t)) throw new Error("key[" + t + "] is reserved");
      };

      t.exports = function (t) {
        t.Object = function (e, n) {
          if (i.isString(e)) return t.Object._create.apply(this, arguments);
          e = e || {}, n && n.parse && (e = this.parse(e), e = this._mergeMagicFields(e));
          var s = r(this, "defaults");
          s && (e = i.extend({}, s, e)), n && n.collection && (this.collection = n.collection), this._serverData = {}, this._opSetQueue = [{}], this._flags = {}, this.attributes = {}, this._hashedJSON = {}, this._escapedAttributes = {}, this.cid = i.uniqueId("c"), this.changed = {}, this._silent = {}, this._pending = {}, this.set(e, {
            silent: !0
          }), this.changed = {}, this._silent = {}, this._pending = {}, this._hasData = !0, this._previousAttributes = i.clone(this.attributes), this.initialize.apply(this, arguments);
        }, t.Object.saveAll = function (e, n) {
          return t.Object._deepSaveAsync(e, null, n);
        }, t.Object.fetchAll = function (e, n) {
          return t.Promise.resolve().then(function () {
            return a("batch", null, null, "POST", {
              requests: i.map(e, function (t) {
                if (!t.className) throw new Error("object must have className to fetch");
                if (!t.id) throw new Error("object must have id to fetch");
                if (t.dirty()) throw new Error("object is modified but not saved");
                return {
                  method: "GET",
                  path: "/1.1/classes/" + t.className + "/" + t.id
                };
              })
            }, n);
          }).then(function (t) {
            return i.forEach(e, function (e, n) {
              if (!t[n].success) {
                var r = new Error(t[n].error.error);
                throw r.code = t[n].error.code, r;
              }

              e._finishFetch(e.parse(t[n].success));
            }), e;
          });
        }, i.extend(t.Object.prototype, t.Events, {
          _fetchWhenSave: !1,
          initialize: function initialize() {},
          fetchWhenSave: function fetchWhenSave(t) {
            if (console.warn("AV.Object#fetchWhenSave is deprecated, use AV.Object#save with options.fetchWhenSave instead."), !i.isBoolean(t)) throw new Error("Expect boolean value for fetchWhenSave");
            this._fetchWhenSave = t;
          },
          getObjectId: function getObjectId() {
            return this.id;
          },
          getCreatedAt: function getCreatedAt() {
            return this.createdAt || this.get("createdAt");
          },
          getUpdatedAt: function getUpdatedAt() {
            return this.updatedAt || this.get("updatedAt");
          },
          toJSON: function toJSON(t, e) {
            var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : [];
            return this._toFullJSON(n, !1);
          },
          toFullJSON: function toFullJSON() {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
            return this._toFullJSON(t);
          },
          _toFullJSON: function _toFullJSON(e) {
            var n = this,
                r = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1],
                s = i.clone(this.attributes);
            if (i.isArray(e)) var o = e.concat(this);
            return t._objectEach(s, function (e, n) {
              s[n] = t._encode(e, o, void 0, r);
            }), t._objectEach(this._operations, function (t, e) {
              s[e] = t;
            }), i.has(this, "id") && (s.objectId = this.id), i(["createdAt", "updatedAt"]).each(function (t) {
              if (i.has(n, t)) {
                var e = n[t];
                s[t] = i.isDate(e) ? e.toJSON() : e;
              }
            }), r && (s.__type = "Object", i.isArray(e) && e.length && (s.__type = "Pointer"), s.className = this.className), s;
          },
          _refreshCache: function _refreshCache() {
            var e = this;
            e._refreshingCache || (e._refreshingCache = !0, t._objectEach(this.attributes, function (n, r) {
              n instanceof t.Object ? n._refreshCache() : i.isObject(n) && e._resetCacheForKey(r) && e.set(r, new t.Op.Set(n), {
                silent: !0
              });
            }), delete e._refreshingCache);
          },
          dirty: function dirty(t) {
            this._refreshCache();

            var e = i.last(this._opSetQueue);
            return t ? !!e[t] : !this.id || i.keys(e).length > 0;
          },
          _toPointer: function _toPointer() {
            return {
              __type: "Pointer",
              className: this.className,
              objectId: this.id
            };
          },
          get: function get(t) {
            switch (t) {
              case "objectId":
                return this.id;

              case "createdAt":
              case "updatedAt":
                return this[t];

              default:
                return this.attributes[t];
            }
          },
          relation: function relation(e) {
            var n = this.get(e);

            if (n) {
              if (!(n instanceof t.Relation)) throw new Error("Called relation() on non-relation field " + e);
              return n._ensureParentAndKey(this, e), n;
            }

            return new t.Relation(this, e);
          },
          escape: function escape(t) {
            var e = this._escapedAttributes[t];
            if (e) return e;
            var n,
                r = this.attributes[t];
            return n = c(r) ? "" : i.escape(r.toString()), this._escapedAttributes[t] = n, n;
          },
          has: function has(t) {
            return !c(this.attributes[t]);
          },
          _mergeMagicFields: function _mergeMagicFields(e) {
            var n = this,
                r = ["objectId", "createdAt", "updatedAt"];
            return t._arrayEach(r, function (r) {
              e[r] && ("objectId" === r ? n.id = e[r] : "createdAt" !== r && "updatedAt" !== r || i.isDate(e[r]) ? n[r] = e[r] : n[r] = t._parseDate(e[r]), delete e[r]);
            }), e;
          },
          _startSave: function _startSave() {
            this._opSetQueue.push({});
          },
          _cancelSave: function _cancelSave() {
            var e = i.first(this._opSetQueue);
            this._opSetQueue = i.rest(this._opSetQueue);
            var n = i.first(this._opSetQueue);
            t._objectEach(e, function (t, r) {
              var i = e[r],
                  s = n[r];
              i && s ? n[r] = s._mergeWithPrevious(i) : i && (n[r] = i);
            }), this._saving = this._saving - 1;
          },
          _finishSave: function _finishSave(e) {
            var n = {};

            t._traverse(this.attributes, function (e) {
              e instanceof t.Object && e.id && e._hasData && (n[e.id] = e);
            });

            var r = i.first(this._opSetQueue);
            this._opSetQueue = i.rest(this._opSetQueue), this._applyOpSet(r, this._serverData), this._mergeMagicFields(e);
            var s = this;
            t._objectEach(e, function (e, r) {
              s._serverData[r] = t._decode(e, r);

              var i = t._traverse(s._serverData[r], function (e) {
                if (e instanceof t.Object && n[e.id]) return n[e.id];
              });

              i && (s._serverData[r] = i);
            }), this._rebuildAllEstimatedData(), this._saving = this._saving - 1;
          },
          _finishFetch: function _finishFetch(e, n) {
            this._opSetQueue = [{}], this._mergeMagicFields(e);
            var r = this;
            t._objectEach(e, function (e, n) {
              r._serverData[n] = t._decode(e, n);
            }), this._rebuildAllEstimatedData(), this._refreshCache(), this._opSetQueue = [{}], this._hasData = n;
          },
          _applyOpSet: function _applyOpSet(e, n) {
            var r = this;

            t._objectEach(e, function (e, i) {
              n[i] = e._estimate(n[i], r, i), n[i] === t.Op._UNSET && delete n[i];
            });
          },
          _resetCacheForKey: function _resetCacheForKey(e) {
            var n = this.attributes[e];

            if (i.isObject(n) && !(n instanceof t.Object) && !(n instanceof t.File)) {
              n = n.toJSON ? n.toJSON() : n;
              var r = JSON.stringify(n);

              if (this._hashedJSON[e] !== r) {
                var s = !!this._hashedJSON[e];
                return this._hashedJSON[e] = r, s;
              }
            }

            return !1;
          },
          _rebuildEstimatedDataForKey: function _rebuildEstimatedDataForKey(e) {
            var n = this;
            delete this.attributes[e], this._serverData[e] && (this.attributes[e] = this._serverData[e]), t._arrayEach(this._opSetQueue, function (r) {
              var i = r[e];
              i && (n.attributes[e] = i._estimate(n.attributes[e], n, e), n.attributes[e] === t.Op._UNSET ? delete n.attributes[e] : n._resetCacheForKey(e));
            });
          },
          _rebuildAllEstimatedData: function _rebuildAllEstimatedData() {
            var e = this,
                n = i.clone(this.attributes);
            this.attributes = i.clone(this._serverData), t._arrayEach(this._opSetQueue, function (n) {
              e._applyOpSet(n, e.attributes), t._objectEach(n, function (t, n) {
                e._resetCacheForKey(n);
              });
            }), t._objectEach(n, function (t, n) {
              e.attributes[n] !== t && e.trigger("change:" + n, e, e.attributes[n], {});
            }), t._objectEach(this.attributes, function (t, r) {
              i.has(n, r) || e.trigger("change:" + r, e, t, {});
            });
          },
          set: function set(e, n, r) {
            var s;
            if (i.isObject(e) || c(e) ? (s = i.mapObject(e, function (e, n) {
              return d(n), t._decode(e, n);
            }), r = n) : (s = {}, d(e), s[e] = t._decode(n, e)), r = r || {}, !s) return this;
            s instanceof t.Object && (s = s.attributes), r.unset && t._objectEach(s, function (e, n) {
              s[n] = new t.Op.Unset();
            });
            var o = i.clone(s),
                a = this;
            t._objectEach(o, function (e, n) {
              e instanceof t.Op && (o[n] = e._estimate(a.attributes[n], a, n), o[n] === t.Op._UNSET && delete o[n]);
            }), this._validate(s, r), r.changes = {};
            var u = this._escapedAttributes;
            this._previousAttributes;
            return t._arrayEach(i.keys(s), function (e) {
              var n = s[e];
              n instanceof t.Relation && (n.parent = a), n instanceof t.Op || (n = new t.Op.Set(n));
              var o = !0;
              n instanceof t.Op.Set && i.isEqual(a.attributes[e], n.value) && (o = !1), o && (delete u[e], r.silent ? a._silent[e] = !0 : r.changes[e] = !0);
              var c = i.last(a._opSetQueue);
              c[e] = n._mergeWithPrevious(c[e]), a._rebuildEstimatedDataForKey(e), o ? (a.changed[e] = a.attributes[e], r.silent || (a._pending[e] = !0)) : (delete a.changed[e], delete a._pending[e]);
            }), r.silent || this.change(r), this;
          },
          unset: function unset(t, e) {
            return e = e || {}, e.unset = !0, this.set(t, null, e);
          },
          increment: function increment(e, n) {
            return (i.isUndefined(n) || i.isNull(n)) && (n = 1), this.set(e, new t.Op.Increment(n));
          },
          add: function add(e, n) {
            return this.set(e, new t.Op.Add(l(n)));
          },
          addUnique: function addUnique(e, n) {
            return this.set(e, new t.Op.AddUnique(l(n)));
          },
          remove: function remove(e, n) {
            return this.set(e, new t.Op.Remove(l(n)));
          },
          op: function op(t) {
            return i.last(this._opSetQueue)[t];
          },
          clear: function clear(t) {
            t = t || {}, t.unset = !0;
            var e = i.extend(this.attributes, this._operations);
            return this.set(e, t);
          },
          _getSaveJSON: function _getSaveJSON() {
            var e = i.clone(i.first(this._opSetQueue));
            return t._objectEach(e, function (t, n) {
              e[n] = t.toJSON();
            }), e;
          },
          _canBeSerialized: function _canBeSerialized() {
            return t.Object._canBeSerializedAsValue(this.attributes);
          },
          fetch: function fetch(t, e) {
            var n = this;
            return a("classes", this.className, this.id, "GET", h(t), e).then(function (t) {
              return n._finishFetch(n.parse(t), !0), n;
            });
          },
          save: function save(e, n, r) {
            var s, o, u;
            i.isObject(e) || c(e) ? (s = e, u = n) : (s = {}, s[e] = n, u = r), u = i.clone(u) || {}, u.wait && (o = i.clone(this.attributes));
            var l = i.clone(u) || {};
            l.wait && (l.silent = !0), s && this.set(s, l);
            var h = this;

            h._refreshCache();

            var f = [],
                d = [];
            return t.Object._findUnsavedChildren(h.attributes, f, d), f.length + d.length > 0 ? t.Object._deepSaveAsync(this.attributes, h, u).then(function () {
              return h.save(null, u);
            }) : (this._startSave(), this._saving = (this._saving || 0) + 1, this._allPreviousSaves = this._allPreviousSaves || t.Promise.resolve(), this._allPreviousSaves = this._allPreviousSaves["catch"](function (t) {}).then(function () {
              var t = h.id ? "PUT" : "POST",
                  e = h._getSaveJSON(),
                  n = {};

              if ((h._fetchWhenSave || u.fetchWhenSave) && (n["new"] = "true"), u.query) {
                var r;

                if ("function" == typeof u.query.toJSON && (r = u.query.toJSON()) && (n.where = r.where), !n.where) {
                  throw new Error("options.query is not an AV.Query");
                }
              }

              i.extend(e, h._flags);
              var c = "classes",
                  f = h.className;
              "_User" !== h.className || h.id || (c = "users", f = null);
              var d = u._makeRequest || a,
                  p = d(c, f, h.id, t, e, u, n);
              return p = p.then(function (t) {
                var e = h.parse(t);
                return u.wait && (e = i.extend(s || {}, e)), h._finishSave(e), u.wait && h.set(o, l), h;
              }, function (t) {
                throw h._cancelSave(), t;
              });
            }), this._allPreviousSaves);
          },
          destroy: function destroy(t) {
            t = t || {};

            var e = this,
                n = function n() {
              e.trigger("destroy", e, e.collection, t);
            };

            return this.id ? (t.wait || n(), a("classes", this.className, this.id, "DELETE", this._flags, t).then(function () {
              return t.wait && n(), e;
            })) : n();
          },
          parse: function parse(e) {
            var n = i.clone(e);
            return i(["createdAt", "updatedAt"]).each(function (e) {
              n[e] && (n[e] = t._parseDate(n[e]));
            }), n.updatedAt || (n.updatedAt = n.createdAt), n;
          },
          clone: function clone() {
            return new this.constructor(this.attributes);
          },
          isNew: function isNew() {
            return !this.id;
          },
          change: function change(e) {
            e = e || {};
            var n = this._changing;
            this._changing = !0;
            var r = this;

            t._objectEach(this._silent, function (t) {
              r._pending[t] = !0;
            });

            var s = i.extend({}, e.changes, this._silent);
            if (this._silent = {}, t._objectEach(s, function (t, n) {
              r.trigger("change:" + n, r, r.get(n), e);
            }), n) return this;

            for (var o = function o(t, e) {
              r._pending[e] || r._silent[e] || delete r.changed[e];
            }; !i.isEmpty(this._pending);) {
              this._pending = {}, this.trigger("change", this, e), t._objectEach(this.changed, o), r._previousAttributes = i.clone(this.attributes);
            }

            return this._changing = !1, this;
          },
          hasChanged: function hasChanged(t) {
            return arguments.length ? this.changed && i.has(this.changed, t) : !i.isEmpty(this.changed);
          },
          changedAttributes: function changedAttributes(e) {
            if (!e) return !!this.hasChanged() && i.clone(this.changed);
            var n = {},
                r = this._previousAttributes;
            return t._objectEach(e, function (t, e) {
              i.isEqual(r[e], t) || (n[e] = t);
            }), n;
          },
          previous: function previous(t) {
            return arguments.length && this._previousAttributes ? this._previousAttributes[t] : null;
          },
          previousAttributes: function previousAttributes() {
            return i.clone(this._previousAttributes);
          },
          isValid: function isValid() {
            try {
              this.validate(this.attributes);
            } catch (t) {
              return !1;
            }

            return !0;
          },
          validate: function validate(e) {
            if (i.has(e, "ACL") && !(e.ACL instanceof t.ACL)) throw new s(s.OTHER_CAUSE, "ACL must be a AV.ACL.");
          },
          _validate: function _validate(t, e) {
            !e.silent && this.validate && (t = i.extend({}, this.attributes, t), this.validate(t));
          },
          getACL: function getACL() {
            return this.get("ACL");
          },
          setACL: function setACL(t, e) {
            return this.set("ACL", t, e);
          },
          disableBeforeHook: function disableBeforeHook() {
            this.ignoreHook("beforeSave"), this.ignoreHook("beforeUpdate"), this.ignoreHook("beforeDelete");
          },
          disableAfterHook: function disableAfterHook() {
            this.ignoreHook("afterSave"), this.ignoreHook("afterUpdate"), this.ignoreHook("afterDelete");
          },
          ignoreHook: function ignoreHook(e) {
            i.contains(["beforeSave", "afterSave", "beforeUpdate", "afterUpdate", "beforeDelete", "afterDelete"], e) || console.trace("Unsupported hookName: " + e), t.hookKey || console.trace("ignoreHook required hookKey"), this._flags.__ignore_hooks || (this._flags.__ignore_hooks = []), this._flags.__ignore_hooks.push(e);
          }
        }), t.Object.createWithoutData = function (e, n, r) {
          var i = new t.Object(e);
          return i.id = n, i._hasData = r, i;
        }, t.Object.destroyAll = function (e) {
          var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          if (!e || 0 === e.length) return t.Promise.resolve();
          var r = i.groupBy(e, function (t) {
            return JSON.stringify({
              className: t.className,
              flags: t._flags
            });
          }),
              s = {
            requests: i.map(r, function (t) {
              var e = i.map(t, "id").join(",");
              return {
                method: "DELETE",
                path: "/1.1/classes/" + t[0].className + "/" + e,
                body: t[0]._flags
              };
            })
          };
          return a("batch", null, null, "POST", s, n);
        }, t.Object._getSubclass = function (e) {
          if (!i.isString(e)) throw new Error("AV.Object._getSubclass requires a string argument.");
          var n = t.Object._classMap[e];
          return n || (n = t.Object.extend(e), t.Object._classMap[e] = n), n;
        }, t.Object._create = function (e, n, r) {
          return new (t.Object._getSubclass(e))(n, r);
        }, t.Object._classMap = {}, t.Object._extend = t._extend, t.Object["new"] = function (e, n) {
          return new t.Object(e, n);
        }, t.Object.extend = function (e, n, r) {
          if (!i.isString(e)) {
            if (e && i.has(e, "className")) return t.Object.extend(e.className, e, n);
            throw new Error("AV.Object.extend's first argument should be the className.");
          }

          "User" === e && (e = "_User");
          var s = null;

          if (i.has(t.Object._classMap, e)) {
            var o = t.Object._classMap[e];
            if (!n && !r) return o;
            s = o._extend(n, r);
          } else n = n || {}, n._className = e, s = this._extend(n, r);

          return s.extend = function (n) {
            if (i.isString(n) || n && i.has(n, "className")) return t.Object.extend.apply(s, arguments);
            var r = [e].concat(i.toArray(arguments));
            return t.Object.extend.apply(s, r);
          }, s["new"] = function (t, e) {
            return new s(t, e);
          }, t.Object._classMap[e] = s, s;
        }, Object.defineProperty(t.Object.prototype, "className", {
          get: function get() {
            var t = this._className || this.constructor._LCClassName || this.constructor.name;
            return "User" === t ? "_User" : t;
          }
        }), t.Object.register = function (e, n) {
          if (!(e.prototype instanceof t.Object)) throw new Error("registered class is not a subclass of AV.Object");
          var r = n || e.name;
          if (!r.length) throw new Error("registered class must be named");
          n && (e._LCClassName = n), t.Object._classMap[r] = e;
        }, t.Object._findUnsavedChildren = function (e, n, r) {
          t._traverse(e, function (e) {
            return e instanceof t.Object ? (e._refreshCache(), void (e.dirty() && n.push(e))) : e instanceof t.File ? void (e.url() || e.id || r.push(e)) : void 0;
          });
        }, t.Object._canBeSerializedAsValue = function (e) {
          var n = !0;
          return e instanceof t.Object || e instanceof t.File ? n = !!e.id : i.isArray(e) ? t._arrayEach(e, function (e) {
            t.Object._canBeSerializedAsValue(e) || (n = !1);
          }) : i.isObject(e) && t._objectEach(e, function (e) {
            t.Object._canBeSerializedAsValue(e) || (n = !1);
          }), n;
        }, t.Object._deepSaveAsync = function (e, n, r) {
          var o = [],
              u = [];
          t.Object._findUnsavedChildren(e, o, u), n && (o = i.filter(o, function (t) {
            return t != n;
          }));
          var c = t.Promise.resolve();
          i.each(u, function (t) {
            c = c.then(function () {
              return t.save();
            });
          });
          var l = i.uniq(o),
              h = i.uniq(l);
          return c.then(function () {
            return t.Promise._continueWhile(function () {
              return h.length > 0;
            }, function () {
              var e = [],
                  n = [];
              if (t._arrayEach(h, function (t) {
                if (e.length > 20) return void n.push(t);
                t._canBeSerialized() ? e.push(t) : n.push(t);
              }), h = n, 0 === e.length) return t.Promise.reject(new s(s.OTHER_CAUSE, "Tried to save a batch with a cycle."));
              var o = t.Promise.resolve(i.map(e, function (e) {
                return e._allPreviousSaves || t.Promise.resolve();
              })),
                  u = o.then(function () {
                return a("batch", null, null, "POST", {
                  requests: i.map(e, function (t) {
                    var e = t._getSaveJSON();

                    i.extend(e, t._flags);
                    var n = "POST",
                        r = "/1.1/classes/" + t.className;
                    return t.id && (r = r + "/" + t.id, n = "PUT"), t._startSave(), {
                      method: n,
                      path: r,
                      body: e
                    };
                  })
                }, r).then(function (n) {
                  var r;
                  if (t._arrayEach(e, function (t, e) {
                    n[e].success ? t._finishSave(t.parse(n[e].success)) : (r = r || n[e].error, t._cancelSave());
                  }), r) return t.Promise.reject(new s(r.code, r.error));
                });
              });
              return t._arrayEach(e, function (t) {
                t._allPreviousSaves = u;
              }), u;
            });
          }).then(function () {
            return e;
          });
        };
      };
    }, function (t, e, n) {
      "use strict";

      var r = n(0);

      t.exports = function (t) {
        t.Op = function () {
          this._initialize.apply(this, arguments);
        }, r.extend(t.Op.prototype, {
          _initialize: function _initialize() {}
        }), r.extend(t.Op, {
          _extend: t._extend,
          _opDecoderMap: {},
          _registerDecoder: function _registerDecoder(e, n) {
            t.Op._opDecoderMap[e] = n;
          },
          _decode: function _decode(e) {
            var n = t.Op._opDecoderMap[e.__op];
            return n ? n(e) : void 0;
          }
        }), t.Op._registerDecoder("Batch", function (e) {
          var n = null;
          return t._arrayEach(e.ops, function (e) {
            e = t.Op._decode(e), n = e._mergeWithPrevious(n);
          }), n;
        }), t.Op.Set = t.Op._extend({
          _initialize: function _initialize(t) {
            this._value = t;
          },
          value: function value() {
            return this._value;
          },
          toJSON: function toJSON() {
            return t._encode(this.value());
          },
          _mergeWithPrevious: function _mergeWithPrevious(t) {
            return this;
          },
          _estimate: function _estimate(t) {
            return this.value();
          }
        }), t.Op._UNSET = {}, t.Op.Unset = t.Op._extend({
          toJSON: function toJSON() {
            return {
              __op: "Delete"
            };
          },
          _mergeWithPrevious: function _mergeWithPrevious(t) {
            return this;
          },
          _estimate: function _estimate(e) {
            return t.Op._UNSET;
          }
        }), t.Op._registerDecoder("Delete", function (e) {
          return new t.Op.Unset();
        }), t.Op.Increment = t.Op._extend({
          _initialize: function _initialize(t) {
            this._amount = t;
          },
          amount: function amount() {
            return this._amount;
          },
          toJSON: function toJSON() {
            return {
              __op: "Increment",
              amount: this._amount
            };
          },
          _mergeWithPrevious: function _mergeWithPrevious(e) {
            if (e) {
              if (e instanceof t.Op.Unset) return new t.Op.Set(this.amount());
              if (e instanceof t.Op.Set) return new t.Op.Set(e.value() + this.amount());
              if (e instanceof t.Op.Increment) return new t.Op.Increment(this.amount() + e.amount());
              throw new Error("Op is invalid after previous op.");
            }

            return this;
          },
          _estimate: function _estimate(t) {
            return t ? t + this.amount() : this.amount();
          }
        }), t.Op._registerDecoder("Increment", function (e) {
          return new t.Op.Increment(e.amount);
        }), t.Op.Add = t.Op._extend({
          _initialize: function _initialize(t) {
            this._objects = t;
          },
          objects: function objects() {
            return this._objects;
          },
          toJSON: function toJSON() {
            return {
              __op: "Add",
              objects: t._encode(this.objects())
            };
          },
          _mergeWithPrevious: function _mergeWithPrevious(e) {
            if (e) {
              if (e instanceof t.Op.Unset) return new t.Op.Set(this.objects());
              if (e instanceof t.Op.Set) return new t.Op.Set(this._estimate(e.value()));
              if (e instanceof t.Op.Add) return new t.Op.Add(e.objects().concat(this.objects()));
              throw new Error("Op is invalid after previous op.");
            }

            return this;
          },
          _estimate: function _estimate(t) {
            return t ? t.concat(this.objects()) : r.clone(this.objects());
          }
        }), t.Op._registerDecoder("Add", function (e) {
          return new t.Op.Add(t._decode(e.objects));
        }), t.Op.AddUnique = t.Op._extend({
          _initialize: function _initialize(t) {
            this._objects = r.uniq(t);
          },
          objects: function objects() {
            return this._objects;
          },
          toJSON: function toJSON() {
            return {
              __op: "AddUnique",
              objects: t._encode(this.objects())
            };
          },
          _mergeWithPrevious: function _mergeWithPrevious(e) {
            if (e) {
              if (e instanceof t.Op.Unset) return new t.Op.Set(this.objects());
              if (e instanceof t.Op.Set) return new t.Op.Set(this._estimate(e.value()));
              if (e instanceof t.Op.AddUnique) return new t.Op.AddUnique(this._estimate(e.objects()));
              throw new Error("Op is invalid after previous op.");
            }

            return this;
          },
          _estimate: function _estimate(e) {
            if (e) {
              var n = r.clone(e);
              return t._arrayEach(this.objects(), function (e) {
                if (e instanceof t.Object && e.id) {
                  var i = r.find(n, function (n) {
                    return n instanceof t.Object && n.id === e.id;
                  });

                  if (i) {
                    var s = r.indexOf(n, i);
                    n[s] = e;
                  } else n.push(e);
                } else r.contains(n, e) || n.push(e);
              }), n;
            }

            return r.clone(this.objects());
          }
        }), t.Op._registerDecoder("AddUnique", function (e) {
          return new t.Op.AddUnique(t._decode(e.objects));
        }), t.Op.Remove = t.Op._extend({
          _initialize: function _initialize(t) {
            this._objects = r.uniq(t);
          },
          objects: function objects() {
            return this._objects;
          },
          toJSON: function toJSON() {
            return {
              __op: "Remove",
              objects: t._encode(this.objects())
            };
          },
          _mergeWithPrevious: function _mergeWithPrevious(e) {
            if (e) {
              if (e instanceof t.Op.Unset) return e;
              if (e instanceof t.Op.Set) return new t.Op.Set(this._estimate(e.value()));
              if (e instanceof t.Op.Remove) return new t.Op.Remove(r.union(e.objects(), this.objects()));
              throw new Error("Op is invalid after previous op.");
            }

            return this;
          },
          _estimate: function _estimate(e) {
            if (e) {
              var n = r.difference(e, this.objects());
              return t._arrayEach(this.objects(), function (e) {
                e instanceof t.Object && e.id && (n = r.reject(n, function (n) {
                  return n instanceof t.Object && n.id === e.id;
                }));
              }), n;
            }

            return [];
          }
        }), t.Op._registerDecoder("Remove", function (e) {
          return new t.Op.Remove(t._decode(e.objects));
        }), t.Op.Relation = t.Op._extend({
          _initialize: function _initialize(e, n) {
            this._targetClassName = null;

            var i = this,
                s = function s(e) {
              if (e instanceof t.Object) {
                if (!e.id) throw new Error("You can't add an unsaved AV.Object to a relation.");
                if (i._targetClassName || (i._targetClassName = e.className), i._targetClassName !== e.className) throw new Error("Tried to create a AV.Relation with 2 different types: " + i._targetClassName + " and " + e.className + ".");
                return e.id;
              }

              return e;
            };

            this.relationsToAdd = r.uniq(r.map(e, s)), this.relationsToRemove = r.uniq(r.map(n, s));
          },
          added: function added() {
            var e = this;
            return r.map(this.relationsToAdd, function (n) {
              var r = t.Object._create(e._targetClassName);

              return r.id = n, r;
            });
          },
          removed: function removed() {
            var e = this;
            return r.map(this.relationsToRemove, function (n) {
              var r = t.Object._create(e._targetClassName);

              return r.id = n, r;
            });
          },
          toJSON: function toJSON() {
            var t = null,
                e = null,
                n = this,
                i = function i(t) {
              return {
                __type: "Pointer",
                className: n._targetClassName,
                objectId: t
              };
            },
                s = null;

            return this.relationsToAdd.length > 0 && (s = r.map(this.relationsToAdd, i), t = {
              __op: "AddRelation",
              objects: s
            }), this.relationsToRemove.length > 0 && (s = r.map(this.relationsToRemove, i), e = {
              __op: "RemoveRelation",
              objects: s
            }), t && e ? {
              __op: "Batch",
              ops: [t, e]
            } : t || e || {};
          },
          _mergeWithPrevious: function _mergeWithPrevious(e) {
            if (e) {
              if (e instanceof t.Op.Unset) throw new Error("You can't modify a relation after deleting it.");

              if (e instanceof t.Op.Relation) {
                if (e._targetClassName && e._targetClassName !== this._targetClassName) throw new Error("Related object must be of class " + e._targetClassName + ", but " + this._targetClassName + " was passed in.");
                var n = r.union(r.difference(e.relationsToAdd, this.relationsToRemove), this.relationsToAdd),
                    i = r.union(r.difference(e.relationsToRemove, this.relationsToAdd), this.relationsToRemove),
                    s = new t.Op.Relation(n, i);
                return s._targetClassName = this._targetClassName, s;
              }

              throw new Error("Op is invalid after previous op.");
            }

            return this;
          },
          _estimate: function _estimate(e, n, r) {
            if (e) {
              if (e instanceof t.Relation) {
                if (this._targetClassName) if (e.targetClassName) {
                  if (e.targetClassName !== this._targetClassName) throw new Error("Related object must be a " + e.targetClassName + ", but a " + this._targetClassName + " was passed in.");
                } else e.targetClassName = this._targetClassName;
                return e;
              }

              throw new Error("Op is invalid after previous op.");
            }

            new t.Relation(n, r).targetClassName = this._targetClassName;
          }
        }), t.Op._registerDecoder("AddRelation", function (e) {
          return new t.Op.Relation(t._decode(e.objects), []);
        }), t.Op._registerDecoder("RemoveRelation", function (e) {
          return new t.Op.Relation([], t._decode(e.objects));
        });
      };
    }, function (t, e, n) {
      "use strict";
    }, function (t, e, n) {
      "use strict";

      var r = n(2).request;

      t.exports = function (t) {
        t.Installation = t.Object.extend("_Installation"), t.Push = t.Push || {}, t.Push.send = function (t, e) {
          if (t.where && (t.where = t.where.toJSON().where), t.where && t.cql) throw new Error("Both where and cql can't be set");
          if (t.push_time && (t.push_time = t.push_time.toJSON()), t.expiration_time && (t.expiration_time = t.expiration_time.toJSON()), t.expiration_time && t.expiration_time_interval) throw new Error("Both expiration_time and expiration_time_interval can't be set");
          return r({
            service: "push",
            method: "POST",
            path: "/push",
            data: t,
            authOptions: e
          });
        };
      };
    }, function (t, e, n) {
      "use strict";

      var r = n(0),
          i = n(6)("leancloud:query"),
          s = n(1),
          o = n(4),
          a = n(2),
          u = a._request,
          c = n(3),
          l = c.ensureArray,
          h = c.transformFetchOptions,
          f = function f(t, e) {
        if (void 0 === t) throw new Error(e);
      };

      t.exports = function (t) {
        t.Query = function (e) {
          r.isString(e) && (e = t.Object._getSubclass(e)), this.objectClass = e, this.className = e.prototype.className, this._where = {}, this._include = [], this._select = [], this._limit = -1, this._skip = 0, this._extraOptions = {};
        }, t.Query.or = function () {
          var e = r.toArray(arguments),
              n = null;

          t._arrayEach(e, function (t) {
            if (r.isNull(n) && (n = t.className), n !== t.className) throw new Error("All queries must be for the same class");
          });

          var i = new t.Query(n);
          return i._orQuery(e), i;
        }, t.Query.and = function () {
          var e = r.toArray(arguments),
              n = null;

          t._arrayEach(e, function (t) {
            if (r.isNull(n) && (n = t.className), n !== t.className) throw new Error("All queries must be for the same class");
          });

          var i = new t.Query(n);
          return i._andQuery(e), i;
        }, t.Query.doCloudQuery = function (e, n, i) {
          var s = {
            cql: e
          };
          return r.isArray(n) ? s.pvalues = n : i = n, u("cloudQuery", null, null, "GET", s, i).then(function (e) {
            var n = new t.Query(e.className);
            return {
              results: r.map(e.results, function (t) {
                var r = n._newObject(e);

                return r._finishFetch && r._finishFetch(n._processResult(t), !0), r;
              }),
              count: e.count,
              className: e.className
            };
          });
        }, t.Query._extend = t._extend, r.extend(t.Query.prototype, {
          _processResult: function _processResult(t) {
            return t;
          },
          get: function get(t, e) {
            if (!t) {
              throw new o(o.OBJECT_NOT_FOUND, "Object not found.");
            }

            var n = this._newObject();

            n.id = t;
            var i = this.toJSON(),
                s = {};
            return i.keys && (s.keys = i.keys), i.include && (s.include = i.include), i.includeACL && (s.includeACL = i.includeACL), u("classes", this.className, t, "GET", h(s), e).then(function (t) {
              if (r.isEmpty(t)) throw new o(o.OBJECT_NOT_FOUND, "Object not found.");
              return n._finishFetch(n.parse(t), !0), n;
            });
          },
          toJSON: function toJSON() {
            var e = {
              where: this._where
            };
            return this._include.length > 0 && (e.include = this._include.join(",")), this._select.length > 0 && (e.keys = this._select.join(",")), void 0 !== this._includeACL && (e.returnACL = this._includeACL), this._limit >= 0 && (e.limit = this._limit), this._skip > 0 && (e.skip = this._skip), void 0 !== this._order && (e.order = this._order), t._objectEach(this._extraOptions, function (t, n) {
              e[n] = t;
            }), e;
          },
          _newObject: function _newObject(e) {
            return e && e.className ? new t.Object(e.className) : new this.objectClass();
          },
          _createRequest: function _createRequest() {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.toJSON(),
                e = arguments[1];

            if (JSON.stringify(t).length > 2e3) {
              var n = {
                requests: [{
                  method: "GET",
                  path: "/1.1/classes/" + this.className,
                  params: t
                }]
              };
              return u("batch", null, null, "POST", n, e).then(function (t) {
                var e = t[0];
                if (e.success) return e.success;
                var n = new Error(e.error.error || "Unknown batch error");
                throw n.code = e.error.code, n;
              });
            }

            return u("classes", this.className, null, "GET", t, e);
          },
          _parseResponse: function _parseResponse(t) {
            var e = this;
            return r.map(t.results, function (n) {
              var r = e._newObject(t);

              return r._finishFetch && r._finishFetch(e._processResult(n), !0), r;
            });
          },
          find: function find(t) {
            return this._createRequest(void 0, t).then(this._parseResponse.bind(this));
          },
          scan: function scan() {
            var t = this,
                e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
                n = e.orderedBy,
                o = e.batchSize,
                a = arguments[1],
                c = this.toJSON();
            i("scan %O", c), c.order && (console.warn("The order of the query is ignored for Query#scan. Checkout the orderedBy option of Query#scan."), delete c.order), c.skip && (console.warn("The skip option of the query is ignored for Query#scan."), delete c.skip), c.limit && (console.warn("The limit option of the query is ignored for Query#scan."), delete c.limit), n && (c.scan_key = n), o && (c.limit = o);
            var l = s.resolve([]),
                h = void 0,
                f = !1;
            return {
              next: function next() {
                return l = l.then(function (e) {
                  return f ? [] : e.length > 1 ? e : h || 0 === e.length ? u("scan/classes", t.className, null, "GET", h ? r.extend({}, c, {
                    cursor: h
                  }) : c, a).then(function (e) {
                    return h = e.cursor, t._parseResponse(e);
                  }).then(function (t) {
                    return t.length || (f = !0), e.concat(t);
                  }) : (f = !0, e);
                }), l.then(function (t) {
                  return t.shift();
                }).then(function (t) {
                  return {
                    value: t,
                    done: f
                  };
                });
              }
            };
          },
          destroyAll: function destroyAll(e) {
            return this.find(e).then(function (n) {
              return t.Object.destroyAll(n, e);
            });
          },
          count: function count(t) {
            var e = this.toJSON();
            return e.limit = 0, e.count = 1, this._createRequest(e, t).then(function (t) {
              return t.count;
            });
          },
          first: function first(t) {
            var e = this,
                n = this.toJSON();
            return n.limit = 1, this._createRequest(n, t).then(function (t) {
              return r.map(t.results, function (t) {
                var n = e._newObject();

                return n._finishFetch && n._finishFetch(e._processResult(t), !0), n;
              })[0];
            });
          },
          skip: function skip(t) {
            return f(t, "undefined is not a valid skip value"), this._skip = t, this;
          },
          limit: function limit(t) {
            return f(t, "undefined is not a valid limit value"), this._limit = t, this;
          },
          equalTo: function equalTo(e, n) {
            return f(e, "undefined is not a valid key"), f(n, "undefined is not a valid value"), this._where[e] = t._encode(n), this;
          },
          _addCondition: function _addCondition(e, n, r) {
            return f(e, "undefined is not a valid condition key"), f(n, "undefined is not a valid condition"), f(r, "undefined is not a valid condition value"), this._where[e] || (this._where[e] = {}), this._where[e][n] = t._encode(r), this;
          },
          sizeEqualTo: function sizeEqualTo(t, e) {
            this._addCondition(t, "$size", e);
          },
          notEqualTo: function notEqualTo(t, e) {
            return this._addCondition(t, "$ne", e), this;
          },
          lessThan: function lessThan(t, e) {
            return this._addCondition(t, "$lt", e), this;
          },
          greaterThan: function greaterThan(t, e) {
            return this._addCondition(t, "$gt", e), this;
          },
          lessThanOrEqualTo: function lessThanOrEqualTo(t, e) {
            return this._addCondition(t, "$lte", e), this;
          },
          greaterThanOrEqualTo: function greaterThanOrEqualTo(t, e) {
            return this._addCondition(t, "$gte", e), this;
          },
          containedIn: function containedIn(t, e) {
            return this._addCondition(t, "$in", e), this;
          },
          notContainedIn: function notContainedIn(t, e) {
            return this._addCondition(t, "$nin", e), this;
          },
          containsAll: function containsAll(t, e) {
            return this._addCondition(t, "$all", e), this;
          },
          exists: function exists(t) {
            return this._addCondition(t, "$exists", !0), this;
          },
          doesNotExist: function doesNotExist(t) {
            return this._addCondition(t, "$exists", !1), this;
          },
          matches: function matches(t, e, n) {
            return this._addCondition(t, "$regex", e), n || (n = ""), e.ignoreCase && (n += "i"), e.multiline && (n += "m"), n && n.length && this._addCondition(t, "$options", n), this;
          },
          matchesQuery: function matchesQuery(t, e) {
            var n = e.toJSON();
            return n.className = e.className, this._addCondition(t, "$inQuery", n), this;
          },
          doesNotMatchQuery: function doesNotMatchQuery(t, e) {
            var n = e.toJSON();
            return n.className = e.className, this._addCondition(t, "$notInQuery", n), this;
          },
          matchesKeyInQuery: function matchesKeyInQuery(t, e, n) {
            var r = n.toJSON();
            return r.className = n.className, this._addCondition(t, "$select", {
              key: e,
              query: r
            }), this;
          },
          doesNotMatchKeyInQuery: function doesNotMatchKeyInQuery(t, e, n) {
            var r = n.toJSON();
            return r.className = n.className, this._addCondition(t, "$dontSelect", {
              key: e,
              query: r
            }), this;
          },
          _orQuery: function _orQuery(t) {
            var e = r.map(t, function (t) {
              return t.toJSON().where;
            });
            return this._where.$or = e, this;
          },
          _andQuery: function _andQuery(t) {
            var e = r.map(t, function (t) {
              return t.toJSON().where;
            });
            return this._where.$and = e, this;
          },
          _quote: function _quote(t) {
            return "\\Q" + t.replace("\\E", "\\E\\\\E\\Q") + "\\E";
          },
          contains: function contains(t, e) {
            return this._addCondition(t, "$regex", this._quote(e)), this;
          },
          startsWith: function startsWith(t, e) {
            return this._addCondition(t, "$regex", "^" + this._quote(e)), this;
          },
          endsWith: function endsWith(t, e) {
            return this._addCondition(t, "$regex", this._quote(e) + "$"), this;
          },
          ascending: function ascending(t) {
            return f(t, "undefined is not a valid key"), this._order = t, this;
          },
          addAscending: function addAscending(t) {
            return f(t, "undefined is not a valid key"), this._order ? this._order += "," + t : this._order = t, this;
          },
          descending: function descending(t) {
            return f(t, "undefined is not a valid key"), this._order = "-" + t, this;
          },
          addDescending: function addDescending(t) {
            return f(t, "undefined is not a valid key"), this._order ? this._order += ",-" + t : this._order = "-" + t, this;
          },
          near: function near(e, n) {
            return n instanceof t.GeoPoint || (n = new t.GeoPoint(n)), this._addCondition(e, "$nearSphere", n), this;
          },
          withinRadians: function withinRadians(t, e, n) {
            return this.near(t, e), this._addCondition(t, "$maxDistance", n), this;
          },
          withinMiles: function withinMiles(t, e, n) {
            return this.withinRadians(t, e, n / 3958.8);
          },
          withinKilometers: function withinKilometers(t, e, n) {
            return this.withinRadians(t, e, n / 6371);
          },
          withinGeoBox: function withinGeoBox(e, n, r) {
            return n instanceof t.GeoPoint || (n = new t.GeoPoint(n)), r instanceof t.GeoPoint || (r = new t.GeoPoint(r)), this._addCondition(e, "$within", {
              $box: [n, r]
            }), this;
          },
          include: function include(t) {
            var e = this;
            return f(t, "undefined is not a valid key"), r(arguments).forEach(function (t) {
              e._include = e._include.concat(l(t));
            }), this;
          },
          includeACL: function includeACL() {
            var t = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0];
            return this._includeACL = t, this;
          },
          select: function select(t) {
            var e = this;
            return f(t, "undefined is not a valid key"), r(arguments).forEach(function (t) {
              e._select = e._select.concat(l(t));
            }), this;
          },
          each: function each(e) {
            var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};

            if (this._order || this._skip || this._limit >= 0) {
              var i = new Error("Cannot iterate on a query with sort, skip, or limit.");
              return t.Promise.reject(i);
            }

            var s = new t.Query(this.objectClass);
            s._limit = n.batchSize || 100, s._where = r.clone(this._where), s._include = r.clone(this._include), s.ascending("objectId");
            var o = !1;
            return t.Promise._continueWhile(function () {
              return !o;
            }, function () {
              return s.find(n).then(function (n) {
                var i = t.Promise.resolve();
                return r.each(n, function (t) {
                  i = i.then(function () {
                    return e(t);
                  });
                }), i.then(function () {
                  n.length >= s._limit ? s.greaterThan("objectId", n[n.length - 1].id) : o = !0;
                });
              });
            });
          },
          subscribe: function subscribe(e) {
            return t.LiveQuery.init(this, e);
          }
        }), t.FriendShipQuery = t.Query._extend({
          _objectClass: t.User,
          _newObject: function _newObject() {
            return new t.User();
          },
          _processResult: function _processResult(t) {
            if (t && t[this._friendshipTag]) {
              var e = t[this._friendshipTag];
              return "Pointer" === e.__type && "_User" === e.className && (delete e.__type, delete e.className), e;
            }

            return null;
          }
        });
      };
    }, function (t, e, n) {
      "use strict";

      var r = n(0);

      t.exports = function (t) {
        t.Relation = function (t, e) {
          if (!r.isString(e)) throw new TypeError("key must be a string");
          this.parent = t, this.key = e, this.targetClassName = null;
        }, t.Relation.reverseQuery = function (e, n, r) {
          var i = new t.Query(e);
          return i.equalTo(n, r._toPointer()), i;
        }, r.extend(t.Relation.prototype, {
          _ensureParentAndKey: function _ensureParentAndKey(t, e) {
            if (this.parent = this.parent || t, this.key = this.key || e, this.parent !== t) throw new Error("Internal Error. Relation retrieved from two different Objects.");
            if (this.key !== e) throw new Error("Internal Error. Relation retrieved from two different keys.");
          },
          add: function add(e) {
            r.isArray(e) || (e = [e]);
            var n = new t.Op.Relation(e, []);
            this.parent.set(this.key, n), this.targetClassName = n._targetClassName;
          },
          remove: function remove(e) {
            r.isArray(e) || (e = [e]);
            var n = new t.Op.Relation([], e);
            this.parent.set(this.key, n), this.targetClassName = n._targetClassName;
          },
          toJSON: function toJSON() {
            return {
              __type: "Relation",
              className: this.targetClassName
            };
          },
          query: function query() {
            var e, n;
            return this.targetClassName ? (e = t.Object._getSubclass(this.targetClassName), n = new t.Query(e)) : (e = t.Object._getSubclass(this.parent.className), n = new t.Query(e), n._extraOptions.redirectClassNameForKey = this.key), n._addCondition("$relatedTo", "object", this.parent._toPointer()), n._addCondition("$relatedTo", "key", this.key), n;
          }
        });
      };
    }, function (t, e, n) {
      "use strict";

      var r = n(0),
          i = n(4);

      t.exports = function (t) {
        t.Role = t.Object.extend("_Role", {
          constructor: function constructor(e, n) {
            if (r.isString(e) ? (t.Object.prototype.constructor.call(this, null, null), this.setName(e)) : t.Object.prototype.constructor.call(this, e, n), n) {
              if (!(n instanceof t.ACL)) throw new TypeError("acl must be an instance of AV.ACL");
              this.setACL(n);
            }
          },
          getName: function getName() {
            return this.get("name");
          },
          setName: function setName(t, e) {
            return this.set("name", t, e);
          },
          getUsers: function getUsers() {
            return this.relation("users");
          },
          getRoles: function getRoles() {
            return this.relation("roles");
          },
          validate: function validate(e, n) {
            if ("name" in e && e.name !== this.getName()) {
              var s = e.name;
              if (this.id && this.id !== e.objectId) return new i(i.OTHER_CAUSE, "A role's name can only be set before it has been saved.");
              if (!r.isString(s)) return new i(i.OTHER_CAUSE, "A role's name must be a String.");
              if (!/^[0-9a-zA-Z\-_ ]+$/.test(s)) return new i(i.OTHER_CAUSE, "A role's name can only contain alphanumeric characters, _, -, and spaces.");
            }

            return !!t.Object.prototype.validate && t.Object.prototype.validate.call(this, e, n);
          }
        });
      };
    }, function (t, e, n) {
      "use strict";

      var r = n(0),
          i = n(2)._request;

      t.exports = function (t) {
        t.SearchSortBuilder = function () {
          this._sortFields = [];
        }, r.extend(t.SearchSortBuilder.prototype, {
          _addField: function _addField(t, e, n, r) {
            var i = {};
            return i[t] = {
              order: e || "asc",
              mode: n || "avg",
              missing: "_" + (r || "last")
            }, this._sortFields.push(i), this;
          },
          ascending: function ascending(t, e, n) {
            return this._addField(t, "asc", e, n);
          },
          descending: function descending(t, e, n) {
            return this._addField(t, "desc", e, n);
          },
          whereNear: function whereNear(t, e, n) {
            n = n || {};
            var r = {},
                i = {
              lat: e.latitude,
              lon: e.longitude
            },
                s = {
              order: n.order || "asc",
              mode: n.mode || "avg",
              unit: n.unit || "km"
            };
            return s[t] = i, r._geo_distance = s, this._sortFields.push(r), this;
          },
          build: function build() {
            return JSON.stringify(t._encode(this._sortFields));
          }
        }), t.SearchQuery = t.Query._extend({
          _sid: null,
          _hits: 0,
          _queryString: null,
          _highlights: null,
          _sortBuilder: null,
          _createRequest: function _createRequest(t, e) {
            return i("search/select", null, null, "GET", t || this.toJSON(), e);
          },
          sid: function sid(t) {
            return this._sid = t, this;
          },
          queryString: function queryString(t) {
            return this._queryString = t, this;
          },
          highlights: function highlights(t) {
            var e;
            return e = t && r.isString(t) ? arguments : t, this._highlights = e, this;
          },
          sortBy: function sortBy(t) {
            return this._sortBuilder = t, this;
          },
          hits: function hits() {
            return this._hits || (this._hits = 0), this._hits;
          },
          _processResult: function _processResult(t) {
            return delete t.className, delete t._app_url, delete t._deeplink, t;
          },
          hasMore: function hasMore() {
            return !this._hitEnd;
          },
          reset: function reset() {
            this._hitEnd = !1, this._sid = null, this._hits = 0;
          },
          find: function find() {
            var t = this;
            return this._createRequest().then(function (e) {
              return e.sid ? (t._oldSid = t._sid, t._sid = e.sid) : (t._sid = null, t._hitEnd = !0), t._hits = e.hits || 0, r.map(e.results, function (n) {
                n.className && (e.className = n.className);

                var r = t._newObject(e);

                return r.appURL = n._app_url, r._finishFetch(t._processResult(n), !0), r;
              });
            });
          },
          toJSON: function toJSON() {
            var e = t.SearchQuery.__super__.toJSON.call(this);

            if (delete e.where, this.className && (e.clazz = this.className), this._sid && (e.sid = this._sid), !this._queryString) throw new Error("Please set query string.");
            if (e.q = this._queryString, this._highlights && (e.highlights = this._highlights.join(",")), this._sortBuilder && e.order) throw new Error("sort and order can not be set at same time.");
            return this._sortBuilder && (e.sort = this._sortBuilder.build()), e;
          }
        });
      };
    }, function (t, e, n) {
      "use strict";

      var r = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (t) {
        return _typeof(t);
      } : function (t) {
        return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : _typeof(t);
      },
          i = n(0),
          s = n(2)._request,
          o = n(3),
          a = o.getSessionToken;

      t.exports = function (t) {
        var e = function e() {
          var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          return a(e) ? t.User._fetchUserBySessionToken(a(e)) : t.User.currentAsync();
        },
            n = function n(_n) {
          return e(_n).then(function (e) {
            return t.Object.createWithoutData("_User", e.id)._toPointer();
          });
        };

        t.Status = function (t, e) {
          return this.data = {}, this.inboxType = "default", this.query = null, t && "object" === (void 0 === t ? "undefined" : r(t)) ? this.data = t : (t && (this.data.image = t), e && (this.data.message = e)), this;
        }, i.extend(t.Status.prototype, {
          get: function get(t) {
            return this.data[t];
          },
          set: function set(t, e) {
            return this.data[t] = e, this;
          },
          destroy: function destroy(e) {
            return this.id ? s("statuses", null, this.id, "DELETE", e) : t.Promise.reject(new Error("The status id is not exists."));
          },
          toObject: function toObject() {
            return this.id ? t.Object.createWithoutData("_Status", this.id) : null;
          },
          _getDataJSON: function _getDataJSON() {
            var e = i.clone(this.data);
            return t._encode(e);
          },
          send: function send() {
            var e = this,
                r = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
            if (!a(r) && !t.User.current()) throw new Error("Please signin an user.");
            return this.query ? n(r).then(function (t) {
              var n = e.query.toJSON();
              n.className = e.query.className;
              var i = {};
              return i.query = n, e.data = e.data || {}, e.data.source = e.data.source || t, i.data = e._getDataJSON(), i.inboxType = e.inboxType || "default", s("statuses", null, null, "POST", i, r);
            }).then(function (n) {
              return e.id = n.objectId, e.createdAt = t._parseDate(n.createdAt), e;
            }) : t.Status.sendStatusToFollowers(this, r);
          },
          _finishFetch: function _finishFetch(e) {
            this.id = e.objectId, this.createdAt = t._parseDate(e.createdAt), this.updatedAt = t._parseDate(e.updatedAt), this.messageId = e.messageId, delete e.messageId, delete e.objectId, delete e.createdAt, delete e.updatedAt, this.data = t._decode(e);
          }
        }), t.Status.sendStatusToFollowers = function (e) {
          var r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          if (!a(r) && !t.User.current()) throw new Error("Please signin an user.");
          return n(r).then(function (n) {
            var i = {};
            i.className = "_Follower", i.keys = "follower", i.where = {
              user: n
            };
            var o = {};
            return o.query = i, e.data = e.data || {}, e.data.source = e.data.source || n, o.data = e._getDataJSON(), o.inboxType = e.inboxType || "default", s("statuses", null, null, "POST", o, r).then(function (n) {
              return e.id = n.objectId, e.createdAt = t._parseDate(n.createdAt), e;
            });
          });
        }, t.Status.sendPrivateStatus = function (e, r) {
          var o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
          if (!a(o) && !t.User.current()) throw new Error("Please signin an user.");
          if (!r) throw new Error("Invalid target user.");
          var u = i.isString(r) ? r : r.id;
          if (!u) throw new Error("Invalid target user.");
          return n(o).then(function (n) {
            var r = {};
            r.className = "_User", r.where = {
              objectId: u
            };
            var i = {};
            return i.query = r, e.data = e.data || {}, e.data.source = e.data.source || n, i.data = e._getDataJSON(), i.inboxType = "private", e.inboxType = "private", s("statuses", null, null, "POST", i, o).then(function (n) {
              return e.id = n.objectId, e.createdAt = t._parseDate(n.createdAt), e;
            });
          });
        }, t.Status.countUnreadStatuses = function (n) {
          var r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "default",
              o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
          if (i.isString(r) || (o = r), !a(o) && null == n && !t.User.current()) throw new Error("Please signin an user or pass the owner objectId.");
          return e(o).then(function (e) {
            var n = {};
            return n.inboxType = t._encode(r), n.owner = t._encode(e), s("subscribe/statuses/count", null, null, "GET", n, o);
          });
        }, t.Status.resetUnreadCount = function (n) {
          var r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "default",
              o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
          if (i.isString(r) || (o = r), !a(o) && null == n && !t.User.current()) throw new Error("Please signin an user or pass the owner objectId.");
          return e(o).then(function (e) {
            var n = {};
            return n.inboxType = t._encode(r), n.owner = t._encode(e), s("subscribe/statuses/resetUnreadCount", null, null, "POST", n, o);
          });
        }, t.Status.statusQuery = function (e) {
          var n = new t.Query("_Status");
          return e && n.equalTo("source", e), n;
        }, t.InboxQuery = t.Query._extend({
          _objectClass: t.Status,
          _sinceId: 0,
          _maxId: 0,
          _inboxType: "default",
          _owner: null,
          _newObject: function _newObject() {
            return new t.Status();
          },
          _createRequest: function _createRequest(t, e) {
            return s("subscribe/statuses", null, null, "GET", t || this.toJSON(), e);
          },
          sinceId: function sinceId(t) {
            return this._sinceId = t, this;
          },
          maxId: function maxId(t) {
            return this._maxId = t, this;
          },
          owner: function owner(t) {
            return this._owner = t, this;
          },
          inboxType: function inboxType(t) {
            return this._inboxType = t, this;
          },
          toJSON: function toJSON() {
            var e = t.InboxQuery.__super__.toJSON.call(this);

            return e.owner = t._encode(this._owner), e.inboxType = t._encode(this._inboxType), e.sinceId = t._encode(this._sinceId), e.maxId = t._encode(this._maxId), e;
          }
        }), t.Status.inboxQuery = function (e, n) {
          var r = new t.InboxQuery(t.Status);
          return e && (r._owner = e), n && (r._inboxType = n), r;
        };
      };
    }, function (t, e, n) {
      "use strict";

      var r = n(0),
          i = n(4),
          s = n(2)._request,
          o = n(1),
          a = function a() {
        if ("undefined" == typeof wx || "function" != typeof wx.login) throw new Error("Weapp Login is only available in Weapp");
        return new o(function (t, e) {
          wx.login({
            success: function success(n) {
              var r = n.code,
                  i = n.errMsg;
              r ? t(r) : e(new Error(i));
            },
            fail: function fail() {
              return e(new Error("wx.login å¤±è´¥"));
            }
          });
        });
      };

      t.exports = function (t) {
        t.User = t.Object.extend("_User", {
          _isCurrentUser: !1,
          _mergeMagicFields: function _mergeMagicFields(e) {
            e.sessionToken && (this._sessionToken = e.sessionToken, delete e.sessionToken), t.User.__super__._mergeMagicFields.call(this, e);
          },
          _cleanupAuthData: function _cleanupAuthData() {
            if (this.isCurrent()) {
              var e = this.get("authData");
              e && t._objectEach(this.get("authData"), function (t, n) {
                e[n] || delete e[n];
              });
            }
          },
          _synchronizeAllAuthData: function _synchronizeAllAuthData() {
            if (this.get("authData")) {
              var e = this;

              t._objectEach(this.get("authData"), function (t, n) {
                e._synchronizeAuthData(n);
              });
            }
          },
          _synchronizeAuthData: function _synchronizeAuthData(e) {
            if (this.isCurrent()) {
              var n;
              r.isString(e) ? (n = e, e = t.User._authProviders[n]) : n = e.getAuthType();
              var i = this.get("authData");

              if (i && e) {
                e.restoreAuthentication(i[n]) || this._unlinkFrom(e);
              }
            }
          },
          _handleSaveResult: function _handleSaveResult(e) {
            return e && !t._config.disableCurrentUser && (this._isCurrentUser = !0), this._cleanupAuthData(), this._synchronizeAllAuthData(), delete this._serverData.password, this._rebuildEstimatedDataForKey("password"), this._refreshCache(), !e && !this.isCurrent() || t._config.disableCurrentUser ? o.resolve() : o.resolve(t.User._saveCurrentUser(this));
          },
          _linkWith: function _linkWith(e, n) {
            var i,
                s = this;

            if (r.isString(e) ? (i = e, e = t.User._authProviders[e]) : i = e.getAuthType(), n) {
              var o = this.get("authData") || {};
              return o[i] = n, this.save({
                authData: o
              }).then(function (t) {
                return t._handleSaveResult(!0).then(function () {
                  return t;
                });
              });
            }

            return e.authenticate().then(function (t) {
              return s._linkWith(e, t);
            });
          },
          linkWithWeapp: function linkWithWeapp() {
            var t = this;
            return a().then(function (e) {
              return t._linkWith("lc_weapp", {
                code: e
              });
            });
          },
          _unlinkFrom: function _unlinkFrom(e) {
            var n = this;
            return r.isString(e) && (e = t.User._authProviders[e]), this._linkWith(e, null).then(function (t) {
              return n._synchronizeAuthData(e), t;
            });
          },
          _isLinked: function _isLinked(t) {
            var e;
            return e = r.isString(t) ? t : t.getAuthType(), !!(this.get("authData") || {})[e];
          },
          logOut: function logOut() {
            this._logOutWithAll(), this._isCurrentUser = !1;
          },
          _logOutWithAll: function _logOutWithAll() {
            if (this.get("authData")) {
              var e = this;

              t._objectEach(this.get("authData"), function (t, n) {
                e._logOutWith(n);
              });
            }
          },
          _logOutWith: function _logOutWith(e) {
            this.isCurrent() && (r.isString(e) && (e = t.User._authProviders[e]), e && e.deauthenticate && e.deauthenticate());
          },
          signUp: function signUp(t, e) {
            var n = t && t.username || this.get("username");
            if (!n || "" === n) throw new i(i.OTHER_CAUSE, "Cannot sign up user with an empty name.");
            var r = t && t.password || this.get("password");
            if (!r || "" === r) throw new i(i.OTHER_CAUSE, "Cannot sign up user with an empty password.");
            return this.save(t, e).then(function (t) {
              return t._handleSaveResult(!0).then(function () {
                return t;
              });
            });
          },
          signUpOrlogInWithMobilePhone: function signUpOrlogInWithMobilePhone(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                n = t && t.mobilePhoneNumber || this.get("mobilePhoneNumber");
            if (!n || "" === n) throw new i(i.OTHER_CAUSE, "Cannot sign up or login user by mobilePhoneNumber with an empty mobilePhoneNumber.");
            var r = t && t.smsCode || this.get("smsCode");
            if (!r || "" === r) throw new i(i.OTHER_CAUSE, "Cannot sign up or login user by mobilePhoneNumber  with an empty smsCode.");
            return e._makeRequest = function (t, e, n, r, i) {
              return s("usersByMobilePhone", null, null, "POST", i);
            }, this.save(t, e).then(function (t) {
              return delete t.attributes.smsCode, delete t._serverData.smsCode, t._handleSaveResult(!0).then(function () {
                return t;
              });
            });
          },
          logIn: function logIn() {
            var t = this;
            return s("login", null, null, "POST", this.toJSON()).then(function (e) {
              var n = t.parse(e);
              return t._finishFetch(n), t._handleSaveResult(!0).then(function () {
                return n.smsCode || delete t.attributes.smsCode, t;
              });
            });
          },
          save: function save(e, n, i) {
            var s, o;
            return r.isObject(e) || r.isNull(e) || r.isUndefined(e) ? (s = e, o = n) : (s = {}, s[e] = n, o = i), o = o || {}, t.Object.prototype.save.call(this, s, o).then(function (t) {
              return t._handleSaveResult(!1).then(function () {
                return t;
              });
            });
          },
          follow: function follow(e, n) {
            if (!this.id) throw new Error("Please signin.");
            var i = void 0,
                o = void 0;
            e.user ? (i = e.user, o = e.attributes) : i = e;
            var a = r.isString(i) ? i : i.id;
            if (!a) throw new Error("Invalid target user.");
            var u = "users/" + this.id + "/friendship/" + a;
            return s(u, null, null, "POST", t._encode(o), n);
          },
          unfollow: function unfollow(t, e) {
            if (!this.id) throw new Error("Please signin.");
            var n = void 0;
            n = t.user ? t.user : t;
            var i = r.isString(n) ? n : n.id;
            if (!i) throw new Error("Invalid target user.");
            var o = "users/" + this.id + "/friendship/" + i;
            return s(o, null, null, "DELETE", null, e);
          },
          followerQuery: function followerQuery() {
            return t.User.followerQuery(this.id);
          },
          followeeQuery: function followeeQuery() {
            return t.User.followeeQuery(this.id);
          },
          fetch: function fetch(e, n) {
            return t.Object.prototype.fetch.call(this, e, n).then(function (t) {
              return t._handleSaveResult(!1).then(function () {
                return t;
              });
            });
          },
          updatePassword: function updatePassword(t, e, n) {
            var r = "users/" + this.id + "/updatePassword";
            return s(r, null, null, "PUT", {
              old_password: t,
              new_password: e
            }, n);
          },
          isCurrent: function isCurrent() {
            return this._isCurrentUser;
          },
          getUsername: function getUsername() {
            return this.get("username");
          },
          getMobilePhoneNumber: function getMobilePhoneNumber() {
            return this.get("mobilePhoneNumber");
          },
          setMobilePhoneNumber: function setMobilePhoneNumber(t, e) {
            return this.set("mobilePhoneNumber", t, e);
          },
          setUsername: function setUsername(t, e) {
            return this.set("username", t, e);
          },
          setPassword: function setPassword(t, e) {
            return this.set("password", t, e);
          },
          getEmail: function getEmail() {
            return this.get("email");
          },
          setEmail: function setEmail(t, e) {
            return this.set("email", t, e);
          },
          authenticated: function authenticated() {
            return console.warn("DEPRECATED: å¦‚æžœè¦åˆ¤æ–­å½“å‰ç”¨æˆ·çš„ç™»å½•çŠ¶æ€æ˜¯å¦æœ‰æ•ˆï¼Œè¯·ä½¿ç”¨ currentUser.isAuthenticated().then()ï¼Œå¦‚æžœè¦åˆ¤æ–­è¯¥ç”¨æˆ·æ˜¯å¦æ˜¯å½“å‰ç™»å½•ç”¨æˆ·ï¼Œè¯·ä½¿ç”¨ user.id === currentUser.idã€‚"), !!this._sessionToken && !t._config.disableCurrentUser && t.User.current() && t.User.current().id === this.id;
          },
          isAuthenticated: function isAuthenticated() {
            var e = this;
            return o.resolve().then(function () {
              return !!e._sessionToken && t.User._fetchUserBySessionToken(e._sessionToken).then(function () {
                return !0;
              }, function (t) {
                if (211 === t.code) return !1;
                throw t;
              });
            });
          },
          getSessionToken: function getSessionToken() {
            return this._sessionToken;
          },
          refreshSessionToken: function refreshSessionToken(t) {
            var e = this;
            return s("users/" + this.id + "/refreshSessionToken", null, null, "PUT", null, t).then(function (t) {
              return e._finishFetch(t), e._handleSaveResult(!0).then(function () {
                return e;
              });
            });
          },
          getRoles: function getRoles(e) {
            return t.Relation.reverseQuery("_Role", "users", this).find(e);
          }
        }, {
          _currentUser: null,
          _currentUserMatchesDisk: !1,
          _CURRENT_USER_KEY: "currentUser",
          _authProviders: {},
          signUp: function signUp(e, n, r, i) {
            return r = r || {}, r.username = e, r.password = n, t.Object._create("_User").signUp(r, i);
          },
          logIn: function logIn(e, n, r) {
            var i = t.Object._create("_User");

            return i._finishFetch({
              username: e,
              password: n
            }), i.logIn(r);
          },
          become: function become(t) {
            return this._fetchUserBySessionToken(t).then(function (t) {
              return t._handleSaveResult(!0).then(function () {
                return t;
              });
            });
          },
          _fetchUserBySessionToken: function _fetchUserBySessionToken(e) {
            var n = t.Object._create("_User");

            return s("users", "me", null, "GET", {
              session_token: e
            }).then(function (t) {
              var e = n.parse(t);
              return n._finishFetch(e), n;
            });
          },
          logInWithMobilePhoneSmsCode: function logInWithMobilePhoneSmsCode(e, n, r) {
            var i = t.Object._create("_User");

            return i._finishFetch({
              mobilePhoneNumber: e,
              smsCode: n
            }), i.logIn(r);
          },
          signUpOrlogInWithMobilePhone: function signUpOrlogInWithMobilePhone(e, n, r, i) {
            return r = r || {}, r.mobilePhoneNumber = e, r.smsCode = n, t.Object._create("_User").signUpOrlogInWithMobilePhone(r, i);
          },
          logInWithMobilePhone: function logInWithMobilePhone(e, n, r) {
            var i = t.Object._create("_User");

            return i._finishFetch({
              mobilePhoneNumber: e,
              password: n
            }), i.logIn(r);
          },
          signUpOrlogInWithAuthData: function signUpOrlogInWithAuthData(e, n) {
            return t.User._logInWith(n, e);
          },
          loginWithWeapp: function loginWithWeapp() {
            var t = this;
            return a().then(function (e) {
              return t.signUpOrlogInWithAuthData({
                code: e
              }, "lc_weapp");
            });
          },
          associateWithAuthData: function associateWithAuthData(t, e, n) {
            return t._linkWith(e, n);
          },
          logOut: function logOut() {
            return t._config.disableCurrentUser ? (console.warn("AV.User.current() was disabled in multi-user environment, call logOut() from user object instead https://leancloud.cn/docs/leanengine-node-sdk-upgrade-1.html"), o.resolve(null)) : (null !== t.User._currentUser && (t.User._currentUser._logOutWithAll(), t.User._currentUser._isCurrentUser = !1), t.User._currentUserMatchesDisk = !0, t.User._currentUser = null, t.localStorage.removeItemAsync(t._getAVPath(t.User._CURRENT_USER_KEY)).then(function () {
              return t._refreshSubscriptionId();
            }));
          },
          followerQuery: function followerQuery(e) {
            if (!e || !r.isString(e)) throw new Error("Invalid user object id.");
            var n = new t.FriendShipQuery("_Follower");
            return n._friendshipTag = "follower", n.equalTo("user", t.Object.createWithoutData("_User", e)), n;
          },
          followeeQuery: function followeeQuery(e) {
            if (!e || !r.isString(e)) throw new Error("Invalid user object id.");
            var n = new t.FriendShipQuery("_Followee");
            return n._friendshipTag = "followee", n.equalTo("user", t.Object.createWithoutData("_User", e)), n;
          },
          requestPasswordReset: function requestPasswordReset(t) {
            return s("requestPasswordReset", null, null, "POST", {
              email: t
            });
          },
          requestEmailVerify: function requestEmailVerify(t) {
            return s("requestEmailVerify", null, null, "POST", {
              email: t
            });
          },
          requestMobilePhoneVerify: function requestMobilePhoneVerify(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                n = {
              mobilePhoneNumber: t
            };
            return e.validateToken && (n.validate_token = e.validateToken), s("requestMobilePhoneVerify", null, null, "POST", n, e);
          },
          requestPasswordResetBySmsCode: function requestPasswordResetBySmsCode(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                n = {
              mobilePhoneNumber: t
            };
            return e.validateToken && (n.validate_token = e.validateToken), s("requestPasswordResetBySmsCode", null, null, "POST", n, e);
          },
          resetPasswordBySmsCode: function resetPasswordBySmsCode(t, e) {
            return s("resetPasswordBySmsCode", null, t, "PUT", {
              password: e
            });
          },
          verifyMobilePhone: function verifyMobilePhone(t) {
            return s("verifyMobilePhone", null, t, "POST", null);
          },
          requestLoginSmsCode: function requestLoginSmsCode(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                n = {
              mobilePhoneNumber: t
            };
            return e.validateToken && (n.validate_token = e.validateToken), s("requestLoginSmsCode", null, null, "POST", n, e);
          },
          currentAsync: function currentAsync() {
            return t._config.disableCurrentUser ? (console.warn("AV.User.currentAsync() was disabled in multi-user environment, access user from request instead https://leancloud.cn/docs/leanengine-node-sdk-upgrade-1.html"), o.resolve(null)) : t.User._currentUser ? o.resolve(t.User._currentUser) : t.User._currentUserMatchesDisk ? o.resolve(t.User._currentUser) : t.localStorage.getItemAsync(t._getAVPath(t.User._CURRENT_USER_KEY)).then(function (e) {
              if (!e) return null;
              t.User._currentUserMatchesDisk = !0, t.User._currentUser = t.Object._create("_User"), t.User._currentUser._isCurrentUser = !0;
              var n = JSON.parse(e);
              return t.User._currentUser.id = n._id, delete n._id, t.User._currentUser._sessionToken = n._sessionToken, delete n._sessionToken, t.User._currentUser._finishFetch(n), t.User._currentUser._synchronizeAllAuthData(), t.User._currentUser._refreshCache(), t.User._currentUser._opSetQueue = [{}], t.User._currentUser;
            });
          },
          current: function current() {
            if (t._config.disableCurrentUser) return console.warn("AV.User.current() was disabled in multi-user environment, access user from request instead https://leancloud.cn/docs/leanengine-node-sdk-upgrade-1.html"), null;
            if (t.User._currentUser) return t.User._currentUser;
            if (t.User._currentUserMatchesDisk) return t.User._currentUser;
            t.User._currentUserMatchesDisk = !0;
            var e = t.localStorage.getItem(t._getAVPath(t.User._CURRENT_USER_KEY));
            if (!e) return null;
            t.User._currentUser = t.Object._create("_User"), t.User._currentUser._isCurrentUser = !0;
            var n = JSON.parse(e);
            return t.User._currentUser.id = n._id, delete n._id, t.User._currentUser._sessionToken = n._sessionToken, delete n._sessionToken, t.User._currentUser._finishFetch(n), t.User._currentUser._synchronizeAllAuthData(), t.User._currentUser._refreshCache(), t.User._currentUser._opSetQueue = [{}], t.User._currentUser;
          },
          _saveCurrentUser: function _saveCurrentUser(e) {
            var n;
            return n = t.User._currentUser !== e ? t.User.logOut() : o.resolve(), n.then(function () {
              e._isCurrentUser = !0, t.User._currentUser = e;
              var n = e.toJSON();
              return n._id = e.id, n._sessionToken = e._sessionToken, t.localStorage.setItemAsync(t._getAVPath(t.User._CURRENT_USER_KEY), JSON.stringify(n)).then(function () {
                return t.User._currentUserMatchesDisk = !0, t._refreshSubscriptionId();
              });
            });
          },
          _registerAuthenticationProvider: function _registerAuthenticationProvider(e) {
            t.User._authProviders[e.getAuthType()] = e, !t._config.disableCurrentUser && t.User.current() && t.User.current()._synchronizeAuthData(e.getAuthType());
          },
          _logInWith: function _logInWith(e, n) {
            return t.Object._create("_User")._linkWith(e, n);
          }
        });
      };
    }, function (t, e, n) {
      "use strict";

      function r(t) {
        var e = this;
        this.AV = t, this.lockedUntil = 0, o.getAsync("serverURLs").then(function (t) {
          if (!t) return e.lock(0);
          var n = t.serverURLs,
              r = t.lockedUntil;
          e.AV._setServerURLs(n, !1), e.lockedUntil = r;
        })["catch"](function () {
          return e.lock(0);
        });
      }

      var i = n(3),
          s = i.ajax,
          o = n(10);
      r.prototype.disable = function () {
        this.disabled = !0;
      }, r.prototype.lock = function (t) {
        this.lockedUntil = Date.now() + t;
      }, r.prototype.refresh = function () {
        var t = this;

        if (!(this.disabled || Date.now() < this.lockedUntil)) {
          this.lock(10);
          return s({
            method: "get",
            url: "https://app-router.leancloud.cn/2/route",
            query: {
              appId: this.AV.applicationId
            }
          }).then(function (e) {
            if (!t.disabled) {
              var n = e.ttl;
              if (!n) throw new Error("missing ttl");
              n *= 1e3;
              var r = {
                push: "https://" + e.push_server,
                stats: "https://" + e.stats_server,
                engine: "https://" + e.engine_server,
                api: "https://" + e.api_server
              };
              return t.AV._setServerURLs(r, !1), t.lock(n), o.setAsync("serverURLs", {
                serverURLs: r,
                lockedUntil: t.lockedUntil
              }, n);
            }
          })["catch"](function (e) {
            console.warn("refresh server URLs failed: " + e.message), t.lock(600);
          });
        }
      }, t.exports = r;
    }, function (t, e, n) {
      "use strict";
      /*!
      * LeanCloud JavaScript SDK
      * https://leancloud.cn
      *
      * Copyright 2016 LeanCloud.cn, Inc.
      * The LeanCloud JavaScript SDK is freely distributable under the MIT license.
      */

      n(26);
      var r = n(5);
      r._ = n(0), r.version = n(12), r.Promise = n(1), r.localStorage = n(11), r.Cache = n(10), r.Error = n(4), n(21), n(18)(r), n(20)(r), n(14)(r), n(25)(r), n(29)(r), n(19)(r), n(24)(r), n(30)(r), n(33)(r), n(28)(r), n(23)(r), n(15)(r), n(16)(r), n(27)(r), n(32)(r), n(31)(r), n(22)(r), r.Conversation = n(17), t.exports = r;
    }, function (t, e, n) {
      "use strict";

      t.exports = [];
    }, function (t, e, n) {
      "use strict";

      var r = n(12),
          i = ["Browser"].concat(n(36));
      t.exports = "LeanCloud-JS-SDK/" + r + " (" + i.join("; ") + ")";
    }, function (t, e, n) {
      "use strict";

      var r = n(7),
          i = n(6)("cos"),
          s = n(1);

      t.exports = function (t, e, n) {
        var o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
        n.attributes.url = t.url, n._bucket = t.bucket, n.id = t.objectId;
        var a = t.upload_url + "?sign=" + encodeURIComponent(t.token);
        return new s(function (t, s) {
          var u = r("POST", a).field("fileContent", e).field("op", "upload");
          o.onprogress && u.on("progress", o.onprogress), u.end(function (e, r) {
            if (r && i(r.status, r.body, r.text), e) return r && (e.statusCode = r.status, e.responseText = r.text, e.response = r.body), s(e);
            t(n);
          });
        });
      };
    }, function (t, e, n) {
      "use strict";

      var r = n(7),
          i = n(1),
          s = n(6)("qiniu");

      t.exports = function (t, e, n) {
        var o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
        n.attributes.url = t.url, n._bucket = t.bucket, n.id = t.objectId;
        var a = t.token;
        return new i(function (t, i) {
          var u = r("POST", "https://up.qbox.me").field("file", e).field("name", n.attributes.name).field("key", n._qiniu_key).field("token", a);
          o.onprogress && u.on("progress", o.onprogress), u.end(function (e, r) {
            if (r && s(r.status, r.body, r.text), e) return r && (e.statusCode = r.status, e.responseText = r.text, e.response = r.body), i(e);
            t(n);
          });
        });
      };
    }, function (t, e, n) {
      "use strict";

      var r = n(7),
          i = n(1),
          s = function s(t, e) {
        return e && (t.statusCode = e.status, t.responseText = e.text, t.response = e.body), t;
      };

      t.exports = function (t, e, n) {
        var o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
        return n.attributes.url = t.url, n._bucket = t.bucket, n.id = t.objectId, new i(function (i, a) {
          var u = r("PUT", t.upload_url).set("Content-Type", n.get("mime_type"));
          o.onprogress && u.on("progress", o.onprogress), u.on("response", function (t) {
            if (t.ok) return i(n);
            a(s(t.error, t));
          }), u.on("error", function (t, e) {
            return a(s(t, e));
          }), u.send(e).end();
        });
      };
    }, function (t, e, n) {
      "use strict";

      (function (e) {
        var r = n(0),
            i = (n(1), {}),
            s = ["getItem", "setItem", "removeItem", "clear"],
            o = e.localStorage;

        try {
          var a = "__storejs__";
          if (o.setItem(a, a), o.getItem(a) != a) throw new Error();
          o.removeItem(a);
        } catch (t) {
          o = n(49);
        }

        r(s).each(function (t) {
          i[t] = function () {
            return o[t].apply(o, arguments);
          };
        }), i.async = !1, t.exports = i;
      }).call(e, n(9));
    }, function (t, e, n) {
      "use strict";

      var r = function r(t, e) {
        var n;
        t.indexOf("base64") < 0 ? n = atob(t) : t.split(",")[0].indexOf("base64") >= 0 ? (e = e || t.split(",")[0].split(":")[1].split(";")[0], n = atob(t.split(",")[1])) : n = unescape(t.split(",")[1]);

        for (var r = new Uint8Array(n.length), i = 0; i < n.length; i++) {
          r[i] = n.charCodeAt(i);
        }

        return new Blob([r], {
          type: e
        });
      };

      t.exports = r;
    }, function (t, e, n) {
      function r(t) {
        if (t) return i(t);
      }

      function i(t) {
        for (var e in r.prototype) {
          t[e] = r.prototype[e];
        }

        return t;
      }

      t.exports = r, r.prototype.on = r.prototype.addEventListener = function (t, e) {
        return this._callbacks = this._callbacks || {}, (this._callbacks["$" + t] = this._callbacks["$" + t] || []).push(e), this;
      }, r.prototype.once = function (t, e) {
        function n() {
          this.off(t, n), e.apply(this, arguments);
        }

        return n.fn = e, this.on(t, n), this;
      }, r.prototype.off = r.prototype.removeListener = r.prototype.removeAllListeners = r.prototype.removeEventListener = function (t, e) {
        if (this._callbacks = this._callbacks || {}, 0 == arguments.length) return this._callbacks = {}, this;
        var n = this._callbacks["$" + t];
        if (!n) return this;
        if (1 == arguments.length) return delete this._callbacks["$" + t], this;

        for (var r, i = 0; i < n.length; i++) {
          if ((r = n[i]) === e || r.fn === e) {
            n.splice(i, 1);
            break;
          }
        }

        return this;
      }, r.prototype.emit = function (t) {
        this._callbacks = this._callbacks || {};
        var e = [].slice.call(arguments, 1),
            n = this._callbacks["$" + t];

        if (n) {
          n = n.slice(0);

          for (var r = 0, i = n.length; r < i; ++r) {
            n[r].apply(this, e);
          }
        }

        return this;
      }, r.prototype.listeners = function (t) {
        return this._callbacks = this._callbacks || {}, this._callbacks["$" + t] || [];
      }, r.prototype.hasListeners = function (t) {
        return !!this.listeners(t).length;
      };
    }, function (t, e) {
      !function () {
        var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
            n = {
          rotl: function rotl(t, e) {
            return t << e | t >>> 32 - e;
          },
          rotr: function rotr(t, e) {
            return t << 32 - e | t >>> e;
          },
          endian: function endian(t) {
            if (t.constructor == Number) return 16711935 & n.rotl(t, 8) | 4278255360 & n.rotl(t, 24);

            for (var e = 0; e < t.length; e++) {
              t[e] = n.endian(t[e]);
            }

            return t;
          },
          randomBytes: function randomBytes(t) {
            for (var e = []; t > 0; t--) {
              e.push(Math.floor(256 * Math.random()));
            }

            return e;
          },
          bytesToWords: function bytesToWords(t) {
            for (var e = [], n = 0, r = 0; n < t.length; n++, r += 8) {
              e[r >>> 5] |= t[n] << 24 - r % 32;
            }

            return e;
          },
          wordsToBytes: function wordsToBytes(t) {
            for (var e = [], n = 0; n < 32 * t.length; n += 8) {
              e.push(t[n >>> 5] >>> 24 - n % 32 & 255);
            }

            return e;
          },
          bytesToHex: function bytesToHex(t) {
            for (var e = [], n = 0; n < t.length; n++) {
              e.push((t[n] >>> 4).toString(16)), e.push((15 & t[n]).toString(16));
            }

            return e.join("");
          },
          hexToBytes: function hexToBytes(t) {
            for (var e = [], n = 0; n < t.length; n += 2) {
              e.push(parseInt(t.substr(n, 2), 16));
            }

            return e;
          },
          bytesToBase64: function bytesToBase64(t) {
            for (var n = [], r = 0; r < t.length; r += 3) {
              for (var i = t[r] << 16 | t[r + 1] << 8 | t[r + 2], s = 0; s < 4; s++) {
                8 * r + 6 * s <= 8 * t.length ? n.push(e.charAt(i >>> 6 * (3 - s) & 63)) : n.push("=");
              }
            }

            return n.join("");
          },
          base64ToBytes: function base64ToBytes(t) {
            t = t.replace(/[^A-Z0-9+\/]/gi, "");

            for (var n = [], r = 0, i = 0; r < t.length; i = ++r % 4) {
              0 != i && n.push((e.indexOf(t.charAt(r - 1)) & Math.pow(2, -2 * i + 8) - 1) << 2 * i | e.indexOf(t.charAt(r)) >>> 6 - 2 * i);
            }

            return n;
          }
        };
        t.exports = n;
      }();
    }, function (t, e, n) {
      function r(t) {
        var n,
            r = 0;

        for (n in t) {
          r = (r << 5) - r + t.charCodeAt(n), r |= 0;
        }

        return e.colors[Math.abs(r) % e.colors.length];
      }

      function i(t) {
        function n() {
          if (n.enabled) {
            var t = n,
                r = +new Date(),
                i = r - (c || r);
            t.diff = i, t.prev = c, t.curr = r, c = r;

            for (var s = new Array(arguments.length), o = 0; o < s.length; o++) {
              s[o] = arguments[o];
            }

            s[0] = e.coerce(s[0]), "string" != typeof s[0] && s.unshift("%O");
            var a = 0;
            s[0] = s[0].replace(/%([a-zA-Z%])/g, function (n, r) {
              if ("%%" === n) return n;
              a++;
              var i = e.formatters[r];

              if ("function" == typeof i) {
                var o = s[a];
                n = i.call(t, o), s.splice(a, 1), a--;
              }

              return n;
            }), e.formatArgs.call(t, s);
            (n.log || e.log || console.log.bind(console)).apply(t, s);
          }
        }

        return n.namespace = t, n.enabled = e.enabled(t), n.useColors = e.useColors(), n.color = r(t), "function" == typeof e.init && e.init(n), n;
      }

      function s(t) {
        e.save(t), e.names = [], e.skips = [];

        for (var n = ("string" == typeof t ? t : "").split(/[\s,]+/), r = n.length, i = 0; i < r; i++) {
          n[i] && (t = n[i].replace(/\*/g, ".*?"), "-" === t[0] ? e.skips.push(new RegExp("^" + t.substr(1) + "$")) : e.names.push(new RegExp("^" + t + "$")));
        }
      }

      function o() {
        e.enable("");
      }

      function a(t) {
        var n, r;

        for (n = 0, r = e.skips.length; n < r; n++) {
          if (e.skips[n].test(t)) return !1;
        }

        for (n = 0, r = e.names.length; n < r; n++) {
          if (e.names[n].test(t)) return !0;
        }

        return !1;
      }

      function u(t) {
        return t instanceof Error ? t.stack || t.message : t;
      }

      e = t.exports = i.debug = i["default"] = i, e.coerce = u, e.disable = o, e.enable = s, e.enabled = a, e.humanize = n(51), e.names = [], e.skips = [], e.formatters = {};
      var c;
    }, function (t, e, n) {
      (function (e) {
        /*!
        * @overview es6-promise - a tiny implementation of Promises/A+.
        * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
        * @license   Licensed under MIT license
        *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
        * @version   4.1.1
        */
        !function (e, n) {
          t.exports = n();
        }(0, function () {
          "use strict";

          function t(t) {
            var e = _typeof(t);

            return null !== t && ("object" === e || "function" === e);
          }

          function r(t) {
            return "function" == typeof t;
          }

          function i(t) {
            V = t;
          }

          function s(t) {
            W = t;
          }

          function o() {
            return void 0 !== Q ? function () {
              Q(u);
            } : a();
          }

          function a() {
            var t = setTimeout;
            return function () {
              return t(u, 1);
            };
          }

          function u() {
            for (var t = 0; t < B; t += 2) {
              (0, X[t])(X[t + 1]), X[t] = void 0, X[t + 1] = void 0;
            }

            B = 0;
          }

          function c(t, e) {
            var n = arguments,
                r = this,
                i = new this.constructor(h);
            void 0 === i[Z] && x(i);
            var s = r._state;
            return s ? function () {
              var t = n[s - 1];
              W(function () {
                return N(s, i, t, r._result);
              });
            }() : S(r, i, t, e), i;
          }

          function l(t) {
            var e = this;
            if (t && "object" == _typeof(t) && t.constructor === e) return t;
            var n = new e(h);
            return g(n, t), n;
          }

          function h() {}

          function f() {
            return new TypeError("You cannot resolve a promise with itself");
          }

          function d() {
            return new TypeError("A promises callback cannot return that same promise.");
          }

          function p(t) {
            try {
              return t.then;
            } catch (t) {
              return rt.error = t, rt;
            }
          }

          function _(t, e, n, r) {
            try {
              t.call(e, n, r);
            } catch (t) {
              return t;
            }
          }

          function v(t, e, n) {
            W(function (t) {
              var r = !1,
                  i = _(n, e, function (n) {
                r || (r = !0, e !== n ? g(t, n) : w(t, n));
              }, function (e) {
                r || (r = !0, O(t, e));
              }, "Settle: " + (t._label || " unknown promise"));

              !r && i && (r = !0, O(t, i));
            }, t);
          }

          function m(t, e) {
            e._state === et ? w(t, e._result) : e._state === nt ? O(t, e._result) : S(e, void 0, function (e) {
              return g(t, e);
            }, function (e) {
              return O(t, e);
            });
          }

          function y(t, e, n) {
            e.constructor === t.constructor && n === c && e.constructor.resolve === l ? m(t, e) : n === rt ? (O(t, rt.error), rt.error = null) : void 0 === n ? w(t, e) : r(n) ? v(t, e, n) : w(t, e);
          }

          function g(e, n) {
            e === n ? O(e, f()) : t(n) ? y(e, n, p(n)) : w(e, n);
          }

          function b(t) {
            t._onerror && t._onerror(t._result), A(t);
          }

          function w(t, e) {
            t._state === tt && (t._result = e, t._state = et, 0 !== t._subscribers.length && W(A, t));
          }

          function O(t, e) {
            t._state === tt && (t._state = nt, t._result = e, W(b, t));
          }

          function S(t, e, n, r) {
            var i = t._subscribers,
                s = i.length;
            t._onerror = null, i[s] = e, i[s + et] = n, i[s + nt] = r, 0 === s && t._state && W(A, t);
          }

          function A(t) {
            var e = t._subscribers,
                n = t._state;

            if (0 !== e.length) {
              for (var r = void 0, i = void 0, s = t._result, o = 0; o < e.length; o += 3) {
                r = e[o], i = e[o + n], r ? N(n, r, i, s) : i(s);
              }

              t._subscribers.length = 0;
            }
          }

          function E() {
            this.error = null;
          }

          function T(t, e) {
            try {
              return t(e);
            } catch (t) {
              return it.error = t, it;
            }
          }

          function N(t, e, n, i) {
            var s = r(n),
                o = void 0,
                a = void 0,
                u = void 0,
                c = void 0;

            if (s) {
              if (o = T(n, i), o === it ? (c = !0, a = o.error, o.error = null) : u = !0, e === o) return void O(e, d());
            } else o = i, u = !0;

            e._state !== tt || (s && u ? g(e, o) : c ? O(e, a) : t === et ? w(e, o) : t === nt && O(e, o));
          }

          function C(t, e) {
            try {
              e(function (e) {
                g(t, e);
              }, function (e) {
                O(t, e);
              });
            } catch (e) {
              O(t, e);
            }
          }

          function j() {
            return st++;
          }

          function x(t) {
            t[Z] = st++, t._state = void 0, t._result = void 0, t._subscribers = [];
          }

          function U(t, e) {
            this._instanceConstructor = t, this.promise = new t(h), this.promise[Z] || x(this.promise), J(e) ? (this.length = e.length, this._remaining = e.length, this._result = new Array(this.length), 0 === this.length ? w(this.promise, this._result) : (this.length = this.length || 0, this._enumerate(e), 0 === this._remaining && w(this.promise, this._result))) : O(this.promise, k());
          }

          function k() {
            return new Error("Array Methods must be provided an Array");
          }

          function I(t) {
            return new U(this, t).promise;
          }

          function R(t) {
            var e = this;
            return new e(J(t) ? function (n, r) {
              for (var i = t.length, s = 0; s < i; s++) {
                e.resolve(t[s]).then(n, r);
              }
            } : function (t, e) {
              return e(new TypeError("You must pass an array to race."));
            });
          }

          function P(t) {
            var e = this,
                n = new e(h);
            return O(n, t), n;
          }

          function D() {
            throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");
          }

          function L() {
            throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
          }

          function q(t) {
            this[Z] = j(), this._result = this._state = void 0, this._subscribers = [], h !== t && ("function" != typeof t && D(), this instanceof q ? C(this, t) : L());
          }

          function M() {
            var t = void 0;
            if (void 0 !== e) t = e;else if ("undefined" != typeof self) t = self;else try {
              t = Function("return this")();
            } catch (t) {
              throw new Error("polyfill failed because global object is unavailable in this environment");
            }
            var n = t.Promise;

            if (n) {
              var r = null;

              try {
                r = Object.prototype.toString.call(n.resolve());
              } catch (t) {}

              if ("[object Promise]" === r && !n.cast) return;
            }

            t.Promise = q;
          }

          var F = void 0;
          F = Array.isArray ? Array.isArray : function (t) {
            return "[object Array]" === Object.prototype.toString.call(t);
          };

          var J = F,
              B = 0,
              Q = void 0,
              V = void 0,
              W = function W(t, e) {
            X[B] = t, X[B + 1] = e, 2 === (B += 2) && (V ? V(u) : Y());
          },
              K = "undefined" != typeof window ? window : void 0,
              G = K || {},
              z = G.MutationObserver || G.WebKitMutationObserver,
              H = "undefined" == typeof self && "undefined" != typeof process && "[object process]" === {}.toString.call(process),
              $ = "undefined" != typeof Uint8ClampedArray && "undefined" != typeof importScripts && "undefined" != typeof MessageChannel,
              X = new Array(1e3),
              Y = void 0;

          Y = H ? function () {
            return function () {
              return process.nextTick(u);
            };
          }() : z ? function () {
            var t = 0,
                e = new z(u),
                n = document.createTextNode("");
            return e.observe(n, {
              characterData: !0
            }), function () {
              n.data = t = ++t % 2;
            };
          }() : $ ? function () {
            var t = new MessageChannel();
            return t.port1.onmessage = u, function () {
              return t.port2.postMessage(0);
            };
          }() : void 0 === K ? function () {
            try {
              var t = n(57);
              return Q = t.runOnLoop || t.runOnContext, o();
            } catch (t) {
              return a();
            }
          }() : a();
          var Z = Math.random().toString(36).substring(16),
              tt = void 0,
              et = 1,
              nt = 2,
              rt = new E(),
              it = new E(),
              st = 0;
          return U.prototype._enumerate = function (t) {
            for (var e = 0; this._state === tt && e < t.length; e++) {
              this._eachEntry(t[e], e);
            }
          }, U.prototype._eachEntry = function (t, e) {
            var n = this._instanceConstructor,
                r = n.resolve;

            if (r === l) {
              var i = p(t);
              if (i === c && t._state !== tt) this._settledAt(t._state, e, t._result);else if ("function" != typeof i) this._remaining--, this._result[e] = t;else if (n === q) {
                var s = new n(h);
                y(s, t, i), this._willSettleAt(s, e);
              } else this._willSettleAt(new n(function (e) {
                return e(t);
              }), e);
            } else this._willSettleAt(r(t), e);
          }, U.prototype._settledAt = function (t, e, n) {
            var r = this.promise;
            r._state === tt && (this._remaining--, t === nt ? O(r, n) : this._result[e] = n), 0 === this._remaining && w(r, this._result);
          }, U.prototype._willSettleAt = function (t, e) {
            var n = this;
            S(t, void 0, function (t) {
              return n._settledAt(et, e, t);
            }, function (t) {
              return n._settledAt(nt, e, t);
            });
          }, q.all = I, q.race = R, q.resolve = l, q.reject = P, q._setScheduler = i, q._setAsap = s, q._asap = W, q.prototype = {
            constructor: q,
            then: c,
            "catch": function _catch(t) {
              return this.then(null, t);
            }
          }, q.polyfill = M, q.Promise = q, q;
        });
      }).call(e, n(9));
    }, function (t, e, n) {
      "use strict";

      function r() {}

      function i(t, e, n) {
        this.fn = t, this.context = e, this.once = n || !1;
      }

      function s() {
        this._events = new r(), this._eventsCount = 0;
      }

      var o = Object.prototype.hasOwnProperty,
          a = "~";
      Object.create && (r.prototype = Object.create(null), new r().__proto__ || (a = !1)), s.prototype.eventNames = function () {
        var t,
            e,
            n = [];
        if (0 === this._eventsCount) return n;

        for (e in t = this._events) {
          o.call(t, e) && n.push(a ? e.slice(1) : e);
        }

        return Object.getOwnPropertySymbols ? n.concat(Object.getOwnPropertySymbols(t)) : n;
      }, s.prototype.listeners = function (t, e) {
        var n = a ? a + t : t,
            r = this._events[n];
        if (e) return !!r;
        if (!r) return [];
        if (r.fn) return [r.fn];

        for (var i = 0, s = r.length, o = new Array(s); i < s; i++) {
          o[i] = r[i].fn;
        }

        return o;
      }, s.prototype.emit = function (t, e, n, r, i, s) {
        var o = a ? a + t : t;
        if (!this._events[o]) return !1;
        var u,
            c,
            l = this._events[o],
            h = arguments.length;

        if (l.fn) {
          switch (l.once && this.removeListener(t, l.fn, void 0, !0), h) {
            case 1:
              return l.fn.call(l.context), !0;

            case 2:
              return l.fn.call(l.context, e), !0;

            case 3:
              return l.fn.call(l.context, e, n), !0;

            case 4:
              return l.fn.call(l.context, e, n, r), !0;

            case 5:
              return l.fn.call(l.context, e, n, r, i), !0;

            case 6:
              return l.fn.call(l.context, e, n, r, i, s), !0;
          }

          for (c = 1, u = new Array(h - 1); c < h; c++) {
            u[c - 1] = arguments[c];
          }

          l.fn.apply(l.context, u);
        } else {
          var f,
              d = l.length;

          for (c = 0; c < d; c++) {
            switch (l[c].once && this.removeListener(t, l[c].fn, void 0, !0), h) {
              case 1:
                l[c].fn.call(l[c].context);
                break;

              case 2:
                l[c].fn.call(l[c].context, e);
                break;

              case 3:
                l[c].fn.call(l[c].context, e, n);
                break;

              case 4:
                l[c].fn.call(l[c].context, e, n, r);
                break;

              default:
                if (!u) for (f = 1, u = new Array(h - 1); f < h; f++) {
                  u[f - 1] = arguments[f];
                }
                l[c].fn.apply(l[c].context, u);
            }
          }
        }

        return !0;
      }, s.prototype.on = function (t, e, n) {
        var r = new i(e, n || this),
            s = a ? a + t : t;
        return this._events[s] ? this._events[s].fn ? this._events[s] = [this._events[s], r] : this._events[s].push(r) : (this._events[s] = r, this._eventsCount++), this;
      }, s.prototype.once = function (t, e, n) {
        var r = new i(e, n || this, !0),
            s = a ? a + t : t;
        return this._events[s] ? this._events[s].fn ? this._events[s] = [this._events[s], r] : this._events[s].push(r) : (this._events[s] = r, this._eventsCount++), this;
      }, s.prototype.removeListener = function (t, e, n, i) {
        var s = a ? a + t : t;
        if (!this._events[s]) return this;
        if (!e) return 0 == --this._eventsCount ? this._events = new r() : delete this._events[s], this;
        var o = this._events[s];
        if (o.fn) o.fn !== e || i && !o.once || n && o.context !== n || (0 == --this._eventsCount ? this._events = new r() : delete this._events[s]);else {
          for (var u = 0, c = [], l = o.length; u < l; u++) {
            (o[u].fn !== e || i && !o[u].once || n && o[u].context !== n) && c.push(o[u]);
          }

          c.length ? this._events[s] = 1 === c.length ? c[0] : c : 0 == --this._eventsCount ? this._events = new r() : delete this._events[s];
        }
        return this;
      }, s.prototype.removeAllListeners = function (t) {
        var e;
        return t ? (e = a ? a + t : t, this._events[e] && (0 == --this._eventsCount ? this._events = new r() : delete this._events[e])) : (this._events = new r(), this._eventsCount = 0), this;
      }, s.prototype.off = s.prototype.removeListener, s.prototype.addListener = s.prototype.on, s.prototype.setMaxListeners = function () {
        return this;
      }, s.prefixed = a, s.EventEmitter = s, t.exports = s;
    }, function (t, e) {
      function n(t) {
        return !!t.constructor && "function" == typeof t.constructor.isBuffer && t.constructor.isBuffer(t);
      }

      function r(t) {
        return "function" == typeof t.readFloatLE && "function" == typeof t.slice && n(t.slice(0, 0));
      }
      /*!
      * Determine if an object is a Buffer
      *
      * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
      * @license  MIT
      */


      t.exports = function (t) {
        return null != t && (n(t) || r(t) || !!t._isBuffer);
      };
    }, function (t, e, n) {
      !function (e) {
        var n = {},
            r = {};
        n.length = 0, n.getItem = function (t) {
          return r[t] || null;
        }, n.setItem = function (t, e) {
          void 0 === e ? n.removeItem(t) : (r.hasOwnProperty(t) || n.length++, r[t] = "" + e);
        }, n.removeItem = function (t) {
          r.hasOwnProperty(t) && (delete r[t], n.length--);
        }, n.key = function (t) {
          return Object.keys(r)[t] || null;
        }, n.clear = function () {
          r = {}, n.length = 0;
        }, t.exports = n;
      }();
    }, function (t, e, n) {
      !function () {
        var e = n(44),
            r = n(13).utf8,
            i = n(48),
            s = n(13).bin,
            o = function o(t, n) {
          t.constructor == String ? t = n && "binary" === n.encoding ? s.stringToBytes(t) : r.stringToBytes(t) : i(t) ? t = Array.prototype.slice.call(t, 0) : Array.isArray(t) || (t = t.toString());

          for (var a = e.bytesToWords(t), u = 8 * t.length, c = 1732584193, l = -271733879, h = -1732584194, f = 271733878, d = 0; d < a.length; d++) {
            a[d] = 16711935 & (a[d] << 8 | a[d] >>> 24) | 4278255360 & (a[d] << 24 | a[d] >>> 8);
          }

          a[u >>> 5] |= 128 << u % 32, a[14 + (u + 64 >>> 9 << 4)] = u;

          for (var p = o._ff, _ = o._gg, v = o._hh, m = o._ii, d = 0; d < a.length; d += 16) {
            var y = c,
                g = l,
                b = h,
                w = f;
            c = p(c, l, h, f, a[d + 0], 7, -680876936), f = p(f, c, l, h, a[d + 1], 12, -389564586), h = p(h, f, c, l, a[d + 2], 17, 606105819), l = p(l, h, f, c, a[d + 3], 22, -1044525330), c = p(c, l, h, f, a[d + 4], 7, -176418897), f = p(f, c, l, h, a[d + 5], 12, 1200080426), h = p(h, f, c, l, a[d + 6], 17, -1473231341), l = p(l, h, f, c, a[d + 7], 22, -45705983), c = p(c, l, h, f, a[d + 8], 7, 1770035416), f = p(f, c, l, h, a[d + 9], 12, -1958414417), h = p(h, f, c, l, a[d + 10], 17, -42063), l = p(l, h, f, c, a[d + 11], 22, -1990404162), c = p(c, l, h, f, a[d + 12], 7, 1804603682), f = p(f, c, l, h, a[d + 13], 12, -40341101), h = p(h, f, c, l, a[d + 14], 17, -1502002290), l = p(l, h, f, c, a[d + 15], 22, 1236535329), c = _(c, l, h, f, a[d + 1], 5, -165796510), f = _(f, c, l, h, a[d + 6], 9, -1069501632), h = _(h, f, c, l, a[d + 11], 14, 643717713), l = _(l, h, f, c, a[d + 0], 20, -373897302), c = _(c, l, h, f, a[d + 5], 5, -701558691), f = _(f, c, l, h, a[d + 10], 9, 38016083), h = _(h, f, c, l, a[d + 15], 14, -660478335), l = _(l, h, f, c, a[d + 4], 20, -405537848), c = _(c, l, h, f, a[d + 9], 5, 568446438), f = _(f, c, l, h, a[d + 14], 9, -1019803690), h = _(h, f, c, l, a[d + 3], 14, -187363961), l = _(l, h, f, c, a[d + 8], 20, 1163531501), c = _(c, l, h, f, a[d + 13], 5, -1444681467), f = _(f, c, l, h, a[d + 2], 9, -51403784), h = _(h, f, c, l, a[d + 7], 14, 1735328473), l = _(l, h, f, c, a[d + 12], 20, -1926607734), c = v(c, l, h, f, a[d + 5], 4, -378558), f = v(f, c, l, h, a[d + 8], 11, -2022574463), h = v(h, f, c, l, a[d + 11], 16, 1839030562), l = v(l, h, f, c, a[d + 14], 23, -35309556), c = v(c, l, h, f, a[d + 1], 4, -1530992060), f = v(f, c, l, h, a[d + 4], 11, 1272893353), h = v(h, f, c, l, a[d + 7], 16, -155497632), l = v(l, h, f, c, a[d + 10], 23, -1094730640), c = v(c, l, h, f, a[d + 13], 4, 681279174), f = v(f, c, l, h, a[d + 0], 11, -358537222), h = v(h, f, c, l, a[d + 3], 16, -722521979), l = v(l, h, f, c, a[d + 6], 23, 76029189), c = v(c, l, h, f, a[d + 9], 4, -640364487), f = v(f, c, l, h, a[d + 12], 11, -421815835), h = v(h, f, c, l, a[d + 15], 16, 530742520), l = v(l, h, f, c, a[d + 2], 23, -995338651), c = m(c, l, h, f, a[d + 0], 6, -198630844), f = m(f, c, l, h, a[d + 7], 10, 1126891415), h = m(h, f, c, l, a[d + 14], 15, -1416354905), l = m(l, h, f, c, a[d + 5], 21, -57434055), c = m(c, l, h, f, a[d + 12], 6, 1700485571), f = m(f, c, l, h, a[d + 3], 10, -1894986606), h = m(h, f, c, l, a[d + 10], 15, -1051523), l = m(l, h, f, c, a[d + 1], 21, -2054922799), c = m(c, l, h, f, a[d + 8], 6, 1873313359), f = m(f, c, l, h, a[d + 15], 10, -30611744), h = m(h, f, c, l, a[d + 6], 15, -1560198380), l = m(l, h, f, c, a[d + 13], 21, 1309151649), c = m(c, l, h, f, a[d + 4], 6, -145523070), f = m(f, c, l, h, a[d + 11], 10, -1120210379), h = m(h, f, c, l, a[d + 2], 15, 718787259), l = m(l, h, f, c, a[d + 9], 21, -343485551), c = c + y >>> 0, l = l + g >>> 0, h = h + b >>> 0, f = f + w >>> 0;
          }

          return e.endian([c, l, h, f]);
        };

        o._ff = function (t, e, n, r, i, s, o) {
          var a = t + (e & n | ~e & r) + (i >>> 0) + o;
          return (a << s | a >>> 32 - s) + e;
        }, o._gg = function (t, e, n, r, i, s, o) {
          var a = t + (e & r | n & ~r) + (i >>> 0) + o;
          return (a << s | a >>> 32 - s) + e;
        }, o._hh = function (t, e, n, r, i, s, o) {
          var a = t + (e ^ n ^ r) + (i >>> 0) + o;
          return (a << s | a >>> 32 - s) + e;
        }, o._ii = function (t, e, n, r, i, s, o) {
          var a = t + (n ^ (e | ~r)) + (i >>> 0) + o;
          return (a << s | a >>> 32 - s) + e;
        }, o._blocksize = 16, o._digestsize = 16, t.exports = function (t, n) {
          if (void 0 === t || null === t) throw new Error("Illegal argument " + t);
          var r = e.wordsToBytes(o(t, n));
          return n && n.asBytes ? r : n && n.asString ? s.bytesToString(r) : e.bytesToHex(r);
        };
      }();
    }, function (t, e) {
      function n(t) {
        if (t = String(t), !(t.length > 100)) {
          var e = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(t);

          if (e) {
            var n = parseFloat(e[1]);

            switch ((e[2] || "ms").toLowerCase()) {
              case "years":
              case "year":
              case "yrs":
              case "yr":
              case "y":
                return n * l;

              case "days":
              case "day":
              case "d":
                return n * c;

              case "hours":
              case "hour":
              case "hrs":
              case "hr":
              case "h":
                return n * u;

              case "minutes":
              case "minute":
              case "mins":
              case "min":
              case "m":
                return n * a;

              case "seconds":
              case "second":
              case "secs":
              case "sec":
              case "s":
                return n * o;

              case "milliseconds":
              case "millisecond":
              case "msecs":
              case "msec":
              case "ms":
                return n;

              default:
                return;
            }
          }
        }
      }

      function r(t) {
        return t >= c ? Math.round(t / c) + "d" : t >= u ? Math.round(t / u) + "h" : t >= a ? Math.round(t / a) + "m" : t >= o ? Math.round(t / o) + "s" : t + "ms";
      }

      function i(t) {
        return s(t, c, "day") || s(t, u, "hour") || s(t, a, "minute") || s(t, o, "second") || t + " ms";
      }

      function s(t, e, n) {
        if (!(t < e)) return t < 1.5 * e ? Math.floor(t / e) + " " + n : Math.ceil(t / e) + " " + n + "s";
      }

      var o = 1e3,
          a = 60 * o,
          u = 60 * a,
          c = 24 * u,
          l = 365.25 * c;

      t.exports = function (t, e) {
        e = e || {};

        var s = _typeof(t);

        if ("string" === s && t.length > 0) return n(t);
        if ("number" === s && !1 === isNaN(t)) return e["long"] ? i(t) : r(t);
        throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(t));
      };
    }, function (t, e, n) {
      function r(t) {
        return "[object Function]" === (i(t) ? Object.prototype.toString.call(t) : "");
      }

      var i = n(8);
      t.exports = r;
    }, function (t, e, n) {
      function r(t) {
        if (t) return i(t);
      }

      function i(t) {
        for (var e in r.prototype) {
          t[e] = r.prototype[e];
        }

        return t;
      }

      var s = n(8);
      t.exports = r, r.prototype.clearTimeout = function () {
        return clearTimeout(this._timer), clearTimeout(this._responseTimeoutTimer), delete this._timer, delete this._responseTimeoutTimer, this;
      }, r.prototype.parse = function (t) {
        return this._parser = t, this;
      }, r.prototype.responseType = function (t) {
        return this._responseType = t, this;
      }, r.prototype.serialize = function (t) {
        return this._serializer = t, this;
      }, r.prototype.timeout = function (t) {
        if (!t || "object" != _typeof(t)) return this._timeout = t, this._responseTimeout = 0, this;

        for (var e in t) {
          switch (e) {
            case "deadline":
              this._timeout = t.deadline;
              break;

            case "response":
              this._responseTimeout = t.response;
              break;

            default:
              console.warn("Unknown timeout option", e);
          }
        }

        return this;
      }, r.prototype.retry = function (t) {
        return 0 !== arguments.length && !0 !== t || (t = 1), t <= 0 && (t = 0), this._maxRetries = t, this._retries = 0, this;
      }, r.prototype._retry = function () {
        return this.clearTimeout(), this.req && (this.req = null, this.req = this.request()), this._aborted = !1, this.timedout = !1, this._end();
      }, r.prototype.then = function (t, e) {
        if (!this._fullfilledPromise) {
          var n = this;
          this._endCalled && console.warn("Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises"), this._fullfilledPromise = new Promise(function (t, e) {
            n.end(function (n, r) {
              n ? e(n) : t(r);
            });
          });
        }

        return this._fullfilledPromise.then(t, e);
      }, r.prototype["catch"] = function (t) {
        return this.then(void 0, t);
      }, r.prototype.use = function (t) {
        return t(this), this;
      }, r.prototype.ok = function (t) {
        if ("function" != typeof t) throw Error("Callback required");
        return this._okCallback = t, this;
      }, r.prototype._isResponseOK = function (t) {
        return !!t && (this._okCallback ? this._okCallback(t) : t.status >= 200 && t.status < 300);
      }, r.prototype.get = function (t) {
        return this._header[t.toLowerCase()];
      }, r.prototype.getHeader = r.prototype.get, r.prototype.set = function (t, e) {
        if (s(t)) {
          for (var n in t) {
            this.set(n, t[n]);
          }

          return this;
        }

        return this._header[t.toLowerCase()] = e, this.header[t] = e, this;
      }, r.prototype.unset = function (t) {
        return delete this._header[t.toLowerCase()], delete this.header[t], this;
      }, r.prototype.field = function (t, e) {
        if (null === t || void 0 === t) throw new Error(".field(name, val) name can not be empty");

        if (this._data && console.error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()"), s(t)) {
          for (var n in t) {
            this.field(n, t[n]);
          }

          return this;
        }

        if (Array.isArray(e)) {
          for (var r in e) {
            this.field(t, e[r]);
          }

          return this;
        }

        if (null === e || void 0 === e) throw new Error(".field(name, val) val can not be empty");
        return "boolean" == typeof e && (e = "" + e), this._getFormData().append(t, e), this;
      }, r.prototype.abort = function () {
        return this._aborted ? this : (this._aborted = !0, this.xhr && this.xhr.abort(), this.req && this.req.abort(), this.clearTimeout(), this.emit("abort"), this);
      }, r.prototype.withCredentials = function (t) {
        return void 0 == t && (t = !0), this._withCredentials = t, this;
      }, r.prototype.redirects = function (t) {
        return this._maxRedirects = t, this;
      }, r.prototype.toJSON = function () {
        return {
          method: this.method,
          url: this.url,
          data: this._data,
          headers: this._header
        };
      }, r.prototype.send = function (t) {
        var e = s(t),
            n = this._header["content-type"];
        if (this._formData && console.error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()"), e && !this._data) Array.isArray(t) ? this._data = [] : this._isHost(t) || (this._data = {});else if (t && this._data && this._isHost(this._data)) throw Error("Can't merge these send calls");
        if (e && s(this._data)) for (var r in t) {
          this._data[r] = t[r];
        } else "string" == typeof t ? (n || this.type("form"), n = this._header["content-type"], this._data = "application/x-www-form-urlencoded" == n ? this._data ? this._data + "&" + t : t : (this._data || "") + t) : this._data = t;
        return !e || this._isHost(t) ? this : (n || this.type("json"), this);
      }, r.prototype.sortQuery = function (t) {
        return this._sort = void 0 === t || t, this;
      }, r.prototype._timeoutError = function (t, e, n) {
        if (!this._aborted) {
          var r = new Error(t + e + "ms exceeded");
          r.timeout = e, r.code = "ECONNABORTED", r.errno = n, this.timedout = !0, this.abort(), this.callback(r);
        }
      }, r.prototype._setTimeouts = function () {
        var t = this;
        this._timeout && !this._timer && (this._timer = setTimeout(function () {
          t._timeoutError("Timeout of ", t._timeout, "ETIME");
        }, this._timeout)), this._responseTimeout && !this._responseTimeoutTimer && (this._responseTimeoutTimer = setTimeout(function () {
          t._timeoutError("Response timeout of ", t._responseTimeout, "ETIMEDOUT");
        }, this._responseTimeout));
      };
    }, function (t, e, n) {
      function r(t) {
        if (t) return i(t);
      }

      function i(t) {
        for (var e in r.prototype) {
          t[e] = r.prototype[e];
        }

        return t;
      }

      var s = n(56);
      t.exports = r, r.prototype.get = function (t) {
        return this.header[t.toLowerCase()];
      }, r.prototype._setHeaderProperties = function (t) {
        var e = t["content-type"] || "";
        this.type = s.type(e);
        var n = s.params(e);

        for (var r in n) {
          this[r] = n[r];
        }

        this.links = {};

        try {
          t.link && (this.links = s.parseLinks(t.link));
        } catch (t) {}
      }, r.prototype._setStatusProperties = function (t) {
        var e = t / 100 | 0;
        this.status = this.statusCode = t, this.statusType = e, this.info = 1 == e, this.ok = 2 == e, this.redirect = 3 == e, this.clientError = 4 == e, this.serverError = 5 == e, this.error = (4 == e || 5 == e) && this.toError(), this.accepted = 202 == t, this.noContent = 204 == t, this.badRequest = 400 == t, this.unauthorized = 401 == t, this.notAcceptable = 406 == t, this.forbidden = 403 == t, this.notFound = 404 == t;
      };
    }, function (t, e) {
      var n = ["ECONNRESET", "ETIMEDOUT", "EADDRINFO", "ESOCKETTIMEDOUT"];

      t.exports = function (t, e) {
        return !!(t && t.code && ~n.indexOf(t.code)) || !!(e && e.status && e.status >= 500) || !!(t && "timeout" in t && "ECONNABORTED" == t.code) || !!(t && "crossDomain" in t);
      };
    }, function (t, e) {
      e.type = function (t) {
        return t.split(/ *; */).shift();
      }, e.params = function (t) {
        return t.split(/ *; */).reduce(function (t, e) {
          var n = e.split(/ *= */),
              r = n.shift(),
              i = n.shift();
          return r && i && (t[r] = i), t;
        }, {});
      }, e.parseLinks = function (t) {
        return t.split(/ *, */).reduce(function (t, e) {
          var n = e.split(/ *; */),
              r = n[0].slice(1, -1);
          return t[n[1].split(/ *= */)[1].slice(1, -1)] = r, t;
        }, {});
      }, e.cleanHeader = function (t, e) {
        return delete t["content-type"], delete t["content-length"], delete t["transfer-encoding"], delete t.host, e && delete t.cookie, t;
      };
    }, function (t, e) {}]);
  });
};

exports["default"] = _default;

}).call(this,require('_process'))
},{"_process":1}],44:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var evanyou = {
  draw: null,
  init: function init(selector) {
    var c = document.querySelector(selector),
        x = c.getContext('2d'),
        pr = window.devicePixelRatio || 1,

    /*devicePixelRatio
     *devicePixelRatio = screenPhysicalPixels/deviceIndependentPixels
     *eg.iPhone4s,Resolution:960*640
     *   screenPhysicalPixels=640px
     *   deviceIndependentPixels=320px
     *   devicePixelRatio=640/320=2
     *You need set diff-size imgs to fit the devicePixelRatio.
     */
    w = window.innerWidth,
        h = window.innerHeight,
        f = 90,
        // InitialDistance
    q,
        z = Math.random,
        r = 0,
        u = Math.PI * 2,
        v = Math.cos;
    c.width = w * pr;
    c.height = h * pr;
    x.scale(pr, pr); // Synchronization with devicePixelRatio

    x.globalAlpha = 0.6; // gloabalAlpha set or return the opacity-value of draw

    function d(i, j) {
      x.beginPath();
      x.moveTo(i.x, i.y);
      x.lineTo(j.x, j.y);
      var k = j.x + (z() * 2 - 0.25) * f,
          // x->[-0.25 * f, 1.75 * f]
      // x_average = 0.75 * 90 = 67.5
      // number_rects = 1080 / 67.5 = 16
      n = y(j.y);
      /*When k < 0:
      *The first rect will be invisable, it is in the window's left.
      *So we can see the first line on the window sometimes changes the initial position.
      */

      x.lineTo(k, n);
      x.closePath();
      r -= u / -22;
      x.fillStyle = '#' + (v(r) * 127 + 128 << 16 | v(r + u / 3) * 127 + 128 << 8 | v(r + u / 3 * 2) * 127 + 128).toString(16);
      /*ColorSelectionAlgorithm
      * v=Math.cos,u=2*Math.Pi,r = n * Math.PI/25(n=0,1,2...)
      * (R,G,B)=>Hexadecimal === (R << 16|G << 8|B).toString(16)
      * 0xFFFFFF = 16777215
      * It's equate to:
      *   R = cos(r)*127+128
      *   G = cos(r+2*PI/3)*127+128
      *   B = cos(r+4*PI/3)*127+128
      * 128 << 16 === 128 * (2 ** 16)
       */

      x.fill();
      q[0] = q[1]; // old point -> new q[0]

      q[1] = {
        x: k,
        y: n
      }; // new point(k, n) -> new q[1]
      // constant line
    }

    function y(p) {
      var t = p + (z() * 2 - 1.1) * f;
      return t > h || t < 0 ? y(p) : t; // y->[-1.1, 0.9)
    }

    this.draw = function () {
      c.style.visibility = 'visible';
      x.clearRect(0, 0, w, h); // clear all rect

      q = [{
        x: 0,
        y: h * .7 + f
      }, {
        x: 0,
        y: h * .7 - f
      }];

      while (q[1].x < w + f) {
        d(q[0], q[1]);
      } // w + f

    };
  }
};
var wave = {
  draw: null,
  animate: null,
  hide: null,
  clear: function clear() {
    window.cancelAnimationFrame(this.animate);
    this.animate = null;
  },
  init: function init(selector) {
    var WAVE_HEIGHT = 200; //波浪变化高度

    var SCALE = 0.2; // 绘制速率

    var CYCLE = 360 / SCALE;
    var TIME = 0;
    var c = document.querySelector(selector);
    var width = window.innerWidth;
    var height = window.innerHeight;
    var x = c.getContext("2d");
    c.width = width;
    c.height = height;
    var colors = {
      op: ['66', '99', 'cc'],
      now: [],
      r: 0,
      d: 5 * 16 * 30 * 2,
      // 5/c, 1f/16ms, 30fps, 2 times slower
      num: -1,
      roll: function roll() {
        var that = this;
        var u = Math.PI * 2,
            v = Math.cos;

        for (var i = 0; i < that.op.length; i++) {
          if (that.r > 1 || that.r < 0) {
            that.d *= -1;
          }

          that.r += u / that.d;
          that.now[i] = '#' + (v(that.r) * 127 + 128 << 16 | v(that.r + u / 3) * 127 + 128 << 8 | v(that.r + u / 3 * 2) * 127 + 128).toString(16) + that.op[i];
        }
      },
      isNext: function isNext(num) {
        if (this.num !== num) {
          this.num = num;
          return true;
        }

        return false;
      }
    };

    function _draw() {
      x.clearRect(0, 0, width, height);
      TIME = (TIME + 1) % CYCLE;
      var angle = SCALE * TIME; // 当前正弦角度

      var dAngle = 45; // 两个波峰相差的角度
      //if (colors.isNext(Math.floor(TIME * 5 / CYCLE))) {

      colors.roll(); //}

      x.beginPath();
      x.moveTo(0, height * 0.77 + distance(WAVE_HEIGHT, angle, 0));
      x.bezierCurveTo(width * 0.6, height * 0.77 + distance(WAVE_HEIGHT, angle, dAngle), width * 0.4, height * 0.77 + distance(WAVE_HEIGHT, angle, 2 * dAngle), width, height * 0.66 + distance(WAVE_HEIGHT, angle, 3 * dAngle));
      x.lineTo(width, height);
      x.lineTo(0, height);
      x.fillStyle = colors.now[2];
      x.fill();
      x.beginPath();
      x.moveTo(0, height * 0.77 + distance(WAVE_HEIGHT, angle, -15));
      x.bezierCurveTo(width * 0.55, height * 0.77 + distance(WAVE_HEIGHT, angle, dAngle - 15), width * 0.45, height * 0.77 + distance(WAVE_HEIGHT, angle, 2 * dAngle - 30), width, height * 0.66 + distance(WAVE_HEIGHT, angle, 3 * dAngle - 45));
      x.lineTo(width, height);
      x.lineTo(0, height);
      x.fillStyle = colors.now[1];
      x.fill();
      x.beginPath();
      x.moveTo(0, height * 0.77 + distance(WAVE_HEIGHT, angle, -30));
      x.bezierCurveTo(width * 0.5, height * 0.77 + distance(WAVE_HEIGHT, angle, dAngle - 30), width * 0.5, height * 0.77 + distance(WAVE_HEIGHT, angle, 2 * dAngle - 60), width, height * 0.66 + distance(WAVE_HEIGHT, angle, 3 * dAngle - 90));
      x.lineTo(width, height);
      x.lineTo(0, height);
      x.fillStyle = colors.now[0];
      x.fill();

      function distance(height, currAngle, diffAngle) {
        return height * Math.cos((currAngle - diffAngle) % 360 * Math.PI / 180);
      }
    }

    var that = this;

    that.draw = function () {
      c.style.visibility = 'visible';
      that.animate = window.requestAnimationFrame(function fn() {
        _draw();

        that.animate = requestAnimationFrame(fn);
      });
    };

    that.hide = function () {
      that.clear();
      c.style.visibility = 'hidden';
    };
  }
};
var _default = {
  init: function init(s) {
    evanyou.init(s);
    wave.init(s);
  },
  draw: function draw(opt) {
    wave.clear();

    if (opt.toLowerCase() === 'wave') {
      typeof wave.draw === 'function' && wave.draw();
    } else {
      typeof evanyou.draw === 'function' && evanyou.draw();
    }
  },
  hide: function hide() {
    wave.hide();
  }
};
exports["default"] = _default;

},{}],45:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _this = void 0;

var _default = function _default(o) {
  !function (n) {
    "use strict";

    function t(n, t) {
      var r = (65535 & n) + (65535 & t);
      return (n >> 16) + (t >> 16) + (r >> 16) << 16 | 65535 & r;
    }

    function r(n, t) {
      return n << t | n >>> 32 - t;
    }

    function e(n, e, o, u, c, f) {
      return t(r(t(t(e, n), t(u, f)), c), o);
    }

    function o(n, t, r, o, u, c, f) {
      return e(t & r | ~t & o, n, t, u, c, f);
    }

    function u(n, t, r, o, u, c, f) {
      return e(t & o | r & ~o, n, t, u, c, f);
    }

    function c(n, t, r, o, u, c, f) {
      return e(t ^ r ^ o, n, t, u, c, f);
    }

    function f(n, t, r, o, u, c, f) {
      return e(r ^ (t | ~o), n, t, u, c, f);
    }

    function i(n, r) {
      n[r >> 5] |= 128 << r % 32, n[14 + (r + 64 >>> 9 << 4)] = r;
      var e,
          i,
          a,
          d,
          h,
          l = 1732584193,
          g = -271733879,
          v = -1732584194,
          m = 271733878;

      for (e = 0; e < n.length; e += 16) {
        i = l, a = g, d = v, h = m, g = f(g = f(g = f(g = f(g = c(g = c(g = c(g = c(g = u(g = u(g = u(g = u(g = o(g = o(g = o(g = o(g, v = o(v, m = o(m, l = o(l, g, v, m, n[e], 7, -680876936), g, v, n[e + 1], 12, -389564586), l, g, n[e + 2], 17, 606105819), m, l, n[e + 3], 22, -1044525330), v = o(v, m = o(m, l = o(l, g, v, m, n[e + 4], 7, -176418897), g, v, n[e + 5], 12, 1200080426), l, g, n[e + 6], 17, -1473231341), m, l, n[e + 7], 22, -45705983), v = o(v, m = o(m, l = o(l, g, v, m, n[e + 8], 7, 1770035416), g, v, n[e + 9], 12, -1958414417), l, g, n[e + 10], 17, -42063), m, l, n[e + 11], 22, -1990404162), v = o(v, m = o(m, l = o(l, g, v, m, n[e + 12], 7, 1804603682), g, v, n[e + 13], 12, -40341101), l, g, n[e + 14], 17, -1502002290), m, l, n[e + 15], 22, 1236535329), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 1], 5, -165796510), g, v, n[e + 6], 9, -1069501632), l, g, n[e + 11], 14, 643717713), m, l, n[e], 20, -373897302), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 5], 5, -701558691), g, v, n[e + 10], 9, 38016083), l, g, n[e + 15], 14, -660478335), m, l, n[e + 4], 20, -405537848), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 9], 5, 568446438), g, v, n[e + 14], 9, -1019803690), l, g, n[e + 3], 14, -187363961), m, l, n[e + 8], 20, 1163531501), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 13], 5, -1444681467), g, v, n[e + 2], 9, -51403784), l, g, n[e + 7], 14, 1735328473), m, l, n[e + 12], 20, -1926607734), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 5], 4, -378558), g, v, n[e + 8], 11, -2022574463), l, g, n[e + 11], 16, 1839030562), m, l, n[e + 14], 23, -35309556), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 1], 4, -1530992060), g, v, n[e + 4], 11, 1272893353), l, g, n[e + 7], 16, -155497632), m, l, n[e + 10], 23, -1094730640), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 13], 4, 681279174), g, v, n[e], 11, -358537222), l, g, n[e + 3], 16, -722521979), m, l, n[e + 6], 23, 76029189), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 9], 4, -640364487), g, v, n[e + 12], 11, -421815835), l, g, n[e + 15], 16, 530742520), m, l, n[e + 2], 23, -995338651), v = f(v, m = f(m, l = f(l, g, v, m, n[e], 6, -198630844), g, v, n[e + 7], 10, 1126891415), l, g, n[e + 14], 15, -1416354905), m, l, n[e + 5], 21, -57434055), v = f(v, m = f(m, l = f(l, g, v, m, n[e + 12], 6, 1700485571), g, v, n[e + 3], 10, -1894986606), l, g, n[e + 10], 15, -1051523), m, l, n[e + 1], 21, -2054922799), v = f(v, m = f(m, l = f(l, g, v, m, n[e + 8], 6, 1873313359), g, v, n[e + 15], 10, -30611744), l, g, n[e + 6], 15, -1560198380), m, l, n[e + 13], 21, 1309151649), v = f(v, m = f(m, l = f(l, g, v, m, n[e + 4], 6, -145523070), g, v, n[e + 11], 10, -1120210379), l, g, n[e + 2], 15, 718787259), m, l, n[e + 9], 21, -343485551), l = t(l, i), g = t(g, a), v = t(v, d), m = t(m, h);
      }

      return [l, g, v, m];
    }

    function a(n) {
      var t,
          r = "",
          e = 32 * n.length;

      for (t = 0; t < e; t += 8) {
        r += String.fromCharCode(n[t >> 5] >>> t % 32 & 255);
      }

      return r;
    }

    function d(n) {
      var t,
          r = [];

      for (r[(n.length >> 2) - 1] = void 0, t = 0; t < r.length; t += 1) {
        r[t] = 0;
      }

      var e = 8 * n.length;

      for (t = 0; t < e; t += 8) {
        r[t >> 5] |= (255 & n.charCodeAt(t / 8)) << t % 32;
      }

      return r;
    }

    function h(n) {
      return a(i(d(n), 8 * n.length));
    }

    function l(n, t) {
      var r,
          e,
          o = d(n),
          u = [],
          c = [];

      for (u[15] = c[15] = void 0, o.length > 16 && (o = i(o, 8 * n.length)), r = 0; r < 16; r += 1) {
        u[r] = 909522486 ^ o[r], c[r] = 1549556828 ^ o[r];
      }

      return e = i(u.concat(d(t)), 512 + 8 * t.length), a(i(c.concat(e), 640));
    }

    function g(n) {
      var t,
          r,
          e = "";

      for (r = 0; r < n.length; r += 1) {
        t = n.charCodeAt(r), e += "0123456789abcdef".charAt(t >>> 4 & 15) + "0123456789abcdef".charAt(15 & t);
      }

      return e;
    }

    function v(n) {
      return unescape(encodeURIComponent(n));
    }

    function m(n) {
      return h(v(n));
    }

    function p(n) {
      return g(m(n));
    }

    function s(n, t) {
      return l(v(n), v(t));
    }

    function C(n, t) {
      return g(s(n, t));
    }

    function A(n, t, r) {
      return t ? r ? s(t, n) : C(t, n) : r ? m(n) : p(n);
    }

    window.md5 = A;
  }(_this);
};

exports["default"] = _default;

},{}],46:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(o) {
  var QRCode;
  !function () {
    function t(t) {
      this.mode = l.MODE_8BIT_BYTE, this.data = t, this.parsedData = [];

      for (var e = 0, r = this.data.length; r > e; e++) {
        var i = [],
            n = this.data.charCodeAt(e);
        n > 65536 ? (i[0] = 240 | (1835008 & n) >>> 18, i[1] = 128 | (258048 & n) >>> 12, i[2] = 128 | (4032 & n) >>> 6, i[3] = 128 | 63 & n) : n > 2048 ? (i[0] = 224 | (61440 & n) >>> 12, i[1] = 128 | (4032 & n) >>> 6, i[2] = 128 | 63 & n) : n > 128 ? (i[0] = 192 | (1984 & n) >>> 6, i[1] = 128 | 63 & n) : i[0] = n, this.parsedData.push(i);
      }

      this.parsedData = Array.prototype.concat.apply([], this.parsedData), this.parsedData.length != this.data.length && (this.parsedData.unshift(191), this.parsedData.unshift(187), this.parsedData.unshift(239));
    }

    function e(t, e) {
      this.typeNumber = t, this.errorCorrectLevel = e, this.modules = null, this.moduleCount = 0, this.dataCache = null, this.dataList = [];
    }

    function r(t, e) {
      if (void 0 == t.length) throw new Error(t.length + "/" + e);

      for (var r = 0; r < t.length && 0 == t[r];) {
        r++;
      }

      this.num = new Array(t.length - r + e);

      for (var i = 0; i < t.length - r; i++) {
        this.num[i] = t[i + r];
      }
    }

    function i(t, e) {
      this.totalCount = t, this.dataCount = e;
    }

    function n() {
      this.buffer = [], this.length = 0;
    }

    function o() {
      return "undefined" != typeof CanvasRenderingContext2D;
    }

    function a() {
      var t = !1,
          e = navigator.userAgent;

      if (/android/i.test(e)) {
        t = !0;
        var r = e.toString().match(/android ([0-9]\.[0-9])/i);
        r && r[1] && (t = parseFloat(r[1]));
      }

      return t;
    }

    function s(t, e) {
      for (var r = 1, i = h(t), n = 0, o = p.length; o >= n; n++) {
        var a = 0;

        switch (e) {
          case u.L:
            a = p[n][0];
            break;

          case u.M:
            a = p[n][1];
            break;

          case u.Q:
            a = p[n][2];
            break;

          case u.H:
            a = p[n][3];
        }

        if (a >= i) break;
        r++;
      }

      if (r > p.length) throw new Error("Too long data");
      return r;
    }

    function h(t) {
      var e = encodeURI(t).toString().replace(/\%[0-9a-fA-F]{2}/g, "a");
      return e.length + (e.length != t ? 3 : 0);
    }

    t.prototype = {
      getLength: function getLength(t) {
        return this.parsedData.length;
      },
      write: function write(t) {
        for (var e = 0, r = this.parsedData.length; r > e; e++) {
          t.put(this.parsedData[e], 8);
        }
      }
    }, e.prototype = {
      addData: function addData(e) {
        var r = new t(e);
        this.dataList.push(r), this.dataCache = null;
      },
      isDark: function isDark(t, e) {
        if (0 > t || this.moduleCount <= t || 0 > e || this.moduleCount <= e) throw new Error(t + "," + e);
        return this.modules[t][e];
      },
      getModuleCount: function getModuleCount() {
        return this.moduleCount;
      },
      make: function make() {
        this.makeImpl(!1, this.getBestMaskPattern());
      },
      makeImpl: function makeImpl(t, r) {
        this.moduleCount = 4 * this.typeNumber + 17, this.modules = new Array(this.moduleCount);

        for (var i = 0; i < this.moduleCount; i++) {
          this.modules[i] = new Array(this.moduleCount);

          for (var n = 0; n < this.moduleCount; n++) {
            this.modules[i][n] = null;
          }
        }

        this.setupPositionProbePattern(0, 0), this.setupPositionProbePattern(this.moduleCount - 7, 0), this.setupPositionProbePattern(0, this.moduleCount - 7), this.setupPositionAdjustPattern(), this.setupTimingPattern(), this.setupTypeInfo(t, r), this.typeNumber >= 7 && this.setupTypeNumber(t), null == this.dataCache && (this.dataCache = e.createData(this.typeNumber, this.errorCorrectLevel, this.dataList)), this.mapData(this.dataCache, r);
      },
      setupPositionProbePattern: function setupPositionProbePattern(t, e) {
        for (var r = -1; 7 >= r; r++) {
          if (!(-1 >= t + r || this.moduleCount <= t + r)) for (var i = -1; 7 >= i; i++) {
            -1 >= e + i || this.moduleCount <= e + i || (r >= 0 && 6 >= r && (0 == i || 6 == i) || i >= 0 && 6 >= i && (0 == r || 6 == r) || r >= 2 && 4 >= r && i >= 2 && 4 >= i ? this.modules[t + r][e + i] = !0 : this.modules[t + r][e + i] = !1);
          }
        }
      },
      getBestMaskPattern: function getBestMaskPattern() {
        for (var t = 0, e = 0, r = 0; 8 > r; r++) {
          this.makeImpl(!0, r);
          var i = d.getLostPoint(this);
          (0 == r || t > i) && (t = i, e = r);
        }

        return e;
      },
      createMovieClip: function createMovieClip(t, e, r) {
        var i = t.createEmptyMovieClip(e, r),
            n = 1;
        this.make();

        for (var o = 0; o < this.modules.length; o++) {
          for (var a = o * n, s = 0; s < this.modules[o].length; s++) {
            var h = s * n,
                l = this.modules[o][s];
            l && (i.beginFill(0, 100), i.moveTo(h, a), i.lineTo(h + n, a), i.lineTo(h + n, a + n), i.lineTo(h, a + n), i.endFill());
          }
        }

        return i;
      },
      setupTimingPattern: function setupTimingPattern() {
        for (var t = 8; t < this.moduleCount - 8; t++) {
          null == this.modules[t][6] && (this.modules[t][6] = t % 2 == 0);
        }

        for (var e = 8; e < this.moduleCount - 8; e++) {
          null == this.modules[6][e] && (this.modules[6][e] = e % 2 == 0);
        }
      },
      setupPositionAdjustPattern: function setupPositionAdjustPattern() {
        for (var t = d.getPatternPosition(this.typeNumber), e = 0; e < t.length; e++) {
          for (var r = 0; r < t.length; r++) {
            var i = t[e],
                n = t[r];
            if (null == this.modules[i][n]) for (var o = -2; 2 >= o; o++) {
              for (var a = -2; 2 >= a; a++) {
                -2 == o || 2 == o || -2 == a || 2 == a || 0 == o && 0 == a ? this.modules[i + o][n + a] = !0 : this.modules[i + o][n + a] = !1;
              }
            }
          }
        }
      },
      setupTypeNumber: function setupTypeNumber(t) {
        for (var e = d.getBCHTypeNumber(this.typeNumber), r = 0; 18 > r; r++) {
          var i = !t && 1 == (e >> r & 1);
          this.modules[Math.floor(r / 3)][r % 3 + this.moduleCount - 8 - 3] = i;
        }

        for (var r = 0; 18 > r; r++) {
          var i = !t && 1 == (e >> r & 1);
          this.modules[r % 3 + this.moduleCount - 8 - 3][Math.floor(r / 3)] = i;
        }
      },
      setupTypeInfo: function setupTypeInfo(t, e) {
        for (var r = this.errorCorrectLevel << 3 | e, i = d.getBCHTypeInfo(r), n = 0; 15 > n; n++) {
          var o = !t && 1 == (i >> n & 1);
          6 > n ? this.modules[n][8] = o : 8 > n ? this.modules[n + 1][8] = o : this.modules[this.moduleCount - 15 + n][8] = o;
        }

        for (var n = 0; 15 > n; n++) {
          var o = !t && 1 == (i >> n & 1);
          8 > n ? this.modules[8][this.moduleCount - n - 1] = o : 9 > n ? this.modules[8][15 - n - 1 + 1] = o : this.modules[8][15 - n - 1] = o;
        }

        this.modules[this.moduleCount - 8][8] = !t;
      },
      mapData: function mapData(t, e) {
        for (var r = -1, i = this.moduleCount - 1, n = 7, o = 0, a = this.moduleCount - 1; a > 0; a -= 2) {
          for (6 == a && a--;;) {
            for (var s = 0; 2 > s; s++) {
              if (null == this.modules[i][a - s]) {
                var h = !1;
                o < t.length && (h = 1 == (t[o] >>> n & 1));
                var l = d.getMask(e, i, a - s);
                l && (h = !h), this.modules[i][a - s] = h, n--, -1 == n && (o++, n = 7);
              }
            }

            if (i += r, 0 > i || this.moduleCount <= i) {
              i -= r, r = -r;
              break;
            }
          }
        }
      }
    }, e.PAD0 = 236, e.PAD1 = 17, e.createData = function (t, r, o) {
      for (var a = i.getRSBlocks(t, r), s = new n(), h = 0; h < o.length; h++) {
        var l = o[h];
        s.put(l.mode, 4), s.put(l.getLength(), d.getLengthInBits(l.mode, t)), l.write(s);
      }

      for (var u = 0, h = 0; h < a.length; h++) {
        u += a[h].dataCount;
      }

      if (s.getLengthInBits() > 8 * u) throw new Error("code length overflow. (" + s.getLengthInBits() + ">" + 8 * u + ")");

      for (s.getLengthInBits() + 4 <= 8 * u && s.put(0, 4); s.getLengthInBits() % 8 != 0;) {
        s.putBit(!1);
      }

      for (;;) {
        if (s.getLengthInBits() >= 8 * u) break;
        if (s.put(e.PAD0, 8), s.getLengthInBits() >= 8 * u) break;
        s.put(e.PAD1, 8);
      }

      return e.createBytes(s, a);
    }, e.createBytes = function (t, e) {
      for (var i = 0, n = 0, o = 0, a = new Array(e.length), s = new Array(e.length), h = 0; h < e.length; h++) {
        var l = e[h].dataCount,
            u = e[h].totalCount - l;
        n = Math.max(n, l), o = Math.max(o, u), a[h] = new Array(l);

        for (var c = 0; c < a[h].length; c++) {
          a[h][c] = 255 & t.buffer[c + i];
        }

        i += l;
        var f = d.getErrorCorrectPolynomial(u),
            g = new r(a[h], f.getLength() - 1),
            p = g.mod(f);
        s[h] = new Array(f.getLength() - 1);

        for (var c = 0; c < s[h].length; c++) {
          var m = c + p.getLength() - s[h].length;
          s[h][c] = m >= 0 ? p.get(m) : 0;
        }
      }

      for (var v = 0, c = 0; c < e.length; c++) {
        v += e[c].totalCount;
      }

      for (var w = new Array(v), _ = 0, c = 0; n > c; c++) {
        for (var h = 0; h < e.length; h++) {
          c < a[h].length && (w[_++] = a[h][c]);
        }
      }

      for (var c = 0; o > c; c++) {
        for (var h = 0; h < e.length; h++) {
          c < s[h].length && (w[_++] = s[h][c]);
        }
      }

      return w;
    };

    for (var l = {
      MODE_NUMBER: 1,
      MODE_ALPHA_NUM: 2,
      MODE_8BIT_BYTE: 4,
      MODE_KANJI: 8
    }, u = {
      L: 1,
      M: 0,
      Q: 3,
      H: 2
    }, c = {
      PATTERN000: 0,
      PATTERN001: 1,
      PATTERN010: 2,
      PATTERN011: 3,
      PATTERN100: 4,
      PATTERN101: 5,
      PATTERN110: 6,
      PATTERN111: 7
    }, d = {
      PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]],
      G15: 1335,
      G18: 7973,
      G15_MASK: 21522,
      getBCHTypeInfo: function getBCHTypeInfo(t) {
        for (var e = t << 10; d.getBCHDigit(e) - d.getBCHDigit(d.G15) >= 0;) {
          e ^= d.G15 << d.getBCHDigit(e) - d.getBCHDigit(d.G15);
        }

        return (t << 10 | e) ^ d.G15_MASK;
      },
      getBCHTypeNumber: function getBCHTypeNumber(t) {
        for (var e = t << 12; d.getBCHDigit(e) - d.getBCHDigit(d.G18) >= 0;) {
          e ^= d.G18 << d.getBCHDigit(e) - d.getBCHDigit(d.G18);
        }

        return t << 12 | e;
      },
      getBCHDigit: function getBCHDigit(t) {
        for (var e = 0; 0 != t;) {
          e++, t >>>= 1;
        }

        return e;
      },
      getPatternPosition: function getPatternPosition(t) {
        return d.PATTERN_POSITION_TABLE[t - 1];
      },
      getMask: function getMask(t, e, r) {
        switch (t) {
          case c.PATTERN000:
            return (e + r) % 2 == 0;

          case c.PATTERN001:
            return e % 2 == 0;

          case c.PATTERN010:
            return r % 3 == 0;

          case c.PATTERN011:
            return (e + r) % 3 == 0;

          case c.PATTERN100:
            return (Math.floor(e / 2) + Math.floor(r / 3)) % 2 == 0;

          case c.PATTERN101:
            return e * r % 2 + e * r % 3 == 0;

          case c.PATTERN110:
            return (e * r % 2 + e * r % 3) % 2 == 0;

          case c.PATTERN111:
            return (e * r % 3 + (e + r) % 2) % 2 == 0;

          default:
            throw new Error("bad maskPattern:" + t);
        }
      },
      getErrorCorrectPolynomial: function getErrorCorrectPolynomial(t) {
        for (var e = new r([1], 0), i = 0; t > i; i++) {
          e = e.multiply(new r([1, f.gexp(i)], 0));
        }

        return e;
      },
      getLengthInBits: function getLengthInBits(t, e) {
        if (e >= 1 && 10 > e) switch (t) {
          case l.MODE_NUMBER:
            return 10;

          case l.MODE_ALPHA_NUM:
            return 9;

          case l.MODE_8BIT_BYTE:
            return 8;

          case l.MODE_KANJI:
            return 8;

          default:
            throw new Error("mode:" + t);
        } else if (27 > e) switch (t) {
          case l.MODE_NUMBER:
            return 12;

          case l.MODE_ALPHA_NUM:
            return 11;

          case l.MODE_8BIT_BYTE:
            return 16;

          case l.MODE_KANJI:
            return 10;

          default:
            throw new Error("mode:" + t);
        } else {
          if (!(41 > e)) throw new Error("type:" + e);

          switch (t) {
            case l.MODE_NUMBER:
              return 14;

            case l.MODE_ALPHA_NUM:
              return 13;

            case l.MODE_8BIT_BYTE:
              return 16;

            case l.MODE_KANJI:
              return 12;

            default:
              throw new Error("mode:" + t);
          }
        }
      },
      getLostPoint: function getLostPoint(t) {
        for (var e = t.getModuleCount(), r = 0, i = 0; e > i; i++) {
          for (var n = 0; e > n; n++) {
            for (var o = 0, a = t.isDark(i, n), s = -1; 1 >= s; s++) {
              if (!(0 > i + s || i + s >= e)) for (var h = -1; 1 >= h; h++) {
                0 > n + h || n + h >= e || (0 != s || 0 != h) && a == t.isDark(i + s, n + h) && o++;
              }
            }

            o > 5 && (r += 3 + o - 5);
          }
        }

        for (var i = 0; e - 1 > i; i++) {
          for (var n = 0; e - 1 > n; n++) {
            var l = 0;
            t.isDark(i, n) && l++, t.isDark(i + 1, n) && l++, t.isDark(i, n + 1) && l++, t.isDark(i + 1, n + 1) && l++, (0 == l || 4 == l) && (r += 3);
          }
        }

        for (var i = 0; e > i; i++) {
          for (var n = 0; e - 6 > n; n++) {
            t.isDark(i, n) && !t.isDark(i, n + 1) && t.isDark(i, n + 2) && t.isDark(i, n + 3) && t.isDark(i, n + 4) && !t.isDark(i, n + 5) && t.isDark(i, n + 6) && (r += 40);
          }
        }

        for (var n = 0; e > n; n++) {
          for (var i = 0; e - 6 > i; i++) {
            t.isDark(i, n) && !t.isDark(i + 1, n) && t.isDark(i + 2, n) && t.isDark(i + 3, n) && t.isDark(i + 4, n) && !t.isDark(i + 5, n) && t.isDark(i + 6, n) && (r += 40);
          }
        }

        for (var u = 0, n = 0; e > n; n++) {
          for (var i = 0; e > i; i++) {
            t.isDark(i, n) && u++;
          }
        }

        var c = Math.abs(100 * u / e / e - 50) / 5;
        return r += 10 * c;
      }
    }, f = {
      glog: function glog(t) {
        if (1 > t) throw new Error("glog(" + t + ")");
        return f.LOG_TABLE[t];
      },
      gexp: function gexp(t) {
        for (; 0 > t;) {
          t += 255;
        }

        for (; t >= 256;) {
          t -= 255;
        }

        return f.EXP_TABLE[t];
      },
      EXP_TABLE: new Array(256),
      LOG_TABLE: new Array(256)
    }, g = 0; 8 > g; g++) {
      f.EXP_TABLE[g] = 1 << g;
    }

    for (var g = 8; 256 > g; g++) {
      f.EXP_TABLE[g] = f.EXP_TABLE[g - 4] ^ f.EXP_TABLE[g - 5] ^ f.EXP_TABLE[g - 6] ^ f.EXP_TABLE[g - 8];
    }

    for (var g = 0; 255 > g; g++) {
      f.LOG_TABLE[f.EXP_TABLE[g]] = g;
    }

    r.prototype = {
      get: function get(t) {
        return this.num[t];
      },
      getLength: function getLength() {
        return this.num.length;
      },
      multiply: function multiply(t) {
        for (var e = new Array(this.getLength() + t.getLength() - 1), i = 0; i < this.getLength(); i++) {
          for (var n = 0; n < t.getLength(); n++) {
            e[i + n] ^= f.gexp(f.glog(this.get(i)) + f.glog(t.get(n)));
          }
        }

        return new r(e, 0);
      },
      mod: function mod(t) {
        if (this.getLength() - t.getLength() < 0) return this;

        for (var e = f.glog(this.get(0)) - f.glog(t.get(0)), i = new Array(this.getLength()), n = 0; n < this.getLength(); n++) {
          i[n] = this.get(n);
        }

        for (var n = 0; n < t.getLength(); n++) {
          i[n] ^= f.gexp(f.glog(t.get(n)) + e);
        }

        return new r(i, 0).mod(t);
      }
    }, i.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]], i.getRSBlocks = function (t, e) {
      var r = i.getRsBlockTable(t, e);
      if (void 0 == r) throw new Error("bad rs block @ typeNumber:" + t + "/errorCorrectLevel:" + e);

      for (var n = r.length / 3, o = [], a = 0; n > a; a++) {
        for (var s = r[3 * a + 0], h = r[3 * a + 1], l = r[3 * a + 2], u = 0; s > u; u++) {
          o.push(new i(h, l));
        }
      }

      return o;
    }, i.getRsBlockTable = function (t, e) {
      switch (e) {
        case u.L:
          return i.RS_BLOCK_TABLE[4 * (t - 1) + 0];

        case u.M:
          return i.RS_BLOCK_TABLE[4 * (t - 1) + 1];

        case u.Q:
          return i.RS_BLOCK_TABLE[4 * (t - 1) + 2];

        case u.H:
          return i.RS_BLOCK_TABLE[4 * (t - 1) + 3];

        default:
          return;
      }
    }, n.prototype = {
      get: function get(t) {
        var e = Math.floor(t / 8);
        return 1 == (this.buffer[e] >>> 7 - t % 8 & 1);
      },
      put: function put(t, e) {
        for (var r = 0; e > r; r++) {
          this.putBit(1 == (t >>> e - r - 1 & 1));
        }
      },
      getLengthInBits: function getLengthInBits() {
        return this.length;
      },
      putBit: function putBit(t) {
        var e = Math.floor(this.length / 8);
        this.buffer.length <= e && this.buffer.push(0), t && (this.buffer[e] |= 128 >>> this.length % 8), this.length++;
      }
    };

    var p = [[17, 14, 11, 7], [32, 26, 20, 14], [53, 42, 32, 24], [78, 62, 46, 34], [106, 84, 60, 44], [134, 106, 74, 58], [154, 122, 86, 64], [192, 152, 108, 84], [230, 180, 130, 98], [271, 213, 151, 119], [321, 251, 177, 137], [367, 287, 203, 155], [425, 331, 241, 177], [458, 362, 258, 194], [520, 412, 292, 220], [586, 450, 322, 250], [644, 504, 364, 280], [718, 560, 394, 310], [792, 624, 442, 338], [858, 666, 482, 382], [929, 711, 509, 403], [1003, 779, 565, 439], [1091, 857, 611, 461], [1171, 911, 661, 511], [1273, 997, 715, 535], [1367, 1059, 751, 593], [1465, 1125, 805, 625], [1528, 1190, 868, 658], [1628, 1264, 908, 698], [1732, 1370, 982, 742], [1840, 1452, 1030, 790], [1952, 1538, 1112, 842], [2068, 1628, 1168, 898], [2188, 1722, 1228, 958], [2303, 1809, 1283, 983], [2431, 1911, 1351, 1051], [2563, 1989, 1423, 1093], [2699, 2099, 1499, 1139], [2809, 2213, 1579, 1219], [2953, 2331, 1663, 1273]],
        m = function () {
      var t = function t(_t, e) {
        this._el = _t, this._htOption = e;
      };

      return t.prototype.draw = function (t) {
        function e(t, e) {
          var r = document.createElementNS("http://www.w3.org/2000/svg", t);

          for (var i in e) {
            e.hasOwnProperty(i) && r.setAttribute(i, e[i]);
          }

          return r;
        }

        var r = this._htOption,
            i = this._el,
            n = t.getModuleCount();
        Math.floor(r.width / n), Math.floor(r.height / n);
        this.clear();
        var o = e("svg", {
          viewBox: "0 0 " + String(n) + " " + String(n),
          width: "100%",
          height: "100%",
          fill: r.colorLight
        });
        o.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink"), i.appendChild(o), o.appendChild(e("rect", {
          fill: r.colorLight,
          width: "100%",
          height: "100%"
        })), o.appendChild(e("rect", {
          fill: r.colorDark,
          width: "1",
          height: "1",
          id: "template"
        }));

        for (var a = 0; n > a; a++) {
          for (var s = 0; n > s; s++) {
            if (t.isDark(a, s)) {
              var h = e("use", {
                x: String(s),
                y: String(a)
              });
              h.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#template"), o.appendChild(h);
            }
          }
        }
      }, t.prototype.clear = function () {
        for (; this._el.hasChildNodes();) {
          this._el.removeChild(this._el.lastChild);
        }
      }, t;
    }(),
        v = "svg" === document.documentElement.tagName.toLowerCase(),
        w = v ? m : o() ? function () {
      function t() {
        this._elImage.src = this._elCanvas.toDataURL("image/png"), this._elImage.style.display = "block", this._elCanvas.style.display = "none";
      }

      function e(t, e) {
        var r = this;

        if (r._fFail = e, r._fSuccess = t, null === r._bSupportDataURI) {
          var i = document.createElement("img"),
              n = function n() {
            r._bSupportDataURI = !1, r._fFail && r._fFail.call(r);
          },
              o = function o() {
            r._bSupportDataURI = !0, r._fSuccess && r._fSuccess.call(r);
          };

          return i.onabort = n, i.onerror = n, i.onload = o, void (i.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==");
        }

        r._bSupportDataURI === !0 && r._fSuccess ? r._fSuccess.call(r) : r._bSupportDataURI === !1 && r._fFail && r._fFail.call(r);
      }

      if (this && this._android && this._android <= 2.1) {
        var r = 1 / window.devicePixelRatio,
            i = CanvasRenderingContext2D.prototype.drawImage;

        CanvasRenderingContext2D.prototype.drawImage = function (t, e, n, o, a, s, h, l, u) {
          if ("nodeName" in t && /img/i.test(t.nodeName)) for (var c = arguments.length - 1; c >= 1; c--) {
            arguments[c] = arguments[c] * r;
          } else "undefined" == typeof l && (arguments[1] *= r, arguments[2] *= r, arguments[3] *= r, arguments[4] *= r);
          i.apply(this, arguments);
        };
      }

      var n = function n(t, e) {
        this._bIsPainted = !1, this._android = a(), this._htOption = e, this._elCanvas = document.createElement("canvas"), this._elCanvas.width = e.width, this._elCanvas.height = e.height, t.appendChild(this._elCanvas), this._el = t, this._oContext = this._elCanvas.getContext("2d"), this._bIsPainted = !1, this._elImage = document.createElement("img"), this._elImage.alt = "Scan me!", this._elImage.style.display = "none", this._el.appendChild(this._elImage), this._bSupportDataURI = null;
      };

      return n.prototype.draw = function (t) {
        var e = this._elImage,
            r = this._oContext,
            i = this._htOption,
            n = t.getModuleCount(),
            o = i.width / n,
            a = i.height / n,
            s = Math.round(o),
            h = Math.round(a);
        e.style.display = "none", this.clear();

        for (var l = 0; n > l; l++) {
          for (var u = 0; n > u; u++) {
            var c = t.isDark(l, u),
                d = u * o,
                f = l * a;
            r.strokeStyle = c ? i.colorDark : i.colorLight, r.lineWidth = 1, r.fillStyle = c ? i.colorDark : i.colorLight, r.fillRect(d, f, o, a), r.strokeRect(Math.floor(d) + .5, Math.floor(f) + .5, s, h), r.strokeRect(Math.ceil(d) - .5, Math.ceil(f) - .5, s, h);
          }
        }

        this._bIsPainted = !0;
      }, n.prototype.makeImage = function () {
        this._bIsPainted && e.call(this, t);
      }, n.prototype.isPainted = function () {
        return this._bIsPainted;
      }, n.prototype.clear = function () {
        this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height), this._bIsPainted = !1;
      }, n.prototype.round = function (t) {
        return t ? Math.floor(1e3 * t) / 1e3 : t;
      }, n;
    }() : function () {
      var t = function t(_t2, e) {
        this._el = _t2, this._htOption = e;
      };

      return t.prototype.draw = function (t) {
        for (var e = this._htOption, r = this._el, i = t.getModuleCount(), n = Math.floor(e.width / i), o = Math.floor(e.height / i), a = ['<table style="border:0;border-collapse:collapse;">'], s = 0; i > s; s++) {
          a.push("<tr>");

          for (var h = 0; i > h; h++) {
            a.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' + n + "px;height:" + o + "px;background-color:" + (t.isDark(s, h) ? e.colorDark : e.colorLight) + ';"></td>');
          }

          a.push("</tr>");
        }

        a.push("</table>"), r.innerHTML = a.join("");
        var l = r.childNodes[0],
            u = (e.width - l.offsetWidth) / 2,
            c = (e.height - l.offsetHeight) / 2;
        u > 0 && c > 0 && (l.style.margin = c + "px " + u + "px");
      }, t.prototype.clear = function () {
        this._el.innerHTML = "";
      }, t;
    }();

    QRCode = function QRCode(t, e) {
      if (this._htOption = {
        width: 256,
        height: 256,
        typeNumber: 4,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: u.H
      }, "string" == typeof e && (e = {
        text: e
      }), e) for (var r in e) {
        this._htOption[r] = e[r];
      }
      "string" == typeof t && (t = document.getElementById(t)), this._htOption.useSVG && (w = m), this._android = a(), this._el = t, this._oQRCode = null, this._oDrawing = new w(this._el, this._htOption), this._htOption.text && this.makeCode(this._htOption.text);
    }, QRCode.prototype.makeCode = function (t) {
      this._oQRCode = new e(s(t, this._htOption.correctLevel), this._htOption.correctLevel), this._oQRCode.addData(t), this._oQRCode.make(), this._el.title = t, this._oDrawing.draw(this._oQRCode), this.makeImage();
    }, QRCode.prototype.makeImage = function () {
      "function" == typeof this._oDrawing.makeImage && (!this._android || this._android >= 3) && this._oDrawing.makeImage();
    }, QRCode.prototype.clear = function () {
      this._oDrawing.clear();
    }, QRCode.CorrectLevel = u;
  }(), function (t, e, r) {
    function i(t, e) {
      var r = g({}, b, e || {}, p(t));
      r.imageSelector && (r.image = h(r.imageSelector).map(function (t) {
        return t.src;
      }).join("||")), u(t, "share-component social-share"), n(t, r), o(t, r), t.initialized = !0;
    }

    function n(t, e) {
      var r = a(e),
          i = "prepend" == e.mode;
      v(i ? r.reverse() : r, function (r) {
        var n = s(r, e),
            o = e.initialized ? d(t, "icon-" + r) : f('<a class="social-share-icon icon-' + r + '"></a>');
        return o.length ? (o[0].href = n, "wechat" === r ? o[0].tabindex = -1 : o[0].target = "_blank", void (e.initialized || (i ? t.insertBefore(o[0], t.firstChild) : t.appendChild(o[0])))) : !0;
      });
    }

    function o(t, e) {
      var r = d(t, "icon-wechat", "a");
      if (0 === r.length) return !1;
      var i = f('<div class="wechat-qrcode"><h4>' + e.wechatQrcodeTitle + '</h4><div class="qrcode"></div><div class="help">' + e.wechatQrcodeHelper + "</div></div>"),
          n = d(i[0], "qrcode", "div");
      r[0].appendChild(i[0]), new QRCode(n[0], {
        text: e.url,
        width: e.wechatQrcodeSize,
        height: e.wechatQrcodeSize
      });
    }

    function a(t) {
      t.mobileSites.length || (t.mobileSites = t.sites);
      var e = (A ? t.mobileSites : t.sites).slice(0),
          r = t.disabled;
      return "string" == typeof e && (e = e.split(/\s*,\s*/)), "string" == typeof r && (r = r.split(/\s*,\s*/)), E && r.push("wechat"), r.length && v(r, function (t) {
        e.splice(m(t, e), 1);
      }), e;
    }

    function s(t, e) {
      return e.summary = e.description, B[t].replace(/\{\{(\w)(\w*)\}\}/g, function (i, n, o) {
        var a = t + n + o.toLowerCase();
        return o = (n + o).toLowerCase(), encodeURIComponent((e[a] === r ? e[o] : e[a]) || "");
      });
    }

    function h(r) {
      return (e.querySelectorAll || t.jQuery || t.Zepto || l).call(e, r);
    }

    function l(t) {
      var r = [];
      return v(t.split(/\s*,\s*/), function (i) {
        var n = i.match(/([#.])(\w+)/);
        if (null === n) throw Error("Supports only simple single #ID or .CLASS selector.");

        if (n[1]) {
          var o = e.getElementById(n[2]);
          o && r.push(o);
        }

        r = r.concat(d(t));
      }), r;
    }

    function u(t, e) {
      if (e && "string" == typeof e) {
        var r = (t.className + " " + e).split(/\s+/),
            i = " ";
        v(r, function (t) {
          i.indexOf(" " + t + " ") < 0 && (i += t + " ");
        }), t.className = i.slice(1, -1);
      }
    }

    function c(t) {
      return (e.getElementsByName(t)[0] || 0).content;
    }

    function d(t, e, r) {
      if (t.getElementsByClassName) return t.getElementsByClassName(e);
      var i = [],
          n = t.getElementsByTagName(r || "*");
      return e = " " + e + " ", v(n, function (t) {
        (" " + (t.className || "") + " ").indexOf(e) >= 0 && i.push(t);
      }), i;
    }

    function f(t) {
      var r = e.createElement("div");
      return r.innerHTML = t, r.childNodes;
    }

    function g() {
      var t = arguments;
      if (C) return C.apply(null, t);
      var e = {};
      return v(t, function (t) {
        v(t, function (t, r) {
          e[r] = t;
        });
      }), t[0] = e;
    }

    function p(t) {
      if (t.dataset) return t.dataset;
      var e = {};
      return t.hasAttributes() ? (v(t.attributes, function (t) {
        var r = t.name;
        return 0 !== r.indexOf("data-") ? !0 : (r = r.replace(/^data-/i, "").replace(/-(\w)/g, function (t, e) {
          return e.toUpperCase();
        }), void (e[r] = t.value));
      }), e) : {};
    }

    function m(t, e, r) {
      var i;

      if (e) {
        if (_) return _.call(e, t, r);

        for (i = e.length, r = r ? 0 > r ? Math.max(0, i + r) : r : 0; i > r; r++) {
          if (r in e && e[r] === t) return r;
        }
      }

      return -1;
    }

    function v(t, e) {
      var i = t.length;

      if (i === r) {
        for (var n in t) {
          if (t.hasOwnProperty(n) && e.call(t[n], t[n], n) === !1) break;
        }
      } else for (var o = 0; i > o && e.call(t[o], t[o], o) !== !1; o++) {
        ;
      }
    }

    function w(r) {
      var i = "addEventListener",
          n = e[i] ? "" : "on";
      ~e.readyState.indexOf("m") ? r() : "load DOMContentLoaded readystatechange".replace(/\w+/g, function (o, a) {
        (a ? e : t)[n ? "attachEvent" : i](n + o, function () {
          r && (6 > a || ~e.readyState.indexOf("m")) && (r(), r = 0);
        }, !1);
      });
    }

    var _ = Array.prototype.indexOf,
        C = Object.assign,
        E = /MicroMessenger/i.test(navigator.userAgent),
        A = e.documentElement.clientWidth <= 768,
        T = (e.images[0] || 0).src || "",
        y = c("site") || c("Site") || e.title,
        L = c("title") || c("Title") || e.title,
        D = c("description") || c("Description") || "",
        b = {
      url: location.href,
      origin: location.origin,
      source: y,
      title: L,
      description: D,
      image: T,
      imageSelector: r,
      weiboKey: "",
      wechatQrcodeTitle: "微信扫一扫：分享",
      wechatQrcodeHelper: "<p>微信里点“发现”，扫一下</p><p>二维码便可将本文分享至朋友圈。</p>",
      wechatQrcodeSize: 100,
      sites: ["weibo", "qq", "wechat", "tencent", "douban", "qzone", "linkedin", "diandian", "facebook", "twitter", "google"],
      mobileSites: [],
      disabled: [],
      initialized: !1
    },
        B = {
      qzone: "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={{URL}}&title={{TITLE}}&desc={{DESCRIPTION}}&summary={{SUMMARY}}&site={{SOURCE}}",
      qq: "http://connect.qq.com/widget/shareqq/index.html?url={{URL}}&title={{TITLE}}&source={{SOURCE}}&desc={{DESCRIPTION}}&pics={{IMAGE}}",
      tencent: "http://share.v.t.qq.com/index.php?c=share&a=index&title={{TITLE}}&url={{URL}}&pic={{IMAGE}}",
      weibo: "http://service.weibo.com/share/share.php?url={{URL}}&title={{TITLE}}&pic={{IMAGE}}&appkey={{WEIBOKEY}}",
      wechat: "javascript:",
      douban: "http://shuo.douban.com/!service/share?href={{URL}}&name={{TITLE}}&text={{DESCRIPTION}}&image={{IMAGE}}&starid=0&aid=0&style=11",
      diandian: "http://www.diandian.com/share?lo={{URL}}&ti={{TITLE}}&type=link",
      linkedin: "http://www.linkedin.com/shareArticle?mini=true&ro=true&title={{TITLE}}&url={{URL}}&summary={{SUMMARY}}&source={{SOURCE}}&armin=armin",
      facebook: "https://www.facebook.com/sharer/sharer.php?u={{URL}}",
      twitter: "https://twitter.com/intent/tweet?text={{TITLE}}&url={{URL}}&via={{ORIGIN}}",
      google: "https://plus.google.com/share?url={{URL}}"
    };
    t.socialShare = function (t, e) {
      t = "string" == typeof t ? h(t) : t, t.length === r && (t = [t]), v(t, function (t) {
        t.initialized || i(t, e);
      });
    }, w(function () {
      socialShare(".social-share, .share-component");
    });
  }(window, document);
};

exports["default"] = _default;

},{}]},{},[11]);
