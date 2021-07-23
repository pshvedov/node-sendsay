export enum Action {
  Login = 'login',
  Ping = 'ping',
}

const publicActions = [Action.Login, Action.Ping];

export function isPublicAction(action: Action): boolean {
  return publicActions.includes(action);
}
