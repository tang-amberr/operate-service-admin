<script setup lang="tsx">
import { computed, ref } from 'vue';
import { Button, Popconfirm, Tag, message } from 'ant-design-vue';
import type { Ref } from 'vue';
import { useBoolean } from '@sa/hooks';
import { editMenu, fetchGetMenuList } from '@/service/api';
import { useTable, useTableOperate, useTableScroll } from '@/hooks/common/table';
import { $t } from '@/locales';
import { yesOrNoRecord } from '@/constants/common';
import { enableStatusRecord, menuTypeRecord } from '@/constants/business';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { useAuth } from '@/hooks/business/auth';
import MenuOperateModal, { type OperateType } from './modules/menu-operate-modal.vue';

const { bool: visible, setTrue: openModal } = useBoolean();
const { tableWrapperRef, scrollConfig } = useTableScroll();

const generateActionButtons = (record, codeMap) => {
  const originAuth = useAuth();
  const hasEdit = originAuth.hasAuth(codeMap.edit);
  const hasDelete = originAuth.hasAuth(codeMap.delete);
  const hasAddChild = originAuth.hasAuth(codeMap.addChild);
  const hasAddButton = originAuth.hasAuth(codeMap.addButton);

  const actions = [];
  if (hasAddChild && record.menu_type === 1) {
    actions.push(
      <Button type="primary" ghost size="small" onClick={() => handleAddChildMenu(record)}>
        {$t('page.manage.menu.addChildMenu')}
      </Button>
    );
  }
  if (hasAddButton && record.menu_type === 2) {
    actions.push(
      <Button type="primary" ghost size="small" onClick={() => handleAddChildMenu(record)}>
        新增按钮
      </Button>
    );
  }
  if (hasEdit) {
    actions.push(
      <Button type="primary" ghost size="small" onClick={() => handleEdit(record.id)}>
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

const { columns, columnChecks, data, loading, pagination, getData, getDataByPage } = useTable({
  apiFn: fetchGetMenuList,
  apiParams: {
    current: 1,
    page_size: 10
  },
  columns: () => [
    {
      key: 'id',
      title: $t('page.manage.menu.id'),
      align: 'center',
      width: 140,
      dataIndex: 'id'
    },
    {
      key: 'menu_type',
      title: $t('page.manage.menu.menuType'),
      align: 'center',
      width: 80,
      customRender: ({ record }) => {
        const tagMap: Record<Api.SystemManage.MenuType, string> = {
          1: 'default',
          2: 'processing',
          3: 'warning'
        };

        const label = $t(menuTypeRecord[record.menu_type]);

        return <Tag color={tagMap[record.menu_type]}>{label}</Tag>;
      }
    },
    {
      key: 'menu_name',
      title: $t('page.manage.menu.menuName'),
      align: 'center',
      width: 110,
      customRender: ({ record }) => {
        const { i18n_key, menu_name } = record;

        if (record.menu_type === 3) {
          return <span>{menu_name}</span>;
        }
        const label = i18n_key ? $t(i18n_key) : menu_name;

        return <span>{label}</span>;
      }
    },
    {
      key: 'icon',
      title: $t('page.manage.menu.icon'),
      align: 'center',
      width: 60,
      customRender: ({ record }) => {
        if (record.menu_type === 3) return;
        const icon = record.icon_type === 2 ? record.icon : undefined;

        const localIcon = record.icon_type === 1 ? record.icon : undefined;

        return (
          <div class="flex-center">
            <SvgIcon icon={icon} localIcon={localIcon} class="text-icon" />
          </div>
        );
      }
    },
    {
      key: 'route_name',
      title: $t('page.manage.menu.routeName'),
      align: 'center',
      dataIndex: 'route_name',
      width: 150
    },
    {
      key: 'route_path',
      title: $t('page.manage.menu.routePath'),
      align: 'center',
      dataIndex: 'route_path',
      width: 150,
      customRender: ({ record }) => {
        if (record.menu_type === 3) return;
        return <span>{record.route_path}</span>;
      }
    },
    {
      key: 'status',
      title: $t('page.manage.menu.menuStatus'),
      align: 'center',
      width: 80,
      customRender: ({ record }) => {
        if (record.status === null) {
          return null;
        }

        const tagMap: Record<Api.Common.EnableStatus, string> = {
          1: 'success',
          2: 'warning'
        };

        const label = $t(enableStatusRecord[record.status]);

        return <Tag color={tagMap[record.status]}>{label}</Tag>;
      }
    },
    {
      key: 'hide_in_menu',
      title: $t('page.manage.menu.hideInMenu'),
      dataIndex: 'hide_in_menu',
      align: 'center',
      width: 80,
      customRender: ({ record }) => {
        if (record.menu_type === 3) return;

        const hide: CommonType.YesOrNo = record.hide_in_menu === 2 ? 'Y' : 'N';

        const tagMap: Record<CommonType.YesOrNo, string> = {
          Y: 'error',
          N: 'default'
        };

        const label = $t(yesOrNoRecord[hide]);

        return <Tag color={tagMap[hide]}>{label}</Tag>;
      }
    },
    {
      key: 'pid',
      dataIndex: 'pid',
      title: $t('page.manage.menu.parentId'),
      width: 90,
      align: 'center'
    },
    {
      key: 'order',
      dataIndex: 'order',
      title: $t('page.manage.menu.order'),
      align: 'center',
      width: 60,
      customRender: ({ record }) => {
        if (record.menu_type === 3) return;
        return <span>{record.order}</span>;
      }
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 230,
      customRender: ({ record }) => {
        const codeMap = {
          add: 'sys:menu:add',
          edit: 'sys:menu:edit',
          delete: 'sys:menu:delete',
          addChild: 'sys:menu:addChild',
          addButton: 'sys:menu:addButton'
        };
        return generateActionButtons(record, codeMap);
      }
    }
  ]
});

const { checkedRowKeys, rowSelection, onBatchDeleted, onDeleted } = useTableOperate(data, getData);

const operateType = ref<OperateType>('add');

function handleAdd() {
  operateType.value = 'add';
  openModal();
}

async function handleBatchDelete() {
  // request

  onBatchDeleted();
}

async function handleDelete(id: number) {
  // request
  console.log(id);
  const res = await editMenu({
    id,
    type: 'delete'
  });
  if (res.response.data.code !== 200) {
    return;
  }
  onDeleted();
}
/** the edit menu data or the parent menu data when adding a child menu */
const editingData: Ref<Api.SystemManage.Menu | null> = ref(null);

function handleEdit(item: Api.SystemManage.Menu) {
  operateType.value = 'edit';
  editingData.value = { ...item };

  openModal();
}

function handleAddChildMenu(item: Api.SystemManage.Menu) {
  operateType.value = 'addChild';

  editingData.value = { ...item };

  openModal();
}

const allPages = computed(() => {
  const nameList: string[] = [];
  function mapFunc(item: Api.SystemManage.Menu) {
    nameList.push(item.routeName);
    if (item.children) {
      item.children.forEach(mapFunc);
    }
  }
  data.value.forEach(mapFunc);
  console.log('nameList', nameList);
  return nameList;
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ACard
      :title="$t('page.manage.menu.title')"
      :bordered="false"
      :body-style="{ flex: 1, overflow: 'hidden' }"
      class="flex-col-stretch sm:flex-1-hidden card-wrapper"
    >
      <template #extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          button-perfix="sys:menu"
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
        :row-selection="rowSelection"
        size="small"
        :loading="loading"
        row-key="id"
        :scroll="scrollConfig"
        :pagination="pagination"
        class="h-full"
      />
      <MenuOperateModal
        v-model:visible="visible"
        :operate-type="operateType"
        :row-data="editingData"
        :all-pages="allPages"
        @submitted="getDataByPage"
      />
    </ACard>
  </div>
</template>

<style scoped></style>
