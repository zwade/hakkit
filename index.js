module.exports = {
	spawn: {
		cmd   : require("./spawns/binarySpawn"),
		net   : require("./spawns/netSpawn"),
		ssh   : require("./spawns/sshSpawn"),
	},
	file: require("./file/file"),
	tube: require("./tubes/tube"),
	filter: {
		grep: require("./filters/grep"),
		hex: require("./filters/hexFilter"),
	}
}
