const hre = require("hardhat");
const { expect } = require("chai");

describe("DutchAuction", () => {
    let erc20
    let aution
    let erc721
    let startTime;
    let endTime;
    let deployer
    let alice;
    const descentRate = 100
    const startPrice = hre.ethers.parseEther("1000")

    beforeEach(async () => {
        const MYERC20 = await hre.ethers.getContractFactory("MYERC20")
        const MYERC721 = await hre.ethers.getContractFactory("MYERC721")
        const DutchAuction = await hre.ethers.getContractFactory("DutchAuction")

        erc20 = await MYERC20.deploy()
        erc721 = await MYERC721.deploy()
        aution = await DutchAuction.deploy()

        let signer = await hre.ethers.getSigners(); // 获取当前账户的Signer对象
        deployer = signer[0];
        alice = signer[1];

        startTime = (await hre.ethers.provider.getBlock('latest')).timestamp + 60
        endTime = startTime + 60 * 60 * 24 * 5
        await aution.addAuction(
            deployer,
            erc721,
            0,
            erc20,
            hre.ethers.parseEther("1000"),
            startTime,
            endTime,
            descentRate)
        await erc721.approve(aution.target, 0);
        await erc20.transfer(alice, hre.ethers.parseEther('10000'))
    })

    context("Auction Length", async () => {
        it("After Add Auction length should be 1", async function () {
            erc721.approve(aution.target, 0)
            expect(await aution.getAuctionsLength()).to.eq(1)
        })
    })

    context("Cancel Auction", async () => {
        it("Cancel Auction before start timestamp should be success", async function () {
            await aution.cancelAuction(0)
            let timestamp = (await hre.ethers.provider.getBlock('latest')).timestamp
            let autions = await aution.getAutionsItems()
            expect(autions[0].endTimestamp).to.eq(timestamp)
        })
    })

    context("Buy", async () => {
        it("Buy Nft before start timestamp", async function () {
            const price = await aution.getCurrentPrice(0)
            await expect(aution.buy(0, price)).to.be.revertedWith('_startTimestamp < now')
        })
        it("Buy nft in bound", async function () {
            const startBuyTime = startTime + 3 * 24 * 60 * 60;
            await ethers.provider.send('evm_setNextBlockTimestamp', [startBuyTime]); // 30 seconds before endTimestamp
            await ethers.provider.send('evm_mine', []); // Mine a block to apply the new timestamp

            const deployer_balanceBeforSales = await erc20.balanceOf(deployer)

            let price = await aution.getCurrentPrice(0);
            const time = (await hre.ethers.provider.getBlock('latest')).timestamp
            expect(price).to.eq(startPrice - BigInt(time - startTime) * BigInt(descentRate))

            erc20.connect(alice).approve(aution.target, price)
            await aution.connect(alice).buy(0, price);
            expect(await erc721.balanceOf(alice)).to.eq(1)
            expect(await erc20.balanceOf(deployer)).to.eq(deployer_balanceBeforSales + price)
        })

        it("Buy nft at auction end", async function () {
            await ethers.provider.send('evm_setNextBlockTimestamp', [endTime + 3 * 24 * 60 * 60]); // 30 seconds before endTimestamp
            await ethers.provider.send('evm_mine', []); // Mine a block to apply the new timestamp
            await expect(aution.getCurrentPrice(0)).to.be.revertedWith('aution end')
            await expect(aution.buy(0, hre.ethers.parseEther("10000"))).to.be.revertedWith('aution end')
        })
    })

    context("GetPrice", async () => {
        it("GetPrice before start", async function () {
            expect(await aution.getCurrentPrice(0)).to.eq(startPrice)
        })

        it("GetPrice after start", async function () {
            await ethers.provider.send('evm_setNextBlockTimestamp', [startTime + 3 * 24 * 60 * 60]); // 30 seconds before endTimestamp
            await ethers.provider.send('evm_mine', []); // Mine a block to apply the new timestamp

            let price = await aution.getCurrentPrice(0);
            const time = (await hre.ethers.provider.getBlock('latest')).timestamp
            expect(price).to.eq(startPrice - BigInt(time - startTime) * BigInt(descentRate))
        })

        it("GetPrice after end", async function () {
            await ethers.provider.send('evm_setNextBlockTimestamp', [endTime + 3 * 24 * 60 * 60]); // 30 seconds before endTimestamp
            await ethers.provider.send('evm_mine', []); // Mine a block to apply the new timestamp
            await expect(aution.getCurrentPrice(0)).to.be.revertedWith('aution end')
        })
    })
})
