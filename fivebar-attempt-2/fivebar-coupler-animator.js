var FiveBarCouplerAnimator = function (config) {
    "use strict";
    
    return this.create(config);
};

FiveBarCouplerAnimator.prototype.createRequiredParameters = [
    "plot", "fiveBar", "framesPerSecond", "inputSpeed1", "inputSpeed2"
];

FiveBarCouplerAnimator.prototype.create = function (config) {
    "use strict";
    /*jslint browser: true */

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
    var that = {},
    
    // privates
        plot = config.plot,
        fb = config.fiveBar,
        period = 1000 / config.framesPerSecond,
    
        draw = function () {
            plot.drawPoint(fb.P1.x, fb.P1.y);
            plot.drawPoint(fb.P2.x, fb.P2.y);
            plot.drawPoint(fb.P3.x, fb.P3.y);
            plot.drawPoint(fb.P4.x, fb.P4.y);
            plot.drawPoint(fb.P5.x, fb.P5.y);
            plot.drawPoint(fb.P6.x, fb.P6.y);
            plot.drawLine(fb.P1.x, fb.P1.y, fb.P2.x, fb.P2.y);
            plot.drawLine(fb.P2.x, fb.P2.y, fb.P3.x, fb.P3.y);
            plot.drawLine(fb.P2.x, fb.P2.y, fb.P6.x, fb.P6.y);
            plot.drawLine(fb.P3.x, fb.P3.y, fb.P4.x, fb.P4.y);
            plot.drawLine(fb.P3.x, fb.P3.y, fb.P6.x, fb.P6.y);
            plot.drawLine(fb.P4.x, fb.P4.y, fb.P5.x, fb.P5.y);
        };
    
    // publics
    that.speed1 = config.inputSpeed1;
    that.speed2 = config.inputSpeed2;
    
    // construction
    fb.calcCouplerPath(200, that.speed1, that.speed2);
    
    (function iteration() {
        var start, time, timeTaken;
        
        start = new Date().getTime();
        time = start / 1000;
        
        fb.setInputAngles(
            (time * that.speed1) % (2 * Math.PI),
            (time * that.speed2 + fb.theta2_phase) % (2 * Math.PI)
        );

        plot.restoreToBackground();
        draw();
        plot.drawPath(fb.cachedPath, {drawColor: "red"});

        timeTaken = new Date().getTime() - start;
        setTimeout(iteration, period - timeTaken);
    }());
    
    return that;
};