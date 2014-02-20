var FiveBarCouplerAnimator = function (config) {
    "use strict";
    
    return this.create(config);
};

FiveBarCouplerAnimator.prototype.createRequiredParameters = [
    "plot", "fiveBar", "framesPerSecond"
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
        period = 1000 / config.framesPerSecond,
    
        draw = function () {
            plot.drawPoint(that.fb.P1.x, that.fb.P1.y);
            plot.drawPoint(that.fb.P2.x, that.fb.P2.y);
            plot.drawPoint(that.fb.P3.x, that.fb.P3.y);
            plot.drawPoint(that.fb.P4.x, that.fb.P4.y);
            plot.drawPoint(that.fb.P5.x, that.fb.P5.y);
            plot.drawPoint(that.fb.P6.x, that.fb.P6.y);
            plot.drawLine(that.fb.P1.x, that.fb.P1.y, that.fb.P2.x, that.fb.P2.y);
            plot.drawLine(that.fb.P2.x, that.fb.P2.y, that.fb.P3.x, that.fb.P3.y);
            plot.drawLine(that.fb.P2.x, that.fb.P2.y, that.fb.P6.x, that.fb.P6.y);
            plot.drawLine(that.fb.P3.x, that.fb.P3.y, that.fb.P4.x, that.fb.P4.y);
            plot.drawLine(that.fb.P3.x, that.fb.P3.y, that.fb.P6.x, that.fb.P6.y);
            plot.drawLine(that.fb.P4.x, that.fb.P4.y, that.fb.P5.x, that.fb.P5.y);
        };  
    
    // publics
    that.fb = config.fiveBar;
    that.speedRatio = config.speedRatio || 1;
    
    // construction
    that.fb.calcCouplerPath(1000);
    
    (function iteration() {
        var start, time, timeTaken;
        
        start = new Date().getTime();
        time = start / 1000;
        
        that.fb.setInputAngles(
            (time * that.fb.speed1 * that.speedRatio) % (2 * Math.PI),
            (time * that.fb.speed2 * that.speedRatio + that.fb.theta2_phase) % (2 * Math.PI)
        );

        plot.restoreToBackground();
        draw();
        plot.drawPath(that.fb.cachedPath, {drawColor: "red"});
        
        if (that.goalPath) {
            plot.drawPath(that.goalPath, {drawColor: "black"});
        }

        timeTaken = new Date().getTime() - start;
        setTimeout(iteration, period - timeTaken);
    }());
    
    return that;
};