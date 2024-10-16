import "./style.css";
import { createDrawing, Drawing } from "./drawing.ts";

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

let drawing = createDrawing(canvas);

// Add control buttons to the app
addControlButtons(app, drawing);

// Function to add control buttons
function addControlButtons(parent: HTMLElement, drawing: Drawing) {
  const buttonsDiv = document.createElement("div");
  buttonsDiv.style.marginTop = "10px";
  parent.appendChild(buttonsDiv);

  const clearButton = document.createElement("button");
  clearButton.innerHTML = "Clear Canvas";
  buttonsDiv.appendChild(clearButton);

  const undoButton = document.createElement("button");
  undoButton.innerHTML = "Undo";
  buttonsDiv.appendChild(undoButton);

  const redoButton = document.createElement("button");
  redoButton.innerHTML = "Redo";
  buttonsDiv.appendChild(redoButton);

  // Add event listeners for the buttons
  clearButton.addEventListener("click", drawing.clearCanvas);
  undoButton.addEventListener("click", drawing.undo);
  redoButton.addEventListener("click", drawing.redo);
}
