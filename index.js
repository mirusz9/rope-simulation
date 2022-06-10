function _dist(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

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
      this.y += 0.002 * deltaTime * deltaTime;
      this.px = px;
      this.py = py;
    }
  }
}

class Stick {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.length = _dist(p1.x, p1.y, p2.x, p2.y);
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

let points;
let sticks;

let saveBtn, loadBtn;
let guiWidth = 104,
  guiHeight = 40;

function setup() {
  createCanvas(1000, 1000);
  loadState();
  saveBtn = createButton("Save");
  saveBtn.position(35, 35);
  saveBtn.mousePressed(saveState);

  loadBtn = createButton("Load");
  loadBtn.position(40 + saveBtn.width, 35);
  loadBtn.mousePressed(loadState);
  stroke(255);
}

function saveState() {
  const serializedPoints = points.map((point) => [
    point.x,
    point.y,
    point.locked ? true : false,
  ]);
  const serializedSticks = sticks.map((stick) => {
    const p1I = points.findIndex((v) => v.x == stick.p1.x && v.y == stick.p1.y);
    const p2I = points.findIndex((v) => v.x == stick.p2.x && v.y == stick.p2.y);
    return [p1I, p2I];
  });
  localStorage.setItem("points", JSON.stringify(serializedPoints));
  localStorage.setItem("sticks", JSON.stringify(serializedSticks));
}

function loadState() {
  const localStoragePoints = localStorage.getItem("points");
  const localStorageSticks = localStorage.getItem("sticks");
  if (localStoragePoints && localStorageSticks) {
    points = JSON.parse(localStoragePoints).map((p) => new mPoint(...p));
    sticks = JSON.parse(localStorageSticks).map(
      (s) => new Stick(points[s[0]], points[s[1]])
    );
  } else {
    points = [];
    sticks = [];
  }
  isSimulating = false;
}

let prevPoint;
let isSimulating = false;

function mousePressed() {
  let currPoint;
  if (isSimulating) return;
  if (
    mouseX >= 25 &&
    mouseX <= 25 + guiWidth &&
    mouseY >= 25 &&
    mouseY <= 25 + guiHeight
  ) {
    return;
  }
  for (p of points) {
    if (dist(p.x, p.y, mouseX, mouseY) <= 10) {
      currPoint = p;
    }
  }

  if (currPoint) {
    if (prevPoint) {
      if (prevPoint.x == currPoint.x && prevPoint.y == currPoint.y) {
        currPoint.locked = !currPoint.locked;
        prevPoint = null;
      } else {
        sticks.push(new Stick(currPoint, prevPoint));
        prevPoint = null;
      }
    } else {
      prevPoint = currPoint;
    }
  } else {
    points.push(new mPoint(mouseX, mouseY, false));
    prevPoint = null;
  }
}

function keyPressed() {
  if (keyCode == ENTER) {
    isSimulating = true;
    saveState();
  } else if (keyCode == DELETE) {
    points = [];
    sticks = [];
  }
}

function draw() {
  if (isSimulating) {
    for (currPoint of points) {
      currPoint.update();
    }

    for (let i = 0; i < 2; i++) {
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

  fill(50);
  rect(20, 20, guiWidth, guiHeight);

  strokeWeight(0);
  for (const currPoint of points) {
    fill(currPoint.locked ? color(255, 0, 0) : 50);
    circle(currPoint.x, currPoint.y, 10);
  }
}
