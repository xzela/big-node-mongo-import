# Big Data Import!

simple test to import a million records into a mongodb using node

## Generate Data

You need a data file. Run the following command to generate the `test.json` json file.

```
	$ node generate-data.js
```

If you would like to customize the data file you can do so by adding the following command line arguments: `--size` and `--filename`

* `--size` specifies the number of documents to create. default value is `1000000`.
* `--filename` specifies a filename for the data document. default value is `test.json`.

## Import the Data

What the magic happen!
```
	$ node index.js
```

If you have customized the data file, use the following command line arguments: `--filename`
