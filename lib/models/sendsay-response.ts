import { SendsayBody } from './sendsay-body';
import { SendsayError } from './sendsay-error';

export interface SendsayResponse extends SendsayBody {
  'request.id': string;
  duration: string | null;
  errors?: Array<SendsayError>;
}
