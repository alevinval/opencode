bun install
./packages/opencode/script/build.ts --single
target=$(which opencode)
rm $target
ln -s "$PWD/packages/opencode/dist/opencode-darwin-arm64/bin/opencode" $target
