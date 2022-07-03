import React from "react";

interface NavBarProps {
  account: string;
}

const NavBar: React.FC<NavBarProps> = ({ account }) => {
  return (
    <nav className="navbar navbar-dark bg-dark fixed-top flex-md-nowrap p-0 shadow">
      <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">
        {" "}
        &nbsp; Dapp Token Farm{" "}
      </a>
      <ul className="navbar-nav px-3">
        <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
          <small className="text-muted">
            <small id="account">{account}</small>
          </small>
        </li>
      </ul>
    </nav>
  );
};
export default NavBar;
