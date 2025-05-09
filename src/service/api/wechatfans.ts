import { request } from '../request';
// 企业粉丝分页查询
export function enterpriseFansList(data: Api.WechatFans.SearchParams) {
  return request<Api.WechatFans.WechatFansList>({
    url: '/company/fans/list',
    method: 'post',
    data
  });
}

export function getFansAnalysis(data: Api.FansAnalysis.SearchParams) {
  return request<Api.FansAnalysis.FansAnalysis>({
    url: '/company/fans/manage',
    method: 'post',
    data
  });
}

export function enterpriseList(data: Api.WechatEnterprise.SearchParams) {
  return request<Api.WechatEnterprise.WechatEnterpriseList>({
    url: '/company/list',
    method: 'post',
    data
  });
}

export function enterpriseMemberList(data: Api.EnterpriseMember.SearchParams) {
  return request<Api.EnterpriseMember.EnterpriseMemberList>({
    url: '/company/member/list',
    method: 'post',
    data
  });
}

export function memberManage(data: Api.MemberManage.MemberManageParam) {
  return request({
    url: '/company/member/edit',
    method: 'post',
    data
  });
}

export function companyAdd(data: Api.CompanyManage.CompanyAddParam) {
  return request({
    url: '/company/add',
    method: 'post',
    data
  });
}

export function companyLoss(data: { company_type: number }) {
  return request({
    url: '/company/fans/loss',
    method: 'post',
    data
  });
}

export function companyTags(data: { company_id: string }) {
  return request({
    url: '/company/tags/list',
    method: 'post',
    data
  });
}

// 企微活码列表
export function companyQrcodeList(data: Api.LiveCode.SearchParams) {
  return request<Api.LiveCode.CompanyQrcodeList>({
    url: '/company/qrcode/list',
    method: 'post',
    data
  });
}

// 企微活码创建
export function companyQrcodeAdd(data: Api.LiveCode.CompanyMessageAdd) {
  return request({
    url: '/company/qrcode/add',
    method: 'post',
    data
  });
}

// 企微标签列表
export function companyTagList(data: Api.CompanyTag.SearchParams) {
  return request<Api.CompanyTag.CompanyTagList>({
    url: '/company/tags/page',
    method: 'post',
    data
  });
}

// 拉取企微标签列表
export function companyTagPull(data: { company_id: number}) {
  return request({
    url: '/company/tags/pull',
    method: 'post',
    data
  });
}

// 拉取企微标签列表
export function companyTagTree(data: { company_id: number}) {
  return request<Api.CompanyTag.TagTree[]>({
    url: '/company/tags/tree',
    method: 'post',
    data
  });
}

// 拉取企微员工
export function companyEmployeePull(data: { company_id: number }) {
  return request({
    url: '/company/employee/pull',
    method: 'post',
    data
  });
}

// 企微员工列表
export function companyEmployeeList(data: Api.CompanyEmployee.SearchParams) {
  return request<Api.CompanyEmployee.CompanyEmployeeList>({
    url: '/company/employee/list',
    method: 'post',
    data
  });
}

/**
 *
 * 添加附件
 */
export function addCompanyAttachment(data: Api.CompanyAttachment.AddCompanyAttachment) {
  return request<Api.CompanyAttachment.AddCompanyAttachmentResponse>({
    url: '/company/qrcode/attachment/add',
    method: 'post',
    data,
  });
}

/**
 *
 * 上传图片
 */
export function uploadCompanyImage(data?: FormData) {
  return request<Api.CompanyAttachment.AddCompanyAttachmentImageResponse>({
    url: '/company/qrcode/attachment/image',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 *
 * 上传附件
 */
export function uploadCompanyAttachment(data?: FormData) {
  return request<Api.CompanyAttachment.UploadCompanyAttachmentResponse>({
    url: '/company/qrcode/attachment/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
