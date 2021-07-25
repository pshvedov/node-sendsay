import * as http from 'http';
import * as https from 'https';
import { SendsayBody } from './models/sendsay-body';
import { Request } from './models/request';

export function request<T>(
  url: string,
  data: SendsayBody | null = null,
  options: http.RequestOptions = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const request = new Request(url, options);
    request.attachBody(data);
    const req = (url.startsWith('https') ? https : http).request(request.options, (res: http.IncomingMessage) => {
      const resBody: Uint8Array[] = [];
      res.on('data', (data: Buffer) => {
        resBody.push(data);
      });

      res.on('end', () => {
        resolve(JSON.parse(Buffer.concat(resBody).toString()));
      });
    });

    req.on('error', (err: Error) => reject(err));
    req.write(request.body);
    req.end();
  });
}

export function get<T>(url: string, data: Record<string, unknown>, options?: http.RequestOptions): Promise<T> {
  return request<T>(url, data, {
    ...options,
    method: 'GET',
  });
}

export function post<T>(url: string, data: Record<string, unknown>, options?: http.RequestOptions): Promise<T> {
  return request<T>(url, data, {
    ...options,
    method: 'POST',
  });
}
