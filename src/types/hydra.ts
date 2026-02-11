export type ClientInput =
  | { tag: "Init" }
  | { tag: "Abort" }
  | { tag: "NewTx"; transaction: string }
  | { tag: "Recover"; recoverTxId: string }
  | { tag: "Decommit"; transaction: string }
  | { tag: "Close" }
  | { tag: "Contest" }
  | { tag: "Fanout" }
  | { tag: "SideLoadSnapshot"; snapshot: string };

export const clientInput = {
  init: { tag: "Init" } as ClientInput,
  abort: { tag: "Abort" } as ClientInput,
  newTx: (transaction: string): ClientInput => ({
    tag: "NewTx",
    transaction,
  }),
  recover: (txhash: string): ClientInput => ({ 
    tag: "Recover", 
    recoverTxId: txhash 
  }),
  decommit: (transaction: string): ClientInput => ({
    tag: "Decommit",
    transaction,
  }),
  close: { tag: "Close" } as ClientInput,
  contest: { tag: "Contest" } as ClientInput,
  fanout: { tag: "Fanout" } as ClientInput,
  sideLoadSnapshot: (snapshot: string): ClientInput => ({
    tag: "SideLoadSnapshot",
    snapshot: snapshot,
  }),
};
