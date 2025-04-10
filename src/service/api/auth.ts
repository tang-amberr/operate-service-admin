import {demoRequest, request} from '../request';

/**
 * Login
 *
 * @param userName User name
 * @param password Password
 */
export function fetchLogin(username: string, password: string, code: string, id:number) {
  return demoRequest({
    url: '/auth/login',
    method: 'post',
    data: {
      username,
      password,
      code,
      id
    }
  });
}

/**
 * Register
 *
 */
export function fetchRegister(username: string, password: string, check_password: string, code: string, id: number) {
  return demoRequest({
    url: '/auth/register',
    method: 'post',
    data: {
      username,
      password,
      check_password,
      code,
      id
    }
  });
}

export function fetchGetCaptcha() {
  return demoRequest({
    url: '/auth/captcha',
    method: 'get'
  });
}

/** Get user info */
export function fetchGetUserInfo() {
  return demoRequest({
    url: '/auth/user/info',
    method: 'get'
  });
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/refreshToken',
    method: 'post',
    data: {
      refreshToken
    }
  });
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param msg error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return request({ url: '/auth/error', params: { code, msg } });
}
