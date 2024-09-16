const hre = require("hardhat");
const { expect, assert } = require("chai");

describe("MYERC721", () => {
    let erc721
    let deployer
    let alice
    beforeEach(async () => {
        const MYERC721 = await hre.ethers.getContractFactory("MYERC721")
        erc721 = await MYERC721.deploy()

        let signers = await hre.ethers.getSigners()
        deployer = signers[0]; // 获取当前账户的Signer对象
        alice = signers[0]; // 获取当前账户的Signer对象
    })

    context("BalanceOf", async () => {
        it("After constructor balanceOf is 1", async function () {
            expect(await erc721.balanceOf(deployer)).to.eq(1)
        })
    })

    context("OwnerOf", async () => {
        it("The nft id's OwnerOf is deployer", async function () {
            expect(await erc721.ownerOf(0)).to.eq(deployer)
        })
    })

    context("TransferFrom", async () => {
        it("TransferFrom NFT to alice", async function () {
            await erc721.transferFrom(deployer, alice, 0)
            expect(await erc721.balanceOf(alice)).to.eq(1)
        })
    })
})