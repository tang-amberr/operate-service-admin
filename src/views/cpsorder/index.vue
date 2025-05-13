<script setup lang="tsx">
import { ref, watchEffect } from 'vue';
import dayjs from 'dayjs';
import { useTable, useTableScroll } from '@/hooks/common/table';
import CpsorderSearch from './modules/cpsorder-search.vue';
import {cpsOrderList} from "@/service/api/cpsorder";
const statistics = ref([
  {
    label: '今日佣金',
    value: '0',
    key: 'day_order_commission'
  },
  {
    label: '昨日佣金',
    value: '0',
    key: 'yesterday_order_commission'
  },
  {
    label: '本月佣金',
    value: '0',
    key: 'this_month_order_commission'
  },
  {
    label: '上月佣金',
    value: '0',
    key: 'last_month_order_commission'
  }
]);

const statusArray = [
  { label: '付款', value: 1 },
  { label: '完成', value: 2 },
  { label: '取消', value: 3 },
  { label: '风控', value: 4 },
  { label: '结算', value: 5 }
];

const orderPlatformArray = [
  { label: '美团', value: 1 },
  { label: '饿了么', value: 2 },
  { label: '滴滴', value: 3 },
  { label: '淘宝', value: 4 },
  { label: '京东', value: 5 },
  { label: '拼多多', value: 6 }
];

const { tableWrapperRef, scrollConfig } = useTableScroll();

const {
  columns,
  columnChecks,
  data,
  loading,
  getData,
  mobilePagination,
  searchParams,
  resetSearchParams,
  originalData
} = useTable({
  apiFn: cpsOrderList,
  apiParams: {
    current: 1,
    page_size: 10,
    order_platform: undefined,
    order_id: undefined,
    pay_date: undefined,
    order_commission_rate: 1
  },
  columns: () => [
    {
      key: 'order_platform',
      dataIndex: 'order_platform',
      title: '活动平台',
      align: 'center',
      customRender: ({ record }) => {
        return orderPlatformArray.find(item => item.value === record.order_platform)?.label;
      }
    },
    {
      key: 'order_channel_account',
      dataIndex: 'order_channel_account',
      title: '账号',
      align: 'center'
    },
    {
      key: 'order_id',
      dataIndex: 'order_id',
      title: '订单编号',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'order_product_name',
      dataIndex: 'order_product_name',
      title: '商品名称',
      align: 'center'
    },
    {
      key: 'order_channel',
      dataIndex: 'order_channel',
      title: '渠道标识',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'order_popularize_place',
      dataIndex: 'order_popularize_place',
      title: '推广位',
      align: 'center'
    },
    {
      key: 'order_pay_price',
      dataIndex: 'order_pay_price',
      title: '付款金额',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'order_commission_rate',
      dataIndex: 'order_commission_rate',
      title: '佣金比例',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'order_cps_profit',
      dataIndex: 'order_cps_profit',
      title: '预估佣金',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'order_status',
      dataIndex: 'order_status',
      title: '状态',
      align: 'center',
      minWidth: 120,
      customRender: ({ record }) => {
        return statusArray.find(item => item.value === record.order_status)?.label;
      }
    },
    {
      key: 'order_pay_time',
      dataIndex: 'order_pay_time',
      title: '付款时间',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'create_at',
      dataIndex: 'create_at',
      title: '创建时间',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'allocated_time',
      dataIndex: 'allocated_time',
      title: '分配时间',
      align: 'center',
      minWidth: 120,
      customRender: ({ record }) => {
        return record.allocated_time ? dayjs(record.allocated_time).format('YYYY-MM-DD HH:mm:ss') : '未分配';
      }
    }
  ]
});

watchEffect(() => {
  if (originalData.value) {
    statistics.value = statistics.value.map(item => {
      item.value = originalData.value[item.key];
      return item;
    });
  }
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ACard title="统计" :bordered="false">
      <ACardGrid v-for="item in statistics" :key="item.label" class="w-1/4!">
        <AStatistic :title="item.label" :value="item.value" />
      </ACardGrid>
    </ACard>
    <CpsorderSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getData" />
    <ACard title="cps订单列表" :bordered="false">
      <template #extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
          :delete-show="true"
          :add-show="true"
          @refresh="getData"
        />
      </template>
      <ATable
        ref="tableWrapperRef"
        :columns="columns"
        :data-source="data"
        :loading="loading"
        row-key="id"
        size="small"
        :pagination="mobilePagination"
        :scroll="scrollConfig"
        class="h-full"
      />
    </ACard>
  </div>
</template>

<style lang="scss" scoped></style>
