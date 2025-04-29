<script setup lang="tsx">
import { Button, Popconfirm, Tag, message } from 'ant-design-vue';
import { useTable, useTableOperate, useTableScroll } from '@/hooks/common/table';
import QrcodeOperateDrawer from './modules/qrcode-operate-drawer.vue';
import TagSearch from './modules/tag-search.vue';
import {companyTagList} from "@/service/api/wechatfans";

const { tableWrapperRef, scrollConfig } = useTableScroll();

const {
  columns,
  columnChecks,
  data,
  mobilePagination,
  getData,
  getDataByPage,
  loading,
  searchParams,
  resetSearchParams
} = useTable({
  apiFn: companyTagList,
  apiParams: {
    current: 1,
    page_size: 10
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
      key: 'fans_tags_id',
      title: '标签id',
      align: 'center',
      dataIndex: 'fans_tags_id',
      width: 100
    },
    {
      key: 'tags_name',
      title: '标签名称',
      align: 'center',
      dataIndex: 'tags_name',
      width: 100
    },
    {
      key: 'company_name',
      dataIndex: 'company_name',
      title: '企业名称',
      align: 'center',
      width: 150
    },
    {
      key: 'father_name',
      dataIndex: 'father_name',
      title: '父标签名称',
      align: 'center',
      width: 200
    }
  ]
});

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
    message.error('删除失败, ',res.response.data.msg);
  }
}

function edit(id: number) {
  handleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <TagSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
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
        :row-selection="rowSelection"
        :scroll="scrollConfig"
        :loading="loading"
        row-key="id"
        :pagination="mobilePagination"
        class="h-full"
      />

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
