const {expect} = require('chai');
const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)


describe("NFTMarketplace", () => {
    let deployer, marketplace, nft, addr2;
    beforeEach(async () => {
        const Marketplace = await ethers.getContractFactory("Marketplace");
        const NFT = await ethers.getContractFactory("NFT");

        [deployer, addr2] = await ethers.getSigners();
        marketplace = await Marketplace.deploy(1);
        nft = await NFT.deploy();
    });
    describe("Deployment ", () => {
        it("Track NFT name & symbol", async () => {
            expect(await nft.name()).to.equal("DApp NFT");
            expect(await nft.symbol()).to.equal("DAPP")
        });
        it("Track feePercent and feeAccount ", async () => {
            expect(await marketplace.feeAccount()).to.equal(deployer.address);
            expect(await marketplace.feePercent()).to.equal(1);
        });
    });

    let URI="Sample URI";
    describe("Minting NFT", () => {
        it("Track minting process", async () => {
            await nft.connect(addr2).mint(URI);
            console.log(addr2.address);
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft.balanceOf(addr2.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);
        })
    })
    describe("Making marketplace item", () => {
        beforeEach(async () => {
            await nft.connect(addr2).mint(URI);
            await nft.connect(addr2).setApprovalForAll(marketplace.address, true);
        });
        it("Track newly created item, transfer NFT from seller marketplace and emit Offered event", async () => {
            await expect(marketplace.connect(addr2).makeItem(nft.address, 1, toWei(1)))
                .to.emit(marketplace, "Offered")
                .withArgs(
                    1,
                    nft.address,
                    1,
                    toWei(1),
                    addr2.address
                )
            // New Owner
            expect(await nft.ownerOf(1)).to.equal(marketplace.address);
            // Prev Owner
            expect(await nft.ownerOf(0)).to.equal(addr2.address);
            // Check item

        });
    })

})