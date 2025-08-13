import { assert, assertEquals } from 'jsr:@std/assert';

import { DirectoryConverter } from './converter.ts';
import { ConversionOptions } from './types.ts';

Deno.test('DirectoryConverter initializes correctly', () => {
  const converter = new DirectoryConverter();
  assert(converter instanceof DirectoryConverter);
});

Deno.test('DirectoryConverter converts files correctly', async () => {
  const converter = new DirectoryConverter();
  const options: ConversionOptions = {
    inputDirs: ['./test/input'], // Specify a test input directory
    outputDir: './test/output', // Specify a test output directory
    minify: false,
    escape: false,
    tree: false,
    clean: false,
  };

  const result = await converter.convert(options);

  // Check if the result contains expected properties
  assert(result.stats);
  assertEquals(result.stats.processedFiles, 1); // Adjust based on test input
  assertEquals(result.stats.skippedFiles, 0); // Adjust based on test input
  assert(result.files.length >= 0);
  // Check if output contains expected sections
  assert(result.files.length > 0); // Ensure files were processed
  assert(result.tree.length < 1); // Ensure tree is generated if requested
});
