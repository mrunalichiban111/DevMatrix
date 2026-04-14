const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";

// ─── Pinata helpers (unchanged) ───────────────────────────────────────────────

export const uploadToIPFS = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  const data = await res.json();

  // ✅ Add these debug logs
  console.log("Pinata file upload status:", res.status);
  console.log("Pinata file upload data:", data);

  // ✅ Throw error if upload failed
  if (!data.IpfsHash) {
    throw new Error(`Pinata file upload failed: ${JSON.stringify(data)}`);
  }

  return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
};

export const uploadMetadata = async (metadata: any) => {
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify(metadata),
  });

  const data = await res.json();
  
  // ✅ Add these debug logs
  console.log("Pinata response status:", res.status);
  console.log("Pinata response data:", data);

  // ✅ Throw error if upload failed
  if (!data.IpfsHash) {
    throw new Error(`Pinata upload failed: ${JSON.stringify(data)}`);
  }

  return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
};
// ─── Mint NFT with UMI ────────────────────────────────────────────────────────

export const mintNFT = async (
  wallet: any,
  imageFile: File | null,
  title: string,
  description: string
) => {
  const { createUmi } = await import("@metaplex-foundation/umi-bundle-defaults");
  const { walletAdapterIdentity } = await import("@metaplex-foundation/umi-signer-wallet-adapters");
  const { createNft, mplTokenMetadata } = await import("@metaplex-foundation/mpl-token-metadata");
  const { generateSigner, percentAmount } = await import("@metaplex-foundation/umi");

  // 1️⃣ Upload image when present
  const imageUrl = imageFile ? await uploadToIPFS(imageFile) : null;

  // 2️⃣ Upload metadata
  const metadata: Record<string, unknown> = {
    name: title,
    description,
  };

  if (imageUrl) {
    metadata.image = imageUrl;
  }

  const metadataUri = await uploadMetadata(metadata);

  console.log("✅ Metadata URI:", metadataUri);

  // 3️⃣ Setup UMI
  const umi = createUmi("https://api.devnet.solana.com")
    .use(mplTokenMetadata())
    .use(walletAdapterIdentity(wallet));

  // 4️⃣ Mint NFT
  const mint = generateSigner(umi);

  await createNft(umi, {
  mint,
  name: title,
  uri: metadataUri,       // ← make sure this is not undefined
  sellerFeeBasisPoints: percentAmount(0),
  isMutable: true,
  symbol: "",             // ← add this, required by Metaplex
}).sendAndConfirm(umi, {
  send: { commitment: "finalized" }, // ← wait for finalization
  confirm: { commitment: "finalized" },
});

console.log("✅ NFT created with URI:", metadataUri);
console.log("✅ Mint address:", mint.publicKey.toString());

  return {
    mint: mint.publicKey.toString(),
    image: imageUrl,
    title,
  };
};