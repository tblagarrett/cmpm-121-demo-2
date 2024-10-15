import "./style.css";

const APP_NAME = "Hello";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

// Add elements
const header = document.createElement("h1");
header.innerHTML = APP_NAME;
app.append(header);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "drawingCanvas";
app.appendChild(canvas);

const ctx = canvas.getContext("2d");

let drawing = false;

// Function to start drawing
const startDrawing = (event: MouseEvent) => {
  drawing = true;
  draw(event);
};

// Function to draw on the canvas
const draw = (event: MouseEvent) => {
  if (!drawing) return;
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
};

// Function to stop drawing
const stopDrawing = () => {
  drawing = false;
  if (ctx) ctx.beginPath();
};

// Add event listeners to the canvas
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

// Add a clear button
const buttonsDiv = document.createElement("div");
buttonsDiv.style.marginTop = "10px";
app.appendChild(buttonsDiv);

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear Canvas";
app.appendChild(clearButton);

// Function to clear the canvas
const clearCanvas = () => {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};

// Add event listener to the clear button
clearButton.addEventListener("click", clearCanvas);
