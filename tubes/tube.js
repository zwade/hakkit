var spawn = require("child_process").spawn
var stream = require("stream")
var util = require("util")
var deasync = require("deasync")

var readline = require("readline")


var bindStream = function(binObj) {
	stream.Duplex.call (this)
	this.owner = binObj

}

util.inherits(bindStream, stream.Duplex)

bindStream.prototype._write = function (chunk, encoding, done) {
	if (this._h_write) {
		this._h_write(chunk)
	}
	done()
}

bindStream.prototype._s_handle = function(type, fn) {
	if (type == "write") this._h_write = fn
	if (type == "read")  this._h_read  = fn
}

bindStream.prototype._read = function (size) {
	if (this._h_read) {
		this._h_read(size)
	}
}

bindStream.prototype._s_write = function(data) {
	this.push(data)
}

bindStream.prototype._s_end = function() {
	this.push(null)
}

var tube = function(spawn) {	
	this.spawn = spawn
	this.stream = this.spawn.spawn(new bindStream())

	this.writebuff = new Buffer(0)

	var that = this
	this.stream._s_handle("read", function(s) {
		if (that._h_input && that._h_input instanceof Function) {
			var out = that._h_input(s)
			if (out != undefined) {
				that.sendline (out)
			}
		}
	})
	this.stream._s_handle("write", function(d) {
		if (that._h_data && that._h_data instanceof Function) {
			that._h_data(d)
		} else {
			that.writebuff = Buffer.concat([that.writebuff, d])
			if (that._h_checkData) {
				that._h_checkData()
			}
		}
	})
}

tube.prototype._h_read = function(rgx, cb) {
	var that = this
	
	var getData = function() {
		if (rgx) {
			var str = that.writebuff.toString()
			var res = str.match(rgx)
			if (res) {
				var endidx = res.index + res[0].length
				var outbuf = that.writebuff.slice(0,endidx)
				that.writebuff = that.writebuff.slice(endidx)
				cb (null,outbuf)

			}
		} else {
			var outbuf = that.writebuff
			that.writebuff = new Buffer(0)
			cb(null,outbuf)
		}
	}
	
	if (this.writebuff.length > 0) {
		getData()
	} else {
		this._h_checkData = getData
	}
}

tube.prototype.on = function(name, fn) {
	if (name === "input" || name === "read")  this._h_input = fn
	if (name === "data"  || name === "write") this._h_data  = fn
}

tube.prototype.send = function(data) {
	this.stream._s_write()
}

tube.prototype.sendline = function(data) {
	this.stream._s_write(data)
	this.stream._s_write("\n")
}

tube.prototype.close = function() {
	this.stream._s_end()
}

tube.prototype.recv = function() {
	var that = this
	return deasync(function (cb) {
		that._h_read(null,cb)
	})()
}

tube.prototype.recvuntil = function(rgx) {
	var that = this
	return deasync(function (cb) {
		that._h_read(rgx,cb)
	})()
}

tube.prototype.recvline = function() {
	var that = this
	return deasync(function (cb) {
		that._h_read(/\n/,cb)
	})()
}

tube.prototype.interactive = function() {
	var that = this
	var devnull = new stream.Writable({
		write: function(x,y, done) {
			done()
		}
	})
	function blocker(cb) {
		var rl = readline.createInterface({
			input: process.stdin,
			output: devnull
		})
		rl.on("SIGINT", function() {
			that._h_input = undefined
			that._h_data  = undefined
			process.stdout.write(that.writebuff.toString())
			that.writebuff = new Buffer(0)
			rl.close()
			cb()	
		})
		that.on("input", function() {
			that._d_prompt = true
			setTimeout(function() {
				if (that._d_prompt) {
					that._d_prompt = false
					rl.question("", function(res) {
						that.sendline(res)
					})
				}
			}, 333)
		})
		that.on("data", function(d) {
			process.stdout.write(d.toString())
			if (that._d_prompt) {
				that._d_prompt = false
				rl.question("", function(res) {
					that.sendline(res)
				})
			}
		})
		that._d_prompt = true
	}
	return deasync(blocker)()
}

module.exports = tube

