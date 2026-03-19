const genId: () => number = ((i: number) => () => ++i)(0);
export default genId;
