import { BN, web3 } from "@coral-xyz/anchor";
import { getProgram } from "../utils/anchor";

// const FIXED_BET_LAMPORTS = new BN(100_000_000); // 0.1 SOL

export type MarketSide = 0 | 1; // 0 = UP, 1 = DOWN

function assertWallet(wallet: any) {
  if (!wallet?.publicKey) {
    throw new Error("Wallet not connected");
  }
}

function getPoolPda(nftMint: web3.PublicKey, programId: web3.PublicKey) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), nftMint.toBuffer()],
    programId
  )[0];
}

function getUserBetPda(
  pool: web3.PublicKey,
  user: web3.PublicKey,
  programId: web3.PublicKey
) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user-bet"), pool.toBuffer(), user.toBuffer()],
    programId
  )[0];
}

export async function initializeMarket(
  wallet: any,
  nftMint: string | web3.PublicKey,
  durationSeconds: number = 300
) {
  assertWallet(wallet);

  const program = getProgram(wallet);
  const nftMintPk =
    typeof nftMint === "string" ? new web3.PublicKey(nftMint) : nftMint;

  const poolPda = getPoolPda(nftMintPk, program.programId);

  const tx = await program.methods
    .initializeMarket(nftMintPk, new BN(durationSeconds))
    .accounts({
      pool: poolPda,
      creator: wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  return { tx, poolPda, nftMint: nftMintPk };
}

export async function placeBet(
  wallet: any,
  nftMint: string | web3.PublicKey,
  side: MarketSide,
  amountSol: number
) {
  assertWallet(wallet);

  const program = getProgram(wallet);
  const nftMintPk =
    typeof nftMint === "string" ? new web3.PublicKey(nftMint) : nftMint;

  const poolPda = getPoolPda(nftMintPk, program.programId);
  const userBetPda = getUserBetPda(
    poolPda,
    wallet.publicKey,
    program.programId
  );
  const amountLamports = new BN(amountSol * 1e9);
  const tx = await program.methods
    .placeBet(amountLamports, side)
    .accounts({
      pool: poolPda,
      userBet: userBetPda,
      user: wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  return { tx, poolPda, userBetPda };
}

export async function finalizeMarket(
  wallet: any,
  nftMint: string | web3.PublicKey,
  viralityScore: number
) {
  assertWallet(wallet);

  const program = getProgram(wallet);
  const nftMintPk =
    typeof nftMint === "string" ? new web3.PublicKey(nftMint) : nftMint;

  const poolPda = getPoolPda(nftMintPk, program.programId);

  const tx = await program.methods
    .finalizeMarket(new BN(viralityScore))
    .accounts({
      pool: poolPda,
      creator: wallet.publicKey,
    })
    .rpc();

  return { tx, poolPda };
}

export async function claimReward(
  wallet: any,
  nftMint: string | web3.PublicKey
) {
  assertWallet(wallet);

  const program = getProgram(wallet);
  const nftMintPk =
    typeof nftMint === "string" ? new web3.PublicKey(nftMint) : nftMint;

  const poolPda = getPoolPda(nftMintPk, program.programId);
  const userBetPda = getUserBetPda(
    poolPda,
    wallet.publicKey,
    program.programId
  );

  const tx = await program.methods
    .claimReward()
    .accounts({
      pool: poolPda,
      userBet: userBetPda,
      user: wallet.publicKey,
    })
    .rpc();

  return { tx, poolPda, userBetPda };
}

export function derivePoolPda(
  nftMint: string | web3.PublicKey,
  programId: string | web3.PublicKey
) {
  const nftMintPk =
    typeof nftMint === "string" ? new web3.PublicKey(nftMint) : nftMint;
  const programPk =
    typeof programId === "string" ? new web3.PublicKey(programId) : programId;

  return getPoolPda(nftMintPk, programPk);
}
