<script setup lang="tsx">
import { Button, Popconfirm, Tag, message } from 'ant-design-vue';
import {Ref, onMounted, ref} from 'vue';
import {deleteUser, editUser, fetchGetRoleList, fetchGetUserList} from '@/service/api';
import { useTable, useTableOperate, useTableScroll } from '@/hooks/common/table';
import { $t } from '@/locales';
import { enableStatusRecord } from '@/constants/business';
import { useAuth } from '@/hooks/business/auth';
import UserOperateDrawer from './modules/user-operate-drawer.vue';
import UserSearch from './modules/user-search.vue';

const { tableWrapperRef, scrollConfig } = useTableScroll();

// 根據当前用户权限，生成操作按钮
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
    if (record.admin_user_status === 1) {
      actions.push(
        <Popconfirm title={'确认禁用吗？'} onConfirm={() => handleClose(record)}>
          <Button danger type="primary" ghost size="small">
            {'禁用'}
          </Button>
        </Popconfirm>
      );
    } else {
      actions.push(
        <Button danger type="primary" dashed size="small" onClick={() => handleClose(record)}>
          {'解禁'}
        </Button>
      );
    }

    // actions.push(
    //   <Button danger type="primary" ghost size="small" onClick={() => resetPassword(record)}>
    //     { '重置密码' }
    //   </Button>,
    // );
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

/** 角色选项 */
const roleMap: Ref<Map<number, string>> = ref(new Map());

async function getRoleOptions() {
  const { error, data } = await fetchGetRoleList({
    current: 1,
    page_size: 1000,
  });

  if (!error) {
    data.list.forEach((item) => {
      roleMap.value.set(item.id, item.admin_role_desc);
    });
  }
}

const { columns, columnChecks, data, getData, loading, mobilePagination, searchParams, resetSearchParams } = useTable({
  apiFn: fetchGetUserList,
  apiParams: {
    current: 1,
    page_size: 10,
    // if you want to use the searchParams in Form, you need to define the following properties, and the value is null
    // the value can not be undefined, otherwise the property in Form will not be reactive
    status: null,
    username: '',
    buttonKey: 'sys:user:list'
  },
  columns: () => [
    {
      key: 'id',
      title: $t('common.index'),
      dataIndex: 'index',
      align: 'center',
      width: 64
    },
    {
      key: 'admin_user_username',
      dataIndex: 'admin_user_username',
      title: $t('page.manage.user.userName'),
      align: 'center',
      minWidth: 150
    },
    {
      key: 'admin_user_role',
      dataIndex: 'admin_user_role',
      title: $t('page.manage.user.userRole'),
      align: 'center',
      minWidth: 150,
      customRender: ({ record }) => {
        const roles = [];
        const colorMap = {
          1: 'cyan',
          2: 'blue',
          3: 'purple',
          4: 'magenta',
          5: 'red',
          6: 'orange',
          7: 'green',
          8: 'lime'
        };

        record.admin_user_role_ids.forEach(item => {
            roles.push(
              <Tag style="font-size: 16px; line-height: 28px" color={colorMap[item % 8 + 1]}>
                {roleMap.value.get(item)}
              </Tag>
            )
        });
        return <div class="flex-center gap-4px">{...roles}</div>;
      }
    },
    {
      key: 'admin_user_status',
      dataIndex: 'admin_user_status',
      title: $t('page.manage.user.userStatus'),
      align: 'center',
      minWidth: 150,
      customRender: ({ record }) => {
        if (record.admin_user_status === null) {
          return null;
        }

        const tagMap: Record<Api.Common.EnableStatus, string> = {
          1: 'success',
          2: 'warning'
        };

        const label = $t(enableStatusRecord[record.admin_user_status]);

        return (
          <Tag style="font-size: 16px; line-height: 28px" color={tagMap[record.admin_user_status]}>
            {label}
          </Tag>
        );
      }
    },
    {
      // create_at
      key: 'create_at',
      dataIndex: 'create_at',
      title: '创建时间',
      align: 'center',
      width: 200
    },
    {
      // update_at
      key: 'update_at',
      dataIndex: 'update_at',
      title: '更新时间',
      align: 'center',
      width: 200
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      minWidth: 130,
      customRender: ({ record }) => {
        return generateActionButtons(record, 'sys:user:edit', 'sys:user:delete');
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

const model = ref({});

// 删除用户
async function handleDelete(id: number) {
  // request
  const res = await deleteUser({
    // 按钮key，用于后端鉴权
    buttonKey: 'sys:user:delete',
    id
  });
  if (res.response.data.code === 200) {
    // message.success('删除成功');
    onDeleted();
  } else {
    message.error('删除失败');
  }
}

// 禁用/解禁 用户
async function handleClose(record: Api.SystemManage.EditUser) {
  Object.assign(model.value, record);
  let msg = '';
  if (record.admin_user_status === 1) {
    model.value.admin_user_status = 2;
    msg = '禁用';
  } else {
    model.value.admin_user_status = 1;
    msg = '解禁';
  }
  const res = await editUser({
    ...model.value,
    buttonKey: 'sys:user:edit',
    type: 'edit'
  });
  // 提示信息
  if (res.response.data.code === 200) {
    // 刷新数据
    getData();
    message.success(`${msg}成功`);
  } else {
    message.error(`${msg}失败`);
  }
}

function edit(id: number) {
  handleEdit(id);
}

onMounted(()=> {
  getRoleOptions();
})
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <UserSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getData" />
    <ACard
      :title="$t('page.manage.user.title')"
      :bordered="false"
      :body-style="{ flex: 1, overflow: 'hidden' }"
      class="flex-col-stretch sm:flex-1-hidden card-wrapper"
    >
      <template #extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          button-perfix="sys:user"
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
        size="small"
        :row-selection="rowSelection"
        :scroll="scrollConfig"
        :loading="loading"
        row-key="id"
        :pagination="mobilePagination"
        class="h-full"
      />

      <UserOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getData"
      />
    </ACard>
  </div>
</template>

<style scoped></style>
