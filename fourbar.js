var createFourBar = function (a, b, c, d, e) {
    var that = {};
    
    var SafeMath = {
        acos : function (x) {
            if (x > 1 || x < -1) { throw "acos(" + x + ")"; }
            return Math.acos(x);
        },
        
        sqrt : function (x) {
            if (x < 0) { throw "sqrt(" + x + ")"; }
            return Math.sqrt(x);
        },
        
        cos : function (x) {
            if (x < 0 || x > Math.PI*2) { throw "cos(" + x + ")"; }
            return Math.cos(x);
        },
        
        sin : function (x) {
            if (x < 0 || x > Math.PI*2) { throw "sin(" + x + ")"; }
            return Math.sin(x);
        },
    };
    
    that.d = d;
    that.x3 = null;
    that.y3 = null;
    that.x4 = null;
    that.y4 = null;
    that.x5 = null;
    that.y5 = null;

    that.calcPositions = function (theta2) {
        var d = that.d;
    
        that.x2 = a * SafeMath.cos(theta2);
        that.y2 = a * SafeMath.sin(theta2);
            
        var f = SafeMath.sqrt(a*a + d*d - 2 * a*d*SafeMath.cos(theta2)),
            phi = SafeMath.acos((f*f + d*d - a*a)/(2*f*d)),
            gamma = SafeMath.acos((f*f + c*c - b*b)/(2*f*c));
        
        if (theta2 < Math.PI) {
            var theta4 = Math.PI - (gamma + phi);
        } else {
            var theta4 = Math.PI - (gamma - phi);
        }
        
        var alpha = SafeMath.acos((b*b + c*c - f*f)/(2*b*c)),
            theta3 = theta4 - alpha;
            
        that.x3 = d + c * SafeMath.cos(theta4),
        that.y3 = c * SafeMath.sin(theta4),
        that.x5 = that.x2 + (b + e)*SafeMath.cos(theta3),
        that.y5 = that.y2 + (b + e)*SafeMath.sin(theta3);
    };
    
    return that;
}