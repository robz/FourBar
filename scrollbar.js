var ScrollBar = function (config) {
    "use strict";

    return this.create(config);
}

ScrollBar.prototype.createRequiredParameters = [
    "container",
    "pixelWidth",  // canvas scale
    "pixelHeight", // canvas scale
    "minX",        // scrollbar scale
    "maxX",        // scrollbar scale
    "startX",        // scrollbar scale
];

ScrollBar.prototype.create = function (config) {
    "use strict";
    
    // required parameter check
    this.createRequiredParameters.forEach(function (elem) {
        if (config[elem] === undefined) {
            throw "error: missing required '" + elem + "' parameter";
        }
    });

    // object to be returned
    var that = {},
    
    // required parameters
        minX = config.minX,
        maxX = config.maxX,
        curX = config.startX;

    // defaults
    that.BAR_WIDTH = (maxX - minX)/10;
    that.movedToCallback = function () {};
    
    // hmm
    config.minY = 0;
    config.maxY = 1;
    config.maxX += that.BAR_WIDTH;
    var  plot = new Plot(config);

    // configurations (optional parameters)
    that.BAR_WIDTH = config.BAR_WIDTH || that.BAR_WIDTH;
    that.movedToCallback = config.movedToCallback || that.movedToCallback;

    // public methods
    that.setPosition = function (x) {
        plot.restoreToBackground();
        plot.drawRect(x, 0, that.BAR_WIDTH, 1);
        curX = x;
    };
    
    var mousePressed = false, 
        barStartX = null,
        pressStartX = null;
    
    plot.setMouseDown(function (x, y) {
        if (x > curX && x < curX + that.BAR_WIDTH) {
            mousePressed = true;
            barStartX = curX;
            pressStartX = x;
        }
    });
    
    plot.setMouseUp(function (x, y) {
        mousePressed = false;
    });
    
    plot.setMouseMove(function (x, y) {
        if (mousePressed) {
            var newX = barStartX + (x - pressStartX);
        
            if (newX < minX ) { newX = minX; }
            if (newX > maxX ) { newX = maxX; }
        
            that.setPosition(newX);
            that.movedToCallback(newX);
        }
    });
    
    plot.setMouseOut(function () {
        mousePressed = false;
        console.log('um');
    });

    that.setPosition(curX);
    
    return that;
};





































