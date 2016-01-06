module.exports = (props, context) => ({
  ...props,
  width: "width" in props ? props.width : context.width,
  height: "height" in props ? props.height : context.height,
  pixelRatio: "pixelRatio" in props ? props.pixelRatio : context.pixelRatio
});
