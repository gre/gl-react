// recursively find all contents but without duplicates by comparing VDOM reference
function findContentsUniq (data) {
  const vdoms = [];
  const contents = [];
  function rec (data) {
    data.contents.forEach(content => {
      if (vdoms.indexOf(content.vdom) === -1) {
        vdoms.push(content.vdom);
        contents.push(content);
      }
    });
    data.children.forEach(child => {
      rec(child.data);
    });
  }
  rec(data);
  return contents;
}

module.exports = findContentsUniq;
