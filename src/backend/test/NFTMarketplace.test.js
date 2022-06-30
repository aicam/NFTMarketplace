const {expect} = require('chai');
const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)


describe("NFTMarketplace", () => {
    let deployer, marketplace, nft, addr1, addr2;
    beforeEach(async () => {
        const Marketplace = await ethers.getContractFactory("Marketplace");
        const NFT = await ethers.getContractFactory("NFT");

        [deployer, addr1, addr2] = await ethers.getSigners();
        marketplace = await Marketplace.deploy(1);
        nft = await NFT.deploy();
    });
    describe("Deployment ", () => {
        it("Track NFT name & symbol", async () => {
            expect(await nft.name()).to.equal("DApp NFT");
            expect(await nft.symbol()).to.equal("DAPP")
        });
        it("Track feePercent and feeAccount ", async () => {
            console.log("deployaer value ",deployer.value);
            expect(await marketplace.feeAccount()).to.equal(deployer.address);
            expect(await marketplace.feePercent()).to.equal(1);
        });
    });

    let URI="12";
    describe("Minting NFT", () => {
        it("Track minting process", async () => {
            await nft.connect(addr1).mint(URI);
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);
        })
    })
    describe("Making marketplace item", () => {
        beforeEach(async function () {
            // addr1 mints an nft
            await nft.connect(addr1).mint(URI)
            // addr1 approves marketplace to spend nft
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true)

        })
        it("Track newly created item, transfer NFT from seller marketplace and emit Offered event", async () => {
            await expect(marketplace.connect(addr1).makeItem(nft.address, 1 , toWei(1)))
                .to.emit(marketplace, "Offered")
                .withArgs(
                    1,
                    nft.address,
                    1,
                    toWei(1),
                    addr1.address
                )
            // New Owner
            expect(await nft.ownerOf(1)).to.equal(marketplace.address);
            // Check item
            const item = await marketplace.items(1);
            expect(item.itemId).to.equal(1);
            expect(item.nft).to.equal(nft.address);
            expect(item.tokenId).to.equal(1);
            expect(item.price).to.equal(toWei(1));
            expect(item.sold).to.equal(false);
        });
    })

    describe("Purchasing marketplace items", function () {
        let price = 2
        let fee = (1/100)*price
        let totalPriceInWei
        beforeEach(async function () {
            // addr1 mints an nft
            await nft.connect(addr1).mint(URI)
            // addr1 approves marketplace to spend tokens
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
            // addr1 makes their nft a marketplace item.
            await marketplace.connect(addr1).makeItem(nft.address, 1 , toWei(price))
        })

        it("Should fail for invalid item ids, sold items and when not enough ether is paid", async function () {
            // fails for invalid item ids
            const totalPriceInWei = await marketplace.getTotalPrice(1);
            await expect(
                marketplace.connect(addr2).purchaseItem(2, {value: totalPriceInWei})
            ).to.be.revertedWith("item doesn't exist");
            await expect(
                marketplace.connect(addr2).purchaseItem(0, {value: totalPriceInWei})
            ).to.be.revertedWith("item doesn't exist");
            // Fails when not enough ether is paid with the transaction.
            // In this instance, fails when buyer only sends enough ether to cover the price of the nft
            // not the additional market fee.
            await expect(
                marketplace.connect(addr2).purchaseItem(1, {value: toWei(1)})
            ).to.be.revertedWith("not enough ether to cover item price and market fee");
            // addr2 purchases item 1
            await marketplace.connect(addr1).purchaseItem(1, {value: totalPriceInWei})
            // addr3 tries purchasing item 1 after its been sold
            const addr3 = addr1
            await expect(
                marketplace.connect(addr3).purchaseItem(1, {value: totalPriceInWei})
            ).to.be.revertedWith("item already sold");
        });
    });

})