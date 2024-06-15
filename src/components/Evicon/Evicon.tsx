import { useEffect, useRef } from 'preact/hooks';
import CryptoJS from 'crypto-js';
import "../../styles/evicons.css";

// Define constants and types
const NUMBER_OF_SEGMENTS = 3;
const TIME_INCREMENT = 0.01;

type Color = [number, number, number];

interface GradientVector {
  i: number;
  j: number;
}

// Define utility functions

const seedColors = (hash: string) => {
  const primaryColor: Color = [parseInt(hash.substring(0, 2), 16), parseInt(hash.substring(2, 4), 16), parseInt(hash.substring(4, 6), 16)];
  const secondaryColor: Color = [parseInt(hash.substring(6, 8), 16), parseInt(hash.substring(8, 10), 16), parseInt(hash.substring(10, 12), 16)];
  return { primaryColor, secondaryColor };
};

const setPixel = (i: ImageData, x: number, y: number, r: number, g: number, b: number) => {
  const index = (y * i.width + x) * 4;
  i.data[index] = r;     // Red
  i.data[index + 1] = g; // Green
  i.data[index + 2] = b; // Blue
  i.data[index + 3] = 255; // Alpha
};

const drawGrid = (imageData: ImageData, canvasPxWidth: number, canvasPxHeight: number, gridSegmentPxWidth: number, gridSegmentPxHeight: number) => {
  for (let y = 0; y < canvasPxHeight; y++) {
    for (let x = 0; x < canvasPxWidth; x++) {
      if (x === 0 || y === 0) continue;

      if (x % gridSegmentPxWidth === 0) {
        setPixel(imageData, x, y, 255, 0, 0);
        setPixel(imageData, x + 1, y, 255, 0, 0);
      }
      if (y % gridSegmentPxHeight === 0) {
        setPixel(imageData, x, y, 255, 0, 0);
        setPixel(imageData, x, y + 1, 255, 0, 0);
      }
    }
  }
};

const getFibonacciSequence = () => {
  const fibonacciSequence: number[] = [];
  let n1 = 1, n2 = 2; // Offset Fibonacci so we always get different numbers
  const numberOfSequenceItems = (NUMBER_OF_SEGMENTS + 1) * (NUMBER_OF_SEGMENTS + 1) * 2;
  for (let i = 0; i < numberOfSequenceItems; i++) {
    fibonacciSequence.push(n1);
    const nextTerm = n1 + n2;
    n1 = n2;
    n2 = nextTerm;
  }
  return fibonacciSequence;
};

const getRandomDirectionByHash = (hash: string, index: number) => {
  while (index > hash.length) index -= hash.length;
  return parseInt(hash[index], 16) < 8 ? -1 : 1;
};

const buildGradientVectors = (hash: string, gridSegmentPxWidth: number, gridSegmentPxHeight: number) => {
  const gradientVectors: { [key: string]: GradientVector } = {};
  const fibonacciSequence = getFibonacciSequence();

  let seedIncrement = 0;
  let directionIncrement = 0;
  for (let y = 0; y <= NUMBER_OF_SEGMENTS; y++) {
    for (let x = 0; x <= NUMBER_OF_SEGMENTS; x++) {
      const originX = x * gridSegmentPxWidth;
      const originY = y * gridSegmentPxHeight;
      const nextSeedX = parseInt(hash.substring(seedIncrement, seedIncrement + 2), 16) * getRandomDirectionByHash(hash, fibonacciSequence[directionIncrement++]);
      const nextSeedY = parseInt(hash.substring(seedIncrement + 2, seedIncrement + 4), 16) * getRandomDirectionByHash(hash, fibonacciSequence[directionIncrement++]);
      const directionX = originX + nextSeedX;
      const directionY = originY + nextSeedY;

      // Calculate the direction vector
      let dirX = directionX - originX;
      let dirY = directionY - originY;

      // Normalize the direction vector
      const length = Math.sqrt(dirX * dirX + dirY * dirY);
      dirX /= length;
      dirY /= length;

      const newVector: GradientVector = {
        i: dirX,
        j: dirY,
      };

      gradientVectors[`${x}:${y}`] = newVector;
      seedIncrement += 2;
      if (seedIncrement >= hash.length - 2) {
        seedIncrement = 0;
      }
    }
  }

  return gradientVectors;
};

