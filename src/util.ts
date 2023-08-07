import { Vec3 } from "gl-matrix/dist/esm";

/**
 * @description 计算顶点法向量
 * @param positions 顶点数据
 * @returns 
 */
export function calculateVertexNormal(positions: number[]) {
  const normals = [];

  for (let i = 0; i < positions.length; i += 9) {
    const p1 = Vec3.fromValues(
      positions[i],
      positions[i + 1],
      positions[i + 2]
    );
    const p2 = Vec3.fromValues(
      positions[i + 3],
      positions[i + 4],
      positions[i + 5]
    );
    const p3 = Vec3.fromValues(
      positions[i + 6],
      positions[i + 7],
      positions[i + 8]
    );

    const v1 = Vec3.create();
    const v2 = Vec3.create();
    const normal = Vec3.create();

    Vec3.subtract(v1, p2, p1);
    Vec3.subtract(v2, p3, p1);
    Vec3.cross(normal, v1, v2);
    Vec3.normalize(normal, normal);

    for (let j = 0; j < 3; j++) {
      normals.push(normal[0], normal[1], normal[2]);
    }
  }

  return normals;
}

/**
 * @description 生成正四面体的顶点坐标
 * @param length 边长
 * @returns 顶点坐标数组
 */
export function generateTetrahedronVertices(length: number) {
	const height = (Math.sqrt(2 / 3) * length) / 2;
  const baseRadius = (Math.sqrt(3) * length) / 3;

  const vertices = [
    // 底面三角形
    0, -height, -baseRadius,     // 顶点1
    -length / 2, -height, baseRadius / 2,   // 顶点2
    length / 2, -height, baseRadius / 2,    // 顶点3

    // 侧面三角形
    0, height, 0,                // 顶点4
    length / 2, -height, baseRadius / 2,    // 顶点5
    -length / 2, -height, baseRadius / 2,   // 顶点6

    // 侧面三角形
    0, height, 0,                // 顶点7
    -length / 2, -height, baseRadius / 2,   // 顶点8
    0, -height, -baseRadius,      // 顶点9

    // 侧面三角形
    0, height, 0,                // 顶点10
    0, -height, -baseRadius,      // 顶点11
    length / 2, -height, baseRadius / 2    // 顶点12
  ];

  return vertices;
}
