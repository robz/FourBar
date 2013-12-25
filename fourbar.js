var FourBar = function (config) {
    "use strict";
    
    return this.create(config);
}

FourBar.prototype.createRequiredParameters = [
    "a", "b", "c", "O2", "O4"
];

// a, b, c, d, e, theta2, theta5
FourBar.prototype.create = function (config) {
    "use strict";
    
    // check for required parameters
    if (!config) {
        throw "error: no parameters";
    }
    this.createRequiredParameters.forEach(function (elem) {
        if (config[elem] === undefined) {
            throw "error: missing required '" + elem + "' parameter";
        }
    });

    // object to be returned
    var that = {};
    
    // privates
    if (config.useSafeMath) {
        var acos = function (x) {
                if (x > 1 + 1e-6 || x < -1 - 1e-6) { throw "acos(" + x + ")"; }
                return Math.acos(x);
            },
            
            sqrt = function (x) {
                if (x < 0) { throw "sqrt(" + x + ")"; }
                return Math.sqrt(x);
            };
    } else {
        var acos = Math.acos,
            sqrt = Math.sqrt;
    }
    
    var cos = Math.cos,
        sin = Math.sin,

        euclid = function (p1, p2) {
            var dx = p1.x - p2.x,
                dy = p1.y - p2.y;
            return Math.sqrt(dx * dx + dy * dy);
        },
        
        stateStack = [];

    // optional parameters
    that.theta2 = config.theta2 || 0;
    that.omega2 = config.omega2 || 0;
    that.alpha2 = config.alpha2 || 0;
    
    // public variables 
    that.a = config.a;
    that.b = config.b;
    that.c = config.c;
    that.O2 = config.O2; 
    that.O4 = config.O4;
    that.pA = null;
    that.pB = null;
    
    // recalculates theta3 and theta4
    // using a, b, c, theta2, O2, and O4
    that.runPositionAnalysis = function () {
        // rename public variables to make math more concise
        var a = that.a,
            b = that.b,
            c = that.c,
            d = euclid(that.O2, that.O4),
            theta2 = that.theta2;

        // position analysis (using geometric method)
        var f = sqrt(a * a + d * d - 2 * a * d * cos(theta2)),
            phi = acos((f * f + d * d - a * a) / (2 * f * d)),
            gamma = acos((f * f + c * c - b * b) / ( 2 * f * c));

        if (theta2 < Math.PI) {
            var theta4 = Math.PI - (gamma + phi);
        } else {
            var theta4 = Math.PI - (gamma - phi);
        }

        var alpha = acos((b * b + c * c - f * f)/(2 * b * c)),
            theta3 = theta4 - alpha;
            
        // set public variables
        that.theta3 = theta3;
        that.theta4 = theta4;
    };
    
    // recalculates pA and pB 
    // using a, b, c, theat2, theta3, theta4, O2, and O4
    that.recalculatePoints = function () {
        var a = that.a,
            b = that.b,
            c = that.c,
            theta2 = that.theta2,
            theta3 = that.theta3,
            theta4 = that.theta4,
            O2 = that.O2,
            O4 = that.O4,
            zeta = Math.atan2(O4.y - O2.y, O4.x - O2.x);
            
        that.pA.x = O2.x + a * Math.cos(zeta + theta2);
        that.pA.y = O2.y + a * Math.sin(zeta + theta2);
        
        that.pB.x = that.pA.x + b * Math.cos(zeta + theta3);
        that.pB.y = that.pA.y + b * Math.sin(zeta + theta3);
        
        // consistency check
        var pB2 = {
            x: O4.x + c * Math.cos(zeta + theta4),
            y: O4.y + c * Math.sin(zeta + theta4)
        };
        
        if (Math.abs(pB2.x - that.pB.x) > 1e-6
            || Math.abs(pB2.y - that.pB.y) > 1e-6) 
        {
            //throw "error: pB calculation check failed";
        }
    };
    
    // recalculates omega3 and omega4
    // using a, b, c, d, theta2, theta3, theta4, and omega2
    that.runVelocityAnalysis = function () {
        // rename public variables to make math more concise
        var a = that.a,
            b = that.b,
            c = that.c,
            d = that.d,
            e = that.e,

            theta2 = that.theta2,
            theta3 = that.theta3,
            theta4 = that.theta4,

            omega2 = that.omega2;

        // velocity analysis (using vector loop method)
        that.omega3 = omega2 * a / c * sin(theta4 - theta2) / sin(theta3 - theta4),
        that.omega4 = omega2 * a / c * sin(theta2 - theta3) / sin(theta4 - theta3);
    };
    
    // recalculates alpha3 and alpha4
    // using a, b, c, d, theta2, theta3, theta4, omega2, omega3, omega4, and alpha2
    that.runAccelerationAnalysis = function (alpha2) {
        // rename public variables to make math more concise
        var a = that.a,
            b = that.b,
            c = that.c,
            d = that.d,
            e = that.e,

            theta2 = that.theta2,
            theta3 = that.theta3,
            theta4 = that.theta4,

            omega2 = that.omega2,
            omega3 = that.omega3,
            omega4 = that.omega4,
            
            alpha2 = that.alpha2;
    
        // acceleration analysis (using copy-equations-from-the-book method)
        var A = c * sin(theta4),
            B = b * sin(theta3),
            C = a * alpha2 * sin(theta2) + a * omega2 * omega2 * cos(theta2) 
                + b * omega3 * omega3 * cos(theta3) - c * omega4 * omega4 * cos(theta4),
            D = c * cos(theta4),
            E = b * cos(theta3),
            F = a * alpha2 * cos(theta2) - a * omega2 * omega2 * sin(theta2) 
                - b * omega3 * omega3 * sin(theta3) + c * omega4 * omega4 * sin(theta4);
        
        // TODO: I don't think these are right...
        that.alpha3 = (C * D - A * F)/(A * E - B * D);
        that.alpha4 = (C * E - B * F)/(A * E - B * D);
    };
    
    // TODO: this could be smarter by accepting an optional parameter specifying what will change
    that.pushState = function () {
        var state = {
            a: that.a,
            b: that.b,
            c: that.c,
            
            theta2: that.theta2,
            theta3: that.theta3,
            theta4: that.theta4,
            
            O2: {x: that.O2.x, y: that.O2.y},
            O4: {x: that.O4.x, y: that.O4.y},
            pA: {x: that.pA.x, y: that.pA.y},
            pB: {x: that.pB.x, y: that.pB.y},
            
            omega2: that.omega2,
            omega3: that.omega3,
            omega4: that.omega4,
            
            alpha2: that.alpha2,
            alpha3: that.alpha3,
            alpha4: that.alpha4
        };
    
        stateStack.push(state);
        
        return state;
    };
    
    that.popState = function (ignoreState) {
        var old = stateStack.pop();
        
        if (ignoreState) {
            return old;
        }
        
        that.a = old.a;
        that.b = old.b;
        that.c = old.c;
        
        that.theta2 = old.theta2;
        that.theta3 = old.theta3;
        that.theta4 = old.theta4;
        
        that.O2.x = old.O2.x;
        that.O2.y = old.O2.y;
        that.O4.x = old.O4.x;
        that.O4.y = old.O4.y;
        that.pA.x = old.pA.x;
        that.pA.y = old.pA.y;
        that.pB.x = old.pB.x;
        that.pB.y = old.pB.y;
        
        that.omega2 = old.omega2;
        that.omega3 = old.omega3;
        that.omega4 = old.omega4;
        
        that.alpha2 = old.alpha2;
        that.alpha3 = old.alpha3;
        that.alpha4 = old.alpha4;
        
        return old;
    };
    
    that.calcPath = function (numPoints, p1, p2, angle, distance) {
        var points = [];
        
        that.pushState();
        
        try {
            for (var i = 0; i < numPoints; i++) {
                that.theta2 = i * Math.PI * 2 / numPoints;
                that.runPositionAnalysis();
                that.recalculatePoints();
                
                var phi = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                var x = p2.x + distance * Math.cos(angle + phi);
                var y = p2.y + distance * Math.sin(angle + phi);
                
                points.push([x, y]);
            }
        } catch (e) {
            return null;
        } finally {
            that.popState();
        }

        return points;
    };
    
    // construction
    that.pA = {x: null, y: null};
    that.pB = {x: null, y: null};
    that.runPositionAnalysis();
    that.recalculatePoints();
    // that.runVelocityAnalysis();
    // that.runAccelerationAnalysis();
    
    return that;
}