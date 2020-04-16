(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module'"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){"use strict";

function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Color = /*#__PURE__*/function () {function Color(r, g, b) {_classCallCheck(this, Color);

    this.R = Math.floor(r);
    this.G = Math.floor(g);
    this.B = Math.floor(b);
  }

  _createClass(Color, [{
    key: "localeCompare",
    value: function localeCompare(that) {return this.toString().localeCompare(that.toString());
    }
  }, {
    key: "toString",
    value: function toString() {var r = (this.R < 16 ? '0' : '') + this.R.toString(16);
      var g = (this.G < 16 ? '0' : '') + this.G.toString(16);
      var b = (this.B < 16 ? '0' : '') + this.B.toString(16);
      return "#".concat(r).concat(g).concat(b);
    }
  }]);

  return Color;
}();

function findTargetColors(colors) {if (colors.length < 16) {return colors.sort();
  } else {var newColors = [];

    for (var i = 0; i < colors.length; i += 1) {
      // get average for every pair of colors
      var left = colors[i];
      var right = colors[++i];

      if (right) {newColors.push(new Color((left.R + right.R) / 2, (left.G + right.G) / 2, (left.B + right.B) / 2));
      } else {newColors.push(left);
      }
    }

    return findTargetColors(newColors);
  }
}

function getImageColors(imgObj) {var canvas = document.createElement('canvas');
  canvas.width = imgObj.naturalWidth;
  canvas.height = imgObj.naturalHeight;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(imgObj, 0, 0);
  var imgDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var imageData = imgDataObj.data;
  var colors = [];

  for (var i = 0; i < imageData.length; i += 1) {
    // every 3 r/g/b values are filled into colors and every alpha value was skiped by the loop
    var r = imageData[i++];
    var g = imageData[i++];
    var b = imageData[i++];
    var a = imageData[i];

    if (a> 0) {
      // remove transparent colors
      colors.push(new Color(r, g, b));
    }
  }

  return findTargetColors(colors);
}

function getImage(data, callback) {var img = document.createElement('img');

  img.onload = function (e) {typeof callback === 'function' && callback(img);
  };

  img.src = data;
}

function setupInputFile() {var file = document.querySelector('#file');
  var img = document.querySelector('#input');
  var placeholder = document.querySelector('#placeholder');
  var output = document.querySelector('#output');
  var loading = document.querySelector('#loading');

  file.onchange = function (e) {if (file.files.length) {var infile = file.files[0];

      if (infile.type.startsWith('image/')) {var reader = new FileReader();
        reader.readAsDataURL(infile);

        reader.onload = function (e) {
          img.style.backgroundColor = 'black';
          img.style.backgroundImage = "url(".concat(reader.result, ")");
          placeholder.style.opacity = 0;
          loading.classList.add('active');
          output.classList.remove('active');
          getImage(reader.result, function (imgObj) {
            output.innerHTML = '';
            var imgColors = getImageColors(imgObj);
            imgColors.forEach(function (color) {var div = document.createElement('div');
              var spanColor = document.createElement('span');
              var spanName = document.createElement('span');
              div.className = 'colors';
              spanColor.className = 'colors-color';
              spanName.className = 'colors-name';
              spanColor.style.background = spanName.innerText = color.toString();
              div.appendChild(spanColor);
              div.appendChild(spanName);
              output.appendChild(div);
            });
            output.classList.add('active');
            loading.classList.remove('active');
          });
        };
      } else {
        img.style.backgroundColor = 'white';
        img.style.backgroundImage = 'none';
        placeholder.style.opacity = 1;
        output.classList.remove('active');
      }
    } else {
      img.style.backgroundColor = 'white';
      img.style.backgroundImage = 'none';
      placeholder.style.opacity = 1;
    }
  };
}

function main() {setupInputFile();
}

main();},{}]},{},[1]);
