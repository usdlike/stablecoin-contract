import { Builder, beginCell } from "ton";

export function beginMessage(params: { op: bigint }): Builder {
  return beginCell()
    .storeUint(params.op, 32)
    .storeUint(Math.floor(Math.random() * Math.pow(2, 31)), 64);
}
