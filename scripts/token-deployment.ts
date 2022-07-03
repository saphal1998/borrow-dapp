import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  BorrowToken__factory,
  MockDAIToken__factory,
  TokenVault__factory,
} from "../src/typechain-types";

async function tokenAndVaultDeployment() {
  const [owner, ...otherAddresses] = await ethers.getSigners();
  const MockDAI = new MockDAIToken__factory(owner);
  const BorrowToken = new BorrowToken__factory(owner);
  const daiToken = await MockDAI.deploy(
    BigNumber.from(1e24),
    "MockDAI Token",
    18,
    "mDAI"
  );
  const borrowToken = await MockDAI.deploy(
    BigNumber.from(1e24),
    "Borrow Token",
    18,
    "BT"
  );
  await Promise.all([daiToken.deployed(), borrowToken.deployed()]).then(
    async () => {
      const TokenVault = new TokenVault__factory(owner);
      const tokenVault = await TokenVault.deploy(
        daiToken.address,
        borrowToken.address
      );
      await tokenVault.deployed();
    }
  );
}

const main = async () => {
  await tokenAndVaultDeployment();
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
