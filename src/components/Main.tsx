import { BigNumber, utils } from "ethers";
import React from "react";

interface MainProps {
  stakingBalance: BigNumber;
  borrowTokenBalance: BigNumber;
  mockDAITokenBalance: BigNumber;
  stakeTokens: (amount: BigNumber) => void;
  unstakeTokens: () => void;
}

const Main: React.FC<MainProps> = ({
  stakingBalance,
  borrowTokenBalance,
  mockDAITokenBalance,
  stakeTokens,
  unstakeTokens,
}) => {
  const input = React.useRef<HTMLInputElement>(null);
  return (
    <div id="content" className="mt-3 align-center">
      <table className="table table-borderless text-muted text-center">
        <thead>
          <tr>
            <th scope="col"> Staking Balance </th>
            <th scope="col"> Reward Balance </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{stakingBalance.toString()}</td>
            <td>{borrowTokenBalance.toString()}</td>
          </tr>
        </tbody>
      </table>
      <div className="card mb-4">
        <div className="card-body">
          <form
            className="mb-3"
            onSubmit={(e) => {
              e.preventDefault();
              stakeTokens(BigNumber.from(input.current?.value));
            }}
          >
            <div>
              <label className="float-left">
                <b>Stake tokens</b>
              </label>
              <span className="float-right text-muted">
                Balance: {mockDAITokenBalance.toString()}
              </span>
            </div>
            <div className="input-group mb-4">
              <input
                type="number"
                ref={input}
                className="form-control form-control-ig"
                placeholder="0"
                required
              />
              <div className="input-group-append">
                <div className="input-group-text">&nbsp;&nbsp;&nbsp; mDAI</div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg">
              {" "}
              Stake!{" "}
            </button>
          </form>
          <button
            type="submit"
            className="btn btn-link btn-block btn-sm"
            onClick={(event) => {
              event.preventDefault();
              unstakeTokens();
            }}
          >
            UnStake
          </button>
        </div>
      </div>
    </div>
  );
};

export default Main;
