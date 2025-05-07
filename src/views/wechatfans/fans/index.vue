<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { Badge } from 'ant-design-vue';
import type { MenuProps } from 'ant-design-vue';
import { useTable, useTableScroll } from '@/hooks/common/table';
import { companyLoss, enterpriseFansList } from '@/service/api/wechatfans';
const statistics = ref([
  {
    label: '当前有效',
    value: '',
    key: 'valid_fans_number'
  },
  {
    label: '累计流失',
    value: '',
    key: 'lost_fans_number'
  },
  {
    label: '累计进粉',
    value: '',
    key: 'total_fans_number'
  }
]);
const { tableWrapperRef, scrollConfig } = useTableScroll();

const currentmenu = ref<number[]>([1]);
const items = ref<MenuProps['items']>([
  {
    key: 1,
    label: '自有企业',
    title: '自有企业'
  },
  {
    key: 2,
    label: '外部企业',
    title: '外部企业'
  },
  {
    key: 3,
    label: '全部企业',
    title: '全部企业'
  }
]);

const { columns, columnChecks, data, loading, getData, mobilePagination, searchParams } = useTable({
  apiFn: enterpriseFansList,
  apiParams: {
    company_type: currentmenu.value[0],
    current: 1,
    page_size: 10,
    buttonKey: 'wechatfans:fans:list'
  },
  columns: () => [
    {
      key: 'id',
      dataIndex: 'id',
      title: '粉丝ID',
      align: 'center',
      width: 80
    },
    {
      key: 'company_fans_profile_picture',
      dataIndex: 'company_fans_profile_picture',
      title: '粉丝头像',
      align: 'center',
      customRender: ({ record }) => (
        <div class={'flex-center'}>
          <img style="width: 40px; height: 40px" src={record.company_fans_profile_picture} />
        </div>
      )
    },
    {
      key: 'company_fans_name',
      dataIndex: 'company_fans_name',
      title: '粉丝名称',
      align: 'center',
      width: 240
    },
    {
      key: 'company_fans_status',
      dataIndex: 'company_fans_status',
      title: '好友状态',
      align: 'center',
      minWidth: 120,
      customRender: ({ record }) => {
        if (record.company_fans_status === 1) {
          return <Badge status="success" text="正常" />;
        }
        return <Badge status="processing" text="单向/流失" />;
      }
    },
    {
      key: 'company_fans_belong_id',
      dataIndex: 'company_fans_belong_id',
      title: '所属企微',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'company_fans_external_user_id',
      dataIndex: 'company_fans_external_user_id',
      title: '企微外部联系人ID',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'company_fans_bind_type',
      dataIndex: 'company_fans_bind_type',
      title: '绑定状态',
      align: 'center',
      minWidth: 120,
      customRender: ({ record }) => {
        if (record.company_fans_bind_type === 1) {
          return <Badge status="success" text="已绑定" />;
        }
        return <Badge status="error" text="未绑定" />;
      }
    },
    {
      key: 'company_fans_loss_at',
      dataIndex: 'company_fans_loss_at',
      title: '流失时间',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'company_fans_last_active_time',
      dataIndex: 'company_fans_last_active_time',
      title: '最后活动时间',
      align: 'center',
      minWidth: 120
    }
  ]
});

const handleClick: MenuProps['onClick'] = e => {
  currentmenu.value = [Number(e.key)];
  searchParams.company_type = Number(e.key);
  getData();
  getTotal();
};

onMounted(() => {
  currentmenu.value = [1];
  getTotal();
});

function getTotal() {
  companyLoss({
    company_type: currentmenu.value[0]
  }).then(res => {
    statistics.value[0].value = `${res.data.company_fan_total - res.data.company_fan_loss_num}人`;
    statistics.value[1].value = `${res.data.company_fan_loss_num}人`;
    statistics.value[2].value = `${res.data.company_fan_total}人`;
  });
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ACard title="统计" :bordered="false">
      <ACardGrid v-for="item in statistics" :key="item.label" class="w-1/5!">
        <AStatistic :title="item.label" :value="item.value" />
      </ACardGrid>
    </ACard>
    <AMenu v-model:selectedKeys="currentmenu" mode="horizontal" :items="items" @click="handleClick" />
    <!--    <PrivatefanSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getData" />-->
    <ACard title="粉丝列表">
      <template #extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
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
      <a-divider/>
    </ACard>
  </div>
</template>

<style lang="scss" scoped></style>
