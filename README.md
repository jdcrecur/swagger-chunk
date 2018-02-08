# swagger-chunk

## Summary
Build and maintain large swagger API documentation files from small manageable chunks.

## How it works
Using a combination of [json-refs](https://www.npmjs.com/package/json-refs) and [js-yaml](https://www.npmjs.com/package/js-yaml), [swagger-chunk](https://www.npmjs.com/package/swagger-chunk) combines multiple [YAML](http://yaml.org) files to output a single JSON or YAML file. 

If you are familiar with [Swagger](https://swagger.io) then you will likely be familiar with the concept of definitions and referencing them with `$ref` for example:
 ```
 $ref: "#/definitions/Weather"
 ```

Enclosing the ref in quotes prefixing with a # tells swagger to search for the reference within the same document. Using [swagger-chunk](https://www.npmjs.com/package/swagger-chunk) you can use the `$ref` with a value not in quotes, you are able to reference other files. This technique allows you to break up what would otherwise be potentially 1000's of lines into smaller re-usable chunks.



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
