import { Action, isPublicAction } from './actions';
import { NOT_AUTHORIZED, NO_API_KEY_SPECIFIED, NO_API_URL_SPECIFIED } from './errors';
import { post } from './http';
import { EventEmitter } from 'events';

const DEFAULT_API_URL = 'https://api.sendsay.ru';

export interface SendsayRequest extends Record<string, string | null> {
  action: Action;
}

export interface SendsayResponse extends Record<string, string | null> {
  'request.id': string;
  duration: string | null;
}

export interface SendsayCredentials {
  login: string;
  sublogin: string;
  password: string;
}

export class SendsayClient extends EventEmitter {
  private apiKey: string;
  private apiUrl: string;
  private credentials: SendsayCredentials | null = null;

  private session = '';
  private pathPrefix = '';

  constructor(apiKey: string, apiUrl: string = DEFAULT_API_URL, credentials?: SendsayCredentials) {
    super();
    if (!apiKey) {
      throw new Error(NO_API_KEY_SPECIFIED);
    }

    if (!apiUrl) {
      throw new Error(NO_API_URL_SPECIFIED);
    }

    this.apiKey = apiKey;
    this.apiUrl = apiUrl;

    if (credentials) {
      this.credentials = credentials;
    }
  }

  public async action<T extends SendsayResponse>(action: Action, params: Record<string, string>): Promise<T> {
    if (!isPublicAction(action) && !this.apiKey && !this.session) {
      if (this.credentials) {
        const { login, sublogin, password } = this.credentials;
        await this.login(login, sublogin, password);
      }
      throw Error(NOT_AUTHORIZED);
    }
    return this.executeAction({ action, ...params });
  }

  private async executeAction<T extends SendsayResponse>(body: SendsayRequest): Promise<T> {
    try {
      this.emit('onRequest', { url: this.url, body });
      const response = await post<T>(this.apiUrl + this.pathPrefix, this.prepareBody(body));
      this.emit('onResponse', { response });
      return response;
    } catch (error: unknown) {
      this.emit('onError', { error });
      throw error;
    }
  }

  public login(login: string, sublogin: string, password: string): Promise<SendsayResponse> {
    return this.action(Action.Login, {
      login,
      sublogin,
      passwd: password,
    });
  }

  private prepareBody(body: Record<string, unknown>): Record<string, unknown> {
    // #TODO: append request.id, apiKey, etc.
    return body;
  }

  private get url(): string {
    return this.apiUrl + this.pathPrefix;
  }
}
