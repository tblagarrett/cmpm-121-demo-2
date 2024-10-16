class Line {
  private points: Array<[number, number]>;

  constructor(points: Array<[number, number]> = []) {
    this.points = points;
  }

  drag(point: [number, number]) {
    this.points.push(point);
  }

  isSinglePoint(): boolean {
    return this.points.length === 1;
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length === 0) return;

    ctx.beginPath();
    this.points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point[0], point[1]);
      } else {
        ctx.lineTo(point[0], point[1]);
      }
    });

    if (this.isSinglePoint()) {
      // Draw a point
      ctx.arc(this.points[0][0], this.points[0][1], 1, 0, Math.PI * 2);
    }

    ctx.stroke();
  }
}

export type Drawing = {
  canvas: HTMLCanvasElement;
  lines: Array<Line>;
  redoStack: Array<Line>;
  currentLine: Line;
  drawingChangedEvent: CustomEvent<unknown>;
  isDrawing: boolean;
  context: CanvasRenderingContext2D | null;

  startDrawing(event: MouseEvent): void;
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
    currentLine: new Line(),
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
        this.currentLine.drag(point); // Use the Line's addPoint method
        this.canvas.dispatchEvent(this.drawingChangedEvent);
      }
    },

    startDrawing: function (event: MouseEvent) {
      this.isDrawing = true;
      this.addPoint(event);
    },

    stopDrawing: function () {
      this.isDrawing = false;
      if (this.currentLine || this.currentLine.isSinglePoint()) {
        this.lines.push(this.currentLine);
      }
      this.currentLine = new Line(); // Reset current line
      this.redoStack = []; // Clear redoStack once a new line is added
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

      this.lines.forEach((line) => {
        line.display(this.context);
      });

      this.currentLine.display(this.context);
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
