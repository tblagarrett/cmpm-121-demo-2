export type Drawing = {
  canvas: HTMLCanvasElement;
  lines: Array<Array<[number, number]>>;
  redoStack: Array<Array<[number, number]>>;
  currentLine: Array<[number, number]>;
  drawingChangedEvent: CustomEvent<unknown>;
  isDrawing: boolean;
  context: CanvasRenderingContext2D | null;

  startDrawing(): void;
  stopDrawing(): void;
  addPoint(event: MouseEvent): void;
  updateDrawing(): void;
  clearCanvas(): void;
  undo(): void;
  redo(): void;
};

export function createDrawing(canvas: HTMLCanvasElement): Drawing {
  const drawingObject: Drawing = {
    canvas,
    lines: [],
    redoStack: [],
    currentLine: [],
    drawingChangedEvent: createDrawingChangedEvent(canvas),
    isDrawing: false,
    context: canvas.getContext("2d"),

    addPoint: function (event: MouseEvent) {
      if (this.isDrawing) {
        const rect = this.canvas.getBoundingClientRect();
        const point: [number, number] = [
          event.clientX - rect.left,
          event.clientY - rect.top,
        ];
        this.currentLine.push(point);
        this.canvas.dispatchEvent(this.drawingChangedEvent);
      }
    },

    startDrawing: function () {
      this.isDrawing = true;
    },

    stopDrawing: function () {
      this.isDrawing = false;
      if (this.currentLine.length > 0) {
        this.lines.push([...this.currentLine]);
        this.currentLine = []; // Reset current line
        this.redoStack = []; // Clear redoStack once a new line is added
      }
      if (this.context) {
        this.context.beginPath();
      }
    },

    updateDrawing: function () {
      if (!this.context) return;

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.lineWidth = 2;
      this.context.lineCap = "round";
      this.context.strokeStyle = "black";

      // Draw all stored lines
      this.lines.forEach((line) => {
        this.context.beginPath();
        line.forEach((point, index) => {
          if (index === 0) {
            this.context.moveTo(point[0], point[1]);
          } else {
            this.context.lineTo(point[0], point[1]);
          }
        });
        this.context.stroke();
      });

      // Draw the current line being drawn
      if (this.currentLine.length > 0) {
        this.context.beginPath();
        this.currentLine.forEach((point, index) => {
          if (index === 0) {
            this.context.moveTo(point[0], point[1]);
          } else {
            this.context.lineTo(point[0], point[1]);
          }
        });
        this.context.stroke();
      }
    },

    clearCanvas: function () {
      this.lines = []; // Clear the stored lines
      this.redoStack = []; // Clear the redo stack
      if (this.context) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateDrawing();
      }
    },

    undo: function () {
      if (this.lines.length > 0) {
        const lastLine = this.lines.pop();
        if (lastLine) this.redoStack.push(lastLine);
        this.canvas.dispatchEvent(this.drawingChangedEvent);
      }
    },

    redo: function () {
      if (this.redoStack.length > 0) {
        const redoLine = this.redoStack.pop();
        if (redoLine) this.lines.push(redoLine);
        this.canvas.dispatchEvent(this.drawingChangedEvent);
      }
    },
  };

  // Bind methods to use the correct `this` context
  drawingObject.addPoint = drawingObject.addPoint.bind(drawingObject);
  drawingObject.startDrawing = drawingObject.startDrawing.bind(drawingObject);
  drawingObject.stopDrawing = drawingObject.stopDrawing.bind(drawingObject);
  drawingObject.updateDrawing = drawingObject.updateDrawing.bind(drawingObject);
  drawingObject.clearCanvas = drawingObject.clearCanvas.bind(drawingObject);
  drawingObject.undo = drawingObject.undo.bind(drawingObject);
  drawingObject.redo = drawingObject.redo.bind(drawingObject);

  canvas.addEventListener("drawing-changed", drawingObject.updateDrawing);
  canvas.addEventListener("mousemove", drawingObject.addPoint);
  canvas.addEventListener("mousedown", drawingObject.startDrawing);
  canvas.addEventListener("mouseup", drawingObject.stopDrawing);

  return drawingObject;
}

function createDrawingChangedEvent(
  canvas: HTMLCanvasElement
): CustomEvent<unknown> {
  return new CustomEvent("drawing-changed");
}
