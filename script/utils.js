const fs = require("fs")
const path = require("path")

function getContractAddress() {
    let json
    try {
        json = fs.readFileSync(path.join(__dirname, "../deployments/contract_address.json"))
    } catch (error) {
        json = "{}"
    }
    return JSON.parse(json)
}

function setContractAddress(network, contract, address) {
    const addrs = getContractAddress()
    addrs[network] = addrs[network] || {}
    addrs[network][contract] = address;
    fs.writeFileSync(path.join(__dirname, "../deployments/contract_address.json"), JSON.stringify(addrs, null, '    '))
}

module.exports = {
    getContractAddress,
    setContractAddress
}