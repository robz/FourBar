var createFourBar = function (a, b, c, d, e, theta2, theta5) {
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
    
    that.theta2 = theta2;
    that.theta3 = null;
    that.theta4 = null;
    that.theta5 = theta5;
    
    that.x2 = null;
    that.y2 = null;
    that.x3 = null;
    that.y3 = null;
    that.x5 = null;
    that.y5 = null;
    
    that.omega2 = null;
    that.omega3 = null;
    that.omega4 = null;
    that.omega5 = null;
    
    that.alpha2 = null;
    that.alpha3 = null;
    that.alpha4 = null;
    that.alpha5 = null;
    
    that.setElements = function (spec) {
        that.a = (spec && spec.a) || that.a;
        that.b = (spec && spec.b) || that.b;
        that.c = (spec && spec.c) || that.c;
        that.d = (spec && spec.d) || that.d;
        that.e = (spec && spec.e) || that.e; 
        that.theta2 = (spec && spec.theta2) || that.theta2; 
        that.theta5 = (spec && spec.theta5) || that.theta5; 
    };
    
    that.copyElements = function () {
        return {a:that.a, b:that.b, c:that.c, d:that.d, e:that.e, theta5:that.theta5}; 
    };
    
    var stack = [];
    
    that.save = function () {
        stack.push({a:that.a, b:that.b, c:that.c, d:that.d, e:that.e, theta5:that.theta5});
    };
    
    that.restore = function () {
        that.setElements(stack.pop());
    };

    that.calcPositions = function (theta2) {
        var a = that.a,
            b = that.b,
            c = that.c,
            d = that.d,
            e = that.e,
            theta5 = that.theta5;
            
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

        var x2 = a * SafeMath.cos(theta2),
            y2 = a * SafeMath.sin(theta2),
            x3 = d + c * SafeMath.cos(theta4),
            y3 = c * SafeMath.sin(theta4),
            x5 = x3 + e * Math.cos(theta5 + theta3),
            y5 = y3 + e * Math.sin(theta5 + theta3);
        
        that.theta2 = theta2;
        that.theta3 = theta3;
        that.theta4 = theta4;
        that.x2 = x2;
        that.y2 = y2;
        that.x3 = x3;
        that.y3 = y3;
        that.x5 = x5;
        that.y5 = y5;
    };
    
    that.calcVelocities = function (omega2) {
        var a = that.a,
            b = that.b,
            c = that.c,
            d = that.d,
            e = that.e,
            theta2 = that.theta2,
            theta3 = that.theta3,
            theta4 = that.theta4,
            theta5 = that.theta5;
        
        var omega3 = omega2*a/c*Math.sin(theta4 - theta2)/Math.sin(theta3 - theta4),
            omega4 = omega2*a/c*Math.sin(theta2 - theta3)/Math.sin(theta4 - theta3);
        
        that.omega2 = omega2;
        that.omega3 = omega3;
        that.omega4 = omega4;
    };
    
    that.calcAccelerations = function (alpha2) {
        var a = that.a,
            b = that.b,
            c = that.c,
            d = that.d,
            e = that.e,
            theta2 = that.theta2,
            theta3 = that.theta3,
            theta4 = that.theta4;
    
        var A = c*sin(theta4),
            B = b*sin(theta3),
            C = a*alpha2*sin(theta2) + a*omega2*omega2*cos(theta2) + b*omega3*omega3*cos(theta3) - c*omega4*omega4*cos(theta4),
            D = c*cos(theta4),
            E = b*cos(theta3),
            F = a*alpha2*cos(theta2) - a*omega2*omega2*sin(theta2) - b*omega3*omega3*sin(theta3) + c*omega4*s4*sin(theta4),
            alpha3 = (C*D - A*F)/(A*E - B*D),
            alpha4 = (C*E - B*F)/(A*E - B*D);
    
        that.alpha2 = alpha2;
        that.alpha3 = alpha3;
        that.alpha4 = alpha4;
    };
    
    return that;
}