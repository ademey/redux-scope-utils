'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var scopeTypeDescriptors = exports.scopeTypeDescriptors = function scopeTypeDescriptors(request, success, failure, scope) {
  return [request, success, failure].map(function (item) {
    if (typeof item === 'string') {
      return {
        type: item,
        meta: { scope: scope }
      };
    }

    if ((typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object') {
      return _extends({}, item, {
        meta: _extends({}, item.meta, {
          scope: scope
        })
      });
    }

    return new Error('Type must be an object or string');
  });
};
//# sourceMappingURL=utils.js.map