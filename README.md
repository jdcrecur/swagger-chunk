# swagger-chunk

## Summary
Build and maintain large swagger API documentation files from small manageable chunks. Perfect for [Documentation-Driven Development](https://gist.github.com/zsup/9434452), and when used in conjunction with [swagger-codegen](https://swagger.io/swagger-codegen/) makes for a powerful methodology to both start and maintain any project.

## How it works
Using a combination of [json-refs](https://www.npmjs.com/package/json-refs) and [js-yaml](https://www.npmjs.com/package/js-yaml), [swagger-chunk](https://www.npmjs.com/package/swagger-chunk) combines multiple [YAML](http://yaml.org) files to output a single JSON or YAML file. 

If you are familiar with [Swagger](https://swagger.io) then you will likely be familiar with the concept of definitions (or components in v3/OpenAPI) and referencing them with `$ref` with the value in single quotes prefixed with a # for example:
 ```
 $ref: "#/definitions/Weather"
 ```

Using [swagger-chunk](https://www.npmjs.com/package/swagger-chunk) you can use the `$ref` with a value not in quotes, this tells the parser to go and fetch the contents of the referenced file (any error in syntax or bad path will throw an error). This technique allows you to break up what would otherwise be potentially 1000's of lines into smaller re-usable chunks. For exmaple:
 ```
 $ref: ./definitions/Weather.yml
 ```

## Install and use

-  Installing: 
```
npm i --save swagger-chunk
```
-  Running swagger-chunk and outputting the compiled contents to file: 
```
node node_modules/swagger-chunk -o yaml -e yml -i ./src/index.yml -D ./build/ -d weather_app_s2jsonapi
```
-  List all the options available: 
```
node node_modules/swagger-chunk/merge.js --help
```

## Examples

For a full example please view the example folder within this repo.: 

https://github.com/jdcrecur/swagger-chunk/tree/master/example

## Options for cli

```
  Options:

    -v, --version                  output the version number
    -o, --output_format [format]   The output format yaml or json
    -i, --input [path]             The relative path to the input file
    -D, --destination [path]       Path to the target
    -d, --destination_name [name]  Base name of the file
    -V, --Version [version]        The version of the file added to the file name as a suffix, defaults to the version set in the swagger file, if not then the package.json version, else an error is thrown.
    -e, --extension [ext]          The output extension, defaults to the output format if not provided.
    -h, --help                     output usage information

```

## Future thoughts
- Use programmatically
- Cleaner error output for badly formed yml