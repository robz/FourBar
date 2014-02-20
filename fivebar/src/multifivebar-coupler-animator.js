var MultiFiveBarCouplerAnimator = function (config) {
    "use strict";
    
    return this.create(config);
};

MultiFiveBarCouplerAnimator.prototype.createRequiredParameters = [
    "plot", "fiveBars"
];

MultiFiveBarCouplerAnimator.prototype.create = function (config) {
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
    
        draw = function (fb) {
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
    that.fbs = config.fiveBars;
    that.speedRatio = config.speedRatio || 1;
    
    // construction
    that.fbs.forEach(function (elem) {
        elem.calcCouplerPath(1000);
        plot.drawPath(elem.cachedPath, {drawColor: "red"});
    });
    
    plot.pushBackground();
    
    (function iteration() {
        var time = new Date().getTime() / 1000;
        
        that.fbs.forEach(function (elem) {
            elem.setInputAngles(
                ((time + elem.phase) * elem.speed1 * that.speedRatio) % (2 * Math.PI),
                ((time + elem.phase) * elem.speed2 * that.speedRatio + elem.theta2_phase) % (2 * Math.PI)
            );
        });

        plot.restoreToBackground();
        
        that.fbs.forEach(function (elem) {
            draw(elem);
        });
        
        requestAnimationFrame(iteration);
    }());
    
    return that;
};