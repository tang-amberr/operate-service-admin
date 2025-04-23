import { request } from '../request';

/** get user list */
export function fetchGetUserList(data?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/manage/user/list',
    method: 'post',
    data
  });
}

/** edit user */
export function editUser(data?: Api.SystemManage.UserSearchParams) {
  return request({
    url: '/manage/user/edit',
    method: 'post',
    data
  });
}

/** delete user */
export function deleteUser(data?: { id: number }) {
  return request({
    url: '/manage/user/delete',
    method: 'post',
    data
  });
}

/** edit role */
export function editRole(data?: Api.SystemManage.EditAdminRole) {
  return request({
    url: '/manage/role/edit',
    method: 'post',
    data
  });
}

/** get role list */
export function fetchGetRoleList(data?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/manage/role/list',
    method: 'post',
    data
  });
}

/** delete role */
export function deleteRole(data?: { id: number }) {
  return request({
    url: '/manage/role/delete',
    method: 'post',
    data
  });
}

/** get menu list tree */
export function fetchGetMenuList(data?: Api.Common.CommonSearchParams) {
  return request<Api.SystemManage.MenuList>({
    url: '/manage/router/list',
    method: 'post',
    data
  });
}
/** get menu list */
export function fetchGetAllPages(data?: { role_id: number }) {
  return request<string[]>({
    url: '/manage/router/pages',
    method: 'post',
    data
  });
}

export function GetMenuTree() {
  return request<Api.SystemManage.MenuTree[]>({
    url: '/manage/router/tree',
    method: 'get'
  });
}
export function editMenu(data?: Api.SystemManage.EditMenuRequest) {
  return request({
    url: '/manage/router/edit',
    method: 'post',
    data
  });
}

/** delete menu */
export function deleteMenu(data?: { id: number }) {
  return request({
    url: '/manage/router/delete',
    method: 'post',
    data
  });
}

export function fetchGetMenuByRoleId(data?: { role_id: number }) {
  return request<number[]>({
    url: '/manage/router/role',
    method: 'post',
    data
  });
}
