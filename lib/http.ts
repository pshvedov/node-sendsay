import * as http from 'http';
import * as https from 'https';
import { createSearchParamsFromObject } from './utils/http.utils';

const defaultHeaders: http.OutgoingHttpHeaders = {
  'Content-Type': 'application/json',
  'Content-Length': '0',
};

const defaultRequestOptions: http.RequestOptions = {
  method: 'GET',
  headers: defaultHeaders,
};

// #TODO: cut this long function to the some smaller
export function request<T>(
  url: string,
  data: Record<string, unknown> | null = null,
  options: http.RequestOptions = defaultRequestOptions,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const reqUrl = new URL(url);
    if (options.method === 'GET' && data !== null && typeof data === 'object') {
      const search = createSearchParamsFromObject(data).toString();
      reqUrl.search = search;
    }
    const { hostname, port, pathname: path, search } = reqUrl;
    const reqBody = data !== null && options.method !== 'GET' ? JSON.stringify(data) : '';

    // #TODO: Choose http or https based on URL protocol
    const req = https.request(
      {
        hostname,
        port,
        path: path + search,
        ...options,
        headers: {
          ...options.headers,
          'Content-Length': reqBody.length,
        },
      },
      (res: http.IncomingMessage) => {
        const resBody: Uint8Array[] = [];
        res.on('data', (data: Buffer) => {
          resBody.push(data);
        });

        res.on('end', () => {
          resolve(JSON.parse(Buffer.concat(resBody).toString()));
        });
      },
    );

    req.on('error', (err: Error) => reject(err));

    req.write(reqBody);
    req.end();
  });
}

export function get<T>(url: string, data: Record<string, unknown>, options = defaultRequestOptions): Promise<T> {
  return request<T>(url, data, {
    ...options,
    method: 'GET',
  });
}

export function post<T>(url: string, data: Record<string, unknown>, options = defaultRequestOptions): Promise<T> {
  return request<T>(url, data, {
    ...options,
    method: 'POST',
  });
}