const drawPerlinAtPosition = (x: number, y: number, imageData: ImageData, gradientVectors: { [key: string]: GradientVector }, colors: { primaryColor: Color, secondaryColor: Color }, gridSegmentPxWidth: number, gridSegmentPxHeight: number) => {
  // Find grid segment
  const gridSegmentX = Math.floor(x / gridSegmentPxWidth);
  const gridSegmentY = Math.floor(y / gridSegmentPxHeight);

  // Find gradient vectors
  const gradientVectorsForPosition = [
    gradientVectors[`${gridSegmentX}:${gridSegmentY}`],
    gradientVectors[`${gridSegmentX + 1}:${gridSegmentY}`],
    gradientVectors[`${gridSegmentX}:${gridSegmentY + 1}`],
    gradientVectors[`${gridSegmentX + 1}:${gridSegmentY + 1}`],
  ];

  // Calculate offset vector for each corner
  const topLeftPosX = gridSegmentX * gridSegmentPxWidth;
  const topLeftPosY = gridSegmentY * gridSegmentPxHeight;
  const topRightPosX = topLeftPosX + gridSegmentPxWidth;
  const topRightPosY = topLeftPosY;
  const bottomLeftPosX = topLeftPosX;
  const bottomLeftPosY = topLeftPosY + gridSegmentPxHeight;
  const bottomRightPosX = topLeftPosX + gridSegmentPxWidth;
  const bottomRightPosY = topLeftPosY + gridSegmentPxHeight;

  const offsetVectors = [
    { i: (x - topLeftPosX) / gridSegmentPxWidth, j: (y - topLeftPosY) / gridSegmentPxHeight },
    { i: (x - topRightPosX) / gridSegmentPxWidth, j: (y - topRightPosY) / gridSegmentPxHeight },
    { i: (x - bottomLeftPosX) / gridSegmentPxWidth, j: (y - bottomLeftPosY) / gridSegmentPxHeight },
    { i: (x - bottomRightPosX) / gridSegmentPxWidth, j: (y - bottomRightPosY) / gridSegmentPxHeight },
  ];

  // Dot product each offset with its relative gradient
  const dotProducts = [];
  for (let i = 0; i < offsetVectors.length; i++) {
    const gradient = gradientVectorsForPosition[i];
    const dotProduct = offsetVectors[i].i * gradient.i + offsetVectors[i].j * gradient.j;
    dotProducts.push(dotProduct);
  }

  // Relative positions
  const relativeX = (x - topLeftPosX) / gridSegmentPxWidth;
  const relativeY = (y - topLeftPosY) / gridSegmentPxHeight;

  // Interpolate x
  const x1 = interpolateDotProducts(dotProducts[0], dotProducts[1], relativeX);
  const x2 = interpolateDotProducts(dotProducts[2], dotProducts[3], relativeX);

  // Interpolate y using the results of x interpolation
  const value = interpolateDotProducts(x1, x2, relativeY);

  // Ensure the final value is within the range [-1, 1]
  const grayscaledValue = (value + 0.5) / 0.5;
  const color = interpolateColor(colors.primaryColor, colors.secondaryColor, grayscaledValue);
  setPixel(imageData, x, y, color[0], color[1], color[2]);
};

const interpolateDotProducts = (a: number, b: number, t: number) => {
  return a + smoothstep(t) * (b - a);
};

const smoothstep = (t: number) => {
  return t * t * t * (t * (t * 6 - 15) + 10);
};

const interpolateColor = (color1: Color, color2: Color, perlinFactor: number): Color => {
  const result = color1.slice() as Color;
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + perlinFactor * (color2[i] - color1[i]));
  }
  return result;
};

const rotateGradientVectors = (gradientVectors: { [key: string]: GradientVector }) => {
  for (let y = 0; y <= NUMBER_OF_SEGMENTS; y++) {
    for (let x = 0; x <= NUMBER_OF_SEGMENTS; x++) {
      const gradient = gradientVectors[`${x}:${y}`];
      const angle = Math.atan2(gradient.j, gradient.i); // Get the current angle of the gradient
      const newAngle = angle + Math.sin(TIME_INCREMENT); // Increment the angle by t for rotation

      gradientVectors[`${x}:${y}`] = {
        i: Math.cos(newAngle),
        j: Math.sin(newAngle),
      };
    }
  }
};

const drawPerlin = (imageData: ImageData, gradientVectors: { [key: string]: GradientVector }, colors: { primaryColor: Color, secondaryColor: Color }, canvasPxWidth: number, canvasPxHeight: number, gridSegmentPxWidth: number, gridSegmentPxHeight: number) => {
  for (let y = 0; y < canvasPxHeight; y++) {
    for (let x = 0; x < canvasPxWidth; x++) {
      drawPerlinAtPosition(x, y, imageData, gradientVectors, colors, gridSegmentPxWidth, gridSegmentPxHeight);
    }
  }
};

