---
layout: index
---

# HakKit

HakKit is a collection of tools, similar in vein to [pwnlib](http://pwntools.readthedocs.org/) that provides a number of resources for doing security and CTF tasks.

Currently supported modules are:

 - Tubes
  - Command Tubes
  - Network Tubes
  - SSH Tubes
    - Shell
    - Commands


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

## Spawners

Spawners are a type of stream that connects the input and output data for a stream and abstracts it to a common interfaces. Spawners are used by a tube to handle communications with other processes.

### Command Spawner

A command spawner launches an application or binary program and binds itself to the output and input. 

#### new hakkit.spawn.cmd(cmd, \<args>, \<fd>, \<env>, \<cwd>, [options])

 - `cmd` \<String>  The command to run. This is relative to the path node is being run from
 - `args` \<String Array> (`[]`) Arguments to be passed to the binary
 - `fd` \<File Descriptor> (`1 | "stdout"`) The file descriptor from which to read output. May be 1 ("stdout") or 2 ("stderr"). The non bound descriptor will be piped to system.stdout. 
 - `env` \<Object> (Current Environment) The object representing the environment in which to run `cmd`
 - `cwd` \<String> (`"."`) The directory that `cmd` should be run from.
 - `options` \<Object> (`{}`) Any options to be passed to `child_process.exec`. Options can be passed in any index as long as it is the last argument
 - `Returns` \<Spawner> The newly created spawner

`new hakkit.spawn.cmd(cmd, args, fd, env, cwd, options)` will create a new process with the given options and pipe its output into a tube

### Network Spawner

A network spawner connects to a remote TCP server and streams data between the server and the tube

#### new hakkit.spawn.net(address, port)

 - `address` \<String> The hostname of the remote server
 - `port` \<int> The value of the remote port
 - `Returns` \<Spawner> The newly created spawner

`new hakkit.spawn.net(address, port)` will create a new TCP connection to `address:port` and stream incoming and outgoing data through it

### SSH Spawner

An SSH spawner uses SSH to either connect a remote shell on a server, or to execute a binary on it

#### Credentials {user, \<password>, \<privateKey>, \<host>, \<port>}

 - `user` \<String> The username to use when connecting
 - `password` \<String> The password to use when authenticating
 - `privateKey` \<String> The file path to the private key to use for authentication
 - `host` \<String> (`"127.0.0.1"`) The remote host to connect to
 - `port` \<int> (`22`) The remote port to connect to

SSH credentials take the form of an object with a mandatory `user` field, and any of the other four options. If neither `password` nor `privateKey` are provided, then hakkit will prompt the user to input a password for authentication.

#### new hakkit.spawn.ssh.cmd(creds, cmd, \<args>, \<env>)

 - `creds` \<Credentials> The credentials to be used for authentication
 - `cmd` \<String> The command that should be run on the remote server
 - `args` \<String Array> (`[]`) An array of arguments to be passed to the command
 - `env` \<String> (Current Environment) An object consisting of the environment to run the command in
 - `Returns` \<Spawner> The newly created spawner

`new hakkit.spawn.ssh.cmd(creds, cmd, args, env)` will create an SSH connection to `creds.host:creds.port` and run the command `cmd args` in the environment specified by `env`. Unlike with `hakkit.spawn.cmd`, both `STDOUT` and `STDIN` will be piped out of the tube.  

#### new hakkit.spawn.ssh.shell(creds)

 - `creds` \<Credentials> The credentials to be used for authentication
 - `Returns` \<Spawner> The newly created spawner

`new hakkit.spawn.ssh.shell(creds)` will create an SSH connection to `creds.host:creds.port` and open a shell. This can be used for running multiple commands in succession. Note, all output from the shell will be piped through the tube, including all data presented in the new command prompt. As such, it is recommended to use `tube.recv()` to flush unwanted output before running a new command.  

===================

# Examples

## Tubes and Spawners

Here are a few examples of how to use tubes and spawners together to provide easy interface with applications

### hakkit.spawn.cmd

```js
s = new hakkit.spawn.cmd("cat", [], "stdout")
var tb = new hakkit.tube(s)

count = 0
tb.on("input", function() {
	if (count < 5) {
		tb.count++
		return `Hello World ${tb.count}` 
	} else if (count == 5) {
		setTimeout(function() {
			tb.sendline("Done!")
			tb.close()
		}, 1000)
		count ++
	}
})

console.log(`1. ${tb.recvline().toString()}`)
console.log(`2. ${tb.recvuntil(/[3-6]\n/).toString()}`)
tb.sendline("Hiya!")
console.log(`3. ${tb.recv().toString()}`)
console.log(`4. ${tb.recv().toString()}`)
console.log(`5. ${tb.recv().toString()}`)
```

will output the following

```text
1. Hello World 1

2. Hello World 2
Hello World 3

3. Hello World 4
Hello World 5

4. Hiya!

5. Done!
```

Another example, using `tb.interactive`

```js
s = new hakkit.spawn.cmd("/bin/bash", [], "stdout", {BOO: "FOO"})
var tb = new hakkit.tube(s)
tb.interactive()
```

Which will open a prompt that allows you to run

```bash
echo $BOO
FOO
```

### hakkit.spawn.net

```js
s = new hakkit.spawn.net("dttw.tech", 80) 

var tb = new hakkit.tube(s)

tb.sendline("GET / HTTP/1.1")
tb.sendline("Host: dttw.tech")
tb.sendline()

tb.recvuntil(/Set-Cookie:/)
console.log(tb.recvline().toString())

tb.close()
```

will fetch the cookie header from an http request, printing out

```text
__cfduid=d52a14e65a3e064092b72565297ee1bbc1460755116; expires=Sat, 15-Apr-17 21:18:36 GMT; path=/; domain=.dttw.tech; HttpOnly
```

### hakkit.spawn.ssh.cmd

```js
s = new hakkit.spawn.ssh.cmd( {host: "unix.andrew.cmu.edu", user: "zwade" }, "cat", ["~/flag.txt"])
var tb = new hakkit.tube(s)
console.log(tb.recvline().toString())
```

will first prompt for a password and then print out the read file


```text
Password for zwade@unix.andrew.cmu.edu -
**********
flage{mush_flage_good_job}
```

### hakkit.spawn.ssh.shell

```js
s = new hakkit.spawn.ssh.shell({user: "zacharywade", privateKey: "/Users/zacharywade/.ssh/id_rsa"})
var tb = new hakkit.tube(s)
tb.interactive()
```

will open a shell on the local machine allowing you to interact with it as

```bash
>>> whoami
zacharywade
```

