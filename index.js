module.exports = {
	spawns: {
		binary: require("./spawns/binarySpawn"),
		net   : require("./spawns/netSpawn"),
		ssh   : require("./spawns/sshSpawn"),
	},
	tube: require("./tubes/tube")
}
