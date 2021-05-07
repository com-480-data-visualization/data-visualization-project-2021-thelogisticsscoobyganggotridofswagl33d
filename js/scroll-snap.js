(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    var TIMEOUT_MIN = 50;
    var TIMEOUT_DEFAULT = 100;
    var DURATION_DEFAULT = 300;
    var THRESHOLD_DEFAULT = 0.2;
    var SNAPSTOP_DEFAULT = false;
    var EASING_DEFAULT = easeInOutQuad;
    var NOOP = function () { };
    var ScrollSnap = /** @class */ (function () {
        function ScrollSnap(element, config) {
            var _this = this;
            this.animating = false;
            this.lastScrollValue = {
                x: 0,
                y: 0,
            };
            this.startAnimation = function () {
                _this.speedDeltaX = _this.checkScrollSpeed(_this.target.scrollLeft, 'x');
                _this.speedDeltaY = _this.checkScrollSpeed(_this.target.scrollTop, 'y');
                if (_this.animating || (_this.speedDeltaX === 0 && _this.speedDeltaY === 0)) {
                    return;
                }
                _this.handler(_this.target);
            };
            this.animationHandler = function () {
                // if we don't move a thing, we can ignore the timeout: if we did, there'd be another timeout added for this.scrollStart+1.
                if (_this.scrollStart.y === _this.target.scrollTop &&
                    _this.scrollStart.x === _this.target.scrollLeft) {
                    // ignore timeout
                    return;
                }
                // detect direction of scroll. negative is up, positive is down.
                var direction = {
                    y: Math.sign(_this.speedDeltaY),
                    x: Math.sign(_this.speedDeltaX),
                };
                // get the next snap-point to snap-to
                var snapPoint = _this.getNextSnapPoint(_this.target, direction);
                _this.listenerElement.removeEventListener('scroll', _this.startAnimation, false);
                _this.animating = true;
                // smoothly move to the snap point
                _this.smoothScroll(_this.target, snapPoint, function () {
                    // after moving to the snap point, rebind the scroll event handler
                    _this.animating = false;
                    _this.listenerElement.addEventListener('scroll', _this.startAnimation, false);
                    _this.onAnimationEnd();
                    // reset scrollStart
                    _this.scrollStart = {
                        y: _this.target.scrollTop,
                        x: _this.target.scrollLeft,
                    };
                });
            };
            this.element = element;
            var snapDestinationX = config.snapDestinationX, snapDestinationY = config.snapDestinationY, timeout = config.timeout, duration = config.duration, threshold = config.threshold, snapStop = config.snapStop, easing = config.easing;
            if (snapDestinationX &&
                typeof snapDestinationX !== 'string' &&
                typeof snapDestinationX !== 'number') {
                throw new Error("Config property 'snapDestinationX' is not valid, expected STRING or NUMBER but found " + (typeof snapDestinationX).toUpperCase());
            }
            this.snapDestinationX = snapDestinationX;
            if (snapDestinationY &&
                typeof snapDestinationY !== 'string' &&
                typeof snapDestinationY !== 'number') {
                throw new Error("Config property 'snapDestinationY' is not valid, expected STRING or NUMBER but found " + (typeof snapDestinationY).toUpperCase());
            }
            this.snapDestinationY = snapDestinationY;
            if (timeout && (isNaN(timeout) || typeof timeout === 'boolean')) {
                throw new Error("Optional config property 'timeout' is not valid, expected NUMBER but found " + (typeof timeout).toUpperCase());
            }
            // any value less then TIMEOUT_MIN may cause weird bahaviour on some devices (especially on mobile with momentum scrolling)
            this.timeout = timeout && timeout >= TIMEOUT_MIN ? timeout : TIMEOUT_DEFAULT;
            if (duration && (isNaN(duration) || typeof duration === 'boolean')) {
                throw new Error("Optional config property 'duration' is not valid, expected NUMBER but found " + (typeof duration).toUpperCase());
            }
            this.duration = duration || DURATION_DEFAULT;
            if (threshold && (isNaN(threshold) || typeof threshold === 'boolean')) {
                throw new Error("Optional config property 'threshold' is not valid, expected NUMBER but found " + (typeof threshold).toUpperCase());
            }
            this.threshold = threshold || THRESHOLD_DEFAULT;
            if (easing && typeof easing !== 'function') {
                throw new Error("Optional config property 'easing' is not valid, expected FUNCTION but found " + (typeof easing).toUpperCase());
            }
            this.easing = easing || EASING_DEFAULT;
            if (snapStop && typeof snapStop !== 'boolean') {
                throw new Error("Optional config property 'snapStop' is not valid, expected BOOLEAN but found " + (typeof snapStop).toUpperCase());
            }
            this.snapStop = snapStop || SNAPSTOP_DEFAULT;
        }
        ScrollSnap.prototype.checkScrollSpeed = function (value, axis) {
            var _this = this;
            var clear = function () {
                _this.lastScrollValue[axis] = null;
            };
            var newValue = value;
            var delta;
            if (this.lastScrollValue[axis] !== null) {
                delta = newValue - this.lastScrollValue[axis];
            }
            else {
                delta = 0;
            }
            this.lastScrollValue[axis] = newValue;
            this.scrollSpeedTimer && clearTimeout(this.scrollSpeedTimer);
            this.scrollSpeedTimer = window.setTimeout(clear, 100);
            return delta;
        };
        ScrollSnap.prototype.saveDeclaration = function (obj) {
            this.snapLengthUnit = this.parseSnapCoordValue(this.snapDestinationX, this.snapDestinationY);
        };
        ScrollSnap.prototype.bindElement = function (element) {
            this.target = element;
            this.listenerElement = element === document.documentElement ? window : element;
            this.listenerElement.addEventListener('scroll', this.startAnimation, false);
            this.saveDeclaration(this.target);
        };
        ScrollSnap.prototype.unbindElement = function () {
            this.listenerElement.removeEventListener('scroll', this.startAnimation, false);
        };
        /**
         * scroll handler
         * this is the callback for scroll events.
         */
        ScrollSnap.prototype.handler = function (target) {
            // if currently animating, stop it. this prevents flickering.
            if (this.animationFrame) {
                clearTimeout(this.animationFrame);
            }
            // if a previous timeout exists, clear it.
            if (this.scrollHandlerTimer) {
                // we only want to call a timeout once after scrolling..
                clearTimeout(this.scrollHandlerTimer);
            }
            else {
                this.scrollStart = {
                    y: target.scrollTop,
                    x: target.scrollLeft,
                };
            }
            this.scrollHandlerTimer = window.setTimeout(this.animationHandler, this.timeout);
        };
        ScrollSnap.prototype.getNextSnapPoint = function (target, direction) {
            // get snap length
            var snapLength = {
                y: Math.round(this.getYSnapLength(this.target, this.snapLengthUnit.y)),
                x: Math.round(this.getXSnapLength(this.target, this.snapLengthUnit.x)),
            };
            var top = this.target.scrollTop;
            var left = this.target.scrollLeft;
            var startPoint = {
                y: this.scrollStart.y / snapLength.y || 0,
                x: this.scrollStart.x / snapLength.x || 0,
            };
            var currentPoint = {
                y: top / snapLength.y || 0,
                x: left / snapLength.x || 0,
            };
            var nextPoint = {
                y: 0,
                x: 0,
            };
            /**
             * Set target and bounds by direction,
             * if threshold has not been reached, scroll back to currentPoint
             **/
            if (this.isAboveThreshold(direction.y, currentPoint.y)) {
                if (this.snapStop) {
                    nextPoint.y = this.roundByDirection(-direction.y, startPoint.y + direction.y);
                }
                else {
                    nextPoint.y = this.roundByDirection(direction.y, currentPoint.y);
                }
            }
            else {
                nextPoint.y = this.roundByDirection(direction.y * -1, currentPoint.y);
            }
            if (this.isAboveThreshold(direction.x, currentPoint.x)) {
                if (this.snapStop) {
                    nextPoint.x = this.roundByDirection(-direction.x, startPoint.x + direction.x);
                }
                else {
                    nextPoint.x = this.roundByDirection(direction.x, currentPoint.x);
                }
            }
            else {
                nextPoint.x = this.roundByDirection(direction.x * -1, currentPoint.x);
            }
            // DEBUG
            // console.log('direction', direction)
            // console.log('startPoint', startPoint)
            // console.log('currentPoint', currentPoint)
            // console.log('nextPoint', nextPoint)
            // calculate where to scroll
            var scrollTo = {
                y: nextPoint.y * snapLength.y,
                x: nextPoint.x * snapLength.x,
            };
            // stay in bounds (minimum: 0, maxmimum: absolute height)
            scrollTo.y = this.stayInBounds(0, target.scrollHeight, scrollTo.y);
            scrollTo.x = this.stayInBounds(0, target.scrollWidth, scrollTo.x);
            return scrollTo;
        };
        ScrollSnap.prototype.isAboveThreshold = function (direction, value) {
            return direction > 0 ? value % 1 > this.threshold : 1 - (value % 1) > this.threshold;
        };
        ScrollSnap.prototype.roundByDirection = function (direction, value) {
            if (direction === -1) {
                // when we go up, we floor the number to jump to the next snap-point in scroll direction
                return Math.floor(value);
            }
            // go down, we ceil the number to jump to the next in view.
            return Math.ceil(value);
        };
        ScrollSnap.prototype.stayInBounds = function (min, max, destined) {
            return Math.max(Math.min(destined, max), min);
        };
        ScrollSnap.prototype.parseSnapCoordValue = function (x, y) {
            // regex to parse lengths
            var regex = /([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*)(?:[eE][+-]?\d+)?)(px|%|vw|vh)/;
            // defaults
            var parsed = {
                y: {
                    value: 0,
                    unit: 'px',
                },
                x: {
                    value: 0,
                    unit: 'px',
                },
            };
            if (typeof y === 'number') {
                parsed.y.value = y;
            }
            else {
                var resultY = regex.exec(y);
                if (resultY !== null) {
                    parsed.y = {
                        value: Number(resultY[1]),
                        unit: resultY[2],
                    };
                }
            }
            if (typeof x === 'number') {
                parsed.x.value = x;
            }
            else {
                var resultX = regex.exec(x);
                if (resultX !== null) {
                    parsed.x = {
                        value: Number(resultX[1]),
                        unit: resultX[2],
                    };
                }
            }
            return parsed;
        };
        ScrollSnap.prototype.getYSnapLength = function (obj, declaration) {
            // get y snap length based on declaration unit
            if (declaration.unit === 'vh') {
                return ((Math.max(document.documentElement.clientHeight, window.innerHeight || 1) / 100) *
                    declaration.value);
            }
            else if (declaration.unit === '%') {
                return (obj.clientHeight / 100) * declaration.value;
            }
            else {
                return declaration.value;
            }
        };
        ScrollSnap.prototype.getXSnapLength = function (obj, declaration) {
            // get x snap length based on declaration unit
            if (declaration.unit === 'vw') {
                return ((Math.max(document.documentElement.clientWidth, window.innerWidth || 1) / 100) *
                    declaration.value);
            }
            else if (declaration.unit === '%') {
                return (obj.clientWidth / 100) * declaration.value;
            }
            else {
                return declaration.value;
            }
        };
        ScrollSnap.prototype.isEdge = function (coords) {
            return (coords.x === 0 && this.speedDeltaY === 0) || (coords.y === 0 && this.speedDeltaX === 0);
        };
        ScrollSnap.prototype.smoothScroll = function (obj, end, callback) {
            var _this = this;
            var position = function (start, end, elapsed, duration) {
                if (elapsed > duration) {
                    return end;
                }
                return start + (end - start) * _this.easing(elapsed / duration);
            };
            var start = {
                y: obj.scrollTop,
                x: obj.scrollLeft,
            };
            // get animation frame or a fallback
            var requestAnimationFrame = window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                function (fn) {
                    return window.setTimeout(fn, 15);
                };
            var duration = this.isEdge(start) ? 1 : this.duration;
            var startTime;
            // setup the stepping function
            function step(timestamp) {
                if (!startTime) {
                    startTime = timestamp;
                }
                var elapsed = timestamp - startTime;
                // change position on y-axis if result is a number.
                if (!isNaN(end.y)) {
                    obj.scrollTop = position(start.y, end.y, elapsed, duration);
                }
                // change position on x-axis if result is a number.
                if (!isNaN(end.x)) {
                    obj.scrollLeft = position(start.x, end.x, elapsed, duration);
                }
                // check if we are over due;
                if (elapsed < duration) {
                    requestAnimationFrame(step);
                }
                else {
                    // is there a callback?
                    if (typeof callback === 'function') {
                        // stop execution and run the callback
                        return callback(end);
                    }
                }
            }
            this.animationFrame = requestAnimationFrame(step);
        };
        ScrollSnap.prototype.bind = function (callback) {
            this.onAnimationEnd = typeof callback === 'function' ? callback : NOOP;
            this.bindElement(this.element);
            return this;
        };
        ScrollSnap.prototype.unbind = function () {
            this.unbindElement();
            return this;
        };
        return ScrollSnap;
    }());
    exports.default = ScrollSnap;
});
//# sourceMappingURL=index.js.map