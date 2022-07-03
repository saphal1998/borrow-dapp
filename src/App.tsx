import React from "react";
import {
  BorrowToken__factory,
  MockDAIToken__factory,
  TokenVault__factory,
  BorrowToken,
  MockDAIToken,
  TokenVault,
} from "../src/typechain-types";
import NavBar from "./components/NavBar";
import Main from "./components/Main";
import * as ethers from "ethers";
import "./App.css";

interface AppState {
  ownerAccount?: ethers.Wallet;
  investorAccount?: ethers.Wallet;
  mockDAIToken?: MockDAIToken;
  borrowToken?: BorrowToken;
  tokenVault?: TokenVault;
  mockDAITokenBalance: ethers.BigNumber;
  borrowTokenBalance: ethers.BigNumber;
  stakingBalance: ethers.BigNumber;
  loading: boolean;
}

function App() {
  const [state, setState] = React.useState<AppState>({
    mockDAITokenBalance: ethers.constants.Zero,
    borrowTokenBalance: ethers.constants.Zero,
    stakingBalance: ethers.constants.Zero,
    loading: true,
  });

  const mockDAITokenAddress = process.env.REACT_APP_MOCK_DAI_TOKEN_ADDRESS;
  const borrowTokenAddress = process.env.REACT_APP_BORROW_TOKEN_ADDRESS;
  const tokenVaultAddress = process.env.REACT_APP_TOKEN_VAULT_ADDRESS;
  const ownerPrivateAddress = process.env.REACT_APP_OWNER_PRIVATE_ADDRESS;
  const investorPrivateAddress = process.env.REACT_APP_INVESTOR_PRIVATE_ADDRESS;

  const loadBlockChainData = async (
    mockDAITokenAddress: string,
    borrowTokenAddress: string,
    tokenVaultAddress: string,
    ownerPrivateAddress: string,
    investorPrivateAddress: string
  ) => {
    const url = "http://127.0.0.1/8545";
    const provider = new ethers.providers.JsonRpcProvider(url);

    const ownerAccount = new ethers.Wallet(
      new ethers.utils.SigningKey(ownerPrivateAddress),
      provider
    );
    const investorAccount = new ethers.Wallet(
      new ethers.utils.SigningKey(investorPrivateAddress),
      provider
    );

    const mockDAIToken = new ethers.Contract(
      mockDAITokenAddress,
      MockDAIToken__factory.abi,
      investorAccount
    );
    const borrowToken = new ethers.Contract(
      borrowTokenAddress,
      BorrowToken__factory.abi,
      investorAccount
    );
    const tokenVault = new ethers.Contract(
      tokenVaultAddress,
      TokenVault__factory.abi,
      ownerAccount
    );

    try {
      if (mockDAIToken && borrowToken && tokenVault) {
        const [mockDAITokenBalance, borrowTokenBalance, stakingBalance] =
          await Promise.all([
            mockDAIToken.balanceOf(investorAccount.address),
            borrowToken.balanceOf(investorAccount.address),
            tokenVault.balanceOf(investorAccount.address),
          ]);
        setState((oldState) => ({
          ...oldState,
          borrowToken,
          borrowTokenBalance,
          tokenVault,
          stakingBalance,
          mockDAIToken,
          mockDAITokenBalance,
          ownerAccount,
          investorAccount,
          loading: false,
        }));
      } else {
        window.alert("Error loading contract data");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const stakeTokens = async (amount: ethers.BigNumber) => {
    if (
      state.mockDAIToken &&
      state.tokenVault &&
      state.borrowToken &&
      state.ownerAccount &&
      state.investorAccount
    ) {
      setState((oldState) => ({ ...oldState, loading: true }));
      const approval = await state.mockDAIToken
        .connect(state.investorAccount)
        .approve(state.tokenVault.address, amount);
      await approval.wait();

      const stake = await state.tokenVault
        .connect(state.investorAccount)
        .stakeTokens(amount);
      await stake.wait();

      const issuance = await stake.tokenVault
        .connect(state.ownerAccount)
        .issueTokens();
      await issuance.wait();

      const [mockDAITokenBalance, borrowTokenBalance, stakingBalance] =
        await Promise.all([
          state.mockDAIToken.balanceOf(state.investorAccount.address),
          state.borrowToken.balanceOf(state.investorAccount.address),
          state.tokenVault.stakingBalance(state.investorAccount.address),
        ]);
      setState((oldState) => ({
        ...oldState,
        mockDAITokenBalance,
        borrowTokenBalance,
        stakingBalance,
        loading: false,
      }));
    }
  };

  const unstakeTokens = async () => {
    if (
      state.tokenVault &&
      state.investorAccount &&
      state.mockDAIToken &&
      state.borrowToken
    ) {
      setState((oldState) => ({ ...oldState, loading: true }));
      const unstaking = await state.tokenVault
        .connect(state.investorAccount)
        .unstakeTokens();
      await unstaking.wait();

      const [mockDAITokenBalance, borrowTokenBalance, stakingBalance] =
        await Promise.all([
          state.mockDAIToken.balanceOf(state.investorAccount.address),
          state.borrowToken.balanceOf(state.investorAccount.address),
          state.tokenVault.stakingBalance(state.investorAccount.address),
        ]);
      setState((oldState) => ({
        ...oldState,
        mockDAITokenBalance,
        borrowTokenBalance,
        stakingBalance,
        loading: false,
      }));
    }
  };

  React.useEffect(() => {
    const loaders = async () => {
      if (
        mockDAITokenAddress &&
        borrowTokenAddress &&
        tokenVaultAddress &&
        ownerPrivateAddress &&
        investorPrivateAddress
      ) {
        await loadBlockChainData(
          mockDAITokenAddress,
          borrowTokenAddress,
          tokenVaultAddress,
          ownerPrivateAddress,
          investorPrivateAddress
        );
      }
    };
    loaders();
  }, []);

  return (
    <div>
      <NavBar account={state.ownerAccount?.address ?? ""} />
      <div className="container-fluid mt-5">
        <div className="row">
          <main
            role="main"
            className="col-lg-12 ml-auto mr-auto"
            style={{ maxWidth: "600px" }}
          >
            <div className="content mr-auto ml-auto">
              {state.loading ? (
                <p id="loader" className="text-center">
                  Loading..
                </p>
              ) : (
                <Main
                  mockDAITokenBalance={state.mockDAITokenBalance}
                  borrowTokenBalance={state.borrowTokenBalance}
                  stakingBalance={state.stakingBalance}
                  stakeTokens={stakeTokens}
                  unstakeTokens={unstakeTokens}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
