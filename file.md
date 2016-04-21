---
layout: index
---


## File Stream

A file stream is a special kind of stream that reads in a file and provides data as a stream to the receiving device. Since file data is streamed, it can handle large files, even when using the synchronous access methods. 

#### file = new hakkit.file(path, \<access>, \<encoding>)

 - `path` \<String> The path pointing to the file to read
 - `access` \<String> (`"r"`) The read/write access for the file. May be **r**ead, **w**rite, **a**ppend, or **ra** for read and append.
 - `encoding` \<Buffer.encoding> (`"utf8"`) The encoding for processing the data. Note, this is only used for the synchronous access methods

`new hakkit.file(path, access, encoding)` will create a new stream source with the given parameters that can *either* be passed to a tube or accessed via the `file.read` and `file.write` methods.

#### file.read(\<size>)

 - `size` \<int> (`all`) The number of bytes to read from the file. If `size` is not provided, `file.read` will return the entire file. 
 
`file.read(size)` will return `size` bytes of data from the file. This data will be streamed, so unless called with no paramters, `file.read` will only load as much data from the file as necessary. The representation of the data is specified by `encoding` in the constructor, so if `hex` is passed as encoding, `file.read` will return a hexedecimal string. This will return `false` if it fails. 

#### file.write(data)

 - `data` \<Buffer\|String\|byte Array> The data to be written to the file. 
 
`file.write(data)` will write data to the file. If passed as a buffer, the data will be written as-is. If passwed as a byte Array, the data will be converted to a buffer and written to a file. If passed as a string, the data will be decoded using `encoding` and written to the file. This will return `false` if it fails. 
