import {demoRequest, request} from '../request';

/** get user list */
export function fetchGetUserList(data?: Api.SystemManage.UserSearchParams) {
  return demoRequest<Api.SystemManage.UserList>({
    url: '/user/list',
    method: 'post',
    data
  });
}

/** edit user*/
export function editUser(data?: Api.SystemManage.UserSearchParams) {
  return request({
    url: '/user/edit',
    method: 'post',
    data
  });
}

/** edit role */
export function editRole(data?: Api.SystemManage.RoleSearchParams) {
  return request({
    url: '/role/edit',
    method: 'post',
    data
  });
}

/** get role list */
export function fetchGetRoleList(data?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/role/list',
    method: 'post',
    data
  });
}
