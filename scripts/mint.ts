import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { TonClient, WalletContractV3R2, WalletContractV4, internal } from "ton";
import { Address } from "ton-core";
import "dotenv/config";

import { mint } from "../contracts/jetton-minter";
import { sleep } from "./utils";

if (!process.env.ADMIN_MNEMONIC) {
  throw new Error("ADMIN_MNEMONIC env var is missing");
}

if (!process.env.ADMIN_WALLET_VERSION) {
  throw new Error("ADMIN_MNEMONIC env var is missing");
}

const adminWalletVersion = process.env.ADMIN_WALLET_VERSION as string;

if (["V4", "V3R2"].indexOf(adminWalletVersion) === -1) {
  throw new Error("ADMIN_WALLET_VERSION env var must be one of V4, V3R2");
}

async function mintJettons(args: { to: string; amount: number }) {
  const { to, amount } = args;

  const mnemonic = process.env.ADMIN_MNEMONIC as string;
  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const wallet =
    adminWalletVersion === "V4" ? WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 }) : WalletContractV3R2.create({ publicKey: key.publicKey, workchain: 0 });

  const endpoint = await getHttpEndpoint({ network: "mainnet" });
  const client = new TonClient({ endpoint });

  if (!(await client.isContractDeployed(wallet.address))) {
    return console.log("wallet is not deployed");
  }

  const walletContract = client.open(wallet);

  console.log("address", walletContract.address.toString());
  console.log("balance", await walletContract.getBalance());

  const seqno = await walletContract.getSeqno();
  await walletContract.sendTransfer({
    secretKey: key.secretKey,
    seqno: seqno,
    messages: [
      internal({
        to: "EQD3QyTQddYpmXapaCZDzxf5OiWb0QBMdOZmtvD9AyME_BgJ",
        value: "0.03",
        body: mint({
          toAddress: Address.parse(to),
          gasAmount: 25000000n,
          jettonAmount: BigInt(amount) * 1000000000n,
        }),
        bounce: false,
      }),
    ],
  });

  // wait until confirmed
  let currentSeqno = seqno;
  while (currentSeqno == seqno) {
    console.log("waiting for transaction to confirm...");
    await sleep(1500);
    currentSeqno = await walletContract.getSeqno();
  }
  console.log("transaction confirmed!");
}

mintJettons({
  to: "EQDH21G7zsSN-HQUYqNL5y9Mk0bd-TBVw1AgU_Fpmp4wTFiL", // address to mint to
  amount: 1, // full amount in TONS to mint
});
