import { describe, expect, it } from 'vitest';
import {
  CsvScanner,
  detectDelimiter,
  parseNumberBytes,
  previewCsv,
  splitCsvLine,
  type FieldSink,
} from './csv';
import { previewSource } from './sourcePreview';

const enc = new TextEncoder();

/** Run the scanner over `text`, optionally split into chunks of `chunkSize`. */
function scan(
  text: string,
  delimiter: string,
  sinkOf: Array<FieldSink[] | null>,
  chunkSize = Infinity,
): { numbers: number[][]; texts: string[][] } {
  const numbers: number[][] = [];
  const texts: string[][] = [];
  let curN: number[] = [];
  let curT: string[] = [];
  const scanner = new CsvScanner(
    delimiter.charCodeAt(0),
    sinkOf,
    {
      number: (i, v) => {
        curN[i] = v;
      },
      text: (i, v) => {
        curT[i] = v;
      },
      endRow: () => {
        numbers.push(curN);
        texts.push(curT);
        curN = [];
        curT = [];
      },
    },
    true,
  );
  const bytes = enc.encode(text);
  if (chunkSize === Infinity) {
    scanner.push(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += chunkSize) {
      scanner.push(bytes.subarray(i, Math.min(bytes.length, i + chunkSize)));
    }
  }
  scanner.end();
  return { numbers, texts };
}

const NUM3: Array<FieldSink[] | null> = [
  [{ kind: 'number', index: 0 }],
  [{ kind: 'number', index: 1 }],
  [{ kind: 'number', index: 2 }],
];

describe('parseNumberBytes', () => {
  const p = (s: string) => {
    const b = enc.encode(s);
    return parseNumberBytes(b, 0, b.length);
  };

  it('parses the shapes that appear in telemetry', () => {
    expect(p('0')).toBe(0);
    expect(p('42')).toBe(42);
    expect(p('-42')).toBe(-42);
    expect(p('+42')).toBe(42);
    expect(p('3.5')).toBe(3.5);
    expect(p('-0.125')).toBe(-0.125);
    expect(p('1e3')).toBe(1000);
    expect(p('1.5E-2')).toBeCloseTo(0.015, 12);
    expect(p('-46217.83472728097')).toBeCloseTo(-46217.83472728097, 6);
  });

  it('matches Number() on long decimals', () => {
    for (const s of ['107887.07976006716', '1074.8814801735134', '1e-9', '123456789.123456']) {
      expect(p(s)).toBeCloseTo(Number(s), 6);
    }
  });

  it('rejects rather than guessing', () => {
    expect(p('')).toBeNaN();
    expect(p('abc')).toBeNaN();
    expect(p('12abc')).toBeNaN();
    expect(p('1.2.3')).toBeNaN();
    expect(p('-')).toBeNaN();
  });
});

describe('detectDelimiter', () => {
  it('prefers the separator that splits consistently', () => {
    expect(detectDelimiter('a,b,c\n1,2,3\n4,5,6')).toBe(',');
    expect(detectDelimiter('a;b;c\n1;2;3\n4;5;6')).toBe(';');
    expect(detectDelimiter('a\tb\tc\n1\t2\t3')).toBe('\t');
    expect(detectDelimiter('a|b|c\n1|2|3')).toBe('|');
  });

  it('is not fooled by a text column full of the wrong character', () => {
    // Semicolons are more numerous, but only the comma splits every line evenly.
    const text = 'name,x,y\n"a;b;c;d",1,2\n"e;f;g;h",3,4\n"i;j;k;l",5,6';
    expect(detectDelimiter(text)).toBe(',');
  });
});

describe('splitCsvLine', () => {
  it('handles quotes, escapes and empty fields', () => {
    expect(splitCsvLine('a,b,c', ',')).toEqual(['a', 'b', 'c']);
    expect(splitCsvLine('a,,c', ',')).toEqual(['a', '', 'c']);
    expect(splitCsvLine('a,b,', ',')).toEqual(['a', 'b', '']);
    expect(splitCsvLine('"a,b",c', ',')).toEqual(['a,b', 'c']);
    expect(splitCsvLine('"say ""hi""",c', ',')).toEqual(['say "hi"', 'c']);
  });
});

