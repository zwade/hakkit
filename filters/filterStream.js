var stream = require("stream")
var util   = require("util")

var coder = function(cfn, scope) {
	this.fn = cfn
	stream.Transform.call(this)
	this.scope = scope
}

util.inherits(coder, stream.Transform)

coder.prototype._transform = function(chunk, encoding, cb) {
	if (typeof chunk == "string") {
		throw Error("Filter passed data of type string, not buffer")
		cb(-1)
	}
	var result = this.fn.apply(this.scope, [chunk])
	if (typeof chunk == "string") {
		throw Error("Filter returns data of type string, not buffer")
		cb(-1)
	}
	cb(null, result)
}

var ioTransform = function(consumedStream) {
	this.consumedStream = consumedStream

	if (!this.decoder && !this.encoder) {
		throw Error("ioTransform needs an encoder or decoder")
	}
	if (!this.decoder) {
		this.decoder = this.encoder
	} 
	if (!this.encoder) {
		this.encoder = this.decoder
	}

	this.encoderStream = new coder(this.encoder, this)
	this.decoderStream = new coder(this.decoder, this)

}

ioTransform.prototype.spawn = function(consumingStream) {
	this.consumingStream = consumingStream

	this.consumingStream.out.pipe(this.encoderStream)
	this.decoderStream.pipe(this.consumingStream.in)

	this.consumedStream.spawn({
		in: this.decoderStream,
		out: this.encoderStream
	})

	return this.consumingStream 
}

ioTransform.prototype.pop = function() {
	return this.consumedStream
}

ioTransform.prototype.swap = function() {
	var tmp = this.encoder
	this.encoder = this.decoder
	this.decoder = tmp
	return this
}

module.exports = ioTransform
