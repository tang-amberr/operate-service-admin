import {demoRequest, request} from '../request';

/** get user list */
export function fetchGetUserList(data?: Api.SystemManage.UserSearchParams) {
  return demoRequest<Api.SystemManage.UserList>({
    url: '/manage/user/list',
    method: 'post',
    data
  });
}

/** edit user*/
export function editUser(data?: Api.SystemManage.UserSearchParams) {
  return request({
    url: '/manage/user/edit',
    method: 'post',
    data
  });
}

/** edit role */
export function editRole(data?: Api.SystemManage.RoleSearchParams) {
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

/** get button list */
export function fetchGetButtonList(data?: Api.SystemManage.ButtonSearchParams) {
  return request<Api.SystemManage.AdminButtonList>({
    url: '/manage/button/list',
    method: 'post',
    data
  });
}
/** edit button*/
export function editButton(data?: Api.SystemManage.EditAdminButton) {
  return request({
    url: '/manage/button/edit',
    method: 'post',
    data
  });
}

/** get menu list */
export function fetchGetMenuList(data?: Api.Common.CommonSearchParams) {
  return request<Api.SystemManage.MenuList>({
    url: '/manage/router/list',
    method: 'post',
    data
  });
}
/** get menu list */
export function fetchGetAllPages(data?: {role_id: number }) {
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

/** get button list */
export function fetchGetMenuList(data?: Api.Common.CommonSearchParams) {
  return request<Api.SystemManage.MenuList>({
    url: '/router/list',
    method: 'post',
    data
  });
}
/** edit button*/
export function editRouter(data?: Api.SystemManage.Menu) {
  return request({
    url: '/router/edit',
    method: 'post',
    data
  });
}
