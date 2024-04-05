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
  const maxLines = 5;
  const variance = 2;  // maxlinesに対するVariance
  const randomValue = maxLines + Math.floor(Math.random() * (2 * variance + 1)) - variance;
  const frameSizeX = 800;
  const frameSizeY = 600;
  const lineWidth = 3;
  const colors: number[][] = [
    [214, 63, 49],   // 赤
    [237, 182, 84], // 黄
    [8, 53, 112],   // 青
    [45, 43, 45], // 灰色
  ];

  let frameCounter = 0;
  let horizontalLines: Line[] = [];
  let verticalLines: Line[] = [];
  let rectangles: Rectangle[] = [];

  p.setup = () => {
    const canvas = p.createCanvas(frameSizeX, frameSizeY);
    canvas.parent('app');
  };

  p.draw = () => {
    p.background(240);
    frameCounter++;
  
    // タイミングが来たときに線、四角形を追加
    if (horizontalLines.length < randomValue && frameCounter % 90 === 30) {
      addHorizontalLine();
    }
    if (verticalLines.length < maxLines && frameCounter % 90 === 60) {
      addVerticalLine();
    }
    if (verticalLines.length >= 2 && horizontalLines.length < maxLines && frameCounter % 13 === 0) {
      addRectangle();
    }

    // 描画処理
    drawObjects();
  };
  
  function addHorizontalLine() {
    let y = p.random(frameSizeY);

    // 線を引く予定の領域に既に被っている四角形を抽出
    const adjacentRectangles = rectangles.filter(
      rectangle => Math.abs(rectangle.y - y) < rectangle.height / 2
    );

    if (adjacentRectangles.length > 0 && Math.random() < 0.9) {  // 線を引く予定の領域に既に被っている四角形があり、一定確率の条件を満たす場合
      const randomRectangle = adjacentRectangles[Math.floor(Math.random() * adjacentRectangles.length)];
      if (randomRectangle.x < frameSizeX / 2) {
        horizontalLines.push({
          x1: randomRectangle.x + 2,
          y1: y,
          x2: frameSizeX,
          y2: y,
        });
      } else {
        horizontalLines.push({
          x1: 0,
          y1: y,
          x2: randomRectangle.x - 2,
          y2: y,
        });
      }
    } else {  // 線を引く予定の領域にまだ四角形がないか、一定確率の条件を満たさない場合
      horizontalLines.push({
        x1: 0,
        y1: y,
        x2: frameSizeX,
        y2: y,
      });
    }
  }
  
  function addVerticalLine() {
    let x: number = 0;
    let isValidCoordinate = false;

    // 既に線が引かれている領域に一定程度近い範囲は新しく線を引く候補から除外
    while (!isValidCoordinate) {
      x = p.random(frameSizeX);
      isValidCoordinate = verticalLines.every(verticalLines => Math.abs(verticalLines.x1 - x) > 40);
    }

    // 線を引く予定の領域に既に被っている四角形を抽出
    const adjacentRectangles = rectangles.filter(
      rectangle => Math.abs(rectangle.x - x) <= rectangle.width / 2
    );

    if (adjacentRectangles.length > 0 && Math.random() < 0.9) {  // 線を引く予定の領域に既に被っている四角形があり、一定確率の条件を満たす場合
      const randomRectangle = adjacentRectangles[Math.floor(Math.random() * adjacentRectangles.length)];
      if (randomRectangle.y < frameSizeY / 2) {
        verticalLines.push({
          x1: x,
          y1: randomRectangle.y + 2,
          x2: x,
          y2: frameSizeY,
        });
      } else {
        verticalLines.push({
          x1: x,
          y1: 0,
          x2: x,
          y2: randomRectangle.y - 2,
        });
      }
    } else {  // 線を引く予定の領域にまだ四角形がないか、一定確率の条件を満たさない場合
      verticalLines.push({
        x1: x,
        y1: 0,
        x2: x,
        y2: frameSizeY,
      });
    }
  }
  
  function addRectangle() {
    // これまでに引かれた線によって囲まれる四角形の領域を仮置き
    const newRectangles: Rectangle[] = getRectangles(horizontalLines, verticalLines);
    // 隣接領域に四角形が見つからない領域のみをavailableRectanglesに渡す
    const availableRectangles = newRectangles.filter(newRectangle => {
      return !rectangles.some(rectangle => {
        return (
          (Math.abs(rectangle.x - newRectangle.x) <= (rectangle.width + newRectangle.width) / 2) ||
          (Math.abs(rectangle.y - newRectangle.y) <= (rectangle.height + newRectangle.height) / 2)
        );
      });
    });

    // 隣接しない四角形からランダムに1つ選び、描画する四角形 (rectangles) に追加
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

  // これまでに引かれた線によって囲まれる四角形の領域をすべて抽出
  function getRectangles(horizontalLines: Line[], verticalLines: Line[]): Rectangle[] {
    const transrectangles: Rectangle[] = [];
    const xCoords: number[] = [0, frameSizeX];
    const yCoords: number[] = [0, frameSizeY];

    for (const line of verticalLines) {
      xCoords.push(line.x1);
    }
  
    for (const line of horizontalLines) {
      yCoords.push(line.y1);
    }

    xCoords.sort((a, b) => a - b);
    yCoords.sort((a, b) => a - b);

    for (let i = 0; i < xCoords.length - 1; i++) {
      for (let j = 0; j < yCoords.length - 1; j++) {
        const x = xCoords[i] === 0 ? 0 : xCoords[i] + lineWidth / 2 + 1;
        const y = yCoords[j] === 0 ? 0 : yCoords[j] + lineWidth / 2 + 1;
        const width = xCoords[i + 1] === frameSizeX ? frameSizeX - x : xCoords[i + 1] - x - lineWidth;
        const height = yCoords[j + 1] === frameSizeY ? frameSizeY - y : yCoords[j + 1] - y - lineWidth;
        transrectangles.push({ x, y, width, height, color: [0, 0, 0] });
      }
    }

    return transrectangles;
  }
  
  function drawObjects() {
    for (const line of horizontalLines) {
      p.stroke(0);
      p.strokeWeight(lineWidth + 4);
      p.line(line.x1, line.y1, line.x2, line.y2);
    }

    for (const line of verticalLines) {
      p.stroke(0);
      p.strokeWeight(lineWidth + 4);
      p.line(line.x1, line.y1, line.x2, line.y2);
    }

    for (const rectangle of rectangles) {
      p.fill(rectangle.color);
      p.noStroke();
      p.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    }
  }
};

new p5(sketch);