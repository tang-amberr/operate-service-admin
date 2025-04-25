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

