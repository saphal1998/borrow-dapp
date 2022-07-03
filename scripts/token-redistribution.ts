import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  BorrowToken__factory,
  MockDAIToken__factory,
  TokenVault__factory,
  BorrowToken,
  MockDAIToken,
  TokenVault,
} from "../src/typechain-types";

const tokenRedistribution = async (amount: string) => {
  const [owner, investor, ...otherAddresses] = await ethers.getSigners();
  const mockDAITokenData = new ethers.Contract(
    process.env.REACT_APP_MOCK_DAI_TOKEN_ADDRESS ?? "",
    MockDAIToken__factory.abi,
    owner
  ) as MockDAIToken;
  await mockDAITokenData.transfer(investor.address, BigNumber.from(amount));
  const borrowTokenData = new ethers.Contract(
    process.env.REACT_APP_BORROW_TOKEN_ADDRESS ?? "",
    BorrowToken__factory.abi,
    owner
  ) as BorrowToken;
  const tokenVaultsData = new ethers.Contract(
    process.env.REACT_APP_TOKEN_VAULT_ADDRESS ?? "",
    TokenVault__factory.abi,
    owner
  ) as TokenVault;
  await borrowTokenData.transfer(
    tokenVaultsData.address,
    await borrowTokenData.balanceOf(owner.address)
  );
  await mockDAITokenData
    .connect(investor)
    .approve(tokenVaultsData.address, BigNumber.from(amount));
  const investDaiTokenBalance = await mockDAITokenData.balanceOf(
    investor.address
  );
  await tokenVaultsData
    .connect(investor)
    .stakeTokens(investDaiTokenBalance.div(100));

  await borrowTokenData.approve(
    tokenVaultsData.address,
    await borrowTokenData.balanceOf(owner.address)
  );
  await tokenVaultsData.connect(owner).issueTokens();
};

async function main() {
  await tokenRedistribution("100000000000000000000");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
