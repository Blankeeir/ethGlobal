/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IServareNFT,
  IServareNFTInterface,
} from "../../../contracts/interfaces/IServareNFT";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getProduct",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "quantity",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "location",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "expiryDate",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "productionDate",
        type: "string",
      },
      {
        internalType: "string",
        name: "category",
        type: "string",
      },
      {
        internalType: "string",
        name: "imageUri",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isListed",
        type: "bool",
      },
      {
        internalType: "address",
        name: "producer",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isVerified",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "carbonFootprint",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "qualityScore",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "int256",
        name: "temperature",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "humidity",
        type: "int256",
      },
    ],
    name: "updateQualityScore",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IServareNFT__factory {
  static readonly abi = _abi;
  static createInterface(): IServareNFTInterface {
    return new Interface(_abi) as IServareNFTInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): IServareNFT {
    return new Contract(address, _abi, runner) as unknown as IServareNFT;
  }
}