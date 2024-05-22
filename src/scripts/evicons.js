

const NUMBER_OF_SEGMENTS = 3;
const TIME_INCREMENT = 0.1;

function seedColors(input) {
    const md5Hash = CryptoJS.MD5(input).toString();
    console.log(md5Hash);
    let primaryColor = [parseInt(md5Hash.substring(0, 2), 16), parseInt(md5Hash.substring(2, 4), 16), parseInt(md5Hash.substring(4, 6), 16)];
    let secondaryColor = [parseInt(md5Hash.substring(6, 8), 16), parseInt(md5Hash.substring(8, 10), 16), parseInt(md5Hash.substring(10, 12), 16)];
    return { primaryColor, secondaryColor };
}

// Set pixel data (RGBA)
function setPixel(i, x, y, r, g, b) {
    const index = (y * i.width + x) * 4;
    i.data[index] = r;     // Red
    i.data[index + 1] = g; // Green
    i.data[index + 2] = b; // Blue
    i.data[index + 3] = 255; // Alpha
}

function drawGrid(imageData) {
    for (let y = 0; y <= canvasPxHeight; y++) {
        for (let x = 0; x <= canvasPxWidth; x++) {
            if (x % gridSegmentPxWidth === 0) {
                setPixel(imageData, x, y, 175, 255, 255, true);
            }
            if (y % gridSegmentPxHeight === 0) {
                setPixel(imageData, x, y, 175, 255, 255, true);
            }
        }
    }
}

function getRandomDirection() {
    return Math.random() > 0.5 ? 1 : -1;
}

function buildGradientVectors(seed, gridSegmentPxWidth, gridSegmentPxHeight) {
    let gradientVectors = [];
    const md5Hash = CryptoJS.MD5(seed).toString();

    let seedIncrement = 0;
    for (let y = 0; y <= NUMBER_OF_SEGMENTS; y++) {
        for (let x = 0; x <= NUMBER_OF_SEGMENTS; x++) {
            let originX = x * gridSegmentPxWidth;
            let originY = y * gridSegmentPxHeight;
            // let directionX = originX + (Math.random() * 100 - 50);
            // let directionY = originY + (Math.random() * 100 - 50);
            let nextSeedX = parseInt(md5Hash.substring(seedIncrement, seedIncrement + 2), 16) * getRandomDirection();
            let nextSeedY = parseInt(md5Hash.substring(seedIncrement + 2, seedIncrement + 4), 16) * getRandomDirection();
            let directionX = originX + nextSeedX;
            let directionY = originY + nextSeedY;
            // let directionX = originX + (parseInt(md5Hash.substring(seedIncrement, seedIncrement + 2), 16)) * getRandomDirection();
            // let directionY = originX + (parseInt(md5Hash.substring(seedIncrement + 2, seedIncrement + 6), 16)) * getRandomDirection();
            // console.log(originX + ' ' + originY);
            // console.log(directionX + ' ' + directionY);

            // Calculate the direction vector
            let dirX = directionX - originX;
            let dirY = directionY - originY;

            // Normalize the direction vector
            let length = Math.sqrt(dirX * dirX + dirY * dirY);
            dirX /= length;
            dirY /= length;

            gradientVectors[`${x}:${y}`] = {
                originX,
                originY,
                endX: originX + dirX,
                endY: originY + dirY
            };
        }
    }

    return gradientVectors;
}

function perlinAtPosition(x, y, imageData, gradientVectors, colors, canvasPxWidth, canvasPxHeight, gridSegmentPxWidth, gridSegmentPxHeight) {
// Find grid segment
var gridSegmentX = Math.floor(x / gridSegmentPxWidth);
var gridSegmentY = Math.floor(y / gridSegmentPxHeight);

// Find gradient vectors
let gradientVectorsForPosition = [
    gradientVectors[`${gridSegmentX}:${gridSegmentY}`],
    gradientVectors[`${gridSegmentX + 1}:${gridSegmentY}`],
    gradientVectors[`${gridSegmentX}:${gridSegmentY + 1}`],
    gradientVectors[`${gridSegmentX + 1}:${gridSegmentY + 1}`],
];

// Calculate offset vector for each corner
let topLeftPosX = gridSegmentX * gridSegmentPxWidth;
let topLeftPosY = gridSegmentY * gridSegmentPxHeight;
let topRightPosX = topLeftPosX + gridSegmentPxWidth;
let topRightPosY = topLeftPosY;
let bottomLeftPosX = topLeftPosX;
let bottomLeftPosY = topLeftPosY + gridSegmentPxHeight;
let bottomRightPosX = topLeftPosX + gridSegmentPxWidth;
let bottomRightPosY = topLeftPosY + gridSegmentPxHeight;

var offsetVectors = [
    { vecX: (x - topLeftPosX) / gridSegmentPxWidth, vecY: (y - topLeftPosY) / gridSegmentPxHeight },
    { vecX: (x - topRightPosX) / gridSegmentPxWidth, vecY: (y - topRightPosY) / gridSegmentPxHeight },
    { vecX: (x - bottomLeftPosX) / gridSegmentPxWidth, vecY: (y - bottomLeftPosY) / gridSegmentPxHeight },
    { vecX: (x - bottomRightPosX) / gridSegmentPxWidth, vecY: (y - bottomRightPosY) / gridSegmentPxHeight },
];

// Dot product each offset with its relative gradient
let dotProducts = [];
for (var i = 0; i < offsetVectors.length; i++) {
    let gradient = gradientVectorsForPosition[i];
    let magnitude = Math.sqrt(Math.pow(gradient.endX - gradient.originX, 2) + Math.pow(gradient.endY - gradient.originY, 2));
    let normalizedGradient = {
        x: (gradient.endX - gradient.originX) / magnitude,
        y: (gradient.endY - gradient.originY) / magnitude
    };

    let dotProduct = offsetVectors[i].vecX * normalizedGradient.x + offsetVectors[i].vecY * normalizedGradient.y;
    dotProducts.push(dotProduct);
}

// Relative positions
var relativeX = (x - topLeftPosX) / gridSegmentPxWidth;
var relativeY = (y - topLeftPosY) / gridSegmentPxHeight;

// Interpolate x
var x1 = interpolateDotProducts(dotProducts[0], dotProducts[1], relativeX);
var x2 = interpolateDotProducts(dotProducts[2], dotProducts[3], relativeX);

// Interpolate y using the results of x interpolation
var value = interpolateDotProducts(x1, x2, relativeY);

// Ensure the final value is within the range [-1, 1]
let grayscaledValue = (value + 0.5) / 0.5;
let color = interpolateColor(colors.primaryColor, colors.secondaryColor, grayscaledValue);
setPixel(imageData, x, y, color[0], color[1], color[2], true);
}

