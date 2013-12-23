var FourBarCouplerAnimator = function (config) {
    "use strict";
    
    return this.create(config);
};

FourBarCouplerAnimator.prototype.createRequiredParameters = [
    "plot", "fourBar", "framesPerSecond", "inputSpeed"
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
        speed = config.inputSpeed;
    
    var drawFourBarPositions = function () {
        plot.drawPoint(fb.O2.x, fb.O2.y);
        plot.drawPoint(fb.O4.x, fb.O4.y);
        plot.drawPoint(fb.pA.x, fb.pA.y);
        plot.drawPoint(fb.pB.x, fb.pB.y);
        plot.drawPoint(fb.legPoint.x, fb.legPoint.y);
        plot.drawLine(fb.O2.x, fb.O2.y, fb.pA.x, fb.pA.y);
        plot.drawLine(fb.pA.x, fb.pA.y, fb.pB.x, fb.pB.y);
        plot.drawLine(fb.pB.x, fb.pB.y, fb.O4.x, fb.O4.y);
        plot.drawLine(fb.O4.x, fb.O4.y, fb.O2.x, fb.O2.y);
        plot.drawLine(fb.pA.x, fb.pA.y, fb.legPoint.x, fb.legPoint.y);
        plot.drawLine(fb.pB.x, fb.pB.y, fb.legPoint.x, fb.legPoint.y);
    };
        
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
        drawFourBarPositions();
        plot.drawPath(path, {drawColor:"red"});
        
        var timeTaken = new Date().getTime() - start;
        setTimeout(f, period - timeTaken);
    })();
    
    return that;
};