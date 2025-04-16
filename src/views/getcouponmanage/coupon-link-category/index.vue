<script setup lang="tsx">
import { Button, Popconfirm, Tag, message } from 'ant-design-vue';
import {editCategory, deleteCategory, fetchGetAllCategorys, fetchGetCouponLinkList} from '@/service/api';
import { useTable, useTableOperate, useTableScroll } from '@/hooks/common/table';
import { $t } from '@/locales';
import CategoryOperateDrawer from './modules/category-operate-drawer.vue';
import CategorySearch from './modules/category-search.vue';
import {useAuth} from "@/hooks/business/auth";

const { tableWrapperRef, scrollConfig } = useTableScroll();

const generateActionButtons = (record, editButtonCode, deleteButtonCode) => {
  const originAuth = useAuth();
  const hasEdit = originAuth.hasAuth(editButtonCode);
  const hasDelete = originAuth.hasAuth(deleteButtonCode);
  const actions = [];
  if (hasEdit) {
    actions.push(
      <Button type="primary" ghost size="small" onClick={() => edit(record.id)}>
        {$t('common.edit')}
      </Button>
    );
  }
  if (hasDelete) {
    actions.push(
      <Popconfirm title={$t('common.confirmDelete')} onConfirm={() => handleDelete(record.id)}>
        <Button danger size="small">
          {$t('common.delete')}
        </Button>
      </Popconfirm>
    );
  }

  return actions.length ? <div class="flex-center gap-8px">{...actions}</div> : null;
};

const {
  columns,
  columnChecks,
  data,
  getData,
  getDataByPage,
  loading,
  searchParams,
  resetSearchParams
} = useTable({
  apiFn: fetchGetAllCategorys,
  apiParams: {
    current: 1,
    page_size: 10,
    buttonKey: 'coupon:category:list'
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
      key: 'cps_category_name',
      title: '名称',
      align: 'center',
      dataIndex: 'cps_category_name',
      width: 100
    },
    {
      key: 'cps_category_status',
      dataIndex: 'cps_category_status',
      title: '分类状态',
      align: 'center',
      width: 100,
      customRender: ({ record }) => {
        if (record.cps_category_status === null) {
          return null;
        }

        const label = record.cps_category_status === 1 ? '启用' : '停用';

        return <Tag color={record.cps_category_status === 1 ? 'blue' : 'default'}>{label}</Tag>;
      }
    },
    {
      key: 'cps_category_icon_url',
      dataIndex: 'cps_category_icon_url',
      title: '图标',
      align: 'center',
      width: 150,
      customRender: ({ record }) =>{
        return (
          <div class="flex-center">
            <img class="w-100px" src={`https://private-domin-1327252780.cos.ap-chengdu.myqcloud.com/hqt/admin/${  record.cps_category_icon_url}` } alt="icon" class="w-40px h-40px" />
          </div>
        );
      }
    },
    {
      key: 'cps_category_desc',
      dataIndex: 'cps_category_desc',
      title: '描述',
      align: 'center',
      width: 200
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      customRender: ({ record }) => {
        return generateActionButtons(record, 'coupon:category:edit', 'coupon:category:delete');
      }
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
    <CategorySearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <ACard
      title="领券链接分类列表"
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
        :pagination="false"
        class="h-full"
      />

      <CategoryOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </ACard>
  </div>
</template>

<style scoped></style>