// Smoothstep function for interpolation
function smoothstep(t) {
return t * t * t * (t * (t * 6 - 15) + 10);
}


function interpolateDotProducts(a, b, t) {
return a + smoothstep(t) * (b - a);
}

function interpolateColor(color1, color2, factor) {
const result = color1.slice();
for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
}
return result;
}

function rotateGradientVectors(gradientVectors) {
for (let y = 0; y <= NUMBER_OF_SEGMENTS; y++) {
    for (let x = 0; x <= NUMBER_OF_SEGMENTS; x++) {
        let gradient = gradientVectors[`${x}:${y}`];
        let magnitude = Math.sqrt(Math.pow(gradient.endX - gradient.originX, 2) + Math.pow(gradient.endY - gradient.originY, 2));
        let normalizedGradient = {
            x: (gradient.endX - gradient.originX) / magnitude,
            y: (gradient.endY - gradient.originY) / magnitude
        };
        let angle = Math.atan2(normalizedGradient.y, normalizedGradient.x); // Get the current angle of the gradient
        let newAngle = angle + Math.sin(TIME_INCREMENT); // Increment the angle by t for rotation

        if (newAngle > 2 * Math.PI) {
            newAngle -= 2 * Math.PI; // Reset the angle to avoid large values
        }
        gradientVectors[`${x}:${y}`] = {
            originX: 0,
            originY: 0,
            endX: Math.cos(newAngle),
            endY: Math.sin(newAngle),
        };
    }
}
}

function drawPerlin(imageData, gradientVectors, colors, canvasPxWidth, canvasPxHeight, gridSegmentPxWidth, gridSegmentPxHeight) {
    for (var y = 0; y  < canvasPxHeight; y++) {
        for (var x = 0; x < canvasPxWidth; x++) {
            perlinAtPosition(x, y, imageData, gradientVectors, colors, canvasPxWidth, canvasPxHeight, gridSegmentPxWidth, gridSegmentPxHeight);
        }
    }
}

function runPerlinAnimation(seed, ctx, imageData, canvasPxWidth, canvasPxHeight, gridSegmentPxWidth, gridSegmentPxHeight) {
    // Shared variables
    var hash = CryptoJS.MD5(seed).toString();
    console.log('seed: ' + seed + ' hash: ' + hash);
    var colors = seedColors(seed);
    var gradientVectors = buildGradientVectors(seed, gridSegmentPxWidth, gridSegmentPxHeight);
    var intervalId = setInterval(() => {
        rotateGradientVectors(gradientVectors);
        drawPerlin(imageData, gradientVectors, colors, canvasPxWidth, canvasPxHeight, gridSegmentPxWidth, gridSegmentPxHeight);
        ctx.putImageData(imageData, 0, 0);
    }, 100);

    return [intervalId, hash, colors, gradientVectors];
}

function renderEvicon(seed) {
    var canvas = document.querySelector('canvas.evicon');
    let canvasPxWidth = canvas.width;
    let canvasPxHeight = canvas.height;
    let gridSegmentPxWidth = canvasPxWidth / NUMBER_OF_SEGMENTS;
    let gridSegmentPxHeight = canvasPxHeight / NUMBER_OF_SEGMENTS;
    var context = canvas.getContext('2d');
    let imageData= context?.createImageData(canvas.width, canvas.height);
    return runPerlinAnimation(seed, context, imageData, canvasPxWidth, canvasPxHeight, gridSegmentPxWidth, gridSegmentPxHeight);
}

function stopRenderingEvicon(intervalId) {
    clearInterval(intervalId);
}

function renderAllEviconsOnPage() {
    var canvases = document.querySelectorAll('canvas.evicon');
    var contexts = [];
    var imageDatas = [];
    for (var i = 0; i < canvases.length; i++) {
        console.log(canvases[i].width)
        var canvas = canvases[i];
        let canvasPxWidth = canvas.width;
        let canvasPxHeight = canvas.height;
        let gridSegmentPxWidth = canvasPxWidth / NUMBER_OF_SEGMENTS;
        let gridSegmentPxHeight = canvasPxHeight / NUMBER_OF_SEGMENTS;
        var ctx = canvas.getContext('2d');
        contexts[i] = ctx;
        imageDatas[i] = ctx?.createImageData(canvas.width, canvas.height);
        runPerlinAnimation(canvas.id, contexts[i], imageDatas[i], canvasPxWidth, canvasPxHeight, gridSegmentPxWidth, gridSegmentPxHeight);
    }
}
