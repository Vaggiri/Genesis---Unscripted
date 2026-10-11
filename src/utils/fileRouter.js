/**
 * src/utils/fileRouter.js
 * 
 * Inspects uploaded CAD / CAM files in the browser.
 * Detects 3D print (STL/OBJ/3MF) vs PCB Gerber archives vs laser/ambiguous files.
 */

import JSZip from 'jszip';

export async function detectFileKind(file) {
  const filename = file.name.toLowerCase();
  const ext = filename.split('.').pop();

  // 1. Direct 3D print extensions
  if (['obj', '3mf', 'step', 'stp'].includes(ext)) {
    return {
      kind: 'print_3d',
      confidence: 'high',
      detectedBy: `Extension .${ext}`
    };
  }

  // 2. Direct PCB CAD extensions
  if (['kicad_pcb', 'brd'].includes(ext)) {
    return {
      kind: 'pcb',
      confidence: 'high',
      detectedBy: `Board CAD file .${ext}`
    };
  }

  // 3. Ambiguous 2D vector extensions
  if (['dxf', 'svg'].includes(ext)) {
    return {
      kind: 'ambiguous',
      confidence: 'medium',
      suggestedKinds: ['laser', 'pcb'],
      detectedBy: `Vector contour file .${ext}`
    };
  }

  // 4. STL Deep Inspection (ASCII vs Binary)
  if (ext === 'stl') {
    try {
      const buffer = await file.slice(0, 1024).arrayBuffer();
      const headerStr = new TextDecoder().decode(buffer.slice(0, 80));

      // ASCII STL begins with "solid"
      if (headerStr.trim().toLowerCase().startsWith('solid')) {
        const fullSample = new TextDecoder().decode(buffer);
        if (fullSample.includes('facet') || fullSample.includes('endsolid')) {
          return {
            kind: 'print_3d',
            subType: 'ascii_stl',
            confidence: 'high',
            detectedBy: 'ASCII STL Solid Header'
          };
        }
      }

      // Binary STL check
      if (file.size >= 84) {
        const countBuf = await file.slice(80, 84).arrayBuffer();
        const view = new DataView(countBuf);
        const triangleCount = view.getUint32(0, true);
        const expectedSize = 84 + triangleCount * 50;

        if (file.size === expectedSize || (triangleCount > 0 && triangleCount < 20000000)) {
          return {
            kind: 'print_3d',
            subType: 'binary_stl',
            triangleCount,
            confidence: 'high',
            detectedBy: `Binary STL (${triangleCount.toLocaleString()} triangles)`
          };
        }
      }

      return {
        kind: 'print_3d',
        confidence: 'medium',
        detectedBy: 'STL File'
      };
    } catch {
      return { kind: 'print_3d', confidence: 'low', detectedBy: 'File extension' };
    }
  }

  // 5. ZIP Archive Inspection (Gerber layers vs Zip-bomb defense)
  if (ext === 'zip') {
    try {
      const zip = await JSZip.loadAsync(file);
      const fileList = Object.keys(zip.files);

      if (fileList.length > 200) {
        return { kind: 'rejected', reason: 'Zip contains too many files (>200 limit).' };
      }

      const gerberExts = ['.gbr', '.gtl', '.gbl', '.gts', '.gbs', '.gko', '.gm1', '.gto', '.gbo'];
      const drillExts = ['.drl', '.xln', '.txt'];

      let gerberLayers = 0;
      let hasDrill = false;

      fileList.forEach(name => {
        const lower = name.toLowerCase();
        if (gerberExts.some(e => lower.endsWith(e))) gerberLayers++;
        if (drillExts.some(e => lower.endsWith(e))) hasDrill = true;
      });

      if (gerberLayers >= 2 || (gerberLayers >= 1 && hasDrill)) {
        return {
          kind: 'pcb',
          confidence: 'high',
          gerberLayers,
          hasDrill,
          detectedBy: `Gerber Cam Archive (${gerberLayers} layers, drill: ${hasDrill ? 'yes' : 'standard'})`
        };
      }

      // Generic zip
      return {
        kind: 'ambiguous',
        suggestedKinds: ['print_3d', 'pcb', 'other'],
        detectedBy: 'Generic ZIP archive'
      };
    } catch (err) {
      return { kind: 'rejected', reason: `Corrupt ZIP archive: ${err.message}` };
    }
  }

  // Unsupported or rejected extension
  return {
    kind: 'rejected',
    reason: `Unsupported file format .${ext}. Please upload .stl, .obj, .3mf, or Gerber .zip.`
  };
}
