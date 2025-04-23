<script setup lang="tsx">
import { Badge, Button } from 'ant-design-vue';
import { ref } from 'vue';
import { useAuth } from "@/hooks/business/auth";
import { useTable, useTableOperate, useTableScroll } from '@/hooks/common/table';
import { enterpriseList } from '@/service/api/wechatfans';
import WechatEnterpriseChildDrawer from '@/views/wechatfans/wechatmanage/modules/wechat-enterprise-child-drawer.vue';

const { tableWrapperRef, scrollConfig } = useTableScroll();
const company = ref({});
const { columns, columnChecks, data, loading, getData, mobilePagination } = useTable({
  apiFn: enterpriseList,
  apiParams: {
    current: 1,
    page_size: 10,
    buttonKey: 'wechatfans:wechat:list'
  },
  columns: () => [
    {
      key: 'id',
      dataIndex: 'id',
      title: '企业ID',
      align: 'center',
      width: 150
    },
    {
      key: 'company_name',
      dataIndex: 'company_name',
      title: '企业名称',
      align: 'center'
    },
    {
      key: 'company_corp_id',
      dataIndex: 'company_corp_id',
      title: '企业标识',
      align: 'center'
    },
    {
      key: 'company_type',
      dataIndex: 'company_type',
      title: '企业类型',
      align: 'center',
      minWidth: 120,
      customRender: ({ record }) => {
        if (record.company_type === '1') {
          return <Badge status="success" text="私有" />;
        }
        return <Badge status="processing" text="外部" />;
      }
    },
    {
      key: 'company_status',
      dataIndex: 'company_status',
      title: '企业类型',
      align: 'center',
      minWidth: 120,
      customRender: ({ record }) => {
        if (record.company_status === '1') {
          return <Badge status="success" text="禁用" />;
        }
        return <Badge status="processing" text="启用" />;
      }
    },
    {
      key: 'company_remarks',
      dataIndex: 'company_remarks',
      title: '备注',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'company_seats_numbers',
      dataIndex: 'company_seats_numbers',
      title: '坐席数',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'company_agent_id',
      dataIndex: 'company_agent_id',
      title: '应用id',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'company_created_at',
      dataIndex: 'company_created_at',
      title: '创建时间',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'company_updated_at',
      dataIndex: 'company_updated_at',
      title: '更新时间',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'operate',
      title: '操作',
      align: 'center',
      minWidth: 200,
      customRender: ({ record }) => {
        const originAuth = useAuth();
        if (!originAuth.hasAuth("originAuth.hasAuth")) {
          return <a-tooltip placement="topLeft" title="无权限">
          <div class="flex-center gap-8px">
            <Button
              style="padding: 0"
            >
              成员设置
            </Button>
          </div></a-tooltip>
        }
        return <div class="flex-center gap-8px">
          <Button
            style="padding: 0"
            type="link"
            onClick={() => {
              company.value = record;
              edit(record.id);
            }}
          >
            成员设置
          </Button>
        </div>
      }


    }
  ]
});

const {
  drawerVisible,
  operateType,
  editingData,
  handleAdd,
  handleEdit
  // closeDrawer
} = useTableOperate(data, getData);

function edit(id: number) {
  console.log(id);
  handleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <!--    <PrivatefanSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getData" />-->
    <ACard title="企业列表" :bordered="false">
      <template #extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          button-perfix="wechatfans:wechat"
          :loading="loading"
          :delete-show="true"
          @add="handleAdd"
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
      <WechatEnterpriseChildDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        :company="company"
        @submitted="getData"
      />
    </ACard>
  </div>
</template>

<style lang="scss" scoped></style>
