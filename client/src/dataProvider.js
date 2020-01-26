import contractAbi from "./contracts/Report.json";

// Please choose network
// const contractAddress = contractAbi.networks["999"].address; // Ganache
const contractAddress = contractAbi.networks["4"].address; // Rinkeby

const Web3 = window.Web3;
const web3 = new Web3(window.web3.currentProvider);
const contract = new web3.eth.Contract(contractAbi.abi, contractAddress);

export default {
  contractAddress,
  // REPORTS
  getReports: async () => {
    // const res = await contract.getPastEvents("LogNewReport", { fromBlock: 0 });
    // const reports = res.map(r => r.returnValues);
    // return new Promise((resolve, reject) => {
    //   resolve({
    //     data: reports
    //   });
    // });
    const count = await contract.methods.getReportCount().call();
    let reports = [];

    for (let i = 0; i < count; i++) {
      const key = await contract.methods.getReportAtIndex(i).call();
      const report = await contract.methods.reports(key).call();
      report.key = key;
      reports.push(report);
    }

    return new Promise((resolve, reject) => {
      resolve({
        data: reports
      });
    });
  },
  getReport: async key => {
    return new Promise((resolve, reject) => {
      contract.methods
        .getReport(key)
        .call()
        .then(report =>
          resolve({
            data: report
          })
        )
        .catch(e => reject(e));
    });
  },

  newReport: async ({ ph, hardness, signed, tds, companyName }) => {
    return new Promise((resolve, reject) => {
      contract.methods
        .newReport(signed, ph, hardness, tds, companyName)
        .send({ from: window.ethereum.selectedAddress })
        .then(() =>
          resolve({
            data: true
          })
        )
        .catch(e => reject(e));
    });
  },
  updateReport: async ({ key, signed }) => {
    return new Promise((resolve, reject) => {
      contract.methods
        .updateReport(key, signed)
        .send({ from: window.ethereum.selectedAddress })
        .then(() =>
          resolve({
            data: true
          })
        )
        .catch(e => reject(e));
    });
  },
  removeReport: async key => {
    return new Promise((resolve, reject) => {
      contract.methods
        .remReport(key)
        .send({ from: window.ethereum.selectedAddress })
        .then(() =>
          resolve({
            data: true
          })
        )
        .catch(e => reject(e));
    });
  },

  // USERS
  getUsers: async () => {
    const res = await contract.getPastEvents("NewUser", { fromBlock: 0 });
    const users = res.map(r => r.returnValues);
    return new Promise((resolve, reject) => {
      resolve({
        data: users
      });
    });
  },
  getUser: async address => {
    const user = await contract.methods.users(address).call();

    return new Promise((resolve, reject) => {
      resolve({
        data: user
      });
    });
  },
  createUser: async name => {
    return new Promise((resolve, reject) => {
      contract.methods
        .createUser(name)
        .send({ from: window.ethereum.selectedAddress })
        .then(() =>
          resolve({
            data: null
          })
        )
        .catch(e => reject(e));
    });
  }
};
