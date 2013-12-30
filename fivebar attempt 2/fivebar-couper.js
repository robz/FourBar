var FiveBarCoupler = function (config) {
    "use strict";
    
    return this.create(config);
};

FiveBarCoupler.prototype.createRequiredParameters = [
    "a1", "a2", "a3", "a4", "P1", "P5", "a5", "theta3"
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
    that.P6 = {x: null, y: null};


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
    
    that.calcCouplerPath = function (numPoints, speed1, speed2) {
        var theta1_temp = that.theta1,
            theta2_temp = that.theta2,
        
            points = [],
            i,
            theta1,
            revs = speed2 * speed1; // TODO: this won't work for negative speeds or for speeds that aren't integers
        
        try {
            for (i = 0; i < numPoints; i += 1) {
                theta1 = i / numPoints * revs * Math.PI * 2;

                that.setInputAngles(
                    theta1 % (2 * Math.PI),
                    (theta1 * speed2 / speed1) % (2 * Math.PI)
                );

                points.push([that.P6.x, that.P6.y]);
            }
        } catch (e) {
            return null;
        } finally {
            that.setInputAngles(theta1_temp, theta2_temp);
        }
        
        that.cachedLegPath = points;

        return points;
    };
    

    // more construction
    that.setInputAngles(that.theta1, that.theta2);


    return that;
};