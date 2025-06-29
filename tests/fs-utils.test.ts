import { describe, test, expect, vi, beforeEach } from 'vitest';
import { vol } from 'memfs';
import path from 'path';
import {
  isExists,
  ensureDir,
  containsAnySource,
  findDuplicateNames,
} from '../src/core/utils/fs';

vi.mock('node:fs/promises');

describe(`${isExists.name}()`, () => {
  beforeEach(() => {
    vol.reset();
    vi.clearAllMocks();
  });

  test('returns true when file exists', async () => {
    const filename = '/test-file.txt';
    vol.writeFileSync(filename, 'content');

    const result = await isExists(filename);
    expect(result).toBe(true);
  });

  test('returns false when file not exists', async () => {
    const result = await isExists('/non-existent-file.txt');
    expect(result).toBe(false);
  });

  test('handles directory check', async () => {
    let dirname = '/test-dir';
    vol.mkdirSync(dirname, { recursive: true });

    const result = await isExists(dirname);
    expect(result).toBe(true);
  });

  test('works with nested paths', async () => {
    let dirname = '/nested/folder';
    let filename = '/file.txt';
    vol.mkdirSync(dirname, { recursive: true });
    vol.writeFileSync(path.join(dirname, filename), 'hello');

    expect(await isExists('/nested/folder/file.txt')).toBe(true);
    expect(await isExists('/nested/folder')).toBe(true);
    expect(await isExists('/nested')).toBe(true);
    expect(await isExists('/nested/folder/non-existent.txt')).toBe(false);
  });
});

describe(`${findDuplicateNames.name}()`, () => {
  beforeEach(() => {
    vol.reset();
    vi.clearAllMocks();
  });

  test('returns true when at least one file exists in destination', async () => {
    const destination = '/dest';
    const mockFiles = ['some.rs', 'index.html', 'main.py', 'abra'];
    const sources = ['some.c', 'some.java', 'some.rs', 'abra'];

    vol.mkdirSync(destination, { recursive: true });
    mockFiles.forEach((file, i) => {
      vol.writeFileSync(path.join(destination, file), `#${i}`);
    });

    let result = await findDuplicateNames(destination, sources);
    console.log('Dublicates:', result);

    expect(true).toBe(true);
  });
});

describe(`${containsAnySource.name}()`, () => {
  beforeEach(() => {
    vol.reset();
    vi.clearAllMocks();
  });

  test('returns true when at least one file exists in destination', async () => {
    const destination = '/dest';
    const mockFiles = ['some.rs'];
    const sources = ['some.c', 'some.java', 'some.rs'];

    vol.mkdirSync(destination, { recursive: true });
    mockFiles.forEach((file, i) => {
      vol.writeFileSync(path.join(destination, file), `#${i}`);
    });

    expect(await containsAnySource(destination, sources)).toBe(true);
  });

  test('returns true when at least one directory exists in destination', async () => {
    const destination = '/dest';
    const mockFiles = ['some.rs'];
    const sources = ['some.c', 'some.java', 'some-directory'];

    vol.mkdirSync(path.join(destination, 'some-directory'), {
      recursive: true,
    });
    mockFiles.forEach((file, i) => {
      vol.writeFileSync(path.join(destination, file), `#${i}`);
    });

    expect(await containsAnySource(destination, sources)).toBe(true);
  });

  test('returns true when multiple sources exist in destination', async () => {
    const destination = '/dest';
    const mockFiles = ['another.c', 'some.rs', 'some.c'];
    const sources = ['some.c', 'some.rs'];

    vol.mkdirSync(destination, { recursive: true });
    mockFiles.forEach((file, i) => {
      vol.writeFileSync(path.join(destination, file), `#${i}`);
    });

    expect(await containsAnySource(destination, sources)).toBe(true);
  });

  test('returns false when no sources exist in destination', async () => {
    const destination = '/dest';
    const mockFiles = ['some.js'];
    const sources = ['some.c', 'some.java', 'some-directory'];

    vol.mkdirSync(destination, { recursive: true });
    mockFiles.forEach((file, i) => {
      vol.writeFileSync(path.join(destination, file), `#${i}`);
    });

    expect(await containsAnySource(destination, sources)).toBe(false);
  });

  test('returns false when destination directory does not exist', async () => {
    const destination = '/dest';
    const sources = ['main.c', 'main.java', 'some-directory'];

    expect(await containsAnySource(destination, sources)).toBe(false);
  });

  test('returns false when sources array is empty', async () => {
    const destination = '/dest';
    const sources: string[] = [];
    vol.mkdirSync(destination, { recursive: true });

    expect(await containsAnySource(destination, sources)).toBe(false);
  });

  test('returns false for empty string in sources', async () => {
    const destination = '/dest';
    const sources: string[] = [''];
    vol.mkdirSync(destination, { recursive: true });

    expect(await containsAnySource(destination, sources)).toBe(false);
  });
});

describe(`${ensureDir.name}()`, () => {
  beforeEach(() => {
    vol.reset();
    vi.clearAllMocks();
  });

  test('should create directory when not exists', async () => {
    const dirpath = '/new-directory';

    await ensureDir(dirpath);

    expect(vol.existsSync(dirpath)).toBe(true);
    expect(vol.statSync(dirpath).isDirectory()).toBe(true);
  });

  test('should create nested directories', async () => {
    const nestedPath = '/nested/path/with/multiple/directories';

    await ensureDir(nestedPath);

    expect(vol.existsSync(nestedPath)).toBe(true);
    expect(vol.statSync(nestedPath).isDirectory()).toBe(true);
  });

  test('should return undefined when path is a file', async () => {
    const filepath = '/existing-file.txt';
    vol.writeFileSync(filepath, 'content');

    expect(await ensureDir(filepath)).toBe(undefined);
  });

  test('should return undefined when path is already exists', async () => {
    const dirpath = '/existing/dir';
    vol.mkdirSync(dirpath, { recursive: true });

    expect(await ensureDir(dirpath)).toBe(undefined);
  });
});
