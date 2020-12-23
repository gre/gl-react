//@flow
const genId: () => number = ((i) => () => ++i)(0);
export default genId;
