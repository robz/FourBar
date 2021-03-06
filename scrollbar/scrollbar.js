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
        maxX = config.maxX;
        
    that.curX = config.startX;

    // defaults
    that.BAR_WIDTH = (maxX - minX)/10;
    that.movedToCallback = function () {};
    
    // hmm
    config.minY = 0;
    config.maxY = 1;
    config.maxX += that.BAR_WIDTH;
    var plot = new Plot(config);

    // configurations (optional parameters)
    that.BAR_WIDTH = config.BAR_WIDTH || that.BAR_WIDTH;
    that.movedToCallback = config.movedToCallback || that.movedToCallback;
    that.label = config.label || false;

    // public methods
    that.setPosition = function (x) {
        plot.restoreToBackground();
        plot.drawRect(x, 0, that.BAR_WIDTH, 1);
        
        // TODO: this is fucking terrible I don't know how I can sleep at night with this in here
        if (that.label) {
            plot.drawText(that.label, 10, 20, 
                {font: "12px sans-serif", drawColor: "black"});
            plot.drawText(Math.round(x*1000)/1000, plot.pixelWidth - 50, 20, 
                {font: "12px sans-serif", drawColor: "black"});
        }

        that.curX = x;
    };
    
    var mousePressed = false, 
        barStartX = null,
        pressStartX = null;
    
    plot.setMouseDown(function (x, y) {
        if (x > that.curX && x < that.curX + that.BAR_WIDTH) {
            mousePressed = true;
            barStartX = that.curX;
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
        // mousePressed = false;
    });

    that.setPosition(that.curX);
    
    return that;
};
