// import expect from "chai";
// import { assert } from 'assert';
// import assert from 'power-assert';

// import test from "ava";

import { fromJS, Map } from 'immutable';

import {
  copyJson,
  findPathsNode,
  getNodeJson,
  intArray,
  logger,
  fileWriter,
  setNodeJson,
} from '../myUtils.js';

import * as _ from 'lodash';
import * as R from 'ramda';

import * as fs from 'fs';
const log = logger([
  console.log,
  fileWriter(fs)
]);
// const log = new Logger(fs, './trace.log');

// const log4 = require('log4js');
// log4.configure({
//   appenders: { access: { type: 'file', filename: './console.log' }, console: { type: 'console' } },
//   categories: { default: { appenders: ['access', 'console'], level: 'info' } }
// });
// const log = log4.getLogger('access');

log.info('start!');

const testobj = {
  id: '0',
  aba: {
    id: '1',
    children: [1, 2, 3],
    test: {
      id: 's',
    },
  },
  abc: {
    id: '2',
    children: ['a', 'b', 'c'],
  },
  dd: {
    id: {
      id: {
        id: '3',
      },
    },
  },
};

const immutableObj = fromJS(testobj);

// console.log(immutableObj.find());

describe('testobj', () => {

  it('findPathsNode', () => {
    expect(
      findPathsNode(testobj, (key) => key === 'test'),
    ).toEqual(
      [ [ 'aba', 'test' ] ],
    );
  });

  it('getNodeJson', () => {
      const paths = ['dd', 'id', 'id', 'id'];
      const test = getNodeJson(testobj, paths);
      expect(paths).toEqual(['dd', 'id', 'id', 'id']);
  });

  it('getNodeJson', () => {
    expect(
      getNodeJson(testobj, ['abc', 'children', 2]),
    ).toBe('c');
  });

  it('copyJson', () => {
    const a = copyJson(testobj);
    expect(a).toEqual(testobj);
  });

  it('_.assign & copyJson', () => {
    const c = {a: 'A', b: {c: 'c'}};
    const a = _.assign(copyJson(c), testobj);
    expect(a).not.toEqual(c);
    expect(c).toEqual({a: 'A', b: {c: 'c'}});
  });

  it('_.assign & R.assign', () => {
    const c = {a: 'A', b: {c: 'c'}};
    const a = _.assign(R.clone(c), testobj);
    expect(a).not.toEqual(c);
    expect(c).toEqual({a: 'A', b: {c: 'c'}});
  });

  it('R.merge', () => {
    const c = {a: 'A', b: {c: 'c'}};
    const a = R.merge(c, testobj);
    expect(a).not.toEqual(c);
    expect(c).toEqual({a: 'A', b: {c: 'c'}});
  });

  it('_.assign no destroy', () => {
    const c = {a: 'A', b: {c: 'c'}};
    const a = _.assign({}, c, testobj);
    expect(a).not.toEqual(c);
    expect(c).toEqual({a: 'A', b: {c: 'c'}});
  });

  it('_.assign destroy', () => {
    const c = {a: 'A', b: {c: 'c'}};
    const a = _.assign(c, testobj);
    expect(a).toEqual(c);
    expect(c).not.toEqual({a: 'A', b: {c: 'c'}});
  });

});

describe('testobj', () => {

  const testobj2 = {
    dd: {
      id: {
        id: {
          gx: {
            sx: {
              fw: '1',
            },
          },
        },
      },
    },
  };

  it('setNodeJson', () => {
    expect(
      setNodeJson({}, ['dd', 'id', 'id', 'gx', 'sx', 'fw'], '1'),
    ).toEqual(testobj2);
  });

  it('setNodeJson', () => {
    const newobj = setNodeJson(testobj2, ['dd', 'id', 'id', 'gx', 'sx', 'fw'], '2');
    expect(newobj).not.toEqual(testobj2);
    expect(newobj).toEqual({dd: {id: {id: {gx: {sx: {fw: '2'}}}}}});
  });

  it('R.set', () => {
    expect(
      R.set(R.lensPath(['dd', 'id', 'id', 'gx', 'sx', 'fw']), '2', testobj2),
    ).not.toEqual(testobj2);
  });

  it('R.set', () => {
    const setter = R.set(R.lensPath(['dd', 'id', 'id', 'gx', 'sx', 'fw']), '1');
    expect(
      setter({}),
    ).toEqual(testobj2);
  });

});

describe('test', () => {
  describe('findPathsNode', () => {
    it('case1', () => {
      expect(
        findPathsNode(testobj, (key) => key === 'test')
      ).toEqual(
        [ [ 'aba', 'test' ] ]
      );
      // assert.deepEqual(findPathsNode(testobj, (key) => key === 'test'), [ [ 'aba', 'test', 'dd' ] ]);
    });
    it('case2', () => {
      expect(
        findPathsNode(testobj, (key) => key === 'id')
      ).toEqual(
        [ [ 'id' ],
          [ 'aba', 'id' ],
          [ 'aba', 'test', 'id' ],
          [ 'abc', 'id' ],
          [ 'dd', 'id' ],
          [ 'dd', 'id', 'id' ],
          [ 'dd', 'id', 'id', 'id' ] ]
      );
    });
  });
});

log.info('done!');
// log.done();
