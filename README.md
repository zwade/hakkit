# This is still in development. Pushed versions are mostly stable, but the APIs are experimental and subject to change. Please use at your own risk

# HakKit

HakKit is a collection of tools, similar in vein to [pwnlib](http://pwntools.readthedocs.org/) that provides a number of resources for doing security and CTF tasks. In addition to providing security related tools, HakKit has a number of utilities that make it easier to write node scripts that interact with the outside world.

Currently supported modules are:

 - [Tubes](http://zwade.github.io/hakkit/tubes)
 - [Spawners](http://zwade.github.io/hakkit/spawners)
  - Command Spawners
  - Network Spawners
  - SSH Shell Spawners
  - SSH Command Spawners
 - [File](http://zwade.github.io/hakkit/file)

Documentation is provided as well as numerous [examples](http://zwade.github.io/hakkit/examples). 

# Usage

```bash
npm install hakkit
```

```js
var hakkit = require("hakkit")
```

## Programs

```js
s = new hakkit.spawn.cmd("/bin/bash", [], "stdout", {BOO: "FOO"})
var tb = new hakkit.tube(s)
tb.interactive()
```

```bash
echo $BOO
FOO
```

## Networking

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

```text
__cfduid=d52a14e65a3e064092b72565297ee1bbc1460755116; expires=Sat, 15-Apr-17 21:18:36 GMT; path=/; domain=.dttw.tech; HttpOnly
```

## SSH

```js
s = new hakkit.spawn.ssh.cmd( {host: "unix.andrew.cmu.edu", user: "zwade" }, "cat", ["~/flag.txt"])
var tb = new hakkit.tube(s)
console.log(tb.recvline().toString())
```

```text
Password for zwade@unix.andrew.cmu.edu -
**********
flage{mush_flage_good_job}
```

