const hre = require("hardhat")
const { getContractAddress, setContractAddress } = require("../utils")
async function main() {
    const MYERC721 = await hre.ethers.getContractFactory("MYERC721")
    const erc721 = await MYERC721.deploy()
    setContractAddress(hre.network.name, "MYERC721", erc721.target)
}


main().then(() => { process.exit(0) }).catch(err => {
    console.log(err)
    process.exit(-1)
})