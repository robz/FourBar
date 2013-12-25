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
            recalculatePoints: that.recalculatePoints,
            pushState: that.pushState,
            popState: that.popState
        };
    
    // public members
    that.f = config.f;
    that.O6 = config.O6;
    that.theta6 = theta6;
    
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

    // actual construction
    that.recalculatePoints();
    
    return that;
};