
// normalize radian angle between -PI and PI (assuming it is not too far)
function normAngle (a) {
  return a < -Math.PI ? a + 2*Math.PI :
  a>Math.PI ? a - 2*Math.PI : a;
}

function smoothstep (min, max, value) {
  var x = Math.max(0, Math.min(1, (value-min)/(max-min)));
  return x*x*(3 - 2*x);
}

function scoreTxt (s) {
  return (s<=9?"0":"")+s;
}

function dist (a, b) {
  var x = a[0]-b[0];
  var y = a[1]-b[1];
  return Math.sqrt(x * x + y * y);
}

function length (v) {
  return Math.sqrt(v[0]*v[0]+v[1]*v[1]);
}

function circleCollides (a, b, r) {
  var x = a[0] - b[0];
  var y = a[1] - b[1];
  return x*x+y*y < r*r;
}
