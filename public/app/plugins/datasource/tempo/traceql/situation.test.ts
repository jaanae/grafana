import { getSituation, SituationType } from './situation';

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
}));

interface SituationTest {
  query: string;
  cursorPos: number;
  expected: SituationType;
}

describe('situation', () => {
  const tests: SituationTest[] = [
    {
      query: '{}',
      cursorPos: 1,
      expected: { type: 'SPANSET_EMPTY' },
    },
    {
      query: '{.}',
      cursorPos: 2,
      expected: { type: 'SPANSET_ONLY_DOT' },
    },
    {
      query: '{foo}',
      cursorPos: 4,
      expected: { type: 'SPANSET_IN_NAME' },
    },
    {
      query: '{span.}',
      cursorPos: 6,
      expected: { type: 'SPANSET_IN_NAME_SCOPE', scope: 'span' },
    },
    {
      query: '{span.foo }',
      cursorPos: 10,
      expected: { type: 'SPANSET_EXPRESSION_OPERATORS' },
    },
    {
      query: '{span.foo = }',
      cursorPos: 12,
      expected: { type: 'SPANSET_IN_VALUE', tagName: 'span.foo', betweenQuotes: false },
    },
    {
      query: '{span.foo = "val" }',
      cursorPos: 18,
      expected: { type: 'SPANSET_EXPRESSION_OPERATORS' },
    },
    {
      query: '{span.foo = "val" && }',
      cursorPos: 21,
      expected: { type: 'SPANSET_EMPTY' },
    },
    {
      query: '{span.foo = "val" && resource.}',
      cursorPos: 30,
      expected: { type: 'SPANSET_IN_NAME_SCOPE', scope: 'resource' },
    },
  ];

  tests.forEach((test) => {
    it(`${test.query} at ${test.cursorPos} is ${test.expected.type}`, async () => {
      const sit = getSituation(test.query, test.cursorPos);
      expect(sit).toEqual({ ...test.expected, query: test.query });
    });
  });
});
