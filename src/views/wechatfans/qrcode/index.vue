<script setup lang="tsx">
import { Button, Popconfirm, Tag, message } from 'ant-design-vue';
import { useTable, useTableOperate, useTableScroll } from '@/hooks/common/table';
import { $t } from '@/locales';
import { companyQrcodeList } from '@/service/api/wechatfans';
import QrcodeOperateDrawer from './modules/qrcode-operate-drawer.vue';
import QrcodeSearch from './modules/qrcode-search.vue';

const { tableWrapperRef, scrollConfig } = useTableScroll();

let innerData: Api.LiveCode.AssociatedEmployee[] = [];

const { columns, columnChecks, data, getData, getDataByPage, loading, searchParams, resetSearchParams } = useTable({
  apiFn: companyQrcodeList,
  apiParams: {
    current: 1,
    page_size: 10
    // buttonKey: 'coupon:category:list'
    // if you want to use the searchParams in Form, you need to define the following properties, and the value is null
    // the value can not be undefined, otherwise the property in Form will not be reactive
  },
  columns: () => [
    {
      key: 'id',
      title: 'id',
      dataIndex: 'id',
      align: 'center',
      width: 50
    },
    {
      key: 'company_name',
      title: '企业名称',
      align: 'center',
      dataIndex: 'company_name',
      width: 100
    },
    {
      key: 'channel_name',
      title: '渠道名称',
      align: 'center',
      dataIndex: 'channel_name',
      width: 100
    },
    {
      key: 'qrcode_link',
      title: '二维码',
      align: 'center',
      dataIndex: 'qrcode_link',
      width: 280,
      height: 280,
      customRender: ({ record }) => {
        return (
          <div class="flex-center">
            <img class="w-150px" src={record.qrcode_link} alt="icon" />
          </div>
        );
      }
    },
    {
      key: 'add_fans_num',
      dataIndex: 'add_fans_num',
      title: '今日新加客户',
      align: 'center',
      width: 100
    },
    {
      key: 'associated_employee',
      dataIndex: 'associated_employee',
      title: '关联成员',
      align: 'center',
      width: 200,
      customRender: ({ record }) => {
        innerData = record.associated_employee;
      }
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      customRender: ({ record }) => {
        return (
          <div class="flex-center gap-8px">
            <Button type="primary" ghost size="small" onClick={() => edit(record.id)}>
              {$t('common.edit')}
            </Button>
            <Popconfirm title={$t('common.confirmDelete')} onConfirm={() => handleDelete(record.id)}>
              <Button danger size="small">
                {$t('common.delete')}
              </Button>
            </Popconfirm>
          </div>
        );
      }
    }
  ]
});

const innerColumns = [
  { title: '成员id', dataIndex: 'employee_id', key: 'employee_id' },
  { title: '成员名称', dataIndex: 'employee_name', key: 'employee_name' },
  { title: '每日添加限制', dataIndex: 'employee_limit_num', key: 'employee_limit_num' },
  { title: '当天已加好友', dataIndex: 'employee_has_add', key: 'employee_has_add' },
  { title: '当天状态', dataIndex: 'employee_status', key: 'employee_status' }
];

const {
  drawerVisible,
  operateType,
  editingData,
  handleAdd,
  handleEdit,
  checkedRowKeys,
  rowSelection,
  onBatchDeleted,
  onDeleted
  // closeDrawer
} = useTableOperate(data, getData);

async function handleBatchDelete() {
  // request
  // console.log(checkedRowKeys.value);

  onBatchDeleted();
}

async function handleDelete(id: number) {
  // request
  const res = await deleteCategory({
    // 按钮key，用于后端鉴权
    buttonKey: 'coupon:category:delete',
    id
  });
  if (res.response.data.code === 200) {
    // message.success('删除成功');
    onDeleted();
  } else {
    message.error('删除失败, ', res.response.data.msg);
  }
}

function edit(id: number) {
  handleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <QrcodeSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <ACard
      title="所有企业成员列表"
      :bordered="false"
      :body-style="{ flex: 1, overflow: 'hidden' }"
      class="flex-col-stretch sm:flex-1-hidden card-wrapper"
    >
      <template #extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          button-perfix="coupon:category"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </template>
      <ATable
        ref="tableWrapperRef"
        :columns="columns"
        :data-source="data"
        size="small"
        :scroll="scrollConfig"
        :loading="loading"
        row-key="id"
        :pagination="false"
        class="h-full"
      >
        <template #expandedRowRender>
          <ATable :columns="innerColumns" :data-source="innerData" :pagination="false">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'employee_status'">
                <span>
                  <Tag v-if="record.employee_status === 1" style="font-size: 14px; line-height: 22px" color="blue">
                    正常
                  </Tag>
                  <Tag v-else style="font-size: 14px; line-height: 22px" color="default">正常</Tag>
                </span>
              </template>
              <template v-else-if="column.key === 'operation'">
                <span class="table-operation">
                  <a>Pause</a>
                  <a>Stop</a>
                  <ADropdown>
                    <template #overlay>
                      <AMenu>
                        <AMenuItem>Action 1</AMenuItem>
                        <AMenuItem>Action 2</AMenuItem>
                      </AMenu>
                    </template>
                    <a>
                      More
                      <DownOutlined />
                    </a>
                  </ADropdown>
                </span>
              </template>
            </template>
          </ATable>
        </template>
      </ATable>

      <QrcodeOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </ACard>
  </div>
</template>

<style scoped></style>
