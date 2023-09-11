import { describe, expect, it } from 'vitest'
import * as rrpu from './remark-rewrite-previewable-url.ts';

describe('compiler test', () => {
  it('should compile', async () => {
    expect(rrpu).toBeDefined();
  });

  // TODO: add real tests
});
