var FiveBarCouplerAnimator = function (config) {
    "use strict";
    
    return this.create(config);
};

FiveBarCouplerAnimator.prototype.createRequiredParameters = [
    "plot", "fiveBarCoupler", "framesPerSecond", "inputSpeed1", "inputSpeed2"
];

FiveBarCouplerAnimator.prototype.create = function (config) {
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
        fb = config.fiveBarCoupler,
        period = 1000/config.framesPerSecond,
        speed1 = config.inputSpeed1,
        speed2 = config.inputSpeed2;
    
    var draw = function () {
        plot.drawPoint(fb.O2.x, fb.O2.y);
        plot.drawPoint(fb.O4.x, fb.O4.y);
        plot.drawPoint(fb.O6.x, fb.O6.y);
        plot.drawPoint(fb.pA.x, fb.pA.y);
        plot.drawPoint(fb.pB.x, fb.pB.y);
        plot.drawPoint(fb.legPoint.x, fb.legPoint.y);
        plot.drawLine(fb.O2.x, fb.O2.y, fb.pA.x, fb.pA.y);
        plot.drawLine(fb.pA.x, fb.pA.y, fb.pB.x, fb.pB.y);
        plot.drawLine(fb.pB.x, fb.pB.y, fb.O4.x, fb.O4.y);
        plot.drawLine(fb.O6.x, fb.O6.y, fb.O2.x, fb.O2.y);
        plot.drawLine(fb.O6.x, fb.O6.y, fb.O4.x, fb.O4.y);
        plot.drawLine(fb.pA.x, fb.pA.y, fb.legPoint.x, fb.legPoint.y);
        plot.drawLine(fb.pB.x, fb.pB.y, fb.legPoint.x, fb.legPoint.y);
    };
        
    // construction
    var path = fb.calcLegPath(100);

    (function f() {
        var start = new Date().getTime();
        
        // do stuff
        var time = start/1000;
        fb.theta2 = (time * speed1)%(2*Math.PI);
        fb.theta6 = (time * speed2)%(2*Math.PI);
        
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