class mPoint {
	constructor(x, y, isLocked) {
		this.x = x;
		this.px = x;
		this.y = y;
		this.py = y;
		this.locked = isLocked;
	}

	update() {
		if (!this.locked) {
			const px = this.x;
			const py = this.y;
			this.x += this.x - this.px;
			this.y += this.y - this.py;
			this.y += 0.0098 * deltaTime * deltaTime;
			this.px = px;
			this.py = py;
		}
	}
}

class Stick {
	constructor(p1, p2) {
		this.p1 = p1;
		this.p2 = p2;
		this.length = dist(p1.x, p1.y, p2.x, p2.y);
	}

	update() {
		const cx = (this.p1.x + this.p2.x) / 2;
		const cy = (this.p1.y + this.p2.y) / 2;
		const dx = this.p1.x - this.p2.x;
		const dy = this.p1.y - this.p2.y;
		const stretchedLength = Math.sqrt(dx * dx + dy * dy);
		const lengthRatio = this.length / stretchedLength;

		if (!this.p1.locked) {
			this.p1.x = cx + (dx * lengthRatio) / 2;
			this.p1.y = cy + (dy * lengthRatio) / 2;
		}
		if (!this.p2.locked) {
			this.p2.x = cx - (dx * lengthRatio) / 2;
			this.p2.y = cy - (dy * lengthRatio) / 2;
		}
	}
}

const points = [];
const sticks = [];

function setup() {
	createCanvas(1000, 1000);
	stroke(255);
}

let prevPoint;
let currPoint;
function mousePressed() {
	let clickedOnPoint = false;
	let clickedPoint;
	for (currPoint of points) {
		if (dist(currPoint.x, currPoint.y, mouseX, mouseY) <= 10) {
			clickedOnPoint = true;
			clickedPoint = currPoint;
		}
	}

	if (clickedOnPoint) {
		clickedPoint.locked = !clickedPoint.locked;
	} else {
		prevPoint = currPoint;
		currPoint = new mPoint(mouseX, mouseY, false);
		points.push(currPoint);
		if (prevPoint) {
			sticks.push(new Stick(currPoint, prevPoint));
		}
	}
}

function keyPressed() {
	if (keyCode == ENTER) isSimulating = true;
}

let isSimulating = false;
function draw() {
	if (isSimulating) {
		for (currPoint of points) {
			currPoint.update();
		}

		for (let i = 0; i < 100; i++) {
			for (stick of sticks) {
				stick.update();
			}
		}
	}

	background(100);

	strokeWeight(2);
	for (const stick of sticks) {
		const { x: x1, y: y1 } = stick.p1;
		const { x: x2, y: y2 } = stick.p2;
		line(x1, y1, x2, y2);
	}

	strokeWeight(0);
	for (const currPoint of points) {
		fill(currPoint.locked ? color(255, 0, 0) : 50);
		circle(currPoint.x, currPoint.y, 10);
	}
}
