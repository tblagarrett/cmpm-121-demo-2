class ToolPreview {
  private position: [number, number] | null = null;
  private thickness: number;

  constructor(thickness: number) {
    this.thickness = thickness;
  }

  updatePosition(position: [number, number]) {
    this.position = position;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.position) return;

    ctx.beginPath();
    ctx.arc(
      this.position[0],
      this.position[1],
      this.thickness / 2,
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = "grey";
    ctx.stroke();
  }
}

class Line {
  private points: Array<[number, number]>;
  private thickness: number;

  constructor(thickness: number = 2, points: Array<[number, number]> = []) {
    this.thickness = thickness;
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
    ctx.lineWidth = this.thickness;
    this.points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point[0], point[1]);
      } else {
        ctx.lineTo(point[0], point[1]);
      }
    });

    if (this.isSinglePoint()) {
      ctx.arc(
        this.points[0][0],
        this.points[0][1],
        this.thickness / 2,
        0,
        Math.PI * 2
      );
    }

    ctx.stroke();
  }
}

export type Drawing = {
  canvas: HTMLCanvasElement;
  currentLineThickness: number;
  lines: Array<Line>;
  redoStack: Array<Line>;
  currentLine: Line;
  drawingChangedEvent: CustomEvent<unknown>;
  isDrawing: boolean;
  toolPreview: ToolPreview | null;
  context: CanvasRenderingContext2D | null;

  startDrawing(event: MouseEvent): void;
  stopDrawing(): void;
  addPoint(event: MouseEvent): void;
  updateDrawing(): void;
  clearCanvas(): void;
  undo(): void;
  redo(): void;
  changeThickness(thickness: number): void;
  toolMoved(event: MouseEvent): void;
};

export function createDrawing(
  canvas: HTMLCanvasElement,
  startingThickness = 2
): Drawing {
  const drawingObject: Drawing = {
    canvas,
    currentLineThickness: startingThickness,
    lines: [],
    redoStack: [],
    currentLine: new Line(startingThickness),
    drawingChangedEvent: createDrawingChangedEvent(canvas),
    isDrawing: false,
    toolPreview: new ToolPreview(startingThickness),
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
      this.currentLine = new Line(this.currentLineThickness);
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

      if (this.toolPreview && !this.isDrawing) {
        this.toolPreview.draw(this.context);
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

    changeThickness: function (thickness: number) {
      this.currentLineThickness = thickness;
      this.currentLine.thickness = thickness;
      if (this.toolPreview) this.toolPreview.thickness = thickness;
    },

    toolMoved: function (event: MouseEvent) {
      if (!this.isDrawing && this.toolPreview) {
        const rect = this.canvas.getBoundingClientRect();
        this.toolPreview.updatePosition([
          event.clientX - rect.left,
          event.clientY - rect.top,
        ]);
        this.updateDrawing();
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
  drawingObject.changeThickness =
    drawingObject.changeThickness.bind(drawingObject);
  drawingObject.toolMoved = drawingObject.toolMoved.bind(drawingObject);

  canvas.addEventListener("drawing-changed", drawingObject.updateDrawing);
  canvas.addEventListener("mousemove", drawingObject.addPoint);
  canvas.addEventListener("mousemove", drawingObject.toolMoved);
  canvas.addEventListener("mousedown", drawingObject.startDrawing);
  canvas.addEventListener("mouseup", drawingObject.stopDrawing);
  canvas.addEventListener("mouseleave", drawingObject.stopDrawing);

  return drawingObject;
}

function createDrawingChangedEvent(
  canvas: HTMLCanvasElement
): CustomEvent<unknown> {
  return new CustomEvent("drawing-changed");
}
