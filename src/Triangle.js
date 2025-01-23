class Triangle {
    constructor(vertices, color) {
        this.vertices = vertices || [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
        this.color = color || [1.0, 1.0, 1.0, 1.0];  // Default white

        this.vertexBuffer = gl.createBuffer();
        if (!this.vertexBuffer) {
            console.error('Failed to create the buffer object for the triangle');
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    }

    render() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.uniform4f(u_FragColor, ...this.color);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
}
