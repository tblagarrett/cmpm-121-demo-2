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

// Add buttons to the app
addControlButtons(app, drawing);
addStickerButtons(app, drawing);

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

  const thinLineButton = document.createElement("button");
  let thin = 2;
  thinLineButton.id = "thicknessButton";
  thinLineButton.innerHTML = "Thin";
  thinLineButton.classList.add("selectedTool");
  buttonsDiv.appendChild(thinLineButton);

  const thickLineButton = document.createElement("button");
  let thick = 5;
  thickLineButton.id = "thicknessButton";
  thickLineButton.innerHTML = "Thick";
  buttonsDiv.appendChild(thickLineButton);

  // Add event listeners for the buttons
  clearButton.addEventListener("click", drawing.clearCanvas);
  undoButton.addEventListener("click", drawing.undo);
  redoButton.addEventListener("click", drawing.redo);
  thinLineButton.addEventListener("click", () => {
    drawing.changeThickness(thin);
    thinLineButton.classList.add("selectedTool");
    thickLineButton.classList.remove("selectedTool");
  });
  thickLineButton.addEventListener("click", () => {
    drawing.changeThickness(thick);
    thickLineButton.classList.add("selectedTool");
    thinLineButton.classList.remove("selectedTool");
  });
}

function addStickerButtons(parent: HTMLElement, drawing: Drawing) {
  const buttonsDiv = document.createElement("div");
  buttonsDiv.style.marginTop = "10px";
  parent.appendChild(buttonsDiv);

  const penButton = document.createElement("button");
  penButton.innerHTML = "Pen";
  penButton.id = "toolButton";
  buttonsDiv.appendChild(penButton);
  penButton.addEventListener("click", () => {
    if (drawing.toolPreview) drawing.toolPreview.character = "•";
    drawing.isPlacingSticker = false;
  });

  const cloudButton = document.createElement("button");
  cloudButton.id = "toolButton";
  cloudButton.innerHTML = "☁";
  buttonsDiv.appendChild(cloudButton);
  cloudButton.addEventListener("click", () => {
    if (drawing.toolPreview) drawing.toolPreview.character = "☁";
    drawing.isPlacingSticker = true;
  });

  const rainButton = document.createElement("button");
  rainButton.id = "toolButton";
  rainButton.innerHTML = "🌧";
  buttonsDiv.appendChild(rainButton);
  rainButton.addEventListener("click", () => {
    if (drawing.toolPreview) drawing.toolPreview.character = "🌧";
    drawing.isPlacingSticker = true;
  });

  const smileButton = document.createElement("button");
  smileButton.id = "toolButton";
  smileButton.innerHTML = "😊";
  buttonsDiv.appendChild(smileButton);
  smileButton.addEventListener("click", () => {
    if (drawing.toolPreview) drawing.toolPreview.character = "😊";
    drawing.isPlacingSticker = true;
  });
}
