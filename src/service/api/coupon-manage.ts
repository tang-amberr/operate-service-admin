import { request } from '../request';

/** get role list */
export function fetchGetCouponLinkList(data?: Api.CouponManage.CouponLinkSearchParams) {
  return request<Api.CouponManage.CouponLinkList>({
    url: '/link/list',
    method: 'post',
    data
  });
}

/** edit role list */
export function editCouponLink(data?: Api.CouponManage.CouponLinkEditParams) {
  return request<string[]>({
    url: '/link/edit',
    method: 'post',
    data
  });
}

/**
 *
 * these roles are all enabled
 */
export function fetchGetAllCategorys(data?: Api.CouponManage.CouponLinkCategorySearchParams) {
  return request<Api.CouponManage.CouponLinkCategoryList>({
    url: '/link/category/list',
    method: 'post',
    data
  });
}

/**
 *
 * these roles are all enabled
 */
export function editCategory(data?: Api.CouponManage.CouponLinkCategoryEditParams) {
  return request<string[]>({
    url: '/link/category/edit',
    method: 'post',
    data
  });
}

/**
 *
 * upload file
 */
export function uploadFile(data?: FormData) {
  return request<string>({
    url: '/upload/file',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
