pragma solidity >=0.4.22 <0.6.0;
contract Pharma{

    constructor() public{
    }

    struct product {
        uint productID;
        address currOwn;
        address prevOwn;
    }
    mapping(uint => product) products;
    event Txn(uint serialNo, address receiver, address shipper);

    function create(uint productID, uint serialNo) public {
        products[serialNo].productID = productID;
        products[serialNo].currOwn = msg.sender;
        products[serialNo].prevOwn = msg.sender;
        emit Txn(serialNo, products[serialNo].currOwn, products[serialNo].prevOwn);
    }

    function transact(address receiver, uint serialNo) public {
        require(products[serialNo].currOwn == msg.sender, "You don't own this");
        products[serialNo].prevOwn = msg.sender;
        products[serialNo].currOwn = receiver;
        emit Txn(serialNo, products[serialNo].currOwn, products[serialNo].prevOwn);
    }



}
