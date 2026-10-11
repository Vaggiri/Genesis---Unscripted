/**
 * src/utils/stlAnalysis.js
 * 
 * Computes exact mesh volume using signed tetrahedra integration,
 * bounding box dimensions (X, Y, Z mm), estimated print time, and material weight.
 */

export async function analyzeStlFile(file, infillPercent = 20) {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  let volumeMm3 = 0;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  let triangleCount = 0;

  // Check if binary STL
  const isBinary = file.size >= 84 && !new TextDecoder().decode(bytes.slice(0, 80)).toLowerCase().startsWith('solid');

  if (isBinary) {
    const dataView = new DataView(arrayBuffer);
    triangleCount = dataView.getUint32(80, true);
    let offset = 84;

    for (let i = 0; i < triangleCount && offset + 50 <= arrayBuffer.byteLength; i++) {
      // Normal vector: 3 floats (12 bytes)
      offset += 12;

      // Vertex 1: x1, y1, z1
      const x1 = dataView.getFloat32(offset, true);
      const y1 = dataView.getFloat32(offset + 4, true);
      const z1 = dataView.getFloat32(offset + 8, true);
      offset += 12;

      // Vertex 2: x2, y2, z2
      const x2 = dataView.getFloat32(offset, true);
      const y2 = dataView.getFloat32(offset + 4, true);
      const z2 = dataView.getFloat32(offset + 8, true);
      offset += 12;

      // Vertex 3: x3, y3, z3
      const x3 = dataView.getFloat32(offset, true);
      const y3 = dataView.getFloat32(offset + 4, true);
      const z3 = dataView.getFloat32(offset + 8, true);
      offset += 12;

      // Attribute byte count: 2 bytes
      offset += 2;

      // Bounding box
      minX = Math.min(minX, x1, x2, x3); maxX = Math.max(maxX, x1, x2, x3);
      minY = Math.min(minY, y1, y2, y3); maxY = Math.max(maxY, y1, y2, y3);
      minZ = Math.min(minZ, z1, z2, z3); maxZ = Math.max(maxZ, z1, z2, z3);

      // Signed volume of tetrahedron: 1/6 * (v1 dot (v2 cross v3))
      const crossX = y2 * z3 - z2 * y3;
      const crossY = z2 * x3 - x2 * z3;
      const crossZ = x2 * y3 - y2 * x3;
      const tetVolume = (x1 * crossX + y1 * crossY + z1 * crossZ) / 6.0;
      volumeMm3 += tetVolume;
    }
  } else {
    // Basic approximation for ASCII STL
    const text = new TextDecoder().decode(bytes);
    const vertexMatches = [...text.matchAll(/vertex\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/gi)];
    triangleCount = Math.floor(vertexMatches.length / 3);

    for (let i = 0; i < vertexMatches.length; i += 3) {
      if (i + 2 >= vertexMatches.length) break;
      const [, x1s, y1s, z1s] = vertexMatches[i];
      const [, x2s, y2s, z2s] = vertexMatches[i + 1];
      const [, x3s, y3s, z3s] = vertexMatches[i + 2];

      const x1 = parseFloat(x1s), y1 = parseFloat(y1s), z1 = parseFloat(z1s);
      const x2 = parseFloat(x2s), y2 = parseFloat(y2s), z2 = parseFloat(z2s);
      const x3 = parseFloat(x3s), y3 = parseFloat(y3s), z3 = parseFloat(z3s);

      minX = Math.min(minX, x1, x2, x3); maxX = Math.max(maxX, x1, x2, x3);
      minY = Math.min(minY, y1, y2, y3); maxY = Math.max(maxY, y1, y2, y3);
      minZ = Math.min(minZ, z1, z2, z3); maxZ = Math.max(maxZ, z1, z2, z3);

      const crossX = y2 * z3 - z2 * y3;
      const crossY = z2 * x3 - x2 * z3;
      const crossZ = x2 * y3 - y2 * x3;
      volumeMm3 += (x1 * crossX + y1 * crossY + z1 * crossZ) / 6.0;
    }
  }

  const absVolumeMm3 = Math.abs(volumeMm3);
  const volumeCm3 = absVolumeMm3 / 1000.0;

  const dimX = maxX > minX ? Math.round(maxX - minX) : 25;
  const dimY = maxY > minY ? Math.round(maxY - minY) : 25;
  const dimZ = maxZ > minZ ? Math.round(maxZ - minZ) : 25;

  // Material calculation: PLA density ~ 1.24 g/cm3
  // Infill factor: 20% infill ~ 35% material density due to solid outer walls
  const effectiveDensityFactor = 0.25 + (infillPercent / 100) * 0.5;
  const materialGrams = Math.max(5, Math.round(volumeCm3 * 1.24 * effectiveDensityFactor));

  // Time estimate: ~8 mm3/s standard extrusion flow rate + 8 minutes bed heat & purge overhead
  const extrusionSeconds = absVolumeMm3 * effectiveDensityFactor / 8.0;
  const totalMinutes = Math.max(20, Math.round((extrusionSeconds / 60.0) + 8));

  return {
    triangleCount,
    volumeCm3: Math.round(volumeCm3 * 10) / 10,
    dimensions: { x: dimX, y: dimY, z: dimZ },
    estimatedGrams: materialGrams,
    estimatedMinutes: totalMinutes
  };
}
