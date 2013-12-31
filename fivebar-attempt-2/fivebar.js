var FiveBar = function (config) {
    "use strict";
    
    return this.create(config);
};

FiveBar.prototype.createRequiredParameters = [
    "a1", "a2", "a3", "a4", "P1", "P5"
];

FiveBar.prototype.create = function (config, my) {
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


    //
    // protected members
    //
    
    my = my || {};
    
    my.fourBar = new FourBar({
        a: config.a1,
        b: config.a2,
        c: config.a3,
        O2: config.P1,
        O4: {
            x: config.P5.x + config.a4 * Math.cos(config.theta2 || 0),
            y: config.P5.y + config.a4 * Math.sin(config.theta2 || 0)
        },
        useSafeMath: config.useSafeMath
    });


    //
    // public members
    //

    that.a1 = config.a1;
    that.a2 = config.a2;
    that.a3 = config.a3;
    that.a4 = config.a4;
    that.P1 = config.P1;
    that.P2 = my.fourBar.pA;
    that.P3 = my.fourBar.pB;
    that.P4 = my.fourBar.O4;
    that.P5 = config.P5;
    that.theta1 = (config.theta1) || 0;
    that.theta2 = (config.theta2) || 0;


    //
    // public methods
    //

    // recalcuates internal angles using theta1
    // then recalculates P4 using a4, P5, and theta2
    // then recalculates P2 and P3 using a1, a2, a3, P1, and theta1
    that.setInputAngles = function (theta1, theta2) {
        that.theta1 = theta1;
        that.theta2 = theta2;
        
        // note: that.P4 and fourBar.O4 reference the same object
        that.P4.x = that.P5.x + that.a4 * Math.cos(that.theta2);
        that.P4.y = that.P5.y + that.a4 * Math.sin(that.theta2);
        
        var P4angle = Math.atan2(
                that.P4.y - that.P1.y,
                that.P4.x - that.P1.x
            ),
            
            P5angle = Math.atan2(
                that.P5.y - that.P1.y,
                that.P5.x - that.P1.x
            ),
            
            diff = P4angle - P5angle;
        
        my.fourBar.theta2 = that.theta1 - diff; // TODO: this is incorrect, finish this function
        my.fourBar.runPositionAnalysis();
        
        // note: that.P2 and fourBar.pA reference the same object
        // and that.P3 and fourBar.pB reference the same object
        my.fourBar.recalculatePoints();
    };
    

    // more construction
    that.setInputAngles(that.theta1, that.theta2);

    return that;
};