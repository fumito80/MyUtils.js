import * as R from 'ramda';

const config = require('./config.json');

/**
 * Generic Functions
 */
function checkEmpty(value) {
  if (!value || value.length === 0) {
    return undefined;
  }
  return value;
}
export function enumElem(elem) {
  if (!elem) {
    return {};
  }
  const disabled = elem.disabled;
  const children = checkEmpty(Array.prototype.map.call(elem.children, el => enumElem(el)));
  const text = checkEmpty(Array.prototype.filter.call(elem.childNodes, el => el.tagType === document.TEXT_NODE).map(el => el.nodeValue).join('').trim());
  return {
    tag: elem.tagName.toLowerCase(),
    text,
    disabled,
    children
  };
}

export const intArray = max => Array.apply(null, Array(max)).map((_, i) => i + 1);
export const lpad = (source, digits, c = '0') => {
  return (intArray(digits).reduce((acc) => acc + c, '') + source).substr(-digits);
};

interface fnWriter { (msg: string): void };
export const fileWriter = (fs): fnWriter => {
  const eol = require('os').EOL;
  const ws = fs.createWriteStream(config.LOG_FILENAME, {
    flags: 'w',
    defaultEncoding: 'utf8',
    fd: null,
    mode: 0o666,
    autoClose: true
  });
  ws.write('\ufeff');
  return (msg: string): void => {
    ws.write(msg + eol);
  }
}
export const makeMsg = (logType: string, arg, args, now: Date = new Date()): string => {
  return `[${now.toLocaleString()}.${lpad(now.getMilliseconds(), 3)}] `
    + `[${logType}] ${JSON.stringify(arg)}${args.map(arg2 => ', ' + arg2).join('')}`;
}
export const log = (writers: fnWriter[], logType: string) => {
  return (arg, ...args) => {
    const msg = makeMsg(logType, arg, args);
    writers.forEach((writer: fnWriter) => writer(msg));
    return arg;
  }
}
export const logger = (writers: fnWriter[]) => {
  return {
    debug: log(writers, 'TRACE'),
    error: log(writers, 'ERROR'),
    info:  log(writers, 'INFO'),
    warn:  log(writers, 'WARN'),
  }
}

export const findPathsNode = (node, comparator: (key: string) => boolean, path: any[] = []): string[][] => {
  if (typeof node === 'object' && !Array.isArray(node)) {
    return Object.keys(node).reduce((memo: string[][], key: string) => {
      const currentPath = path.concat([key]);
      return memo.concat(comparator(key) ? [currentPath] : [], findPathsNode(node[key], comparator, currentPath));
    }, []);
  }
  return [];
};

export const getNodeJson = (json, paths: any[]) => {
  if (paths.length === 0) {
    return json;
  }
  return getNodeJson(json[paths[0]], paths.slice(1));
};

export const copyJson = (obj) => JSON.parse(JSON.stringify(obj));

export const setNodeJson = (json, paths: any[], value) => {
  const getOrCreateNodeJson = (node, paths2: string[]) => {
    if (paths2.length === 0) {
      return node;
    }
    if (node[paths2[0]] === undefined) {
      node[paths2[0]] = {};
    }
    return getOrCreateNodeJson(node[paths2[0]], paths2.slice(1));
  };
  const clone = copyJson(json);
  const parentPath = paths.slice(0, -1);
  const target = paths.slice(-1)[0];
  getOrCreateNodeJson(clone, parentPath)[target] = value;
  return clone;
};

/**
 * Array's generic callbacks
 */
// Unique for filter
export const uniq = (value, i, self) => self.indexOf(value) === i;
// Flatten for reduce
export const flatten = (memo, listable) => {
  return [].concat(memo,
    Array.isArray(listable) ?
    listable.reduce((memo2, listable2) => flatten(memo2, listable2)) :
    listable);
};
/**
 * Function Combinaters
 */
export const pipe = (fn, ...fns) => (a) => fns.reduce((memo, fn2) => fn2(memo), fn(a));
export const compose = (...fns) => pipe(fns.pop(), fns.reverse());
export const identity = (a) => a;
export const tap = (f) => (a) => {
  f(a);
  return a;
};
export const alt = (...fns) => (a) => {
  if (!fns[0]) {
    return null;
  }
  // case !0 && !'' && !false && !null && !undefined
  return fns[0](a) || alt(...fns.slice(1))(a);
  // case !false && !null && !undefined
  // const ret = fns[0](a);
  // return (ret !== false && ret !==null && ret !== undefined) ? ret : alt(...fns.slice(1))(a);
};
export const fork = (join, f1, f2) => (a) => join(f1(a), f2(a));
export const seq = (fn, ...fns) => (a) => {
  [fn].concat(...fns).forEach(f => f(a));
  return a;
};

/**
 * Maybe monad
 */
export class Maybe {
  public static just = (a) => new Just(a);
  public static nothing = () => new Nothing();
  public static fromNullable = (a) => a !== null ? Maybe.just(a) : Maybe.nothing();
  public static of = (a) => Maybe.just(a);
  get isNothing() {
    return false;
  }
  get isJust() {
    return false;
  }
}

export interface IMaybe {
  value;
  map(f);
  getOrElse(_);
  filter(f);
  chain(f);
}

class Just extends Maybe implements IMaybe {
  constructor(private valueIn) {
    super();
  }
  get value() {
    return this.valueIn;
  }
  public map = (f) => Maybe.fromNullable(f(this.value));
  public getOrElse = (_) => this.value;
  public filter = (f) => Maybe.fromNullable(f(this.value) ? this.value : null);
  public chain = (f) => f(this.value);
}

class Nothing extends Maybe implements IMaybe {
  get value() {
    throw new TypeError(`Can't extract the value of a Nothing.`);
  }
  public map = (_) => this;
  public getOrElse = (other) => other;
  public filter = (_) => this;
  public chain = (_) => this;
}

export const lift = (f) => (value) => Maybe.fromNullable(value).map(f);
export const map = (f) => (container) => container.map(f);
export const chain = (f) => (container) => container.chain(f);
export const filter = (f) => (container) => container.filter(f);

/**
 * Either monad
 */
export class Either {
  public static left = (a) => new Left(a);
  public static right = (a) => new Right(a);
  public static fromNullable = (val) => (val !== null && val !== undefined) ? Either.right(val) : Either.left(val);
  public static of = (a) => Either.right(a);
  constructor(protected valueIn) {}
  get value() {
    return this.valueIn;
  }
}

export interface IEither {
  value;
  map(f);
  getOrElse(_);
  orElse(f);
  chain(f);
  getOrElseThrow(a);
  filter(f);
}

class Right extends Either implements IEither {
  get value() {
    return this.value;
  }
  public map = (f) => Either.of(f(this.value));
  public getOrElse = (_) => this.value;
  public orElse = (_) => this;
  public chain = (f) => f(this.value);
  public getOrElseThrow = (a) => this.value;
  public filter = (f) => Either.fromNullable(f(this.value) ? this.value : null);
}

class Left extends Either implements IEither {
  get value() {
    throw new TypeError(`Can't extract the value of a Left(a).`);
  }
  public map = (_) => this;
  public getOrElse = (other) => other;
  public orElse = (f) => f(this.value);
  public chain = (f) => this;
  public getOrElseThrow = (a) => {throw new Error(a); };
  public filter = (f) => this;
}
