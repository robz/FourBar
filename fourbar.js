var createFourBar = function (a, b, c, d, e, theta5) {
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
    
    that.a = a;
    that.b = b;
    that.c = c;
    that.d = d;
    that.e = e;
    that.x2 = null;
    that.y2 = null;
    that.x3 = null;
    that.y3 = null;
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
            
        that.x3 = d + c * SafeMath.cos(theta4);
        that.y3 = c * SafeMath.sin(theta4);
        that.x5 = that.x3 + e * Math.cos(theta5 + theta3);
        that.y5 = that.y3 + e * Math.sin(theta5 + theta3);
    };
    
    that.calcAccelerations = function (alpha2) {
        var d = that.d;
    
        var A = c*sin(theta4),
            B = b*sin(theta3),
            C = a*alpha2*sin(theta2) + a*omega2*omega2*cos(theta2) + b*omega3*omega3*cos(theta3) - c*omega4*omega4*cos(theta4),
            D = c*cos(theta4),
            E = b*cos(theta3),
            F = a*alpha2*cos(theta2) - a*omega2*omega2*sin(theta2) - b*omega3*omega3*sin(theta3) + c*omega4*s4*sin(theta4),
            alpha3 = (C*D - A*F)/(A*E - B*D),
            alpha4 = (C*E - B*F)/(A*E - B*D);
    };
    
    return that;
}