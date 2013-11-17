var FourBar = function (config) {
    "use strict";
    
    return this.create(config);
}

FourBar.prototype.createRequiredParameters = [
    "a", "b", "c", "O2", "O4"
];

// a, b, c, d, e, theta2, theta5
Plot.prototype.create = function (config) {
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
                if (x > 1 || x < -1) { throw "acos(" + x + ")"; }
                return Math.acos(x);
            },
            
            sqrt = function (x) {
                if (x < 0) { throw "sqrt(" + x + ")"; }
                return Math.sqrt(x);
            },
            
            cos = function (x) {
                if (x < 0 || x > Math.PI*2) { throw "cos(" + x + ")"; }
                return Math.cos(x);
            },
            
            sin = function (x) {
                if (x < 0 || x > Math.PI*2) { throw "sin(" + x + ")"; }
                return Math.sin(x);
            };
    } else {
        var acos = Math.acos,
            sqrt = Math.sqrt,
            cos = Math.cos,
            sin = Math.sin;
    }

    var euclid = function (p1, p2) {
        var dx = p1.x - p2.x,
            dy = p1.y - p2.y;
        return Math.sqrt(dx*dx + dy*dy);
    }

    // optional variables
    that.theta2 = config.theta2 || 0;
    that.omega2 = config.omega2 || 0;
    
    // public variables 
    // note: none of these should be directly modified...
    that.a = config.a;
    that.b = config.b;
    that.c = config.c;
    that.O2 = config.O2;
    that.O4 = config.O4;
    
    // more privates...
    var zeta = Math.atan2(O4.y - O2.y, O4.x - O2.x);
    
    // public methods
    
    // recalculates theta3 and theta4
    // using a, b, c, d, and theta2
    that.runPositionalAnalysis = function () {
        // rename public variables to make math more concise
        var a = that.a,
            b = that.b,
            c = that.c,
            d = that.d,
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

        var alpha = Math.acos((b * b + c * c - f * f)/(2 * b * c)),
            theta3 = theta4 - alpha;
            
        // set public variables
        that.theta3 = theta3;
        that.theta4 = theta4;
    };
    
    // recalculates pA and pB 
    // using a, b, c, d, theat2, theta3, theta4, O2, O4, and zeta
    that.recalculatePoints = function () {
        var a = that.a,
            b = that.b,
            c = that.c,
            d = that.d,
            theta2 = that.theta2,
            theta3 = that.theta2,
            theta4 = that.theta2,
            O2 = that.O2,
            O4 = that.O4;
            
        that.pA = {
            x: O2.x + a * Math.cos(zeta + theta2),
            y: O2.y + a * Math.sin(zeta + theta2)
        };
        
        that.pB = {
            x: that.pA.x + b * Math.cos(zeta + theta3),
            y: that.pA.y + b * Math.sin(zeta + theta3)
        };
        
        // consistency check
        var pB2 = {
            x: O4.x + c * Math.cos(zeta + theta4),
            y: O4.x + c * Math.sin(zeta + theta4)
        };
        
        if (pB2.x !== that.pB.x || pB2.y !== that.pB.y) {
            throw "error: pB calculation check failed";
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
    
    // construction
    that.runPositionalAnalysis();
    that.recalculatePoints();
    // that.runVelocityAnalysis();
    // that.runAccelerationAnalysis();
    
    return that;
}