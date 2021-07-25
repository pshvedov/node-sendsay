import * as http from 'http';
import { URL } from 'url';
import { SendsayBody } from './sendsay-body';

const DefaultHeaders: http.OutgoingHttpHeaders = {
  'Content-Type': 'application/json',
  'Content-Length': '0',
};

const DefaultRequestOptions: http.RequestOptions = {
  method: 'GET',
  headers: DefaultHeaders,
};

export class Request {
  private _options: http.RequestOptions = DefaultHeaders;
  private _body = '';

  constructor(url: string, options: http.RequestOptions) {
    this.prepareOptions(url, options);
  }

  private prepareOptions(url: string, options: http.RequestOptions): void {
    const { hostname, port, pathname: path } = new URL(url);
    this._options = {
      ...DefaultRequestOptions,
      hostname,
      port,
      path,
      ...options,
      headers: {
        ...DefaultHeaders,
        ...options.headers,
      },
    };
  }

  public attachBody(body: SendsayBody | null = null): void {
    if (body === null) {
      return;
    }

    if (this._options.method === 'GET') {
      const search = this.createSearchParamsFromObject(body).toString();
      this._options.path += search;
      this._body = '';
    } else {
      this._body = this.prepareBody(body);
      this._options.headers = {
        ...this._options.headers,
        'Content-Length': this._body.length,
      };
    }
  }

  private createSearchParamsFromObject(data: Record<string, unknown>): URLSearchParams {
    const searchParams = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          searchParams.append(key, String(item));
        });
      } else {
        searchParams.set(key, String(value));
      }
    });
    return searchParams;
  }

  private prepareBody(data: SendsayBody | null): string {
    return data !== null ? JSON.stringify(data) : '';
  }

  public get options(): http.RequestOptions {
    return this._options;
  }

  public get body(): string {
    return this._body;
  }
}
