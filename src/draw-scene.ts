import { Mat4 } from "gl-matrix/dist/esm";

function drawScene(
  gl: WebGLRenderingContext,
  programInfo: any,
  buffers,
  texture: WebGLTexture,
  cubeRotation: number
) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const canvas = gl.canvas as HTMLCanvasElement;
  const fieldOfView = (45 * Math.PI) / 180; // in radians
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = Mat4.create();

  Mat4.perspectiveNO(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  const modelViewMatrix = Mat4.create();

  Mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    [-0.0, 0.0, -6.0]
  ); // amount to translate

  rotate(modelViewMatrix, cubeRotation);

  const normalMatrix = Mat4.create();
  Mat4.invert(normalMatrix, modelViewMatrix);
  Mat4.transpose(normalMatrix, normalMatrix);

  setPositionAttribute(gl, buffers, programInfo);

  setTextureCoordAttribute(gl, buffers, programInfo);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  setNormalAttribute(gl, buffers, programInfo);

  gl.useProgram(programInfo.program);
  // gl.lineWidth(2);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.normalMatrix,
    false,
    normalMatrix,
  );

  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

  {
    const vertexCount = 12;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    // gl.drawElements(gl.TRIANGLES, 3, type, 0);
    // gl.drawElements(gl.TRIANGLES, 3, type, 3 * 2);
    // gl.drawElements(gl.TRIANGLES, 3, type, 6 * 2);
    // gl.drawElements(gl.TRIANGLES, 3, type, 9 * 2);
  }
}

function rotate(modelViewMatrix: Mat4, cubeRotation: number) {
  Mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation, // amount to rotate in radians
    [0, 0, 1]
  ); // axis to rotate around (Z)
  Mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation * 0.7, // amount to rotate in radians
    [0, 1, 0]
  ); // axis to rotate around (Y)
  Mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation * 0.3, // amount to rotate in radians
    [1, 0, 0]
  ); // axis to rotate around (X)
}

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function setPositionAttribute(gl: WebGLRenderingContext, buffers, programInfo) {
  const numComponents = 3; // pull out 3 values per iteration
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0; // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

// Tell WebGL how to pull out the colors from the color buffer
// into the vertexColor attribute.
function setColorAttribute(gl: WebGLRenderingContext, buffers, programInfo) {
  const numComponents = 4;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexColor,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}

// 告诉 WebGL 如何从缓冲区中提取纹理坐标
function setTextureCoordAttribute(
  gl: WebGLRenderingContext,
  buffers,
  programInfo
) {
  const numComponents = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
  gl.vertexAttribPointer(
    programInfo.attribLocations.textureCoord,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
}

// 设置法线属性
function setNormalAttribute(gl: WebGLRenderingContext, buffers, programInfo) {
  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexNormal,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
}

export { drawScene };
