pragma solidity ^0.4.24;


library ECVerify {
    // sig[0] = uint8 v
    // sig[1...33] = bytes32 r
    // sig[33...] = bytes32 s
    function ecverify(bytes32 msgHash, bytes sig, address signer) internal pure {
        require(sig.length == 65, "wrong length");
        uint8 v;
        bytes32 r;
        bytes32 s;
        assembly {
            r := mload(add(sig, 0x20))
            s := mload(add(sig, 0x40))
            v := mload(add(sig, 0x41))
        }

        // https://github.com/ethereum/go-ethereum/issues/2053
        if (v < 27) {
            v += 27;
        }

        address addr = ecrecover(msgHash, v, r, s);
        require(addr != 0 && addr == signer, "wrong signer"); // verify
    }

    function ecverify(string message, bytes sig, address signer) internal pure {
        ecverify(keccak256(bytes(message)), sig, signer);
    }

    function ecverify(bytes message, bytes sig, address signer) internal pure {
        ecverify(keccak256(message), sig, signer);
    }
}
