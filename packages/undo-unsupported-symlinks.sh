cd `dirname $0`

cd tests
rm -f node_modules/gl-react node_modules/gl-react-headless
npm i ../gl-react ../gl-react-headless
cd -

cd cookbook-expo
rm -f node_modules/gl-react node_modules/gl-react-expo
npm i ../gl-react ../gl-react-expo
cd -
