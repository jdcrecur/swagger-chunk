# swagger-chunk

## Summary
Swagger is becoming the defacto api documentation tool, swagger files though do have a tendency of growing wildly large and hard to maintain.

Swagger-chunk allows you to build and maintain large swagger API documentation files from small manageable chunks, importing and re-using. Perfect for [Documentation-Driven Development](https://gist.github.com/zsup/9434452), and when used in conjunction with [swagger-codegen](https://swagger.io/swagger-codegen/) makes for a powerful methodology to both start and maintain any project.

## Examples
For a full example please view the example folder within the swagger-chunk repo.: https://github.com/jdcrecur/swagger-chunk/tree/master/example

## How it works
Using a combination of [json-refs](https://www.npmjs.com/package/json-refs) and [js-yaml](https://www.npmjs.com/package/js-yaml), [swagger-chunk](https://www.npmjs.com/package/swagger-chunk) combines multiple [YAML](http://yaml.org) files to output a single JSON or YAML file. 

Swagger-chunk will automatically extract the swagger version number from the parsed yml and append to the file name produced, helping ensure little confusion when publishing changes to your API swagger documentation.

If you are familiar with [Swagger](https://swagger.io) then you will likely be familiar with the concept of definitions (or components in v3/OpenAPI) and referencing them with `$ref` with the value in single quotes prefixed with a # for example:
 ```
 $ref: "#/definitions/Weather"
 ```

Using [swagger-chunk](https://www.npmjs.com/package/swagger-chunk) you can use the `$ref` feature's value as a path to another yml file, swagger-chunk will try to fetch the contents of the path and inject into the file. This technique allows you to break up what would otherwise be potentially 1000's of lines into smaller re-usable chunks. For example:
 ```
 $ref: ./definitions/Weather.yml
 ```

## Joining multiple paths

Swagger/OpenAPI definition does not allow paths to be merged from an array using the allOf keywords. For example the folowoing will fail:
```
/event/{eventId}/contests/:

  allOf:

    - $ref: ./contests/index.read.yml

    - $ref: ./contests/index.write.yml
```

However, using swagger-chunk you can. The above will automatically fetch and inject the contents into paths leaving the above looking like:
```
/event/{eventId}/contests/:
    get:
        .... content
    post:
        .... content
    put:
        .... content
    delete:
        .... content
```

This allows you to share resource in your swagger-chunk repo.


## Install and use locally via cli
Installing: 
```
npm i --save swagger-chunk
```

Running swagger-chunk and outputting the compiled contents to file (typically you would add this to a script in your package.json file): 
```
node node_modules/swagger-chunk -o yaml -e yml -i ./src/index.yml -D ./build/ -d weather_app_s2jsonapi
```

The following options are available, made easily possible by [commander](https://www.npmjs.com/package/commander)
```
  Options:

    -v, --version                  output the version number
    -o, --output_format [format]   The output format yaml or json
    -i, --input [path]             The relative path to the input file
    -D, --destination [path]       Path to the target
    -d, --destination_name [name]  Base name of the file
    -V, --Version [version]        The version of the file added to the file name as a suffix, defaults to the version set in the swagger file, if not then the package.json version, else an error is thrown.
    -e, --extension [ext]          The output extension, defaults to the output format if not provided.
    --init                         Inject a skeleton yml structure to the current directory named /src/...    
    -h, --help                     output usage information

```

For an example use of the command line, please view the [example](https://github.com/jdcrecur/swagger-chunk/tree/master/example) `package.json` file.


## Use programmatically
Command line use is essentially an abstraction to the actual SwaggerChunk class, all the parameters available for cli are available via methods.

You have the option to import the es6 class or the es5 commonJS module.

For an example use of the pragmatical use, please view the [example](https://github.com/jdcrecur/swagger-chunk/tree/master/example) `package.json` file.


## Globally installed command line
You can optionally install and use swagger-chunk as a globally installed npm package, doing so is handy for lots of command line use. It is generally advised though to use a locally installed to the project version. This will prevent future updates breaking things.

To install swagger-chunk globally:
```
npm install -g swagger-chunk
```

Using swagger chunk globally is just the same as from locally, for an example please view the [example](https://github.com/jdcrecur/swagger-chunk/tree/master/example) `package.json` file'd scripts.

## Install skeleton swagger-chunk files
You can kick start your swagger documentation code base by running the below command. The command will result in a new sub directory from the `current working directory` the command is run from:

From locally installed:
```
node node_modules/swagger-chunk --init
```

From globally installed:
```
swagger-chunk --init
```

## Future thoughts
- Cleaner error output for badly formed yml.
