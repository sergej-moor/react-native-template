import {
  isAuthDeepLink,
  parseTokensFromHash,
  parseTokensFromQuery,
} from './use-auth-deep-link';

describe('parseTokensFromHash', () => {
  it('parses tokens from URL hash fragment', () => {
    const url =
      'myapp://callback#access_token=abc123&refresh_token=xyz789&type=recovery';

    const result = parseTokensFromHash(url);

    expect(result).toEqual({
      accessToken: 'abc123',
      refreshToken: 'xyz789',
      type: 'recovery',
    });
  });

  it('parses tokens without type parameter', () => {
    const url = 'myapp://callback#access_token=abc&refresh_token=xyz';

    const result = parseTokensFromHash(url);

    expect(result).toEqual({
      accessToken: 'abc',
      refreshToken: 'xyz',
      type: null,
    });
  });

  it('returns null when URL has no hash', () => {
    const url = 'myapp://callback?access_token=abc&refresh_token=xyz';

    expect(parseTokensFromHash(url)).toBeNull();
  });

  it('returns null when hash is empty', () => {
    expect(parseTokensFromHash('myapp://callback#')).toBeNull();
  });

  it('returns null when access_token is missing', () => {
    expect(
      parseTokensFromHash('myapp://callback#refresh_token=xyz'),
    ).toBeNull();
  });

  it('returns null when refresh_token is missing', () => {
    expect(parseTokensFromHash('myapp://callback#access_token=abc')).toBeNull();
  });

  it('handles URL-encoded values in hash', () => {
    const url =
      'myapp://callback#access_token=abc%20123&refresh_token=xyz%2B789';

    const result = parseTokensFromHash(url);

    expect(result).toEqual({
      accessToken: 'abc 123',
      refreshToken: 'xyz+789',
      type: null,
    });
  });

  it('handles complex JWT-like token values', () => {
    const url =
      'myapp://auth/callback#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&refresh_token=dGVzdC1yZWZyZXNoLXRva2Vu&type=signup';

    const result = parseTokensFromHash(url);

    expect(result).toEqual({
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      refreshToken: 'dGVzdC1yZWZyZXNoLXRva2Vu',
      type: 'signup',
    });
  });
});

describe('parseTokensFromQuery', () => {
  it('parses tokens from query params object', () => {
    const queryParams = {
      access_token: 'abc123',
      refresh_token: 'xyz789',
      type: 'recovery',
    };

    const result = parseTokensFromQuery(queryParams);

    expect(result).toEqual({
      accessToken: 'abc123',
      refreshToken: 'xyz789',
      type: 'recovery',
    });
  });

  it('parses tokens without type parameter', () => {
    const queryParams = { access_token: 'abc', refresh_token: 'xyz' };

    const result = parseTokensFromQuery(queryParams);

    expect(result).toEqual({
      accessToken: 'abc',
      refreshToken: 'xyz',
      type: undefined,
    });
  });

  it('returns null when queryParams is null', () => {
    expect(parseTokensFromQuery(null)).toBeNull();
  });

  it('returns null when queryParams is undefined', () => {
    expect(parseTokensFromQuery(undefined)).toBeNull();
  });

  it('returns null when access_token is missing', () => {
    expect(parseTokensFromQuery({ refresh_token: 'xyz' })).toBeNull();
  });

  it('returns null when refresh_token is missing', () => {
    expect(parseTokensFromQuery({ access_token: 'abc' })).toBeNull();
  });

  it('returns null for empty object', () => {
    expect(parseTokensFromQuery({})).toBeNull();
  });
});

describe('isAuthDeepLink', () => {
  const scheme = 'myapp://';

  it('returns true for valid auth URL with access_token', () => {
    expect(isAuthDeepLink('myapp://callback#access_token=abc', scheme)).toBe(
      true,
    );
  });

  it('returns true for valid auth URL with refresh_token', () => {
    expect(isAuthDeepLink('myapp://callback#refresh_token=xyz', scheme)).toBe(
      true,
    );
  });

  it('returns true for valid auth URL with both tokens', () => {
    const url = 'myapp://callback#access_token=abc&refresh_token=xyz';
    expect(isAuthDeepLink(url, scheme)).toBe(true);
  });

  it('returns false for null URL', () => {
    expect(isAuthDeepLink(null, scheme)).toBe(false);
  });

  it('returns false for URL with wrong scheme', () => {
    expect(isAuthDeepLink('otherapp://callback#access_token=abc', scheme)).toBe(
      false,
    );
  });

  it('returns false for URL without tokens', () => {
    expect(isAuthDeepLink('myapp://callback?page=home', scheme)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isAuthDeepLink('', scheme)).toBe(false);
  });

  it('handles query params with tokens', () => {
    const url = 'myapp://callback?access_token=abc&refresh_token=xyz';
    expect(isAuthDeepLink(url, scheme)).toBe(true);
  });
});
