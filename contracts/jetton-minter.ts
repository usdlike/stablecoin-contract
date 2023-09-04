import BN from "bn.js";
import { Cell, beginCell, Address } from "ton-core";
import { beginMessage } from "./helpers";

export function data(params: { totalSupply: bigint; adminAddress: Address; managerAddress: Address; jettonWalletCode: Cell }): Cell {
  return beginCell()
    .storeCoins(params.totalSupply)
    .storeAddress(params.adminAddress)
    .storeUint(0, 2)
    .storeAddress(params.managerAddress)
    .storeRef(params.jettonWalletCode)
    .endCell();
}

export function mint(params: { toAddress: Address; gasAmount: bigint; jettonAmount: bigint; fromAddress?: Address; responseAddress?: Address; forwardTonAmount?: bigint }): Cell {
  return beginMessage({ op: 21n })
    .storeAddress(params.toAddress)
    .storeCoins(params.gasAmount)
    .storeRef(
      beginCell()
        .storeUint(0x178d4519, 32)
        .storeUint(0, 64)
        .storeCoins(params.jettonAmount)
        .storeAddress(params.fromAddress || null)
        .storeAddress(params.responseAddress || null)
        .storeCoins(params.forwardTonAmount || 0)
        .storeUint(0, 1)
        .endCell()
    )
    .endCell();
}

export function changeAdmin(params: { newAdmin: Address }): Cell {
  return beginMessage({ op: 3n }).storeAddress(params.newAdmin).endCell();
}

export function claimAdmin(): Cell {
  return beginMessage({ op: 4n }).endCell();
}

export function changeManager(params: { newManager: Address }): Cell {
  return beginMessage({ op: 7n }).storeAddress(params.newManager).endCell();
}
