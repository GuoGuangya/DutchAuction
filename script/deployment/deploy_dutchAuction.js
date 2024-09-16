const hre = require("hardhat")
const { getContractAddress, setContractAddress } = require("../utils")
async function main() {
    const DutchAuction = await hre.ethers.getContractFactory("DutchAuction")
    const aution = await DutchAuction.deploy()
    setContractAddress(hre.network.name, "DutchAuction", aution.target)

    const erc20_contract = await hre.ethers.getContractAt("MYERC20", getContractAddress()[hre.network.name]["MYERC20"])
    const erc721_contract = await hre.ethers.getContractAt("MYERC721", getContractAddress()[hre.network.name]["MYERC721"])

    let date = new Date();

    const [deployer] = await hre.ethers.getSigners(); // 获取当前账户的Signer对象

    aution.addAuction(
        deployer,
        erc721_contract,
        0,
        erc20_contract,
        1000 * 10 ** 18,
        Math.floor(date.getTime()) / 1000 + 120,
        Math.floor(date.getTime()) / 1000 + 120 + 60 * 60 * 24 * 5,
        100)
    erc721_contract.approve(aution.target, 0)
}


main().then(() => { process.exit(0) }).catch(err => {
    console.log(err)
    process.exit(-1)
})