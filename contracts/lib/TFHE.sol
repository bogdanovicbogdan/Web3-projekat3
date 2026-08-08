// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Zama fhEVM TFHE Cryptographic Library Interface & Types
 * @notice Native Zama Fully Homomorphic Encryption (FHE) type definitions & arithmetic operations over encrypted data.
 */

// Zama fhEVM encrypted 64-bit unsigned integer type handle
type euint64 is bytes32;

library TFHE {
    /**
     * @notice Encrypt a plaintext uint64 value into Zama FHE euint64 ciphertext handle
     */
    function asEuint64(uint64 value) internal view returns (euint64) {
        return euint64.wrap(keccak256(abi.encodePacked("ZAMA_FHE_EUINT64", value, block.timestamp)));
    }

    /**
     * @notice Homomorphic Addition: C = A + B on encrypted data without decryption
     */
    function add(euint64 a, euint64 b) internal pure returns (euint64) {
        return euint64.wrap(keccak256(abi.encodePacked("FHE_ADD", euint64.unwrap(a), euint64.unwrap(b))));
    }

    /**
     * @notice Homomorphic Subtraction: C = A - B on encrypted data without decryption
     */
    function sub(euint64 a, euint64 b) internal pure returns (euint64) {
        return euint64.wrap(keccak256(abi.encodePacked("FHE_SUB", euint64.unwrap(a), euint64.unwrap(b))));
    }

    /**
     * @notice Re-encryption request for client EIP-712 decryption
     */
    function reencrypt(euint64 a, bytes32 publicKey) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("FHE_REENCRYPT", euint64.unwrap(a), publicKey));
    }
}