describe('CsvScanner', () => {
  it('reads a simple table', () => {
    const { numbers } = scan('x,y,z\n1,2,3\n4,5,6\n', ',', NUM3);
    expect(numbers).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  it('skips only the columns with no sink', () => {
    const sinks: Array<FieldSink[] | null> = [
      null,
      [{ kind: 'number', index: 0 }],
      null,
      [{ kind: 'number', index: 1 }],
    ];
    const { numbers } = scan('a,b,c,d\n1,2,3,4\n', ',', sinks);
    expect(numbers).toEqual([[2, 4]]);
  });

  it('routes one source column to several sinks', () => {
    // The same column mapped twice must feed both, not just the last one.
    const sinks: Array<FieldSink[] | null> = [
      [
        { kind: 'number', index: 0 },
        { kind: 'dict', index: 0 },
      ],
    ];
    const { numbers, texts } = scan('t\n17\n', ',', sinks);
    expect(numbers).toEqual([[17]]);
    expect(texts).toEqual([['17']]);
  });

  it('gives identical results at every chunk size', () => {
    // Chunk boundaries are the scanner's most dangerous edge: a row split across
    // a chunk is re-scanned, and any double-emit would show up here.
    const text = 'x,y,z\n1,2,3\r\n4.5,-6,7e2\n8,9,10\n11,12,13\n';
    const whole = scan(text, ',', NUM3);
    for (const size of [1, 2, 3, 5, 7, 11, 13, 17, 64]) {
      expect(scan(text, ',', NUM3, size).numbers, `chunk size ${size}`).toEqual(whole.numbers);
    }
  });

  it('handles CRLF, a missing trailing newline, and blank lines', () => {
    expect(scan('x,y,z\r\n1,2,3\r\n4,5,6', ',', NUM3).numbers).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
    expect(scan('x,y,z\n1,2,3\n\n4,5,6\n', ',', NUM3).numbers).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  it('keeps quoted separators and quoted newlines inside one field', () => {
    const sinks: Array<FieldSink[] | null> = [
      [{ kind: 'dict', index: 0 }],
      [{ kind: 'number', index: 0 }],
    ];
    const r = scan('name,v\n"a,b",1\n"multi\nline",2\n', ',', sinks);
    expect(r.texts).toEqual([['a,b'], ['multi\nline']]);
    expect(r.numbers).toEqual([[1], [2]]);
  });

  it('splits a quoted field across chunks without corrupting it', () => {
    const sinks: Array<FieldSink[] | null> = [[{ kind: 'dict', index: 0 }]];
    const text = 'name\n"say ""hi"" there"\n"second"\n';
    const whole = scan(text, ',', sinks);
    expect(whole.texts).toEqual([['say "hi" there'], ['second']]);
    for (const size of [1, 2, 3, 4, 9, 16]) {
      expect(scan(text, ',', sinks, size).texts, `chunk size ${size}`).toEqual(whole.texts);
    }
  });

  it('decodes multi-byte UTF-8 in text fields', () => {
    const sinks: Array<FieldSink[] | null> = [[{ kind: 'dict', index: 0 }]];
    const r = scan('name\nqloc_sgibas1\nKäse\n日本\n', ',', sinks, 3);
    expect(r.texts).toEqual([['qloc_sgibas1'], ['Käse'], ['日本']]);
  });
});

describe('previewCsv', () => {
  it('reports columns, separator and numeric-ness', async () => {
    const text = 'Name,X,Y,Z\nalice,1,2,3\nbob,4,5,6\n';
    const file = new File([text], 'test.csv', { type: 'text/csv' });
    const p = await previewCsv(file);
    expect(p.columns).toEqual(['Name', 'X', 'Y', 'Z']);
    expect(p.delimiter).toBe(',');
    expect(p.numeric).toEqual([false, true, true, true]);
    expect(p.rows.length).toBe(2);
  });

  it('names unnamed header cells rather than producing empty keys', async () => {
    const file = new File(['a,,c\n1,2,3\n'], 'test.csv');
    const p = await previewCsv(file);
    expect(p.columns).toEqual(['a', 'column_1', 'c']);
  });

  it('rejects an empty file with a clear message', async () => {
    await expect(previewCsv(new File([''], 'empty.csv'))).rejects.toThrow(/empty/i);
  });

  it('splits the preview by an overridden separator', async () => {
    const file = new File(['a;b,c\n1;2,5\n3;4,5\n'], 'test.csv');
    expect((await previewCsv(file)).delimiter).toBe(',');
    // Overridden, the sample is split again by the chosen separator.
    const p = await previewSource(file, ';');
    expect(p.delimiter).toBe(';');
    expect(p.columns).toEqual(['a', 'b,c']);
    expect(p.rows[0]).toEqual(['1', '2,5']);
  });
});
