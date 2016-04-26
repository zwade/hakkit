var spawn = require("child_process").spawn
var stream = require("stream")
var util = require("util")

var binary = function(cmd, args, fd, env, cwd, options) {

	/* Pull Options as the last item and makes sure it's a strict object */
	var options = (typeof options === "object") ? options : {}
	options.cwd = cwd || options.cwd
	options.env = env || options.env || undefined
	
	this.fd = fd

	this.cmd = cmd
	this.args = args
	this.options = options
}

binary.prototype.name = function() {
	return this.cmd + " " + this.args.join(" ")
}

binary.prototype.error = function() {
	return (function(that) {
		return function(err) {
			if (that.options.quiet) return
			console.error ("*---------- Error in " + that.name() + ": -----------*")
			console.error (err)
		}
	})(this)
}

/* Expected to return a stream */
binary.prototype.spawn = function(stream) {
	this.stream = stream
	this.child = spawn(this.cmd, this.args, this.options)
	this.stream.out.pipe(this.child.stdin)
	
	if (this.fd === "stderr" || this.fd === 2) {
		this.child.stderr.pipe(this.stream.in)
		if (!this.options.quiet) {
			this.child.stdout.pipe(process.stdout)
		}
	}
	if (!this.fd || this.fd === "stdout" || this.fd === 1) {
		this.child.stdout.pipe(this.stream.in)
		if (!this.options.quiet) {
			this.child.stderr.pipe(process.stderr)
		}
	}

	this.child.stdout.on("error", this.error())
	this.child.stderr.on("error", this.error())
	this.child.stdin.on("error", this.error())

	return this.stream
}

module.exports = binary
