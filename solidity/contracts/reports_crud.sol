pragma solidity 0.5.16;

import "./HitchensUnorderedKeySet.sol";

//example of key 0xdeadbeef00000000000000000000000000000000000000000000000000000001

contract Report {
    using HitchensUnorderedKeySetLib for HitchensUnorderedKeySetLib.Set;
    HitchensUnorderedKeySetLib.Set reportSet;
    HitchensUnorderedKeySetLib.Set userSet;

    uint256 public maxDelay = 30 days;
    uint256 public delayFee = 0.1 ether;
    address public admin;

    struct ReportStruct {
        bool signed;
        uint256 ph;
        uint256 hardness;
        uint256 tds;
        string companyName;
        address sender;
        uint256 timestamp;
    }

    struct User {
        address account;
        string name;
        uint256 balance;
        uint256 lastReport;
    }

    mapping(bytes32 => ReportStruct) public reports;

    mapping(address => User) public users;

    event LogNewReport(
        address sender,
        bytes32 key,
        bool signed,
        uint256 ph,
        uint256 hardness,
        uint256 tds,
        string companyName
    );
    event LogReportSigned(address sender, bytes32 key);
    event LogRemReport(address sender, bytes32 key);

    event NewUser(address sender, string name);
    event NewDeposit(address sender, uint256 amount);
    event LateReport(address sender, uint256 feeCharged, uint256 timeStamp);

    constructor() public {
        admin = msg.sender;
    }

    modifier onlyWithBalance() {
        require(users[msg.sender].balance >= delayFee, "Not enough balance");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    modifier onlyCreatedUser() {
        require(users[msg.sender].account == msg.sender, "User not created");
        _;
    }

    modifier onlyNewUser() {
        require(users[msg.sender].account == address(0), "User already exists");
        _;
    }

    function changeAdmin(address newAdmin) external {
        admin = newAdmin;
    }

    function updateMaxDealy(uint256 newDelay) external onlyAdmin {
        maxDelay = newDelay;
    }

    function updateFee(uint256 newFee) external onlyAdmin {
        delayFee = newFee;
    }

    function createUser(string calldata name) external onlyNewUser {
        bytes32 key = keccak256(abi.encodePacked(msg.sender, name));
        userSet.insert(key);

        User memory newUser = User(msg.sender, name, 0, 0);
        users[msg.sender] = newUser;

        emit NewUser(msg.sender, name);
    }

    function checkTime(bytes32 key) internal {
        if (reports[key].timestamp + maxDelay < now) {
            // Charge fee to user for the delay
            uint256 timeDelayed = now - reports[key].timestamp - maxDelay;
            uint256 feeToCharge = (timeDelayed / maxDelay) * delayFee;

            require(
                users[msg.sender].balance >= feeToCharge,
                "Not enough balance to pay delay fee"
            );

            users[msg.sender].balance -= feeToCharge;
            emit LateReport(msg.sender, feeToCharge, now);
        }
        // Update user's last report time
        // users[msg.sender].lastReport = now;
    }

    function deposit() external payable {
        require(msg.value > 0, "Value should be greater than 0");

        users[msg.sender].balance += msg.value;

        emit NewDeposit(msg.sender, msg.value);
    }

    function newReport(
        bool _signed,
        uint256 _ph,
        uint256 _hardness,
        uint256 _tds,
        string memory _companyName
    ) public onlyWithBalance onlyCreatedUser {
        bytes32 key = keccak256(
            abi.encodePacked(
                msg.sender,
                now,
                _ph,
                _hardness,
                _tds,
                _companyName
            )
        );

        reportSet.insert(key); // Note that this will fail automatically if the key already exists.
        ReportStruct storage w = reports[key];
        w.signed = _signed;
        w.ph = _ph;
        w.hardness = _hardness;
        w.tds = _tds;
        w.companyName = _companyName;
        w.sender = msg.sender;
        w.timestamp = now;
        emit LogNewReport(
            msg.sender,
            key,
            _signed,
            _ph,
            _hardness,
            _tds,
            _companyName
        );
    }

    function signReport(bytes32 key) public {
        require(!reports[key].signed, "Report is already signed");

        checkTime(key);
        require(
            reportSet.exists(key),
            "Can't sign a report that doesn't exist."
        );
        reports[key].signed = true;
        emit LogReportSigned(msg.sender, key);
    }

    function remReport(bytes32 key) public {
        reportSet.remove(key); // Note that this will fail automatically if the key doesn't exist
        delete reports[key];
        emit LogRemReport(msg.sender, key);
    }

    function getReport(bytes32 key)
        public
        view
        returns (
            bool signed,
            uint256 ph,
            uint256 hardness,
            uint256 tds,
            string memory companyName,
            address sender,
            uint256 timestamp
        )
    {
        require(
            reportSet.exists(key),
            "Can't get a report that doesn't exist."
        );
        ReportStruct storage w = reports[key];
        return (
            w.signed,
            w.ph,
            w.hardness,
            w.tds,
            w.companyName,
            w.sender,
            w.timestamp
        );
    }

    function getReportCount() public view returns (uint256 count) {
        return reportSet.count();
    }

    function getReportAtIndex(uint256 index) public view returns (bytes32 key) {
        return reportSet.keyAtIndex(index);
    }

    function withdrawFunds() external onlyAdmin {
        address payable to = address(uint160(admin));
        to.transfer(address(this).balance);
    }
}
