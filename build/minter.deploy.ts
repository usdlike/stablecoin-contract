import * as jettonMinter from "../contracts/jetton-minter";
import fs from "fs";
import { Address, Cell, beginCell } from "ton";
import dotenv from "dotenv";
import { BN } from "bn.js";
dotenv.config();

export function initData() {
  if (process.env.ADMIN_ADDRESS === undefined) throw new Error("ADMIN_ADDRESS is not defined");
  if (process.env.MANAGER_ADDRESS === undefined) throw new Error("MANAGER_ADDRESS is not defined");

  return jettonMinter.data({
    totalSupply: 0n,
    adminAddress: Address.parseFriendly(process.env.ADMIN_ADDRESS).address,
    managerAddress: Address.parseFriendly(process.env.MANAGER_ADDRESS).address,
    jettonWalletCode: Cell.fromBoc(fs.readFileSync("build/jetton-wallet.cell"))[0],
  });
}

export function initMessage() {
  return null;
}
