// Import Solana web3 functinalities
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction
} = require("@solana/web3.js");

// キーペアを生成
const keypair = new Keypair();

const DEMO_FROM_SECRET_KEY = keypair._keypair.secretKey;
const DEMO_FROM_SECRET_FUNC = keypair.secretKey;
const DEMO_FROM_PUBLIC_KEY = keypair._keypair.publicKey;
const DEMO_FROM_PUBLIC_FUNC = keypair.publicKey;

// const DEMO_FROM_SECRET_KEY = new Uint8Array(
//   [
//     160, 20, 189, 212, 129, 188, 171, 124, 20, 179, 80,
//     27, 166, 17, 179, 198, 234, 36, 113, 87, 0, 46,
//     186, 250, 152, 137, 244, 15, 86, 127, 77, 97, 170,
//     44, 57, 126, 115, 253, 11, 60, 90, 36, 135, 177,
//     185, 231, 46, 155, 62, 164, 128, 225, 101, 79, 69,
//     101, 154, 24, 58, 214, 219, 238, 149, 86
//   ]
// );

const transferSol = async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Get Keypair from Secret Key
  var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

  // 受信者のキーペアを生成
  const to = Keypair.generate();

  getWalletBalance(connection, DEMO_FROM_PUBLIC_FUNC);

  // エアドロップ
  console.log("Airdopping some SOL to Sender wallet!");
  const fromAirDropSignature = await connection.requestAirdrop(
    new PublicKey(from.publicKey),
    2 * LAMPORTS_PER_SOL
  );

  // ブロックハッシュを生成
  let latestBlockHash = await connection.getLatestBlockhash();

  // Confirm transaction using the last valid block height (refers to its time)
  // to check for transaction expiration
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: fromAirDropSignature
  });

  console.log("Airdrop completed for the Sender account");

  // Send money from "from" wallet and into "to" wallet
  var transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: 1 * LAMPORTS_PER_SOL
    })
  );

  // Sign transaction
  var signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [from]
  );
  console.log('Signature is ', signature);

  // 送信者のウォレット残高
  console.log("送信者");
  getWalletBalance(connection, DEMO_FROM_PUBLIC_FUNC);

  console.log("受信者");
  getWalletBalance(connection, to.publicKey);
}

// プライベートキーから残高を取得
async function getWalletBalance(connection, pubkey) {
  try {
    // 作成したキーペアから残高を取得する
    const walletBalance = await connection.getBalance(
      new PublicKey(pubkey)
    );
    console.log(`Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
  } catch (err) {
    console.log(err);
  }
};

transferSol();