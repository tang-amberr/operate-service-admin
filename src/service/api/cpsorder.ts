import {request} from '../request';

export function cpsOrderList(data: Api.CpsOrder.CpsOrderSearchParams) {
  return request<Api.CpsOrder.CpsOrderList>({
    url: '/cps/order/list',
    method: 'post',
    data
  });
}
