var FiveBarCoupler = function (config) {
    "use strict";
    
    return this.create(config);
};

FiveBarCoupler.prototype.createRequiredParameters = [
    "a", "b", "c", "f", "O2", "O6", "legLength", "legAngle"
];

FiveBarCoupler.prototype.create = function (config) {
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
    
    // need O4 for child construction to work
    var theta6 = config.theta6 || 0;
    config.O4 = {
        x: config.O6.x + config.f * Math.cos(theta6),
        y: config.O6.y + config.f * Math.sin(theta6)
    };

    // object to be returned
    var that = new FourBarCoupler(config),
    
    // parent functions
        parent = {
            runPositionAnalysis: that.runPositionAnalysis,
            recalculatePoints: that.recalculatePoints,
            pushState: that.pushState,
            popState: that.popState
        },
        
    // privates
        euclid = function (p1, p2) {
            var dx = p1.x - p2.x,
                dy = p1.y - p2.y;
            return Math.sqrt(dx * dx + dy * dy);
        };
    
    // public members
    that.f = config.f;
    that.O6 = config.O6;
    that.theta6 = theta6;
    
    that.runPositionAnalysis = function () {
        var a = euclid(that.O2, that.O4),
            b = euclid(that.O2, that.O6),
            c = euclid(that.O4, that.O6),
            phi = Math.acos((a * a + b * b - c * c) / (2 * a * b));
        
        that.theta2 = that.theta2 + phi;
        
        parent.runPositionAnalysis.call(that);
    };
    
    // recalculates O4
    // using O6, f, and theta6
    that.recalculatePoints = function () {
        that.O4.x = that.O6.x + that.f * Math.cos(that.theta6);
        that.O4.y = that.O6.y + that.f * Math.sin(that.theta6);
        
        parent.recalculatePoints.call(that);
    };
    
    that.pushState = function () {
        var state = parent.pushState.call(that);
        
        state.O6 = {x: that.O6.x, y: that.O6.y};
        state.f = that.f;
        state.theta6 = that.theta6;
        
        return state;
    };
    
    that.popState = function (ignoreState) {
        var old = parent.popState.call(that, ignoreState);
        
        if (ignoreState) {
            return old;
        }
        
        that.O6.x = old.O6.x;
        that.O6.y = old.O6.y;
        that.f = old.f;
        that.theta6 = old.theta6;
        
        return old;
    };
    
    that.calcLegPath = function (numPoints, w2, w6) {
        var points = [],
            i;
        
        that.pushState();
        
        try {
            for (i = 0; i < numPoints; i += 1) {
                that.theta2 = i * Math.PI * 2 / numPoints;
                that.theta6 = that.theta2 * w6 / w2;
                that.runPositionAnalysis();
                that.recalculatePoints();
                
                points.push([that.legPoint.x, that.legPoint.y]);
            }
        } catch (e) {
            return null;
        } finally {
            that.popState();
        }
        
        that.cachedLegPath = points;

        return points;
    };

    // actual construction
    that.recalculatePoints();
    
    return that;
};