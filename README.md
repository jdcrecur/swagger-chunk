# swagger-chunk
Build swagger with chunks and write to disc.

The output will automatically pickup the version number from the swagger file, or the package.json or a number manually passed in.

Currently this must be installed locally, a global package is on the way.

Call `node node_modules/swagger-chunk/merge.js --help` file with for how to use it.

Should the merger not be able to parse a chunk an error is thrown and process exits

## Example use via the package.json
```
{
  "name": "APISwagger",
  "version": "0.5.1",
  "scripts": {
    "build:internet": "node node_modules/swagger-chunk/merge.js -o yaml -i ./src_internet/index.yml -D ./build/internet/ -d internet_swagger2_jsonapi -e yml",
  },
  "dependencies": {
    "swagger-chunk": "0.0.2"
  }
}
```
