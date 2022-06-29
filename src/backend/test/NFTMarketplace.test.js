const {expect} = require('chai');


describe("NFTMarketplace", () => {
    let deployer, marketplace, nft;
    const addr2 = "0xf0cc965724304676e37d775f08f4e96bb12052cd776c34008f7bed44dcbd3bc7";
    beforeEach(async () => {
        const Marketplace = await ethers.getContractFactory("Marketplace");
        const NFT = await ethers.getContractFactory("NFT");

        [deployer] = await ethers.getSigners();
        marketplace = await Marketplace.deploy(1);
        nft = await NFT.deploy();
    });
    describe("Deployment ", () => {
        it("Track feePercent and feeAccount ", async () => {
            expect(await marketplace.feeAccount()).to.equal(deployer.address);
            expect(await marketplace.feePercent()).to.equal(1);
        })
    });
    // describe("Minting NFT", () => {
    //     let URI="Sample URI";
    //     it("Track minting process", async () => {
    //         await nft.connect(addr2).mint(URI);
    //         console.log(nft);
    //         expect(await nft.tokenCount()).to.equal(1);
    //     })
    // })
    describe("Making marketplace item", () => {

    })

})