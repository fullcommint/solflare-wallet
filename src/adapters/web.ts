import { Cluster, Transaction } from '@solana/web3.js';
import WalletAdapter from './base';
import { SolflareIframeMessage } from '../types';
import Wallet from '@project-serum/sol-wallet-adapter';

export default class WebAdapter extends WalletAdapter {
  private _instance: Wallet | null = null;
  private _provider: string;
  private _network: Cluster;

  get publicKey () {
    return this._instance!.publicKey || null;
  }

  get connected () {
    return this._instance!.connected || false;
  }

  // @ts-ignore
  constructor (iframe: HTMLIFrameElement, network: Cluster, provider: string) {
    super();
    this._network = network;
    this._provider = provider;
  }

  async connect () {
    this._instance = new Wallet(this._provider, this._network);

    this._instance.on('connect', this._handleConnect);
    this._instance.on('disconnect', this._handleDisconnect);

    await this._instance.connect();
  }

  async disconnect () {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    this._instance!.removeAllListeners('connect');
    this._instance!.removeAllListeners('disconnect');

    await this._instance!.disconnect();
  }

  async signTransaction (transaction: Transaction): Promise<Transaction> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    return await this._instance!.signTransaction(transaction);
  }

  async signAllTransactions (transactions: Transaction[]): Promise<Transaction[]> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    return await this._instance!.signAllTransactions(transactions);
  }

  async signMessage (data: Buffer | Uint8Array, display: 'hex' | 'utf8' = 'hex'): Promise<Uint8Array> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    const { signature } = await this._instance!.sign(data, display);
    return signature;
  }

  // @ts-ignore
  handleMessage = (data: SolflareIframeMessage) => {
    // nothing to do here
  };

  private _handleConnect = () => {
    this.emit('connect');
  };

  private _handleDisconnect = () => {
    this.emit('disconnect');
  };
}
