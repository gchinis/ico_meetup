pragma solidity ^0.4.15;

contract owned {
    address public owner;

    function owned() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) onlyOwner {
        owner = newOwner;
    }
}

contract MyToken is owned {

    string public name;
    string public symbol;

    uint256 public buyPrice;
    uint256 public sellPrice;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 value);

    function MyToken(
        uint256 initialSupply,
        string tokenName,
        string tokenSymbol
    ) {
        name = tokenName;
        symbol = tokenSymbol;

        totalSupply = initialSupply;
        balanceOf[msg.sender] = initialSupply / 10;
        balanceOf[this] = initialSupply - balanceOf[msg.sender];
    }

    function setPrices(uint256 newSellPrice, uint256 newBuyPrice) onlyOwner {
        sellPrice = newSellPrice;
        buyPrice  = newBuyPrice;
    }

    function transfer(address _to, uint256 _value) {
        _transfer(msg.sender, _to, _value);
    }

    function _transfer(address _from, address _to, uint _value) internal {
        require(_to != 0x0);

        require(balanceOf[_from] >= _value);
        require(balanceOf[_to] + _value >= balanceOf[_to]);

        balanceOf[_from] -= _value;
        balanceOf[_to]   += _value;

        Transfer(_from, _to, _value);
    }

    function buy() payable returns (uint amount) {
        amount = msg.value / buyPrice;
        require(balanceOf[this] >= amount);
        balanceOf[msg.sender] += amount;
        balanceOf[this] -= amount;
        Transfer(this, msg.sender, amount);
        return amount;
    }

    function sell(uint amount) returns (uint revenue) {
        require(balanceOf[msg.sender] >= amount);
        balanceOf[this] += amount;
        balanceOf[msg.sender] -= amount;
        revenue = amount * sellPrice;
        require(msg.sender.send(revenue));
        return revenue;
    }
}