
// recursively find shared VDOM across direct children.
// if a VDOM is used in 2 different children, it means we can share its computation in contextChildren
function findChildrenDuplicates (data, toIgnore) {
  let descendantsVDOM = [];
  let descendantsVDOMData = [];
  data.children.map(child => {
    descendantsVDOM = descendantsVDOM.concat(child.descendantsVDOM);
    descendantsVDOMData = descendantsVDOMData.concat(child.descendantsVDOMData);
  });
  return descendantsVDOM.map((vdom, allIndex) => {
    if (toIgnore.indexOf(vdom) !== -1) return;
    let occ = 0;
    for (let i=0; i<data.children.length; i++) {
      if (data.children[i].descendantsVDOM.indexOf(vdom) !== -1) {
        occ ++;
        if (occ > 1) return {
          data: descendantsVDOMData[allIndex],
          vdom
        };
      }
    }
  }).filter(obj => obj);
}

module.exports = findChildrenDuplicates;
