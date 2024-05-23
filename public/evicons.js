

const NUMBER_OF_SEGMENTS = 3;
const TIME_INCREMENT = 0.01;

function seedColors(input) {
    const md5Hash = CryptoJS.MD5(input).toString();
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

function getFibonacciSequence() {
    let fibonacciSequence = [];
    let n1 = 1, n2 = 2; // Offset Fibonacci so we always get different numbers
    let numberOfSequenceItems = (NUMBER_OF_SEGMENTS + 1) * (NUMBER_OF_SEGMENTS + 1) * 2;
    for (let i = 0; i < numberOfSequenceItems; i++) {
        fibonacciSequence.push(n1);
        let nextTerm = n1 + n2;
        n1 = n2;
        n2 = nextTerm;
    }
    return fibonacciSequence;
}

function getRandomDirectionByHash(hash, index) {
    while (index > hash.length) index -= hash.length;
    return parseInt(hash[index], 16) < 8 ? -1 : 1;
}

function buildGradientVectors(seed, gridSegmentPxWidth, gridSegmentPxHeight) {
    let gradientVectors = [];
    const md5Hash = CryptoJS.MD5(seed).toString();
    const fibonacciSequence = getFibonacciSequence();

    let seedIncrement = 0;
    let directionIncrement = 0;
    for (let y = 0; y <= NUMBER_OF_SEGMENTS; y++) {
        for (let x = 0; x <= NUMBER_OF_SEGMENTS; x++) {
            let originX = x * gridSegmentPxWidth;
            let originY = y * gridSegmentPxHeight;
            let nextSeedX = parseInt(md5Hash.substring(seedIncrement, seedIncrement + 2), 16) * getRandomDirectionByHash(md5Hash, fibonacciSequence[directionIncrement++]);
            let nextSeedY = parseInt(md5Hash.substring(seedIncrement + 2, seedIncrement + 4), 16) * getRandomDirectionByHash(md5Hash, fibonacciSequence[directionIncrement++]);
            let directionX = originX + nextSeedX;
            let directionY = originY + nextSeedY;

            // Calculate the direction vector
            let dirX = directionX - originX;
            let dirY = directionY - originY;


            // Normalize the direction vector
            let length = Math.sqrt(dirX * dirX + dirY * dirY);
            dirX /= length;
            dirY /= length;

            let newVector = {
                i: dirX,
                j: dirY,
            };

            gradientVectors[`${x}:${y}`] = newVector;
            seedIncrement += 2;
            if (seedIncrement >= md5Hash.length - 4) {
                seedIncrement = 0;
            }
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
        { i: (x - topLeftPosX) / gridSegmentPxWidth, j: (y - topLeftPosY) / gridSegmentPxHeight },
        { i: (x - topRightPosX) / gridSegmentPxWidth, j: (y - topRightPosY) / gridSegmentPxHeight },
        { i: (x - bottomLeftPosX) / gridSegmentPxWidth, j: (y - bottomLeftPosY) / gridSegmentPxHeight },
        { i: (x - bottomRightPosX) / gridSegmentPxWidth, j: (y - bottomRightPosY) / gridSegmentPxHeight },
    ];

    // Dot product each offset with its relative gradient
    let dotProducts = [];
    for (var i = 0; i < offsetVectors.length; i++) {
        let gradient = gradientVectorsForPosition[i];

        let dotProduct = offsetVectors[i].i * gradient.i + offsetVectors[i].j * gradient.j;
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
            let angle = Math.atan2(gradient.j, gradient.i); // Get the current angle of the gradient
            let newAngle = angle + Math.sin(TIME_INCREMENT); // Increment the angle by t for rotation

            gradientVectors[`${x}:${y}`] = {
                i: Math.cos(newAngle),
                j: Math.sin(newAngle),
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

function runPerlinAnimation(seed, ctx, imageData, canvasPxWidth, canvasPxHeight, gridSegmentPxWidth, gridSegmentPxHeight, showGradientVectors) {
    // Shared variables
    var hash = CryptoJS.MD5(seed).toString();
    var colors = seedColors(seed);
    let gradientVectors = buildGradientVectors(seed, gridSegmentPxWidth, gridSegmentPxHeight);
    
    var intervalId = setInterval(() => {
        rotateGradientVectors(gradientVectors);
        drawPerlin(imageData, gradientVectors, colors, canvasPxWidth, canvasPxHeight, gridSegmentPxWidth, gridSegmentPxHeight);
        ctx.putImageData(imageData, 0, 0);
    
        if (showGradientVectors) {
            for (const [key, value] of Object.entries(gradientVectors)) {
                let pos = key.split(':');
                let originX = pos[0] * gridSegmentPxWidth;
                let originY = pos[1] * gridSegmentPxHeight;
            
                ctx.beginPath(); // Start a new path
                ctx.moveTo(originX, originY);
            
                let radius = canvasPxWidth / 5; // Length of the line
                let vectorLength = Math.sqrt(value.i * value.i + value.j * value.j);
                let normalizedI = value.i / vectorLength;
                let normalizedJ = value.j / vectorLength;
                let adjacent = radius * normalizedI;
                let opposite = radius * normalizedJ;
            
                let endX = originX + adjacent;
                let endY = originY + opposite;
            
                ctx.lineTo(endX, endY); // Draw the line to the new point
            
                ctx.strokeStyle = 'red'; // Set the line color to red
                ctx.lineWidth = 2; // Set the line width to 3 pixels
                ctx.stroke();
            
                // Draw arrowhead
                let arrowLength = 10;
                let arrowAngle = Math.PI / 6; // 30 degrees
            
                let angle = Math.atan2(opposite, adjacent);
                
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
        }
    }, 1);

    return [intervalId, hash, colors, gradientVectors];
}

function renderEvicon(seed, showGradientVectors) {
    var canvas = document.querySelector('canvas.evicon');
    let canvasPxWidth = canvas.width;
    let canvasPxHeight = canvas.height;
    let gridSegmentPxWidth = canvasPxWidth / NUMBER_OF_SEGMENTS;
    let gridSegmentPxHeight = canvasPxHeight / NUMBER_OF_SEGMENTS;
    var context = canvas.getContext('2d');
    let imageData= context?.createImageData(canvas.width, canvas.height);
    return runPerlinAnimation(seed, context, imageData, canvasPxWidth, canvasPxHeight, gridSegmentPxWidth, gridSegmentPxHeight, showGradientVectors);
}

function stopRenderingEvicon(intervalId) {
    clearInterval(intervalId);
}

function renderAllEviconsOnPage() {
    var canvases = document.querySelectorAll('canvas.evicon');
    var contexts = [];
    var imageDatas = [];
    for (var i = 0; i < canvases.length; i++) {
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
