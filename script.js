var dt = 0.1;
var mouseAttraction = 0.5;

var lengthSlider = document.getElementById("lengthSlider");
var gravitySlider = document.getElementById("gravitySlider");

function sq(x) {
    return x*x;
}

var dtsq = sq(dt);

var Particle = function(x,y,m) {
    this.s = {
        x:x,
        y:y
    };
    this.s0 = {
        x:x,
        y:y
    };
    this.f = {
        x:0,
        y:0
    };
    this.m = m;
};
Particle.prototype.display = function() {
    stroke(255);
    strokeWeight(8);
    point(this.s.x,this.s.y);
};
Particle.prototype.update = function() {
    let x = this.s.x;
    let y = this.s.y;
    let x0 = this.s0.x;
    let y0 = this.s0.y;
    let ax = this.f.x/this.m;
    let ay = this.f.y/this.m;
    
    let x1 = 2*x - x0 + ax*dtsq;
    let y1 = 2*y - y0 + ay*dtsq;
    
    this.s0 = {
        x:x,
        y:y
    };
    this.s = {
        x:x1,
        y:y1
    };
};
Particle.prototype.reset = function() {
    this.f.x = 0;
    this.f.y = 0;
};
Particle.prototype.applyForce = function(x,y) {
    this.f.x += x;
    this.f.y += y;
};
Particle.prototype.gravity = function(g) {
    this.applyForce(0,g*this.m);
};

var Connector = function(p1, p2) {
    this.r = sqrt(sq(p2.s.x-p1.s.x) + sq(p2.s.y-p1.s.y));
    this.p1 = p1;
    this.p2 = p2;
};
Connector.prototype.display = function() {
    strokeWeight(1);
    stroke(180);
    line(this.p1.s.x, this.p1.s.y, this.p2.s.x, this.p2.s.y);
    this.p1.display();
    this.p2.display();
};
Connector.prototype.calculateStuff = function() {
    let p1 = this.p1;
    let p2 = this.p2;
    
    var dsx = p2.s.x-p1.s.x;
    var dsy = p2.s.y-p1.s.y;
    
    let v1x = p1.s.x-p1.s0.x;
    let v1y = p1.s.y-p1.s0.y;
    let v2x = p2.s.x-p2.s0.x;
    let v2y = p2.s.y-p2.s0.y;
    let dvsq = sq(v2x-v1x) + sq(v2y-v1y); //square of the differences of the velocities
    let a = (dvsq - ((p1.f.x/p1.m - p2.f.x/p2.m)*(dsx)+(p1.f.y/p1.m - p2.f.y/p2.m)*(dsy)))/(this.r*(1/p1.m + 1/p2.m));
    
    let nx = dsx/this.r;
    let ny = dsy/this.r;
    
    p1.applyForce(a*nx,a*ny);
    p2.applyForce(-a*nx,-a*ny);
};
Connector.prototype.update = function() {
    let p1 = this.p1;
    let p2 = this.p2;
    
    let dx = p2.s.x-p1.s.x;
    let dy = p2.s.y-p1.s.y;
    let d = sqrt(sq(dx) + sq(dy));
    
    let nx = dx/d;
    let ny = dy/d;
    
    let correction = (d-this.r)*0.5;
    
    p1.s.x += correction*nx;
    p1.s.y += correction*ny;
    p2.s.x -= correction*nx;
    p2.s.y -= correction*ny;
};
Connector.prototype.setR = function(r) {
    this.r = r;
};

var p1;
var p2;
var obj;

function setup() {
    bodyStyle = document.body.style;
    
    createCanvas(windowWidth, windowHeight);
    
    background(0);
    bodyStyle.backgroundColor = 0;
    
    let middleX = width/2;
    let middleY = height/2;
    p1 = new Particle(middleX,middleY,1);
    p2 = new Particle(middleX,middleY + Number(lengthSlider.value),1);
    obj = new Connector(p1,p2);
}

lengthSlider.oninput = function() {
    obj.setR(this.value);
};

var g = Number(gravitySlider.value);
gravitySlider.oninput = function() {
    g=Number(this.value);
};

function draw() {
    background(0);
    p1.reset();
    p2.reset();
    
    //attract to mouse pointer
    var dx = mouseX-p1.s.x;
    var dy = mouseY-p1.s.y;

    p1.applyForce(mouseAttraction*dx,mouseAttraction*dy);
    
    //gravity
    p1.applyForce(0,g);
    p2.applyForce(0,g);
    
    obj.calculateStuff();
    
    p1.update();
    p2.update();
    obj.update();
    obj.display();
    
    //display spring
    var d = sqrt(sq(dx)+sq(dy));
    strokeWeight(3);
    stroke(0, 179, 255,constrain(d,0,255));
    line(p1.s.x,p1.s.y,mouseX,mouseY);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}