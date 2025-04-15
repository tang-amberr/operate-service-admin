<script setup lang="tsx">
import {Button, message, Popconfirm, Tag} from 'ant-design-vue';
import {editRole,  fetchGetRoleList} from '@/service/api';
import { useTable, useTableOperate, useTableScroll } from '@/hooks/common/table';
import RoleOperateDrawer from './modules/role-operate-drawer.vue';
import RoleSearch from './modules/role-search.vue';
import {$t} from "@/locales";
import { useAuth } from '@/hooks/business/auth';


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
  loading,
  getData,
  getDataByPage,
  mobilePagination,
  searchParams,
  resetSearchParams
} = useTable({
  apiFn: fetchGetRoleList,
  apiParams: {
    current: 1,
    page_size: 10,
    role_name: ''
  },
  columns: () => [
    {
      key: 'id',
      dataIndex: 'id',
      title: $t('common.index'),
      width: 64,
      align: 'center'
    },
    {
      key: 'role_name',
      dataIndex: 'role_name',
      title: $t('page.manage.role.roleName'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'role_desc',
      dataIndex: 'role_desc',
      title: $t('page.manage.role.roleDesc'),
      minWidth: 120
    },
    {
      // create_at
      key: 'create_at',
      dataIndex: 'create_at',
      title: "创建时间",
      align: 'center',
      minWidth: 120
    },
    {
      // update_at
      key: 'update_at',
      dataIndex: 'update_at',
      title: '更新时间',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      customRender: ({ record }) => {
        return generateActionButtons(record, 'sys:role:edit', 'sys:role:delete');
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
  onDeleted
  // closeDrawer
} = useTableOperate(data, getData);

async function handleDelete(id: number) {
  // request
  const res = await editRole({
    id,
    type: 'delete'
  });
  if (res.response.data.code === 200) {
    message.success('删除成功');
  } else {
    message.error('删除失败');
  }

  onDeleted();
}

function edit(id: number) {
  handleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <RoleSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <ACard
      :title="$t('page.manage.role.title')"
      :bordered="false"
      :body-style="{ flex: 1, overflow: 'hidden' }"
      class="flex-col-stretch sm:flex-1-hidden card-wrapper"
    >
      <template #extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          button-perfix="sys:role"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @refresh="getData"
        />
      </template>
      <ATable
        ref="tableWrapperRef"
        :columns="columns"
        :data-source="data"
        :row-selection="rowSelection"
        :loading="loading"
        row-key="id"
        size="small"
        :pagination="mobilePagination"
        :scroll="scrollConfig"
        class="h-full"
      />
      <RoleOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </ACard>
  </div>
</template>

<style scoped></style>
