var spawn = require("child_process").spawn
var stream = require("stream")
var util = require("util")
var fs = require("fs")
var deasync = require("deasync")

var file = function(filepath, mode, enc) {
	this.filepath = filepath
	this.enc = enc
	this.modes = []
	mode = mode || "r"
	
	for (var i = 0; i < mode.length; i++) {
		switch (mode[i]) {
			case "r":
			case "R":
				this.modes.push("r")
				break;
			case "w":
			case "W":
				this.modes.push("w")
				break;
			case "a":
			case "A":
				this.modes.push("a")
				break
		}
	}

	this.active = false
	this.empty = false
}

file.prototype.name = function() {
	return this.filepath
}

file.prototype.error = function() {
	return (function(that) {
		return function(err) {
			if (that.options && that.options.quiet) return
			console.error ("*---------- Error in " + that.name() + ": -----------*")
			console.error (err)
		}
	})(this)
}

file.prototype._createStream = function() {
	if (this.active) return
	this.active = true
	
	if (this.modes.indexOf("r") >= 0) {
		this.readable = fs.createReadStream(this.filepath, {
			flags: "r",
		})
		this.readable._h_readable = false
	}

	if (this.modes.indexOf("a") >= 0) {
		this.writable = fs.createWriteStream(this.filepath, {
			flags: "a+",
		})
	} else if (this.modes.indexOf("w") >= 0 && this.modes.indexOf("r") < 0) {
		this.writable = fs.createWriteStream(this.filepath, {
			flags: "w+",
		})
	}
}

file.prototype.read = function(i) {
	if (this.modes.indexOf("r") < 0) return false
	if (this.stream) return false
	
	var that = this

	this._createStream()

	var wait_read = function(cb) {
		if (that.empty) {
			cb(null, new Buffer(0))
			return
		}
		var read = i
		var readBuff = new Buffer(0)
		var readHandle = function () {
			var buff = that.readable.read(read)
			while (buff != null) {
				if (read != undefined && buff.length > read) {
					that.error()("readable.read returned more data than requested. Some data may have been lost")
					that.readable.removeListener("readable", readHandle)
					cb(null, false)
				}
				if (read != undefined && buff.length == read) {
					that.readable.removeListener("readable", readHandle) 
					cb(null, Buffer.concat([readBuff, buff]))
				} else {
					readBuff = Buffer.concat([readBuff, buff])	
				}
				if (read) {
					read -= buff.length
				}
				buff = that.readable.read(read)
			}
		}
		that.readable.on("readable", readHandle) 
		readHandle()
		that.readable.on("end", function () {
			that.empty = true
			cb(null, readBuff)
		})
	}
	var out = deasync(wait_read)()
	if (this.enc) {
		return out.toString(this.enc)
	} else {
		return out
	}
}

file.prototype.write = function(data) {
	if (this.modes.indexOf("w") < 0 &&
	    this.modes.indexOf("a") < 0) return false
	if (this.stream) return false

	if (! (data instanceof Buffer)) {
		if (typeof data == "string") {
			if (!this.enc) {
				data = Buffer.from(data, "utf8")
			} else {
				data = Buffer.from(data, this.enc)
			}
		} else {
			data = new Buffer(data)
		}
	}

	var that = this
	this._createStream()

	var write = function(cb) {
		that.writable.write(data, that.enc, cb)
	}

	return deasync(write)()
	
}

file.prototype.spawn = function(stream) {
	this.stream = stream
	this._createStream()

	if (this.writable) {
		this.stream.pipe(this.writable)
		this.writable.on("error", this.error())
	}
	if (this.readable) {
		this.readable.pipe(this.stream)
		this.readable.on("error", this.error())
	}

	return this.stream
}

module.exports = file
