import { calculateVertexNormal, generateTetrahedronVertices } from "./util.js";

const positions = generateTetrahedronVertices(2);

function initBuffers(gl: WebGLRenderingContext) {
  const positionBuffer = initPositionBuffer(gl);
  const colorBuffer = initColorBuffer(gl);
  const indexBuffer = initIndexBuffer(gl);
  const textureCoordBuffer = initTextureBuffer(gl);
  const normalBuffer = initNormalBuffer(gl);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    textureCoord: textureCoordBuffer,
    normal: normalBuffer,
  };
}

function initPositionBuffer(gl: WebGLRenderingContext) {
  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer;
}

function initColorBuffer(gl: WebGLRenderingContext) {
  const faceColors = [
    // Top face: green
    [0.0, 1.0, 0.0, 1.0],
    // Bottom face: blue
    [0.0, 0.0, 1.0, 1.0],
    // Right face: yellow
    [1.0, 1.0, 0.0, 1.0],
    // Left face: purple
    [1.0, 0.0, 1.0, 1.0],
  ];

  let colors: number[] = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];
    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return colorBuffer;
}

function initIndexBuffer(gl: WebGLRenderingContext) {
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const indices = [
    // Front face
    0, 1, 2,
    // Right face
    3, 4, 5,
    // Back face
    6, 7, 8,
    // Left face
    9, 10, 11,
  ];

  // Now send the element array to GL

  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );
  return indexBuffer;
}

// 初始化纹理 buffer
function initTextureBuffer(gl: WebGLRenderingContext) {
  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  const textureCoordinates = [
    0.5, 1.0, 0.0, 0.0, 1.0, 0.0, 0.5, 1.0, 1.0, 0.0, 0.0, 0.0, 0.5, 1.0, 0.0,
    0.0, 1.0, 0.0, 0.5, 1.0, 1.0, 0.0, 0.0, 0.0,
  ];

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(textureCoordinates),
    gl.STATIC_DRAW
  );

  return textureCoordBuffer;
}

// 初始化法线 buffer
function initNormalBuffer(gl: WebGLRenderingContext) {
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  const vertexNormals = calculateVertexNormal(positions);

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertexNormals),
    gl.STATIC_DRAW
  );
  return normalBuffer;
}

export {
  initBuffers,
  initColorBuffer,
  initIndexBuffer,
  initTextureBuffer,
  initNormalBuffer,
};
