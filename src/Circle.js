class Circle {
    constructor(center, radius, color, numSegments) {
        this.center = center;
        this.radius = radius;
        this.color = color;
        this.numSegments = numSegments; // Store the number of segments

        this.vertexBuffer = gl.createBuffer();
        if (!this.vertexBuffer) {
            console.error('Failed to create the buffer object for the circle');
            return;
        }

        let vertices = this.calculateCircleVertices();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    }

    calculateCircleVertices() {
        let vertices = [];
        const angleStep = 2 * Math.PI / this.numSegments;
        for (let i = 0; i <= this.numSegments; i++) {
            let angle = i * angleStep;
            let x = this.center[0] + this.radius * Math.cos(angle);
            let y = this.center[1] + this.radius * Math.sin(angle);
            vertices.push(x);
            vertices.push(y);
        }
        return vertices;
    }

    render() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.uniform4f(u_FragColor, ...this.color);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.numSegments + 1);
    }
}
