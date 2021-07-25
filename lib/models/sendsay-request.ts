import { Action } from '../actions';

export interface SendsayRequest extends Record<string, string | null> {
  action: Action;
}
