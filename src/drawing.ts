interface Command {
  execute(): void;
}

class ToolPreview {
  private position: [number, number] | null = null;
  public character: string;
  private fontSize: number;

  constructor(thickness: number, character: string = "•") {
    this.fontSize = thickness * 5; // Scale font size with thickness
    this.character = character;
  }

  updatePosition(position: [number, number]) {
    this.position = position;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.position) return;

    ctx.font = `${this.fontSize}px Arial`; // You can customize the font
    ctx.fillStyle = "grey"; // Color of the character
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.character, this.position[0], this.position[1]);
  }

  updateFontSize(thickness: number) {
    this.fontSize = thickness * 5; // Update the font size when thickness changes
  }
}

class Line {
  public points: Array<[number, number]>;
  private thickness: number;
  public isSticker: boolean;
  private character: string;

  constructor(
    thickness: number = 5,
    isSticker: boolean = false,
    character: string = "Z",
    points: Array<[number, number]> = []
  ) {
    this.thickness = thickness;
    this.points = points;
    this.isSticker = isSticker;
    this.character = character;
  }

  drag(point: [number, number]) {
    this.points.push(point);
  }

  isSinglePoint(): boolean {
    return this.points.length === 1;
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length === 0) return;

    if (this.isSticker) {
      ctx.font = `${this.thickness * 5}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.character, this.points[0][0], this.points[0][1]);
      return;
    }

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
        this.thickness / 4,
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
  isPlacingSticker: boolean;
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
  exportAsPNG();
};

export function createDrawing(
  canvas: HTMLCanvasElement,
  startingThickness = 5
): Drawing {
  const drawingObject: Drawing = {
    canvas,
    currentLineThickness: startingThickness,
    lines: [],
    redoStack: [],
    currentLine: new Line(startingThickness),
    drawingChangedEvent: createDrawingChangedEvent(canvas),
    isDrawing: false,
    isPlacingSticker: false,
    toolPreview: new ToolPreview(startingThickness),
    context: canvas.getContext("2d"),

    addPoint: function (event: MouseEvent) {
      if (!this.isDrawing) return;

      const rect = this.canvas.getBoundingClientRect();
      const point: [number, number] = [
        event.clientX - rect.left,
        event.clientY - rect.top,
      ];

      if (!this.isPlacingSticker) {
        this.currentLine.drag(point);
      } else {
        // is the current line the same sticker? if so change its location to point
        // if not, push the current line & make a new one that is a sticker whose character is ToolPreview's character
        if (
          this.lines.length > 0 &&
          this.lines[this.lines.length - 1].thickness ===
            this.currentLineThickness &&
          this.lines[this.lines.length - 1].isSticker &&
          this.lines[this.lines.length - 1].character ===
            this.toolPreview.character
        ) {
          this.lines[this.lines.length - 1].points = [point];
        } else {
          this.lines.push(
            new Line(
              this.currentLineThickness,
              true,
              this.toolPreview.character,
              [point]
            )
          );
        }
      }

      this.canvas.dispatchEvent(this.drawingChangedEvent);
    },

    startDrawing: function (event: MouseEvent) {
      this.isDrawing = true;
      this.addPoint(event);
    },

    stopDrawing: function () {
      this.isDrawing = false;
      if (this.isPlacingSticker) return;

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
      this.context.lineWidth = 5;
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
      if (this.toolPreview) {
        this.toolPreview.thickness = thickness;
        this.toolPreview.updateFontSize(thickness); // Update when thickness changes
      }
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

    exportAsPNG: function () {
      // Create a new canvas 4x the size of the original
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = 1024;
      exportCanvas.height = 1024;
      const exportContext = exportCanvas.getContext("2d");
      if (!exportContext) return;

      // Scale to match the new larger canvas size
      exportContext.scale(4, 4);

      // Redraw all lines to the new context
      this.lines.forEach((line) => {
        line.display(exportContext);
      });

      // Convert the canvas to a data URL and download
      exportCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "drawing.png";
          a.click();
          URL.revokeObjectURL(url); // Clean up the URL object
        }
      });
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
  drawingObject.exportAsPNG = drawingObject.exportAsPNG.bind(drawingObject);

  canvas.addEventListener("drawing-changed", drawingObject.updateDrawing);
  canvas.addEventListener("mousemove", drawingObject.addPoint);
  canvas.addEventListener("mousemove", drawingObject.toolMoved);
  canvas.addEventListener("mousedown", drawingObject.startDrawing);
  canvas.addEventListener("mouseup", drawingObject.stopDrawing);
  canvas.addEventListener("mouseleave", () => {
    drawingObject.isDrawing = false;
    if (drawingObject.currentLine.points.length > 0)
      drawingObject.lines.push(drawingObject.currentLine);
    drawingObject.currentLine = new Line(drawingObject.currentLineThickness);
  });

  return drawingObject;
}

function createDrawingChangedEvent(
  canvas: HTMLCanvasElement
): CustomEvent<unknown> {
  return new CustomEvent("drawing-changed");
}
