// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { ETHRwandaHackathonGenesisRegistry } from "../typechain-types";

// describe("ETHRwandaHackathonGenesisRegistry", function () {
//   let registry: ETHRwandaHackathonGenesisRegistry;
//   let owner: any;
//   let addr1: any;
//   let addr2: any;

//   beforeEach(async () => {
//     [owner, addr1, addr2] = await ethers.getSigners();
//     const RegistryFactory = await ethers.getContractFactory("ETHRwandaHackathonGenesisRegistry");
//     registry = (await RegistryFactory.deploy()) as ETHRwandaHackathonGenesisRegistry;
//     await registry.deployed();
//   });

//   it("should open and close registrations", async function () {
//     await registry.setRegistrationsStatus(true);
//     expect(await registry.getAreRegistrationsOpen()).to.be.true;

//     await registry.setRegistrationsStatus(false);
//     expect(await registry.getAreRegistrationsOpen()).to.be.false;
//   });

//   it("should register a hacker", async function () {
//     await registry.setRegistrationsStatus(true);
//     await registry.registerHacker(addr1.address, "Alice", "alice@example.com", 1234567890, addr2.address);

//     const hackerData = await registry.getHackerDataByAddress(addr1.address);
//     expect(hackerData.name).to.equal("Alice");
//     expect(hackerData.email).to.equal("alice@example.com");
//   });

//   it("should not register a hacker if registrations are closed", async function () {
//     await expect(
//       registry.registerHacker(addr1.address, "Alice", "alice@example.com", 1234567890, addr2.address)
//     ).to.be.revertedWith("RegistrationsClosed");
//   });

//   it("should edit hacker data", async function () {
//     await registry.setRegistrationsStatus(true);
//     await registry.registerHacker(addr1.address, "Alice", "alice@example.com", 1234567890, addr2.address);

//     await registry.editHackerData(addr1.address, "Alice Updated", "alice_updated@example.com", 9876543210, addr2.address);

//     const hackerData = await registry.getHackerDataByAddress(addr1.address);
//     expect(hackerData.name).to.equal("Alice Updated");
//     expect(hackerData.email).to.equal("alice_updated@example.com");
//   });

//   it("should send Ether", async function () {
//     await addr1.sendTransaction({ to: registry.address, value: ethers.utils.parseEther("1.0") });
//     await registry.setRegistrationsStatus(true);
//     await registry.registerHacker(addr1.address, "Alice", "alice@example.com", 1234567890, addr2.address);

//     await registry.connect(addr1).sendEther(addr2.address, ethers.utils.parseEther("0.5"));
//     expect(await ethers.provider.getBalance(addr2.address)).to.equal(ethers.utils.parseEther("10000.5"));
//   });

//   it("should transfer ERC20 tokens", async function () {
//     const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
//     const token = await ERC20Mock.deploy("MockToken", "MTK", addr1.address, ethers.utils.parseEther("1000"));
//     await token.deployed();

//     await registry.setRegistrationsStatus(true);
//     await registry.registerHacker(addr1.address, "Alice", "alice@example.com", 1234567890, addr2.address);

//     await token.connect(addr1).approve(registry.address, ethers.utils.parseEther("100"));
//     await registry.connect(addr1).transferERC20(token.address, addr2.address, ethers.utils.parseEther("100"));

//     expect(await token.balanceOf(addr2.address)).to.equal(ethers.utils.parseEther("100"));
//   });

//   it("should transfer ERC721 tokens", async function () {
//     const ERC721Mock = await ethers.getContractFactory("ERC721Mock");
//     const token = await ERC721Mock.deploy("MockNFT", "MNFT");
//     await token.deployed();

//     await token.mint(addr1.address, 1);

//     await registry.setRegistrationsStatus(true);
//     await registry.registerHacker(addr1.address, "Alice", "alice@example.com", 1234567890, addr2.address);

//     await token.connect(addr1).approve(registry.address, 1);
//     await registry.connect(addr1).transferERC721(token.address, addr2.address, 1);

//     expect(await token.ownerOf(1)).to.equal(addr2.address);
//   });

//   it("should revert when an unregistered user tries to send Ether", async function () {
//     await addr1.sendTransaction({ to: registry.address, value: ethers.utils.parseEther("1.0") });

//     await expect(
//       registry.connect(addr1).sendEther(addr2.address, ethers.utils.parseEther("0.5"))
//     ).to.be.revertedWith("UserNotRegistered");
//   });

//   it("should revert when an unregistered user tries to transfer ERC20 tokens", async function () {
//     const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
//     const token = await ERC20Mock.deploy("MockToken", "MTK", addr1.address, ethers.utils.parseEther("1000"));
//     await token.deployed();

//     await token.connect(addr1).approve(registry.address, ethers.utils.parseEther("100"));

//     await expect(
//       registry.connect(addr1).transferERC20(token.address, addr2.address, ethers.utils.parseEther("100"))
//     ).to.be.revertedWith("UserNotRegistered");
//   });

//   it("should revert when an unregistered user tries to transfer ERC721 tokens", async function () {
//     const ERC721Mock = await ethers.getContractFactory("ERC721Mock");
//     const token = await ERC721Mock.deploy("MockNFT", "MNFT");
//     await token.deployed();

//     await token.mint(addr1.address, 1);
//     await token.connect(addr1).approve(registry.address, 1);

//     await expect(
//       registry.connect(addr1).transferERC721(token.address, addr2.address, 1)
//     ).to.be.revertedWith("UserNotRegistered");
//   });
// });
