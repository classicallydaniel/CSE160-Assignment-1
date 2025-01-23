class Point {
    constructor(position, color, size) {
        this.position = position || [0.0, 0.0];
        this.color = color || [1.0, 1.0, 1.0, 1.0];  // Default white
        this.size = size || 20.0;  // Default size

        this.vertexBuffer = gl.createBuffer();
        if (!this.vertexBuffer) {
            console.error('Failed to create the buffer object for the point');
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.position), gl.STATIC_DRAW);
    }

    render() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.uniform4f(u_FragColor, ...this.color);
        gl.uniform1f(u_Size, this.size);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}