const runPerlinAnimation = (
  hash: string,
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  canvasPxWidth: number,
  canvasPxHeight: number,
  gridSegmentPxWidth: number,
  gridSegmentPxHeight: number,
  displayGradientVectors?: boolean,
  displayGrid?: boolean
) => {
  // Shared variables
  const colors = seedColors(hash);
  const gradientVectors = buildGradientVectors(hash, gridSegmentPxWidth, gridSegmentPxHeight);

  const intervalId = setInterval(() => {
    rotateGradientVectors(gradientVectors);
    drawPerlin(imageData, gradientVectors, colors, canvasPxWidth, canvasPxHeight, gridSegmentPxWidth, gridSegmentPxHeight);

    if (displayGrid) {
      drawGrid(imageData, canvasPxWidth, canvasPxHeight, gridSegmentPxWidth, gridSegmentPxHeight);
    }

    ctx.putImageData(imageData, 0, 0);

    if (displayGradientVectors) {
      renderGradientVectors(gradientVectors, gridSegmentPxWidth, gridSegmentPxHeight, ctx, canvasPxWidth / 5);
    }
  }, 1);

  return intervalId;
};

const renderGradientVectors = (
  gradientVectors: { [key: string]: GradientVector },
  gridSegmentPxWidth: number,
  gridSegmentPxHeight: number,
  ctx: CanvasRenderingContext2D,
  radius: number
) => {
  for (const [key, value] of Object.entries(gradientVectors)) {
    const pos = key.split(':');
    const originX = parseInt(pos[0]) * gridSegmentPxWidth;
    const originY = parseInt(pos[1]) * gridSegmentPxHeight;

    ctx.beginPath(); // Start a new path
    ctx.moveTo(originX, originY);

    const vectorLength = Math.sqrt(value.i * value.i + value.j * value.j);
    const normalizedI = value.i / vectorLength;
    const normalizedJ = value.j / vectorLength;
    const adjacent = radius * normalizedI;
    const opposite = radius * normalizedJ;

    const endX = originX + adjacent;
    const endY = originY + opposite;

    ctx.lineTo(endX, endY); // Draw the line to the new point

    ctx.strokeStyle = 'red'; // Set the line color to red
    ctx.lineWidth = 2; // Set the line width to 3 pixels
    ctx.stroke();

    // Draw arrowhead
    const arrowLength = 10;
    const arrowAngle = Math.PI / 6; // 30 degrees

    const angle = Math.atan2(opposite, adjacent);

    // Left arrow line
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle - arrowAngle),
      endY - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.stroke();

    // Right arrow line
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle + arrowAngle),
      endY - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.stroke();
  }
};

interface EviconProps {
  seed: string;
  widthPx: number;
  heightPx: number;
  borderRadiusPx?: number;
  displayEviconDemoPageLink?: boolean;
  displayGradientVectors?: boolean;
  displayGrid?: boolean;
}

const Evicon: preact.FunctionComponent<EviconProps> = ({ seed, widthPx, heightPx, borderRadiusPx, displayEviconDemoPageLink, displayGradientVectors, displayGrid }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const canvasPxWidth = canvas.width;
        const canvasPxHeight = canvas.height;
        const gridSegmentPxWidth = canvasPxWidth / NUMBER_OF_SEGMENTS;
        const gridSegmentPxHeight = canvasPxHeight / NUMBER_OF_SEGMENTS;
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const hash = CryptoJS.MD5(seed).toString();

        const intervalId = runPerlinAnimation(
          hash,
          ctx,
          imageData,
          canvasPxWidth,
          canvasPxHeight,
          gridSegmentPxWidth,
          gridSegmentPxHeight,
          displayGradientVectors,
          displayGrid
        );

        return () => clearInterval(intervalId);
      }
    }
  }, [seed, displayGradientVectors, displayGrid]);

  let canvas = <canvas ref={canvasRef} className="evicon" width={widthPx} height={heightPx} style={`border-radius: ${borderRadiusPx ?? 0}px`}/>;
  return displayEviconDemoPageLink ? (
    <a style={`height: ${heightPx}px`} href="/evicons" title="What is this smudge?">
      {canvas}
    </a>
  ) : canvas;
}

export default Evicon;
