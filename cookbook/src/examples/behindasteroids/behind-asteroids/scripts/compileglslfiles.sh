
if [ "$#" -ne 2 ]; then
  echo "Invalid arguments. Usage: $0 fromDir toDir" >&2;
  exit 1;
fi;
if [ "$1" == "$2" ]; then
  echo "fromDir and toDir must be different" >&2;
  exit 2;
fi;
if [ ! -d "$1" ]; then
  echo "fromDir must be a directory" >&2;
  exit 3;
fi;
if [ ! -d "$2" ]; then
  echo "toDir must be a directory" >&2;
  exit 4;
fi;

for glsl in $1/*.frag $1/*.vert; do
  name=`basename $glsl`;
  cat $glsl | glslmin > $2/$name;
done;
