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

const drawing = createDrawing(canvas);

// Sticker definition
const stickers = [
  { name: "Pen", icon: "•", isPlacingSticker: false },
  { name: "Exploding Head", icon: "🤯", isPlacingSticker: true },
  { name: "Dice", icon: "🎲", isPlacingSticker: true },
  { name: "Smile", icon: "😊", isPlacingSticker: true },
];

const availableColors = ["black", "red", "green", "blue"];

// Add buttons to the app
addControlButtons(app, drawing);
addStickerButtons(app, drawing);
addColorButtons(app, drawing);

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

  const exportButton = document.createElement("button");
  exportButton.innerHTML = "Export as PNG";
  buttonsDiv.appendChild(exportButton);

  const thinLineButton = document.createElement("button");
  const thin = 5;
  thinLineButton.id = "thicknessButton";
  thinLineButton.innerHTML = "Thin";
  thinLineButton.classList.add("selectedTool");
  buttonsDiv.appendChild(thinLineButton);

  const thickLineButton = document.createElement("button");
  const thick = 10;
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

  // Add export functionality
  exportButton.addEventListener("click", drawing.exportAsPNG);
}

function addStickerButtons(parent: HTMLElement, drawing: Drawing) {
  const buttonsDiv = document.createElement("div");
  buttonsDiv.style.marginTop = "10px";
  parent.appendChild(buttonsDiv);

  // Button to add custom sticker
  const customStickerButton = document.createElement("button");
  customStickerButton.innerHTML = "Add Custom Sticker";
  buttonsDiv.appendChild(customStickerButton);

  customStickerButton.addEventListener("click", () => {
    const customIcon = prompt("Enter a character for your new sticker:", "⭐");

    // Proceed only if valid input is given
    if (customIcon) {
      const newSticker = {
        name: "Custom",
        icon: customIcon,
        isPlacingSticker: true,
      };
      stickers.push(newSticker); // Add to the array
      createStickerButton(newSticker, buttonsDiv, drawing); // Generate button
    }
  });

  // Iterate over existing stickers to create buttons
  stickers.forEach((sticker) =>
    createStickerButton(sticker, buttonsDiv, drawing)
  );
}

function createStickerButton(
  sticker: { name: string; icon: string; isPlacingSticker: boolean },
  buttonsDiv: HTMLElement,
  drawing: Drawing
) {
  const button = document.createElement("button");
  button.id = "toolButton";
  button.innerHTML = sticker.icon;
  buttonsDiv.appendChild(button);

  button.addEventListener("click", () => {
    if (drawing.toolPreview) drawing.toolPreview.character = sticker.icon;
    drawing.isPlacingSticker = sticker.isPlacingSticker;
  });
}

function addColorButtons(parent: HTMLElement, drawing: Drawing) {
  const buttonsDiv = document.createElement("div");
  buttonsDiv.style.marginTop = "10px";
  parent.appendChild(buttonsDiv);

  availableColors.forEach((color) => {
    const colorButton = document.createElement("button");
    colorButton.style.backgroundColor = color;
    colorButton.setAttribute("data-color", color);
    colorButton.style.border = "none";
    colorButton.style.width = "24px";
    colorButton.style.height = "24px";
    colorButton.style.borderRadius = "50%";
    buttonsDiv.appendChild(colorButton);

    colorButton.addEventListener("click", () => {
      drawing.currentColor = color;
      if (drawing.toolPreview) {
        drawing.toolPreview.color = color;
      }
    });
  });

  // Add Random Color Button
  const randomColorButton = document.createElement("button");
  randomColorButton.innerHTML = "Random";
  randomColorButton.title = "Random Color";
  randomColorButton.style.border = "none";
  randomColorButton.style.width = "24px";
  randomColorButton.style.height = "24px";
  randomColorButton.style.borderRadius = "50%";
  buttonsDiv.appendChild(randomColorButton);

  // Set random color event listener
  randomColorButton.addEventListener("click", () => {
    const randomColor = generateRandomColor();
    drawing.currentColor = randomColor;
    if (drawing.toolPreview) {
      drawing.toolPreview.color = randomColor;
    }
  });
}

function generateRandomColor(): string {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
