import { initBuffers } from "./init-buffers.js";
import { drawScene } from "./draw-scene.js";

let cubeRotation = 0.0;
let deltaTime = 0;

main();

function main() {
  const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;
  const gl = canvas.getContext("webgl")!;

  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Vertex shader program
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    precision highp float;
    varying vec2 vTextureCoord;
    varying vec3 vLighting;
    varying vec3 vNormal;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;

      // Apply lighting effect

      vec3 ambientLight = vec3(0.5, 0.5, 0.5);
      vec3 directionalLightColor = vec3(1.0, 1.0, 1.0);
      vec3 directionalVector = normalize(vec3(1.0, 0.0, -8.0));
      vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
      vNormal = transformedNormal.xyz;
    }
`;

  const fsSource = `
    precision highp float;
    varying  vec2 vTextureCoord;
    varying  vec3 vLighting;
    varying  vec3 vNormal;

    uniform sampler2D uSampler;

    void main(void) {
      vec4 texelColor = texture2D(uSampler, vTextureCoord);

      gl_FragColor = vec4(texelColor.rgb * vLighting, 1.0);
      // gl_FragColor = vec4(vNormal, 1.0);
    }
`;

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  if (!shaderProgram) {
    throw new Error("Failed to create shader program");
  }

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      // vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
      textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
      vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
      uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
    },
  };

  const buffers = initBuffers(gl);

  const texture = loadTexture(
    gl,
    "https://mass-office.alipay.com/huamei_koqzbu/afts/img/K5FlQIHPeZAAAAAAAAAAABAADnV5AQBr/original"
  );
  // 将图像像素按照 WebGL 期望的从底部到顶部的顺序翻转。
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  let then = 0;

  // Draw the scene repeatedly
  function render(now: number) {
    now *= 0.001; // convert to seconds
    deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, buffers, texture, cubeRotation);
    cubeRotation += deltaTime;

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function initShaderProgram(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string
) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  if (shaderProgram === null) {
    throw new Error("Failed to create shader program");
  }

  if (!vertexShader) {
    throw new Error("Failed to create vertex shader");
  }

  if (!fragmentShader) {
    throw new Error("Failed to create fragment shader");
  }

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram
      )}`
    );
    return null;
  }

  return shaderProgram;
}

function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

// 加载纹理
function loadTexture(gl: WebGLRenderingContext, url: string) {
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // 填充纹理
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  // border 必须为 0
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  // 填充纹理
  const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel
  );

  // 异步加载图片
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // 填充纹理
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image
    );

    // WebGL1 中非 2 的幂次方纹理不能使用 mipmap
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // 生成 mipmap
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // 不是 2 的幂次方，关闭 mipmap 并设置 wrapping
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // x 轴
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // y 轴
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // 缩小
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value: number) {
  return (value & (value - 1)) === 0;
}
