import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, mkdir, readdir } from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const tempDir = path.join(os.tmpdir(), 'docconverter-' + Date.now());
  
  try {
    await mkdir(tempDir, { recursive: true });
    
    const data = await req.formData();
    const file = data.get('file') as File;
    const sourceFormat = data.get('sourceFormat') as string;
    const targetFormat = data.get('targetFormat') as string;

    const inputName = `input.${sourceFormat.toLowerCase()}`;
    const inputPath = path.join(tempDir, inputName);

    
    const buffer = await file.arrayBuffer();
    await writeFile(inputPath, Buffer.from(buffer));

    
    const command = `soffice --headless --convert-to ${targetFormat.toLowerCase()} "${inputPath}" --outdir "${tempDir}"`;
    console.log('Executing command:', command);

    
    const { stdout, stderr } = await execAsync(command);
    console.log('LibreOffice stdout:', stdout);
    if (stderr) console.error('LibreOffice stderr:', stderr);

    
    const files = await readdir(tempDir);
    console.log('Files in temp directory:', files);

    
    const outputFile = files.find(f => 
      f.toLowerCase().endsWith(`.${targetFormat.toLowerCase()}`) && 
      f.toLowerCase() !== inputName.toLowerCase()
    );
    
    if (!outputFile) {
      throw new Error(`Conversion failed - no ${targetFormat} file found in: ${files.join(', ')}`);
    }

    console.log('Found output file:', outputFile);

    
    const outputPath = path.join(tempDir, outputFile);
    const convertedBuffer = await readFile(outputPath);
    
    const blob = new Blob([convertedBuffer], { 
      type: getMimeType(targetFormat) 
    });

    return new NextResponse(blob, {
      headers: {
        'Content-Type': blob.type,
        'Content-Disposition': `attachment; filename="${outputFile}"`,
      },
    });

  } catch (error) {
    console.error('Server conversion error:', error);
    
    return NextResponse.json(
      { 
        error: 'Conversion failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    
    try {
      await execAsync(`rm -rf "${tempDir}"`);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'doc': 'application/msword',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    'odt': 'application/vnd.oasis.opendocument.text'
  };
  return mimeTypes[format.toLowerCase()] || 'application/octet-stream';
} 