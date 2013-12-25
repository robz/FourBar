var FourBarCouplerAnimator = function (config) {
    "use strict";
    
    return this.create(config);
};

FourBarCouplerAnimator.prototype.createRequiredParameters = [
    "plot", "fourBar", "framesPerSecond", "inputSpeed", "draw"
];

FourBarCouplerAnimator.prototype.create = function (config) {
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
    var plot = config.plot,
        fb = config.fourBar,
        period = 1000/config.framesPerSecond,
        speed = config.inputSpeed,
        draw = config.draw;
        
    // construction
    var path = fb.calcLegPath(100);
    
    (function f() {
        var start = new Date().getTime();
        
        // do stuff
        var time = start/1000;
        fb.theta2 = (time * speed)%(2*Math.PI);
        
        fb.runPositionAnalysis();
        fb.recalculatePoints();
        
        plot.restoreToBackground();
        draw();
        plot.drawPath(path, {drawColor:"red"});
        
        var timeTaken = new Date().getTime() - start;
        setTimeout(f, period - timeTaken);
    })();
    
    return that;
};