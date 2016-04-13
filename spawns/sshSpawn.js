var stream = require("stream")
var util = require("util")
var ssh2 = require("ssh2").Client
var deasync = require("deasync")
var fs = require("fs")
var readline = require("readline")



var genSSH = {
	init: function(creds) {
		this.addr = creds.host || "127.0.0.1"
		this.port = creds.port || 22
		var that = this
		if (creds && creds.user) {
			if (!(creds.password || creds.privateKey)) {
				var passwordStream = new stream.Writable({
					write: function(chunk, encoding, done) {
						for (var i = 0; i < chunk.length; i++) {
							if (chunk[0] == 0x1b) {
								process.stdout.write(chunk)
							} else if (chunk[i] == "\n") {
								process.stdout.write("\n")
							} else {
								process.stdout.write("*")
							}
						}
						done()
					}
				})			
				var rl = readline.createInterface({
					input: process.stdin,
					output: passwordStream,
					terminal: true
				})
				var inquire = function(cb) {
					process.stdout.write("Password for "+creds.user+"@"+that.addr+" -\n")
					rl.question("", function(pass) {
						cb(null, pass)
					})
				}
				creds.pass = deasync(inquire)()
				rl.close()
				process.stdout.write("\n")
			}
		} else {
			throw new Error("Missing SSH Credentials")
		}

		this.creds = creds
	},

	name: function() {
		return this.addr + ":" + this.port
	},

	error: function() {
		return (function(that) {
			return function(err) {
				if (that.options.quiet) return
				console.error ("*---------- Error in " + that.name() + ": -----------*")
				console.error (err)
			}
		})(this)
	},

	connect: function() {
		this.child = new ssh2()

		var params = {
			host: this.addr,
			port: this.port,
			username: this.creds.user
		}
		if (this.creds.pass) {
			params.password = this.creds.pass
		} else if (this.creds.privateKey) {
			params.privateKey = fs.readFileSync(this.creds.privateKey) 
		} else {
			throw new Error("Error Loading Credentials")
		}


		var that = this
		var connect = function(cb) {
			that.child.on("ready", function () {
				cb()
			})
			that.child.connect(params)
		}

		deasync(connect)()
	}
}

var sshShell = function() {
	this.init.apply(this, arguments)
}

sshShell.prototype = Object.create(genSSH)

sshShell.prototype.spawn = function(stream) {
	var that = this
	this.stream = stream
	this.connect()
	this.shellStream = deasync(function (cb) {
		that.child.shell(cb)
	})()

	this.stream.pipe(this.shellStream)
	this.shellStream.pipe(this.stream)

	this.shellStream.on("error", this.error())

	return this.stream
}

var sshCmd = function(creds, cmd, args, env) {
	this.init.apply(this,[creds])

	this.cmd = cmd
	this.args = args
	this.env = env
}

sshCmd.prototype = Object.create(genSSH)

sshCmd.prototype.spawn = function(stream) {
	var that = this
	this.stream = stream

	this.connect()
	this.shellStream = deasync(function (cb) {
		that.child.exec(that.cmd + " " + that.args.join(" "), {env: that.env, pty: true}, cb)
	})()

	this.shellStream.pipe(this.stream)
	this.stream.pipe(this.shellStream)

	this.shellStream.on("error", this.error())

	return this.stream
}

module.exports = {
	shell: sshShell,
	cmd: sshCmd
}
