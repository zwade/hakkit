## Tubes

Tubes are abstract types that take a `spawn` stream and expose methods for reading and writing data to them. 

#### tube = new hakkit.tube (spawner)

 - `spawner` \<spawn> The spawner for this tube
 - `Returns` \<tube> The created and connected tube

#### tube.recv()

 - `Returns` \<Buffer> The received data

`tube.recv()` returns either everything stored in the receiving buffer or the next chunk of incoming data. This function *is* blocking.

#### tube.recvline() 

 - `Returns` \<Buffer> The received data

`tube.recvline()` returns a single line of data from the tube, returning everything up to and including the first newline character ("\n"). This function *is* blocking.

#### tube.recvuntil(rgx)

 - `rgx` \<RegExp> The regular expression to match on
 - `Returns` \<Buffer> The received data

`tube.recvuntil(rgx)` returns all data up until and including data matched by the regular expression rgx. This function *is* blocking.

#### tube.send(data)

 - `data` \<String | Buffer> The data to be sent through the tube
 - `Returns` \<undefined>

`tube.send(data)` transmits `data` through the tube sending and flushing it without a newline at the end. Note that while data is sent, some spawners will not recognise it without a newline ("\n") character to flush it through.

#### tube.sendline(data)
 
 - `data` \<String | Buffer> The data to be sent through the tube
 - `Returns` \<undefined>

`tube.send(data)` transmits `data` through the tube with a newline ("\n") character at the end. This is helpful for spawners that expect an entire line to be passed (such as a spawned shell)

#### tube.interactive()

 - `Returns` \<undefined>

`tube.interactive` opens up a readline REPL for whatever the current spawner is. This will allow you to interact with the tube in real time. Note, `tube.interactive` currently does not work in the Node REPL (it cannot bind to `stdin`). This function *is* blocking.

#### tube.on(evt, callback)

 - `evt` \<String> Either "input" or "data"
 - `callback` \<function> The function to be called when the event occurs
 - `Returns` \<undefined>

`tube.on("input", function(length) {...})` will call callback with the parameter `length` representing how many bytes the input is requesting. Input data can either be returned from the function, or sent via `tube.sendline`. Returnsed data will not have a new line appended to it. This function *is not* blocking. 

`tube.on("data", function(data) {...})` will call callback with the parameter `data` as a buffer representing the data transmitted out from the spawner. Since this is chunked data, there are no gauruntees made on the size of `data` or the conditions of it. This function *is not* blocking

Note, once `tube.on` has a bound handler for `data`, the blocking methods will no longer be called. Calling `tube.on("data", false)` will reset this. 


