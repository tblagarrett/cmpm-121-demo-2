import "./style.css";
import { createDrawing } from "./drawing.ts";

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

// Add a clear button
const buttonsDiv = document.createElement("div");
buttonsDiv.style.marginTop = "10px";
app.appendChild(buttonsDiv);

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear Canvas";
app.appendChild(clearButton);


// Add event listener to the clear button
clearButton.addEventListener("click", drawing.clearCanvas);
