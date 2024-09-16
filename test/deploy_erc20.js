const hre = require("hardhat");
const { expect, assert } = require("chai");
const { extendConfig } = require("hardhat/config");
describe("MYERC20", () => {
    let erc20
    let deployer;
    let alice;
    let bob;
    beforeEach(async () => {
        const signers = await hre.ethers.getSigners(); // 获取当前账户的Signer对象
        deployer = signers[0];
        alice = signers[1];
        bob = signers[2];

        const MYERC20 = await hre.ethers.getContractFactory("MYERC20")
        erc20 = await MYERC20.deploy()
    })

    context("BalanceOf", async () => {
        it("After constructor balanceOf is 10000000 * (10 ** 18)", async function () {
            expect(await erc20.balanceOf(deployer)).to.eq(hre.ethers.parseEther("10000000"))
            await erc20.transfer(alice, hre.ethers.parseEther("1"))
            await erc20.transfer(bob, hre.ethers.parseEther("2"))
            expect(await erc20.balanceOf(alice)).to.eq(hre.ethers.parseEther("1"))
            expect(await erc20.balanceOf(bob)).to.eq(hre.ethers.parseEther("2"))
        })
    })

    context("Approve", async () => {
        it("Approve to other user, user transfer", async function () {
            expect(await erc20.balanceOf(deployer)).to.eq(hre.ethers.parseEther("10000000"))
            await erc20.transfer(alice, hre.ethers.parseEther("2"))
            await erc20.connect(alice).approve(bob, hre.ethers.parseEther("1"))
            await erc20.connect(bob).transferFrom(alice, bob, hre.ethers.parseEther("1"))

            expect(await erc20.balanceOf(alice)).to.eq(hre.ethers.parseEther("1"))
            expect(await erc20.balanceOf(bob)).to.eq(hre.ethers.parseEther("1"))
        })
    })
})