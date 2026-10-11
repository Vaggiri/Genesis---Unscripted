/**
 * server/lib/fileRouter.js
 * 
 * Verifies file type and integrity using content inspection and magic bytes.
 * Defends against spoofed file extensions and zip-bombs.
 */

import JSZip from 'jszip';

/**
 * Checks if a buffer represents a valid STL file.
 * Returns { valid: boolean, type: 'ascii'|'binary', triangleCount?: number }
 */
export function inspectStlBuffer(buffer) {
  if (!buffer || buffer.length < 84) {
    return { valid: false, reason: 'File too small to be a valid STL' };
  }

  // Check ASCII STL: Starts with "solid"
  const headerAscii = buffer.slice(0, 80).toString('utf8').trim();
  if (headerAscii.toLowerCase().startsWith('solid')) {
    // Check if it really contains text like "facet normal"
    const sample = buffer.slice(0, 1024).toString('utf8');
    if (sample.includes('facet') || sample.includes('endsolid')) {
      return { valid: true, type: 'ascii' };
    }
  }

  // Check Binary STL: 80 bytes header + 4 bytes triangle count + triangleCount * 50 bytes
  const triangleCount = buffer.readUInt32LE(80);
  const expectedSize = 84 + triangleCount * 50;

  if (buffer.length === expectedSize) {
    return { valid: true, type: 'binary', triangleCount };
  }

  // Some binary STLs have extra comments or padding at the end
  if (buffer.length >= expectedSize && triangleCount > 0 && triangleCount < 50000000) {
    return { valid: true, type: 'binary', triangleCount };
  }

  return { valid: false, reason: 'STL header / triangle count does not match file size' };
}

/**
 * Checks a ZIP buffer to ensure it is a safe, valid Gerber PCB archive.
 * Protects against zip bombs (max 200 files, max 50MB uncompressed).
 */
export async function inspectGerberZipBuffer(buffer) {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const filenames = Object.keys(zip.files);

    if (filenames.length === 0) {
      return { valid: false, reason: 'Zip file is empty' };
    }

    if (filenames.length > 200) {
      return { valid: false, reason: 'Zip contains too many entries (max 200 allowed)' };
    }

    let totalUncompressedSize = 0;
    const gerberExtensions = ['.gbr', '.gtl', '.gbl', '.gts', '.gbs', '.gko', '.gm1', '.gto', '.gbo'];
    const drillExtensions = ['.drl', '.xln', '.txt'];

    let gerberCount = 0;
    let drillCount = 0;

    for (const filename of filenames) {
      const file = zip.files[filename];
      if (file.dir) continue;

      // Zip bomb check
      // @ts-ignore
      const uncompressed = file._data ? file._data.uncompressedSize || 0 : 0;
      totalUncompressedSize += uncompressed;
      if (totalUncompressedSize > 50 * 1024 * 1024) {
        return { valid: false, reason: 'Uncompressed size exceeds 50MB limit' };
      }

      const lower = filename.toLowerCase();
      if (gerberExtensions.some(ext => lower.endsWith(ext))) {
        gerberCount++;
      }
      if (drillExtensions.some(ext => lower.endsWith(ext))) {
        drillCount++;
      }
    }

    if (gerberCount === 0 && !filenames.some(f => f.toLowerCase().endsWith('.kicad_pcb') || f.toLowerCase().endsWith('.brd'))) {
      return { 
        valid: false, 
        reason: 'No recognized Gerber layers (.gtl, .gbl, .gbr) or KiCad/Eagle PCB board files found inside zip' 
      };
    }

    return {
      valid: true,
      fileCount: filenames.length,
      gerberLayersCount: gerberCount,
      hasDrill: drillCount > 0
    };
  } catch (err) {
    return { valid: false, reason: `Failed to unpack zip: ${err.message}` };
  }
}
