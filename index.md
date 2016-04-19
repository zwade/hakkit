---
layout: index
---


# HakKit

HakKit is a collection of tools, similar in vein to [pwnlib](http://pwntools.readthedocs.org/) that provides a number of resources for doing security and CTF tasks. In addition to providing security related tools, HakKit has a number of utilities that make it easier to write node scripts that interact with the outside world.

Currently supported modules are:

 - [Tubes](http://zwade.github.io/tubes)
 - [Spawners](http://zwade.github.io/spawners)
  - Command Spawners
  - Network Spawners
  - SSH Shell Spawners
  - SSH Command Spawners

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

