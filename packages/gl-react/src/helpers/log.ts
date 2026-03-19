// https://github.com/adamschwartz/log/blob/master/log.js
/* eslint-disable */

const { userAgent, vendor } =
  typeof navigator !== "undefined"
    ? navigator
    : { userAgent: "", vendor: "" };

interface Format {
  regex: RegExp;
  replacer: (m: string, ...args: string[]) => string;
  styles: (match: RegExpMatchArray) => string[];
}

var exportedLog: any,
  ffSupport: () => boolean,
  formats: Format[],
  getOrderedMatches: (str: string) => { format: Format; match: RegExpMatchArray }[],
  hasMatches: (str: string) => boolean,
  isFF: () => boolean,
  isIE: () => boolean,
  isOpera: () => boolean,
  isSafari: () => boolean,
  log: (...args: any[]) => any,
  operaSupport: () => boolean | number,
  safariSupport: () => boolean | number,
  stringToArgs: (str: string) => string[],
  _log: (...args: any[]) => any;

log = function (...args: any[]) {
  args.forEach(function (arg: any) {
    if (typeof arg === "string") {
      return (args = args.concat(stringToArgs(arg)));
    } else {
      return args.push(arg);
    }
  });
  return _log.apply(
    typeof window !== "undefined" ? window : undefined,
    args
  );
};

_log = function (...args: any[]) {
  return Function.prototype.apply.call(console.log, console, args);
};

formats = [
  {
    regex: /\*([^\*]+)\*/,
    replacer: function (m: string, p1: string) {
      return "%c" + p1 + "%c";
    },
    styles: function () {
      return ["font-style: italic", ""];
    },
  },
  {
    regex: /_([^_]+)_/,
    replacer: function (m: string, p1: string) {
      return "%c" + p1 + "%c";
    },
    styles: function () {
      return ["font-weight: bold", ""];
    },
  },
  {
    regex: /`([^`]+)`/,
    replacer: function (m: string, p1: string) {
      return "%c" + p1 + "%c";
    },
    styles: function () {
      return [
        "background: rgb(255, 255, 219); padding: 1px 5px; border: 1px solid rgba(0, 0, 0, 0.1)",
        "",
      ];
    },
  },
  {
    regex:
      /\[c=(?:"|')?((?:(?!(?:"|')\]).)*)(?:"|')?\]((?:(?!\[c\]).)*)\[c\]/,
    replacer: function (m: string, p1: string, p2: string) {
      return "%c" + p2 + "%c";
    },
    styles: function (match: RegExpMatchArray) {
      return [match[1], ""];
    },
  },
];

hasMatches = function (str: string) {
  var _hasMatches: boolean;
  _hasMatches = false;
  formats.forEach(function (format) {
    if (format.regex.test(str)) {
      return (_hasMatches = true);
    }
  });
  return _hasMatches;
};

getOrderedMatches = function (str: string) {
  var matches: { format: Format; match: RegExpMatchArray }[];
  matches = [];
  formats.forEach(function (format) {
    var match: RegExpMatchArray | null;
    match = str.match(format.regex);
    if (match) {
      return matches.push({
        format: format,
        match: match,
      });
    }
  });
  return matches.sort(function (a, b) {
    return a.match.index! - b.match.index!;
  });
};

stringToArgs = function (str: string) {
  var firstMatch, matches: { format: Format; match: RegExpMatchArray }[], styles: string[];
  styles = [];
  while (hasMatches(str)) {
    matches = getOrderedMatches(str);
    firstMatch = matches[0];
    str = str.replace(firstMatch.format.regex, firstMatch.format.replacer);
    styles = styles.concat(firstMatch.format.styles(firstMatch.match));
  }
  return [str].concat(styles);
};

isSafari = function () {
  return /Safari/.test(userAgent) && /Apple Computer/.test(vendor);
};

isOpera = function () {
  return /OPR/.test(userAgent) && /Opera/.test(vendor);
};

isFF = function () {
  return /Firefox/.test(userAgent);
};

isIE = function () {
  return /MSIE/.test(userAgent);
};

safariSupport = function () {
  var m: RegExpMatchArray | null;
  m = userAgent.match(/AppleWebKit\/(\d+)\.(\d+)(\.|\+|\s)/);
  if (!m) {
    return false;
  }
  return 537.38 <= parseInt(m[1], 10) + parseInt(m[2], 10) / 100;
};

operaSupport = function () {
  var m: RegExpMatchArray | null;
  m = userAgent.match(/OPR\/(\d+)\./);
  if (!m) {
    return false;
  }
  return 15 <= parseInt(m[1], 10);
};

ffSupport = function () {
  return (
    typeof window !== "undefined" &&
    ((window as any).console.firebug || (window as any).console.exception)
  );
};

if (
  isIE() ||
  (isFF() && !ffSupport()) ||
  (isOpera() && !operaSupport()) ||
  (isSafari() && !safariSupport())
) {
  exportedLog = _log;
} else {
  exportedLog = log;
}

exportedLog.l = _log;

export default exportedLog;
