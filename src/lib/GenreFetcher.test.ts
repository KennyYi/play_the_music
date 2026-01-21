import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenreScriptFetcher, extractJsonFromScript } from './GenreFetcher';

describe('GenreFetcher', () => {
  describe('extractJsonFromScript', () => {
    it('should extract JSON from script with JSON.parse', () => {
      const script = 'const data = JSON.parse("{\\"key\\":\\"value\\"}");';
      const result = extractJsonFromScript(script);
      expect(result).toBe('{"key":"value"}');
    });

    it('should handle escaped characters', () => {
      const script = 'JSON.parse("{\\"name\\":\\"test\\\\nline\\"}");';
      const result = extractJsonFromScript(script);
      expect(result).toBe('{"name":"test\nline"}');
    });
  });

  describe('GenreScriptFetcher.fetch', () => {
    let fetcher: GenreScriptFetcher;
    let mockFetch: any;

    beforeEach(() => {
      fetcher = new GenreScriptFetcher();
      mockFetch = vi.fn();
      global.fetch = mockFetch;
    });

    it('should handle array format with standard id field', async () => {
      const mockData = [
        { id: 'track-1', title: 'Song 1', genre: 'Rock' },
        { id: 'track-2', title: 'Song 2', genre: 'Rock' },
        { id: 'track-3', title: 'Song 3', genre: 'Pop' },
      ];

      const scriptContent = `const data = JSON.parse('${JSON.stringify(mockData)}');`;

      // Mock detectGenreJsHash
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<html>page-testhash.js</html>',
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => scriptContent,
        });

      const result = await fetcher.fetch();

      expect(result.length).toBeGreaterThan(0);
      expect(result.every(genre => genre.songs.length > 0)).toBe(true);
      expect(result.every(genre => 
        genre.songs.every(song => song.id && song.id !== 'undefined')
      )).toBe(true);
    });

    it('should handle array format with clip_id field', async () => {
      const mockData = [
        { clip_id: 'clip-1', title: 'Song 1', genre: 'Rock' },
        { clip_id: 'clip-2', title: 'Song 2', genre: 'Rock' },
      ];

      const scriptContent = `const data = JSON.parse('${JSON.stringify(mockData)}');`;

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<html>page-testhash.js</html>',
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => scriptContent,
        });

      const result = await fetcher.fetch();

      expect(result.length).toBeGreaterThan(0);
      const allSongs = result.flatMap(g => g.songs);
      expect(allSongs.every(song => song.id.startsWith('clip-'))).toBe(true);
    });

    it('should skip tracks without any valid ID', async () => {
      const mockData = [
        { title: 'Valid Song', id: 'valid-id', genre: 'Rock' },
        { title: 'No ID Song', genre: 'Rock' }, // This should be skipped
        { title: 'Another Valid', clip_id: 'clip-id', genre: 'Rock' },
      ];

      const scriptContent = `const data = JSON.parse('${JSON.stringify(mockData)}');`;

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<html>page-testhash.js</html>',
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => scriptContent,
        });

      const result = await fetcher.fetch();

      const rockGenre = result.find(g => g.genre === 'Rock');
      expect(rockGenre).toBeDefined();
      // Should only have 2 songs (the one without ID should be skipped)
      expect(rockGenre!.songs.length).toBe(2);
    });

    it('should handle object format (legacy)', async () => {
      const mockData = {
        Rock: [
          { id: 'rock-1', title: 'Rock Song 1' },
          { id: 'rock-2', title: 'Rock Song 2' },
        ],
        Pop: [
          { id: 'pop-1', title: 'Pop Song 1' },
        ],
      };

      const scriptContent = `const data = JSON.parse('${JSON.stringify(mockData)}');`;

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<html>page-testhash.js</html>',
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => scriptContent,
        });

      const result = await fetcher.fetch();

      expect(result.length).toBe(2);
      expect(result.some(g => g.genre === 'Rock')).toBe(true);
      expect(result.some(g => g.genre === 'Pop')).toBe(true);
    });

    it('should group tracks by genre when in array format', async () => {
      const mockData = [
        { id: '1', title: 'Song 1', genre: 'Rock' },
        { id: '2', title: 'Song 2', genre: 'Rock' },
        { id: '3', title: 'Song 3', genre: 'Pop' },
        { id: '4', title: 'Song 4', genre: 'Jazz' },
      ];

      const scriptContent = `const data = JSON.parse('${JSON.stringify(mockData)}');`;

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<html>page-testhash.js</html>',
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => scriptContent,
        });

      const result = await fetcher.fetch();

      expect(result.length).toBe(3); // Rock, Pop, Jazz
      const rockSongs = result.find(g => g.genre === 'Rock')?.songs;
      expect(rockSongs?.length).toBe(2);
    });

    it('should use "All Tracks" as default genre when no genre field exists', async () => {
      const mockData = [
        { id: '1', title: 'Song 1' },
        { id: '2', title: 'Song 2' },
      ];

      const scriptContent = `const data = JSON.parse('${JSON.stringify(mockData)}');`;

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<html>page-testhash.js</html>',
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => scriptContent,
        });

      const result = await fetcher.fetch();

      expect(result.length).toBe(1);
      expect(result[0].genre).toBe('All Tracks');
      expect(result[0].songs.length).toBe(2);
    });

    it('should handle tracks with various ID field names', async () => {
      const mockData = [
        { id: 'standard-id', title: 'Standard ID', genre: 'Test' },
        { clip_id: 'clip-id', title: 'Clip ID', genre: 'Test' },
        { audio_id: 'audio-id', title: 'Audio ID', genre: 'Test' },
        { track_id: 'track-id', title: 'Track ID', genre: 'Test' },
        { song_id: 'song-id', title: 'Song ID', genre: 'Test' },
        { uid: 'uid-id', title: 'UID', genre: 'Test' },
      ];

      const scriptContent = `const data = JSON.parse('${JSON.stringify(mockData)}');`;

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<html>page-testhash.js</html>',
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => scriptContent,
        });

      const result = await fetcher.fetch();

      const testGenre = result.find(g => g.genre === 'Test');
      expect(testGenre).toBeDefined();
      expect(testGenre!.songs.length).toBe(6);
      
      // Verify each ID was extracted correctly
      const songIds = testGenre!.songs.map(s => s.id);
      expect(songIds).toContain('standard-id');
      expect(songIds).toContain('clip-id');
      expect(songIds).toContain('audio-id');
      expect(songIds).toContain('track-id');
      expect(songIds).toContain('song-id');
      expect(songIds).toContain('uid-id');
    });
  });
});
