import './style.css';
import p5 from 'p5';

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number[];
}

const sketch = (p: p5) => {
  const maxLines = 8;
  const frameSizeX = 800;
  const frameSizeY = 600;
  const colors: number[][] = [
    [214, 63, 49],   // 赤
    [237, 182, 84], // 黄
    [8, 53, 112],   // 青
    [45, 43, 45], // 灰色
  ];

  let frameCounter = 0;
  let lines: Line[] = [];
  let rectangles: Rectangle[] = [];

  p.setup = () => {
    const canvas = p.createCanvas(frameSizeX, frameSizeY);
    canvas.parent('app');
  };

  p.draw = () => {
    p.background(240);
    frameCounter++;

    if (lines.length < maxLines && frameCounter % 90 === 30) {
      let y: number = 0;
      let isValidCoordinate = false;

      while (!isValidCoordinate) {
        y = p.random(frameSizeY);
        isValidCoordinate = lines.every(line => Math.abs(line.y1 - y) > 20);
      }

      const adjacentRectangles = rectangles.filter(
        rectangle => Math.abs(rectangle.y - y) <= rectangle.height / 2
      );

      if (adjacentRectangles.length > 0 && Math.random() < 0.9) {
        const randomRectangle = adjacentRectangles[Math.floor(Math.random() * adjacentRectangles.length)];
        lines.push({
          x1: randomRectangle.x,
          y1: y,
          x2: randomRectangle.x + randomRectangle.width,
          y2: y,
        });
      } else {
        lines.push({
          x1: 0,
          y1: y,
          x2: frameSizeX,
          y2: y,
        });
      }
    }

    if (lines.length < maxLines && frameCounter % 90 === 60) {
      let x: number = 0;
      let isValidCoordinate = false;

      while (!isValidCoordinate) {
        x = p.random(frameSizeX);
        isValidCoordinate = lines.every(line => Math.abs(line.x1 - x) > 20);
      }

      const adjacentRectangles = rectangles.filter(
        rectangle => Math.abs(rectangle.x - x) <= rectangle.width / 2
      );

      if (adjacentRectangles.length > 0 && Math.random() < 0.5) {
        const randomRectangle = adjacentRectangles[Math.floor(Math.random() * adjacentRectangles.length)];
        lines.push({
          x1: x,
          y1: randomRectangle.y,
          x2: x,
          y2: randomRectangle.y + randomRectangle.height,
        });
      } else {
        lines.push({
          x1: x,
          y1: 0,
          x2: x,
          y2: frameSizeY,
        });
      }
    }

    if (lines.length >= 4 && lines.length < maxLines && frameCounter % 25 === 0) {
      const newRectangles: Rectangle[] = getRectangles(lines);
      const availableRectangles = newRectangles.filter(newRectangle => {
        return !rectangles.some(rectangle => {
          return (
            (Math.abs(rectangle.x - newRectangle.x) <= (rectangle.width + newRectangle.width) / 2) ||
            (Math.abs(rectangle.y - newRectangle.y) <= (rectangle.height + newRectangle.height) / 2)
          );
        });
      });

      if (availableRectangles.length > 0) {
        const randomIndex = p.floor(p.random(availableRectangles.length));
        const selectedRectangle = availableRectangles[randomIndex];
        const randomColorIndex = p.floor(p.random(colors.length));
        const selectedColor = colors[randomColorIndex];
        rectangles.push({
          ...selectedRectangle,
          color: selectedColor,
        });
      }
    }

    for (const line of lines) {
      p.stroke(0);
      p.strokeWeight(7);
      p.line(line.x1, line.y1, line.x2, line.y2);
    }

    for (const rectangle of rectangles) {
      p.fill(rectangle.color);
      p.noStroke();
      p.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    }
  };

  function getRectangles(lines: Line[]): Rectangle[] {
    const lineWidth = 3;
    const rectangles: Rectangle[] = [];
    const xCoords: number[] = [0, frameSizeX];
    const yCoords: number[] = [0, frameSizeY];

    for (const line of lines) {
      if (line.x1 === line.x2) {
        xCoords.push(line.x1);
      } else {
        yCoords.push(line.y1);
      }
    }

    xCoords.sort((a, b) => a - b);
    yCoords.sort((a, b) => a - b);

    for (let i = 0; i < xCoords.length - 1; i++) {
      for (let j = 0; j < yCoords.length - 1; j++) {
        const x = xCoords[i] === 0 ? 0 : xCoords[i] + lineWidth / 2 + 1;
        const y = yCoords[j] === 0 ? 0 : yCoords[j] + lineWidth / 2 + 1;
        const width = xCoords[i + 1] === frameSizeX ? frameSizeX - x : xCoords[i + 1] - x - lineWidth;
        const height = yCoords[j + 1] === frameSizeY ? frameSizeY - y : yCoords[j + 1] - y - lineWidth;
        rectangles.push({ x, y, width, height, color: [0, 0, 0] });
      }
    }

    return rectangles;
  }
};

new p5(sketch);