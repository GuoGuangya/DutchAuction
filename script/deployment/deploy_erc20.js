const hre = require("hardhat")
const { getContractAddress, setContractAddress } = require("../utils")
async function main() {
    const MYERC20 = await hre.ethers.getContractFactory("MYERC20")
    const erc20 = await MYERC20.deploy()
    setContractAddress(hre.network.name, "MYERC20", erc20.target)
}


main().then(() => { process.exit(0) }).catch(err => {
    console.log(err)
    process.exit(-1)
})