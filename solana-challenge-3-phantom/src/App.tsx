
// importfunctionalities
import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { useEffect, useState } from "react";

// create types
type DisplayEncoding = "utf8" | "hex";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

// create a provider interface (hint: think of this as an object) to store the Phantom Provider
interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

/**
 * @description gets Phantom provider, if it exists
 */
const getProvider = (): PhantomProvider | undefined => {
  // windowオブジェクトの中に"solana"がある場合
  if ("solana" in window) {
    // @ts-ignore
    // any 型にキャストしている
    const provider = window.solana as any;
    if (provider.isPhantom) {
      // プロバイダーがPhantomWalletの場合、プロバイダーを返却
      return provider as PhantomProvider;
    }
  }
};

function App() {
  // 拡張機能でPhantomWalletが存在するかを格納するステート
  const [provider, setProvider] = useState<PhantomProvider | undefined>(
    undefined
  );

  // ウォレットキーを格納するステート
  const [walletKey, setWalletKey] = useState<PhantomProvider | undefined>(
    undefined
  );

  // ステートが書き変わるたびに実行される
  useEffect(() => {
    const provider = getProvider();

    if (provider) {
      // PhantomWalletがインストールされている場合
      setProvider(provider);
    } else {
      // PhantomWalletがインストールされていない場合
      setProvider(undefined);
    }
  }, []);

  /**
   * @description prompts user to connect wallet if it exists.
   * This function is called when the connect wallet button is clicked
   */
  const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    // checks if phantom wallet exists
    if (solana) {
      try {
        // ウォレットを接続する
        // TODO: どこで公開鍵を受け取って接続しているのか？
        const response = await solana.connect();
        console.log('wallet account ', response.publicKey.toString());
        // ウォレッキーをステートに保存
        setWalletKey(response.publicKey.toString());
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  /**
   * ウォレットを切断する
   */
  const disconnectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    // phantomウォレットが存在するか確認
    if (solana) {
      try {
        // 切断するメソッドを呼び出し
        await solana.disconnect();
        // ステートをundefinedに書き換え
        setWalletKey(undefined);
        return true;
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  /**
   * ウォレットキーを変形
   * 
   * @param walletKey 
   * @returns 変換したウォレットアドレス
   */
  function getSliceWalletAddress(walletKey: any) {
    let pubKey = walletKey as unknown as String;
    const first = pubKey.substring(0, 6);
    const last = pubKey.substring(pubKey.length - 7, pubKey.length - 1);

    return first + "....." + last;
  }

  // HTML code for the app
  return (
    <div className="App">
      <header className="App-header">
        <div className="item-list">
          {provider && walletKey && (
            <>
              <p>{getSliceWalletAddress(walletKey)}</p>
              <button className='main-button disconnect' onClick={disconnectWallet}>
                Disconnect Wallet
              </button>
            </>
          )}
        </div>
      </header>
      <main>
        <div className="wrap-content">
          <h2>Connect to Phantom Wallet</h2>
          {/* 拡張機能にウォレットが入っている。かつウォレット接続をしていない */}
          {provider && !walletKey && (
            <button className='main-button connect' onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
          {/* 拡張機能にウォレットが入っている。かつウォレット接続をしている */}
          {provider && walletKey && <p>Connected account</p>}
          {/* 拡張機能にウォレットが存在しない */}
          {!provider && (
            <p>
              No provider found. Install{" "}
              <a href="https://phantom.app/">Phantom Browser extension</a>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
