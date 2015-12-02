
function uniqImages (arr) {
  var uris = [];
  var coll = [];
  arr.forEach(function (item) {
    if (uris.indexOf(item.uri) === -1) {
      uris.push(item.uri);
      coll.push(item);
    }
  });
  return coll;
}

module.exports = uniqImages;
