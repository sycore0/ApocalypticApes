import { expect } from "chai";
import { ethers } from "hardhat";

describe("Apocalypse Apes", function () {
  it("Should return the name", async function () {
    const ApocalypseApes = await ethers.getContractFactory("ApocalypseApes");
    const apocalapse = await ApocalypseApes.deploy();
    await apocalapse.deployed();

    expect(await apocalapse.name()).to.equal("Apocalypse Apes");
  });
  it("Should set base URI", async function () {
    const ApocalypseApes = await ethers.getContractFactory("ApocalypseApes");
    const apocalapse = await ApocalypseApes.deploy();
    await apocalapse.deployed();

    expect(await apocalapse.baseURI()).to.equal("ipfs://000000000000000000000000000000000000000000/");

    const setBaseURI = await apocalapse.setBaseURI("ipfs://QmbA4XoyA8b28hiNWG9uAC4Jdq153a1BLtxTSiTHqrpaC4/");

    // wait until the transaction is mined
    await setBaseURI.wait();

    expect(await apocalapse.baseURI()).to.equal("ipfs://QmbA4XoyA8b28hiNWG9uAC4Jdq153a1BLtxTSiTHqrpaC4/");
  });
});
