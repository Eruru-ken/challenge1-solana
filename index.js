// Import Solana web3 functinalities
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL
} = require("@solana/web3.js");

let args = process.argv.slice(2);
console.log(args[0]);

// 公開鍵と秘密鍵のペアを生成する
const newPair = new Keypair();

// ペアインスタンスの中からカギを取り出す
const publicKey = new PublicKey(newPair._keypair.publicKey).toString();
const privateKey = newPair._keypair.secretKey;

// 接続するネットを選択
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

console.log("Public Key of the generated keypair", publicKey);

// プライベートキーから残高を取得
const getWalletBalance = async () => {
  try {
    // 接続するネットを選択
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // 作成したキーペアから残高を取得する
    const myWallet = await Keypair.fromSecretKey(privateKey);
    const walletBalance = await connection.getBalance(
      new PublicKey(args[0])
    );
    console.log(`Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
  } catch (err) {
    console.log(err);
  }
};

const airDropSol = async () => {
  try {
    // プライベートキーでDevネットに接続
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const myWallet = await Keypair.fromSecretKey(privateKey);

    // エアドロする。単位はLAMPORTSで1solにするには 1 * 10000000
    console.log("Airdropping some SOL to my wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
      // new PublicKey(myWallet._keypair.publicKey),
      new PublicKey(args[0]),
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(fromAirDropSignature);
  } catch (err) {
    console.log(err);
  }
};

// Show the wallet balance before and after airdropping SOL
const mainFunction = async () => {
  await getWalletBalance();
  await airDropSol();
  await getWalletBalance();
}

mainFunction();
