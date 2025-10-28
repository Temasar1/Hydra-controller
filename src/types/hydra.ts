// Hydra Transaction Types
export interface HydraTransaction {
  id: string;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  fee: number;
  validityInterval?: {
    invalidBefore?: number;
    invalidHereafter?: number;
  };
}

export interface TransactionInput {
  txId: string;
  index: number;
}

export interface TransactionOutput {
  address: string;
  value: number;
  datum?: string;
}

// Snapshot Types
export interface InitialSnapshot {
  snapshotNumber: number;
  utxo: HydraTransaction[];
  timestamp: number;
}

export interface ConfirmedSnapshot {
  snapshotNumber: number;
  utxo: HydraTransaction[];
  timestamp: number;
  confirmedAt: number;
}

// Client Input Types
export type ClientInput =
  | { tag: "Init" }
  | { tag: "Abort" }
  | { tag: "NewTx"; transaction: HydraTransaction }
  | { tag: "Recover"; recoverTxId: string }
  | { tag: "Decommit"; transaction: HydraTransaction }
  | { tag: "Close" }
  | { tag: "Contest" }
  | { tag: "Fanout" }
  | { tag: "SideLoadSnapshot"; snapshot: InitialSnapshot | ConfirmedSnapshot };

// Hydra Node State
export interface HydraNodeState {
  headId?: string;
  contestationDeadline?: number;
  contestationPeriod?: number;
  parties: string[];
  utxo: HydraTransaction[];
  snapshotNumber: number;
  isInitialized: boolean;
  isOpen: boolean;
  isClosed: boolean;
}

// API Response Types
export interface HydraApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface HydraApiConfig {
  url: string;
  timeout?: number;
}
