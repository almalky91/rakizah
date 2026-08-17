/**
 * Public Assets Verification Test
 * 
 * This test verifies that public directory assets load correctly in Next.js
 * 
 * Task: 15.1 Verify public directory assets load correctly
 * Requirements: 9.1, 9.3
 * 
 * Tests:
 * - favicon.ico loads from root path
 * - logo.jpg loads from root path
 * - placeholder.svg loads from root path
 * - robots.txt loads from root path
 */

import { describe, it, expect } from 'vitest';

const BASE_URL = 'http://localhost:3001'; // Dev server port

describe('Public Directory Assets', () => {
  it('should load favicon.ico from root path', async () => {
    const response = await fetch(`${BASE_URL}/favicon.ico`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('image');
  });

  it('should load logo.jpg from root path', async () => {
    const response = await fetch(`${BASE_URL}/logo.jpg`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('image/jpeg');
  });

  it('should load placeholder.svg from root path', async () => {
    const response = await fetch(`${BASE_URL}/placeholder.svg`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('image/svg');
  });

  it('should load robots.txt from root path', async () => {
    const response = await fetch(`${BASE_URL}/robots.txt`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/plain');
  });

  it('should verify all assets are accessible without authentication', async () => {
    const assets = ['/favicon.ico', '/logo.jpg', '/placeholder.svg', '/robots.txt'];
    
    const results = await Promise.all(
      assets.map(async (asset) => {
        const response = await fetch(`${BASE_URL}${asset}`);
        return {
          asset,
          status: response.status,
          ok: response.ok,
        };
      })
    );

    results.forEach(({ asset, status, ok }) => {
      expect(ok).toBe(true);
      expect(status).toBe(200);
    });
  });

  it('should verify favicon.ico has valid ICO format', async () => {
    const response = await fetch(`${BASE_URL}/favicon.ico`);
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // ICO files start with 0x00 0x00 0x01 0x00 or 0x00 0x00 0x02 0x00
    expect(bytes[0]).toBe(0x00);
    expect(bytes[1]).toBe(0x00);
    expect(bytes[2] === 0x01 || bytes[2] === 0x02).toBe(true);
    expect(bytes[3]).toBe(0x00);
  });

  it('should verify logo.jpg has valid JPEG format', async () => {
    const response = await fetch(`${BASE_URL}/logo.jpg`);
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // JPEG files start with 0xFF 0xD8 and end with 0xFF 0xD9
    expect(bytes[0]).toBe(0xFF);
    expect(bytes[1]).toBe(0xD8);
  });

  it('should verify placeholder.svg has valid SVG format', async () => {
    const response = await fetch(`${BASE_URL}/placeholder.svg`);
    const text = await response.text();
    
    // SVG files should contain <svg tag
    expect(text).toContain('<svg');
    expect(text).toContain('</svg>');
  });

  it('should verify robots.txt has valid content', async () => {
    const response = await fetch(`${BASE_URL}/robots.txt`);
    const text = await response.text();
    
    // robots.txt should contain directives (at minimum should not be empty)
    expect(text.length).toBeGreaterThan(0);
    // Common robots.txt directives
    const hasValidDirective = 
      text.includes('User-agent:') || 
      text.includes('Disallow:') || 
      text.includes('Allow:') ||
      text.includes('Sitemap:');
    expect(hasValidDirective).toBe(true);
  });
});
