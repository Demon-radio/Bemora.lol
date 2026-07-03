import WebSocket from 'ws';
import { EventEmitter } from 'events';

/**
 * Binance WebSocket stream — real-time crypto prices (no key)
 *
 * @example
 * const stream = new BinanceStream(['btcusdt', 'ethusdt']);
 * stream.on('price', (data) => console.log(data));
 * stream.on('error', console.error);
 * // later:
 * stream.close();
 */
export class BinanceStream extends EventEmitter {
  /**
   * @param {string[]} symbols — e.g. ['btcusdt', 'ethusdt', 'solusdt']
   */
  constructor(symbols = ['btcusdt']) {
    super();
    this._symbols = symbols.map((s) => s.toLowerCase());
    this._ws = null;
    this._reconnectDelay = 2000;
    this._closed = false;
    this._connect();
  }

  _connect() {
    const streams = this._symbols.map((s) => `${s}@miniTicker`).join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    this._ws = new WebSocket(url);

    this._ws.on('open', () => {
      this._reconnectDelay = 2000;
      this.emit('connected', { streams: this._symbols });
    });

    this._ws.on('message', (raw) => {
      try {
        const { data } = JSON.parse(raw.toString());
        this.emit('price', {
          symbol: data.s,
          price: parseFloat(data.c),
          change_24h: parseFloat(data.P),
          high: parseFloat(data.h),
          low: parseFloat(data.l),
          volume: parseFloat(data.v),
          timestamp: data.E,
        });
      } catch (_) {}
    });

    this._ws.on('error', (err) => this.emit('error', err));

    this._ws.on('close', () => {
      if (this._closed) return;
      this.emit('disconnected');
      setTimeout(() => this._connect(), this._reconnectDelay);
      this._reconnectDelay = Math.min(this._reconnectDelay * 2, 30000);
    });
  }

  /** Close the stream */
  close() {
    this._closed = true;
    this._ws?.terminate();
  }
}

/**
 * Kraken WebSocket — real-time prices (no key)
 *
 * @example
 * const stream = new KrakenStream(['BTC/USD', 'ETH/USD']);
 * stream.on('price', console.log);
 */
export class KrakenStream extends EventEmitter {
  /**
   * @param {string[]} pairs — e.g. ['BTC/USD', 'ETH/USD']
   */
  constructor(pairs = ['BTC/USD']) {
    super();
    this._pairs = pairs;
    this._closed = false;
    this._connect();
  }

  _connect() {
    this._ws = new WebSocket('wss://ws.kraken.com');

    this._ws.on('open', () => {
      this._ws.send(JSON.stringify({
        event: 'subscribe',
        pair: this._pairs,
        subscription: { name: 'ticker' },
      }));
      this.emit('connected');
    });

    this._ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (Array.isArray(msg) && msg[2] === 'ticker') {
          const [, data, , pair] = msg;
          this.emit('price', {
            pair,
            price: parseFloat(data.c[0]),
            bid: parseFloat(data.b[0]),
            ask: parseFloat(data.a[0]),
            volume_24h: parseFloat(data.v[1]),
            change_24h: parseFloat(data.p[1]),
          });
        }
      } catch (_) {}
    });

    this._ws.on('error', (err) => this.emit('error', err));
    this._ws.on('close', () => {
      if (!this._closed) setTimeout(() => this._connect(), 3000);
    });
  }

  close() {
    this._closed = true;
    this._ws?.terminate();
  }
}

/**
 * Simple one-shot price fetch using WebSocket (returns a Promise)
 * @param {{ exchange: 'binance'|'kraken', symbol: string, timeout?: number }} params
 */
export function getRealtimePrice({ exchange = 'binance', symbol, timeout = 5000 }) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      stream.close();
      reject(new Error(`Timeout waiting for price: ${symbol}`));
    }, timeout);

    let stream;
    if (exchange === 'binance') {
      stream = new BinanceStream([symbol]);
    } else {
      stream = new KrakenStream([symbol]);
    }

    stream.once('price', (data) => {
      clearTimeout(timer);
      stream.close();
      resolve(data);
    });

    stream.once('error', (err) => {
      clearTimeout(timer);
      stream.close();
      reject(err);
    });
  });
}
