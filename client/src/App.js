import React, { Component } from "react";
import { Admin, Resource } from "react-admin";

import { ReportList, NewReport, EditReport } from "./reports";
import { UserList, UserCreate, ShowUser } from "./users";

import authProvider from "./authProvider";
import Dashboard from "./Dashboard";
import dataProvider from "./dataProvider";

import contractAbi from "./contracts/Report.json";
const contractAddress = dataProvider.contractAddress;
const Web3 = window.Web3;

class App extends Component {
  state = { account: null, contract: null };

  componentDidMount() {
    this.setup();
  }

  // Web3 Setup
  setup = async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
      console.log("Using Ethereum enabled browser");
      window.web3 = new Web3(window.ethereum);

      try {
        await window.ethereum.enable();

        //If accounts change
        window.ethereum.on("accountsChanged", accounts => {
          if (accounts.length > 0) {
            this.setState({
              account: accounts[0],
              isLoggedOut: false
            });
          } else {
            this.setState({ account: null });
          }
        });

        const web3 = new Web3(window.web3.currentProvider);
        const contract = new web3.eth.Contract(
          contractAbi.abi,
          contractAddress
        );

        window.contract = contract;

        this.setState({
          account: window.ethereum.selectedAddress,
          contract
        });

        // // Test fetch user
        // const response = await contract.methods
        //   .users(this.state.account)
        //   .call();
        // console.log(response);

        // // Test fetch reports
        // this.getReports();
      } catch (error) {
        console.log(error);
        console.error("You must approve this dApp to interact with it");
      }
    }

    // Non-dapp browsers...
    else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  render() {
    return (
      <Admin
        dashboard={() => (
          <Dashboard
            account={this.state.account}
            contract={this.state.contract}
          />
        )}
        authProvider={authProvider}
        dataProvider={dataProvider}
      >
        <Resource
          name="reports"
          list={ReportList}
          create={NewReport}
          edit={EditReport}
        />
        <Resource
          name="users"
          list={UserList}
          create={UserCreate}
          edit={ShowUser}
        />
      </Admin>
    );
  }
}

export default App;
