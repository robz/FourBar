var FiveBarCoupler = function (config, my) {
    "use strict";
    
    return this.create(config, my);
};

FiveBarCoupler.prototype.createRequiredParameters = [
    "a1", "a2", "a3", "a4", "P1", "P5", "a5", "theta3", "speed1", "speed2" // NOTE: incorrectly assuming that speedi is positive and an integer
];

FiveBarCoupler.prototype.create = function (config, my) {
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
    

    // protected namespace
    my = my || {};

    // object to be returned
    var that = new FiveBar(config, my),
    
    // parent namespace
        parent = {
            setInputAngles: that.setInputAngles
        };


    //
    // public members
    //

    that.a5 = config.a5;
    that.theta3 = config.theta3;
    that.theta2_phase = config.theta2_phase || 0;
    that.P6 = {x: null, y: null};
    that.speed1 = config.speed1;
    that.speed2 = config.speed2;
    that.optimizing = false;


    //
    // public methods
    //

    // executes fiveBar's setInputAngles,
    // then updates the coupler point (P6) using P3, a5 and theta3
    that.setInputAngles = function (theta1, theta2) {
        parent.setInputAngles(theta1, theta2);
        
        var phi = Math.atan2(
            that.P3.y - that.P2.y,
            that.P3.x - that.P2.x
        );
        
        that.P6.x = that.P3.x + that.a5 * Math.cos(that.theta3 + phi);
        that.P6.y = that.P3.y + that.a5 * Math.sin(that.theta3 + phi);
    };
    
    that.calcCouplerPath = function (numPoints) {
        var theta1_temp = that.theta1,
            theta2_temp = that.theta2,
        
            points = [],
            i,
            theta1,
            revs = that.speed1 * that.speed2;
        
        if (revs < 0) {
            revs = -revs;
        }
        
        try {
            for (i = 0; i < numPoints; i += 1) {
                theta1 = i / numPoints * revs * Math.PI * 2;

                that.setInputAngles(
                    theta1 % (2 * Math.PI),
                    (theta1 * that.speed2 / that.speed1 + that.theta2_phase) % (2 * Math.PI)
                );

                points.push([that.P6.x, that.P6.y]);
            }
        } catch (e) {
            return null;
        } finally {
            that.setInputAngles(theta1_temp, theta2_temp);
        }
        
        that.cachedPath = points;

        return points;
    };
    
    
    
    
    
    //
    // Gradient descent optimization
    //
    
    var calcCenter = function (path) {
        var pathcx = 0,
            pathcy = 0;
        
        path.forEach(function (e) {
            pathcx += e[0];
            pathcy += e[1];
        });
        
        return [pathcx / path.length,
                pathcy / path.length];
    };
    
    var euclid = function (p1, p2) {
        var dx = p1[0] - p2[0],
            dy = p1[1] - p2[1];

        return Math.sqrt(dx*dx + dy*dy);
    };
    
    var calcPathMinDiff = function (path1, path2) {
        var error = 0;
        
        for (var i = 0; i < path1.length; i++) {
            var minErr = 1e100;
        
            for (var j = 0; j < path2.length; j++) {
                var err = euclid(path1[i], path2[j]);
                
                if (err < minErr) {
                    minErr = err;
                }
            }
            
            error += minErr;
        }
        
        return error;
    };
        
    var calcError = function (goalPath) {
        var path = that.calcCouplerPath(1000);
        
        var centerErr = euclid(calcCenter(path), calcCenter(goalPath)),
            goalPathErr = calcPathMinDiff(goalPath, path),
            curPathErr = calcPathMinDiff(path, goalPath);
        
        return 100*goalPathErr + 10*centerErr + curPathErr;
    };
    
    var setElements = function (elements) {
        that.a1 = elements.a1;
        that.a2 = elements.a2;
        that.a3 = elements.a3;
        that.a4 = elements.a4;
        that.a5 = elements.a5;
        that.theta3 = elements.theta3;
        that.P5.x = elements.P5x;
    };
    
    var getElements = function () {
        return {
            a1: that.a1,
            a2: that.a2,
            a3: that.a3,
            a4: that.a4,
            a5: that.a5,
            theta3: that.theta3,
            P5x: that.P5.x,
        };
    };
    
    that.optimize = function (goalPath) {
        var prevError = 1e1000;
        var scale = 20;
        
        var choices = [
            {name:"a1", mutate:scale*.01},
            {name:"a2", mutate:scale*.01},
            {name:"a3", mutate:scale*.01},
            {name:"a4", mutate:scale*.01},
            {name:"a5", mutate:scale*.01},
            {name:"theta3", mutate:Math.PI*2/100},
            {name:"P5x", mutate:scale*.01}];
            
        that.optimizing = true;    
        
        (function f() {
            if (!that.optimizing) return;
        
            var lowestError = 1e100;
            var bestElements = null;
            
            var done = true;
            
            var tmpDistance, tmpAngle;
            
            for (var i = 0; i < choices.length*3; i++) {
                my.fourBar.pushState();
                
                var elements = getElements();
            
                var noaction = (i%3) == 0;
                var j = Math.floor(i/3);
                switch (i%3) {
                    case 0:
                        break;
                    case 1:
                        elements[choices[j].name] += choices[j].mutate * Math.random();
                        break;
                    case 2:
                        elements[choices[j].name] -= choices[j].mutate * Math.random();
                        break;
                }
                
                setElements(elements);
                
                try {
                    var error = calcError(goalPath);
                    
                    if (error <= lowestError) {  
                        bestElements = elements;
                        lowestError = error;
                        done = noaction;
                    }
                } catch (ex) {};
                
                my.fourBar.popState();
            }
            
            setElements(bestElements);
            
            if (done) {
                that.optimizing = false;
            } else {
                setTimeout(f, 10);
            }
        })();
    };
    

    // more construction
    that.setInputAngles(that.theta1, that.theta2);


    return that;
};