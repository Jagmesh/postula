export function newActionRegexp(action: string): RegExp {
  return new RegExp(`${action}:([\\w-]{36})`);
}
