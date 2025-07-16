const { run } = require("hardhat")

async function verify(contractAddress, args) { // In this case args are empty because SimpleStorage.sol has no constructure
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }

}

module.exports = {verify}