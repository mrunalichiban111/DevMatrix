import { AnchorProvider, Program, web3, Idl } from "@coral-xyz/anchor";
import idl from "../idl/trendfi.json";
import type {Trendfi} from "../idl/trendfi.ts";

const programID = new web3.PublicKey("4SnGQnEKoYUKMyjG2GK22NdzBBH5mh7PNrodx9EXhWkh");

export const getProgram = (wallet: any): Program<Idl> => {
  const connection = new web3.Connection("https://api.devnet.solana.com");

  const provider = new AnchorProvider(
    connection,
    {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    },
    {}
  );
  
  console.log("IDL:", idl); // Debug - check what's imported
  
  return new Program(idl as Trendfi, provider);
};