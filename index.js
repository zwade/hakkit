module.exports = {
	spawn: {
		cmd   : require("./spawns/binarySpawn"),
		net   : require("./spawns/netSpawn"),
		ssh   : require("./spawns/sshSpawn"),
	},
	tube: require("./tubes/tube")
}
