/**
 * Simple function wrapper.
 * <pre>
 * var t = {
 *     r : function (a, b, c) {
 *         console.log("hi a + b + c = " + (a + b + c));
 *     }
 * };
 *
 * t.r(1,2,3);
 *
 * var w = new MethodWrapper(function(orig, a) {
 *     console.log(orig + "," + a);
 * });
 * w.wrap('r', t);
 *
 * t.r(3, 4, 5);
 * w.unwrapAll();
 * t.r(6, 7, 8);
 * </pre>
 *
 * @param {function=} _defaultWrapper
 * @param {object=} _defaultWrapperContext
 * @author Andrew Porokhin
 */
function MethodWrapper(_defaultWrapper, _defaultWrapperContext) {
    this.defaultWrapper = _defaultWrapper;
    this.defaultWrapperContext = _defaultWrapperContext;
    this.h = [];
    /**
     * @param {function} sMethodName
     * @param {object} oContext
     * @param {function=} fWrapper
     * @param {object=} oWrapperContext
     */
    this.wrap = function(sMethodName, oContext, fWrapper, oWrapperContext) {
        var fOriginal = oContext[sMethodName];
        var wrapperMethod = fWrapper ? fWrapper : this.defaultWrapper;
        var wrapperContext = oWrapperContext ? oWrapperContext : this.defaultWrapperContext;

        if (wrapperMethod === null && oWrapperContext) {
            wrapperMethod = oWrapperContext[sMethodName];
        }

        oContext[sMethodName] = function () {
            wrapperMethod.apply(wrapperContext, arguments);
            return fOriginal.apply(oContext, arguments);
        };
        this.h.push({
            _oContext: oContext,
            _sMethodName: sMethodName,
            _original: fOriginal,
            unwrap: function() {
                this._oContext[this._sMethodName] = this._original;
            }
        });
    };

    /**
     * @param {string} sMethodName
     * @param {object} oContext
     * @param {object} oWrapperContext
     * @param {string=} sWrapperFunction
     */
    this.wrapWithObject = function(sMethodName, oContext, oWrapperContext, sWrapperFunction) {
        var fOriginal = oContext[sMethodName];
        var wrapperMethod = sWrapperFunction
            ? oWrapperContext[sWrapperFunction]
            : oWrapperContext[sMethodName];

        oContext[sMethodName] = function () {
            wrapperMethod.apply(oWrapperContext, arguments);
            return fOriginal.apply(oContext, arguments);
        };
        oContext[sMethodName].unwrapped = fOriginal;
        this.h.push({
            _oContext: oContext,
            _sMethodName: sMethodName,
            _original: fOriginal,
            unwrap: function() {
                this._oContext[this._sMethodName] = this._original;
            }
        });
    };

    this.unwrapAll = function() {
        for (var i in this.h) {
            this.h[i].unwrap();
        }
    };
}

// Test Object
function testMethodWrapper() {
    var t = {
        r : function (a, b, c) {
            return (a + b + c);
        }
    };

    t.r(1,2,3);

    var w = new MethodWrapper(function(orig, a) {
        console.log(orig + "," + a);
    });
    w.wrap('r', t);

    t.r(3, 4, 5);
    w.unwrapAll();
    t.r(6, 7, 8);
}