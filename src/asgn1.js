// asgn1.js file
// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = u_Size; // Use the uniform for point size
    }
`;

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }
`;

// Global variables for color and size
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // Default to white
let g_selectedSize = 20;                    // Default point size
let g_selectedSegments = 30;                // Default to 30 segments
let currentMode = 'point';                  // Default to drawing points
let image = null;  // Global variable to store the Batman symbol data
let dynamicColorEnabled = false;
let canvas, gl, a_Position, u_FragColor, u_Size;
let shapesList = []; // List to store all shapes

function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.error('Failed to get the rendering context for WebGL');
        return false;
    }
    return connectVariablesToGLSL();
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.error('Failed to initialize shaders.');
        return false;
    }
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (a_Position < 0 || !u_FragColor || !u_Size) {
        console.error('Failed to get the storage location of uniforms');
        return false;
    }
    return true;
}

function handleCanvasClick(event) {
    if (event.buttons === 1) {  // Only draw if the left mouse button is pressed
        drawShape(event);
    }
}

function handleMouseMove(event) {
    if (event.buttons === 1) {  // Only draw if the left mouse button is pressed
        drawShape(event);
    }
}

function drawShape(event) {
    let [x, y] = convertCoordinatesEventToGL(event);
    
    if (dynamicColorEnabled) {
        let distance = Math.sqrt(x * x + y * y);
        let colorIntensity = Math.max(0, 1 - distance);
        g_selectedColor = [colorIntensity, 0.5, 1.0 - colorIntensity, 1.0];
    }

    switch (currentMode) {
        case 'point':
            shapesList.push(new Point([x, y], [...g_selectedColor], g_selectedSize));
            break;
        case 'triangle':
            let scaleFactor = g_selectedSize / 20;
            let offset = 0.05 * scaleFactor;
            let vertices = [x, y, x + offset, y + offset, x - offset, y + offset];
            shapesList.push(new Triangle(vertices, [...g_selectedColor]));
            break;
        case 'circle':
            let radius = g_selectedSize / 400;
            shapesList.push(new Circle([x, y], radius, [...g_selectedColor], g_selectedSegments));
            break;
    }
    renderAllShapes();
}


function drawImage(gl, a_Position, u_FragColor) {
    const vertices = new Float32Array([
        -0.05, 0.1,  0.05, 0.1,  0.0, 0.5,
        -0.05, 0.1, -0.1, 0.3,  0.0, 0.5,
         0.05, 0.1,  0.1, 0.3,  0.0, 0.5,

        -0.2, -0.1, -0.6, 0.0, -0.3, 0.2,
        -0.6, 0.0, -0.7, -0.3, -0.3, 0.2,
        -0.3, -0.4, -0.4, -0.2, -0.1, -0.3,

         0.2, -0.1,  0.6, 0.0,  0.3, 0.2,
         0.6, 0.0,  0.7, -0.3,  0.3, 0.2,
         0.3, -0.4,  0.4, -0.2,  0.1, -0.3,

        -0.05, 0.5, -0.1, 0.6,  0.0, 0.65,
         0.05, 0.5,  0.1, 0.6,  0.0, 0.65
    ]);

    image = { vertices: vertices, color: [1.0, 1.0, 0.0, 1.0] }; // Color: Yellow

    renderAllShapes();
}

function addActionsForHtmlUI() {
    document.getElementById('red').onclick = () => g_selectedColor = [1.0, 0.0, 0.0, 1.0];
    document.getElementById('green').onclick = () => g_selectedColor = [0.0, 1.0, 0.0, 1.0];
    document.getElementById('pointButton').onclick = () => currentMode = 'point';
    document.getElementById('triangleButton').onclick = () => currentMode = 'triangle';
    document.getElementById('circleButton').onclick = () => currentMode = 'circle';
    document.getElementById('toggleColorChange').onclick = () => dynamicColorEnabled = !dynamicColorEnabled;

    document.getElementById('clearButton').onclick = () => {
        shapesList = [];
        gl.clear(gl.COLOR_BUFFER_BIT);
    };

    document.getElementById('redSlide').oninput = () => g_selectedColor[0] = parseFloat(document.getElementById('redSlide').value) / 100;
    document.getElementById('greenSlide').oninput = () => g_selectedColor[1] = parseFloat(document.getElementById('greenSlide').value) / 100;
    document.getElementById('blueSlide').oninput = () => g_selectedColor[2] = parseFloat(document.getElementById('blueSlide').value) / 100;
    document.getElementById('sizeSlide').oninput = () => g_selectedSize = parseFloat(document.getElementById('sizeSlide').value);
    document.getElementById('segmentSlide').oninput = () => {
        g_selectedSegments = parseInt(document.getElementById('segmentSlide').value);
    };
    document.getElementById('drawImage').addEventListener('click', function() {
        drawImage(gl, a_Position, u_FragColor);
    });    

    canvas.onmousedown = handleCanvasClick;
    canvas.onmousemove = handleMouseMove; // Properly assign the function
}

function main() {
    if (!setupWebGL()) {
        return;
    }
    addActionsForHtmlUI();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function convertCoordinatesEventToGL(ev) {
    let rect = ev.target.getBoundingClientRect();
    let x = ((ev.clientX - rect.left) - canvas.width / 2) / (canvas.width / 2);
    let y = (canvas.height / 2 - (ev.clientY - rect.top)) / (canvas.height / 2);
    return [x, y];
}

function renderAllShapes() {
    let startTime = performance.now();
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (image) {
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, image.vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.uniform4fv(u_FragColor, image.color);
        gl.drawArrays(gl.TRIANGLES, 0, image.vertices.length / 2);
    }

    // Draw other shapes in the shapesList
    shapesList.forEach(shape => {
        shape.render();
        gl.disableVertexAttribArray(a_Position);  // Disable attribute to clean up
    });
    let endTime = performance.now();
    console.log('Render time: ' + (endTime - startTime) + ' ms');
}

main();
