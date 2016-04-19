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


