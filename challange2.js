// 必要なモジュールをインポート
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction
} = require("@solana/web3.js");


const transferSol = async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // キーペアを生成
  const keypair = new Keypair();
  // 秘密鍵からキーペアを取得
  let from = Keypair.fromSecretKey(keypair.secretKey);

  // 受信者のキーペアを生成
  const to = Keypair.generate();

  // 残高を表示
  dispWalletBalance(connection, from.publicKey, to.publicKey);

  // 2SOLをエアドロップ
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

  // エアドロ後の残高を取得
  let fromBalance = await getWalletBalance(connection, from.publicKey);

  // Send money from "from" wallet and into "to" wallet
  let transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: fromBalance  / 2
    })
  );

  // Sign transaction
  let signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [from]
  );
  console.log('Signature is ', signature);

  // 残高を表示
  dispWalletBalance(connection, from.publicKey, to.publicKey);
}


/**
 * 送り主・受け取り主の残高を表示
 * 
 * @param {*} connection コネクション情報
 * @param {String} senderPubKey 送り主公開鍵
 * @param {String} reciverPubKey 受け取り主公開鍵
 */
async function dispWalletBalance(connection, senderPubKey, reciverPubKey){
  let senderWalletBalance = await getWalletBalance(connection, senderPubKey);
  let reciverWalletBalance = await getWalletBalance(connection, reciverPubKey);

  // 送り主の残高を表示
  console.log(parseInt(senderWalletBalance) / LAMPORTS_PER_SOL);
  // 受け取り主の残高を表示
  console.log(parseInt(reciverWalletBalance) / LAMPORTS_PER_SOL);
}


/**
 * ウォレット残高を取得する
 * 
 * @param {*} connection コネクション情報
 * @param {String} pubkey 公開鍵
 * @returns ウォレット残高
 */
async function getWalletBalance(connection, pubkey) {
  try {
    // 作成したキーペアから残高を取得する
    return await connection.getBalance(new PublicKey(pubkey));
  } catch (err) {
    console.log(err);
  }
};

transferSol();