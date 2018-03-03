//@flow
// https://github.com/adamschwartz/log/blob/master/log.js
/* eslint-disable */

const { userAgent, vendor } =
  typeof navigator !== "undefined" ? navigator : { userAgent: "", vendor: "" };

var exportedLog,
  ffSupport,
  formats,
  getOrderedMatches,
  hasMatches,
  isFF,
  isIE,
  isOpera,
  isSafari,
  log,
  makeArray,
  operaSupport,
  safariSupport,
  stringToArgs,
  _log;

log = function(...args: *) {
  args.forEach(function(arg) {
    if (typeof arg === "string") {
      return (args = args.concat(stringToArgs(arg)));
    } else {
      return args.push(arg);
    }
  });
  return _log.apply(window, args);
};

_log = function(...args: *) {
  return Function.prototype.apply.call(console.log, console, args);
};

formats = [
  {
    regex: /\*([^\*]+)\*/,
    replacer: function(m, p1) {
      return "%c" + p1 + "%c";
    },
    styles: function() {
      return ["font-style: italic", ""];
    }
  },
  {
    regex: /_([^_]+)_/,
    replacer: function(m, p1) {
      return "%c" + p1 + "%c";
    },
    styles: function() {
      return ["font-weight: bold", ""];
    }
  },
  {
    regex: /`([^`]+)`/,
    replacer: function(m, p1) {
      return "%c" + p1 + "%c";
    },
    styles: function() {
      return [
        "background: rgb(255, 255, 219); padding: 1px 5px; border: 1px solid rgba(0, 0, 0, 0.1)",
        ""
      ];
    }
  },
  {
    regex: /\[c=(?:"|')?((?:(?!(?:"|')\]).)*)(?:"|')?\]((?:(?!\[c\]).)*)\[c\]/,
    replacer: function(m, p1, p2) {
      return "%c" + p2 + "%c";
    },
    styles: function(match) {
      return [match[1], ""];
    }
  }
];

(formats: Array<{ styles: (m: *) => * }>);

hasMatches = function(str) {
  var _hasMatches;
  _hasMatches = false;
  formats.forEach(function(format) {
    if (format.regex.test(str)) {
      return (_hasMatches = true);
    }
  });
  return _hasMatches;
};

getOrderedMatches = function(str) {
  var matches;
  matches = [];
  formats.forEach(function(format) {
    var match;
    match = str.match(format.regex);
    if (match) {
      return matches.push({
        format: format,
        match: match
      });
    }
  });
  return matches.sort(function(a, b) {
    // $FlowFixMe
    return a.match.index - b.match.index;
  });
};

stringToArgs = function(str) {
  var firstMatch, matches, styles;
  styles = [];
  while (hasMatches(str)) {
    matches = getOrderedMatches(str);
    firstMatch = matches[0];
    str = str.replace(firstMatch.format.regex, firstMatch.format.replacer);
    styles = styles.concat(firstMatch.format.styles(firstMatch.match));
  }
  return [str].concat(styles);
};

isSafari = function() {
  return /Safari/.test(userAgent) && /Apple Computer/.test(vendor);
};

isOpera = function() {
  return /OPR/.test(userAgent) && /Opera/.test(vendor);
};

isFF = function() {
  return /Firefox/.test(userAgent);
};

isIE = function() {
  return /MSIE/.test(userAgent);
};

safariSupport = function() {
  var m;
  m = userAgent.match(/AppleWebKit\/(\d+)\.(\d+)(\.|\+|\s)/);
  if (!m) {
    return false;
  }
  return 537.38 <= parseInt(m[1], 10) + parseInt(m[2], 10) / 100;
};

operaSupport = function() {
  var m;
  m = userAgent.match(/OPR\/(\d+)\./);
  if (!m) {
    return false;
  }
  return 15 <= parseInt(m[1], 10);
};

ffSupport = function() {
  return (
    typeof window !== "undefined" &&
    (window.console.firebug || window.console.exception)
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
