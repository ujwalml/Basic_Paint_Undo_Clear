alert(
  "WELCOME TO BASIC PAINT.\nEnjoy drawing on all devices!!.\nThis project enables us to choose the colours from the options and do some basic drawings like line drawings.\nYou can Erase, Undo, Clear and Download your drawings.\nScroll down to find Erase and Download button."
);
window.onload = () => {
  init();
  window.addEventListener("resize", resizeCanvas);
};

var c, ctx, w, h;
var undoStack = [];
var currentLine = [];
var isDrawing = false;

function init() {
  c = document.getElementById("main");
  ctx = c.getContext("2d");
  resizeCanvas();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";

  c.addEventListener("touchstart", startDrawing, { passive: false });
  c.addEventListener("touchmove", draw, { passive: false });
  c.addEventListener("touchend", endDrawing);
  c.addEventListener("mousedown", startDrawing);
  c.addEventListener("mousemove", draw);
  c.addEventListener("mouseup", endDrawing);
}

function resizeCanvas() {
  let prevData = ctx.getImageData(0, 0, c.width, c.height); 
  w = Math.min(window.innerWidth * 0.95, 1200); 
  h = window.innerHeight * 0.75;
  c.width = w;
  c.height = h;
  ctx.putImageData(prevData, 0, 0); 
  redraw();
}

function getCursorPosition(e) {
  let rect = c.getBoundingClientRect();
  let scaleX = c.width / rect.width;
  let scaleY = c.height / rect.height;

  let x =
    (e.clientX ? e.clientX - rect.left : e.touches[0].clientX - rect.left) *
    scaleX;
  let y =
    (e.clientY ? e.clientY - rect.top : e.touches[0].clientY - rect.top) *
    scaleY;

  return { x, y };
}

function startDrawing(e) {
  e.preventDefault();
  isDrawing = true;
  let pos = getCursorPosition(e);
  currentLine = [ctx.strokeStyle, [pos.x, pos.y]];
}

function draw(e) {
  if (!isDrawing) return;
  e.preventDefault();
  let pos = getCursorPosition(e);

  ctx.beginPath();
  ctx.moveTo(
    currentLine[currentLine.length - 1][0],
    currentLine[currentLine.length - 1][1]
  );
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  currentLine.push([pos.x, pos.y]);
}

function endDrawing(e) {
  e.preventDefault();
  isDrawing = false;
  if (currentLine.length > 1) {
    undoStack.push(currentLine);
  }
}

function colorSelect(color, index) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  document.querySelectorAll(".color-box").forEach((box, i) => {
    box.style.transform = i === index ? "scale(1.3)" : "scale(1)";
  });
}

function undo() {
  if (undoStack.length === 0) return;
  ctx.clearRect(0, 0, w, h);
  undoStack.pop();
  redraw();
}

function clearCanvas() {
  ctx.clearRect(0, 0, w, h);
  undoStack = [];
}

function redraw() {
  undoStack.forEach((line) => {
    ctx.strokeStyle = line[0];
    ctx.beginPath();
    line.slice(1).forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point[0], point[1]);
      } else {
        ctx.lineTo(point[0], point[1]);
      }
    });
    ctx.stroke();
  });
}
function downloadCanvas() {
  let tempCanvas = document.createElement("canvas");
  let tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = c.width;
  tempCanvas.height = c.height;

  tempCtx.fillStyle = "white";
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  tempCtx.drawImage(c, 0, 0);

  let link = document.createElement("a");
  link.download = "my_drawing.png";
  link.href = tempCanvas.toDataURL("image/png");
  link.click();
}

var isErasing = false;
var lastStrokeStyle = "black";

function useEraser() {
  if (!isErasing) {
    lastStrokeStyle = ctx.strokeStyle;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 15;
    isErasing = true;
  } else {
    ctx.strokeStyle = lastStrokeStyle;
    ctx.lineWidth = 3;
    isErasing = false;
  }
}
