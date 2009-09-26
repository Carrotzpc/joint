Shape.currentDrag = false;

function Shape(opt){
    this.wrapper = null;
    this.subShapes = [];
    this._opt = {
	draggable: true
    };
    for (var key in opt)
	this._opt[key] = opt[key];
    this.isShape = true;

    // this is needed in joint library when
    // manipulation with a raphael object joints array
    // - just delegate joints array methods to the wrapper
    var self = this;
    this.joints = {
	indexOf: function(){
	    return self.wrapper.joints.indexOf.apply(self.wrapper.joints, arguments);
	},
	push: function(){
	    return self.wrapper.joints.push.apply(self.wrapper.joints, arguments);
	}
    };
};

Shape.prototype.dragger = function(e){
    Shape.currentDrag = this.wholeShape;
    Shape.currentDrag.dx = e.clientX;
    Shape.currentDrag.dy = e.clientY;    
    e.preventDefault && e.preventDefault();
};

Shape.mouseMove = function(e){
    e = e || window.event;
    if (Shape.currentDrag){
	Shape.currentDrag.translate(e.clientX - Shape.currentDrag.dx, e.clientY - Shape.currentDrag.dy);
	r.safari();
	Shape.currentDrag.dx = e.clientX;
	Shape.currentDrag.dy = e.clientY;
    }
};

Shape.mouseUp = function(e){
    Shape.currentDrag = false;
};

addEvent(document, "mousemove", Shape.mouseMove);
addEvent(document, "mouseup", Shape.mouseUp);

Shape.prototype.translate = function(dx, dy){
    this.wrapper.translate(dx, dy);
    for (var i = this.subShapes.length - 1; i >= 0; --i){
	this.subShapes[i].translate(dx, dy);
    }
};

Shape.prototype.add = function(s){
    this.subShapes.push(s);
};

Shape.prototype.addMain = function(s){
    this.wrapper = s;
    this.wrapper.wholeShape = this;
    this.type = this.wrapper.type;
    if (this._opt && this._opt.draggable){
	this.wrapper.mousedown(this.dragger);
    }
};

Shape.prototype.getBBox = function(){
    return this.wrapper.getBBox();
};

Shape.prototype.joint = function(to, opt){
    var toobj = (to.isShape) ? to.wrapper : to;
    this.wrapper.joint.apply(this.wrapper, [toobj, opt]);
};

Shape.prototype.attr = function(){
    return Raphael.el.attr.apply(this.wrapper, arguments);
};

/**
 * UML StateChart state.
 * @param raphael raphael paper
 * @param r rectangle
 * @param attrs shape SVG attributes
 * @param text string state name
 */
function UMLState(raphael, r, attrs, text){
//    Shape.apply(this, arguments[5]);
    Shape.apply(this);
    this.opt = {
	rect: r,
	radius: 15,
	attrs: attrs,
	text: {
	    string: text,
	    dx: 20,	// x distance from oval bbox x
	    dy: 5	// y distance from oval bbox y
	},
	swimlane: {
	    dy: 15	// swimlane distance from the top
	}
    }; 
    this._raphael = raphael;
    this.addMain(this._raphael.rect(this.opt.rect.x, this.opt.rect.y, 
				    this.opt.rect.width, this.opt.rect.height, 
				    this.opt.radius).attr(this.opt.attrs));
    this.add(this.drawText());
    this.add(this.drawSwimlane());
};
UMLState.prototype = new Shape;

UMLState.prototype.drawSwimlane = function(){
    var bb = this.wrapper.getBBox();
    return this._raphael.path({}, ["M", bb.x, bb.y + this.opt.text.dy + this.opt.swimlane.dy, "L", bb.x + bb.width, bb.y + this.opt.text.dy + this.opt.swimlane.dy]);
};

UMLState.prototype.drawText = function(){
    var 
    bb = this.wrapper.getBBox(),
    t = this._raphael.text(bb.x, bb.y, this.opt.text.string),
    tbb = t.getBBox();
    t.translate(bb.x - tbb.x + this.opt.text.dx, 
		bb.y - tbb.y + this.opt.text.dy);
    return t;
};

UMLState.prototype.scale = function(){
    this.wrapper.scale.apply(this.wrapper, arguments);
    this.subShapes[0].remove();	// text
    this.subShapes[1].remove();	// swimlane
    this.subShapes[0] = this.drawText();
    this.subShapes[1] = this.drawSwimlane();
};

/**
 * Finite state machine state.
 * @param raphael raphael paper
 * @param p point position
 * @param r radius
 * @param attrs shape SVG attributes
 * @param text string state name
 */
function FSAState(raphael, p, r, attrs, text){
//    Shape.apply(this, arguments[5]);
    Shape.apply(this);
    this.opt = {
	point: p,
	radius: r,
	attrs: attrs,
	text: {
	    string: text,
	    dx: r/2,	// x distance from oval bbox x
	    dy: r/2 + 8	// y distance from oval bbox y
	}
    }; 
    this._raphael = raphael;
    this.addMain(this._raphael.circle(this.opt.point.x, this.opt.point.y, 
				      this.opt.radius).attr(this.opt.attrs));
    this.add(this.drawText());
};
FSAState.prototype = new Shape;

FSAState.prototype.drawText = function(){
    var 
    bb = this.wrapper.getBBox(),
    t = this._raphael.text(bb.x, bb.y, this.opt.text.string),
    tbb = t.getBBox();
    t.translate(bb.x - tbb.x + this.opt.text.dx, 
		bb.y - tbb.y + this.opt.text.dy);
    return t;
};

FSAState.prototype.scale = function(){
    this.wrapper.scale.apply(this.wrapper, arguments);
    this.subShapes[0].remove();	// text
    this.subShapes[0] = this.drawText();
};

/**
 * Finite state machine start state.
 * @param raphael raphael paper
 * @param p point position
 * @param r radius
 * @param attrs shape SVG attributes
 */
function FSAStartState(raphael, p, r, attrs){
//    Shape.apply(this, arguments[4]);
    Shape.apply(this);
    this.opt = {
	point: p,
	radius: r,
	attrs: attrs
    }; 
    this._raphael = raphael;
    this.addMain(this._raphael.circle(this.opt.point.x, this.opt.point.y, 
				      this.opt.radius).attr(this.opt.attrs).attr("fill", "black"));
};
FSAStartState.prototype = new Shape;

FSAStartState.prototype.scale = function(){
    this.wrapper.scale.apply(this.wrapper, arguments);
};

/**
 * Finite state machine end state.
 * @param raphael raphael paper
 * @param p point position
 * @param r radius
 * @param attrs shape SVG attributes
 */
function FSAEndState(raphael, p, r, attrs){
//    Shape.apply(this, arguments[4]);
    Shape.apply(this);
    this.opt = {
	point: p,
	radius: r,
	subRadius: r/2,
	attrs: attrs
    }; 
    this._raphael = raphael;
    this.addMain(this._raphael.circle(this.opt.point.x, this.opt.point.y, 
				      this.opt.radius).attr(this.opt.attrs).attr("fill", "white"));
    this.add(this._raphael.circle(this.opt.point.x, this.opt.point.y, 
				  this.opt.subRadius).attr(this.opt.attrs).attr("fill", "black"));
};
FSAEndState.prototype = new Shape;

FSAEndState.prototype.scale = function(){
    this.wrapper.scale.apply(this.wrapper, arguments);
    this.subShapes[0].scale.apply(this.subShapes[0], arguments);
};
