var FourBarCoupler = function (config) {
    "use strict";
    
    return this.create(config);
}

FourBarCoupler.prototype.createRequiredParameters = [
    "a", "b", "c", "O2", "O4", "legLength", "legAngle"
];

FourBarCoupler.prototype.create = function (config) {
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
    var that = new FourBar(config);
    
    // parent functions
    var parent = {
        recalculatePoints: that.recalculatePoints
    };
    
    // public variables 
    that.legLength = config.legLength;
    that.legAngle = config.legAngle;
    that.legPoint = null;
    that.cachedLegPath = null;
    
    // recalculates pA, pB, legPoint
    // using a, b, c, theat2, theta3, theta4, O2, O4, legLength, and legAngle
    that.recalculatePoints = function () {
        parent.recalculatePoints.call(that);
        
        var phi = Math.atan2(that.pB.y - that.pA.y, that.pB.x - that.pA.x);
        that.legPoint.x = that.pB.x + that.legLength * Math.cos(that.legAngle + phi);
        that.legPoint.y = that.pB.y + that.legLength * Math.sin(that.legAngle + phi);  
    };
    
    that.calcLegPath = function (numPoints) {
        var points = [];
        
        that.pushState();
        
        try {
            for (var i = 0; i < numPoints; i++) {
                that.theta2 = i * Math.PI * 2 / numPoints;
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
    that.legPoint = {x: null, y: null};
    that.recalculatePoints();
    
    return that;
};