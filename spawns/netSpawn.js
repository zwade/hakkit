var stream = require("stream")
var util = require("util")
var netr = require("net")

var net = function(addr, port) {

	this.addr = addr
	this.port = port
}

net.prototype.name = function() {
	return this.addr + ":" + this.port
}

net.prototype.error = function() {
	return (function(that) {
		return function(err) {
			if (that.options.quiet) return
			console.error ("*---------- Error in " + that.name() + ": -----------*")
			console.error (err)
		}
	})(this)
}

/* Expected to return a stream */
net.prototype.spawn = function(stream) {
	this.stream = stream
	this.child = netr.connect(this.port, this.addr) 

	this.child.pipe(this.stream)
	this.stream.pipe(this.child)

	this.child.on("error", this.error())

	return this.stream
}

module.exports = net
