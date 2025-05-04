<script setup lang="tsx">
import { Button, Popconfirm, Tag, message } from 'ant-design-vue';
import {deleteCouponLink, fetchGetAllCategorys, fetchGetCouponLinkList} from '@/service/api';
import { useTable, useTableOperate, useTableScroll } from '@/hooks/common/table';
import { $t } from '@/locales';
import CouponOperateDrawer from './modules/coupon-operate-drawer.vue';
import CouponLinkSearch from './modules/coupon-search.vue';
import {onMounted, ref} from "vue";
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
  loading,
  searchParams,
  mobilePagination,
  resetSearchParams
} = useTable({
  apiFn: fetchGetCouponLinkList,
  apiParams: {
    current: 1,
    page_size: 10,
    buttonKey: 'coupon:link:list'
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
      key: 'cps_link_category_id',
      dataIndex: 'cps_link_category_id',
      title: '分类',
      align: 'center',
      width: 50,
      customRender: ({ record }) => {
        if (record.cps_link_category_id === null) {
          return null;
        }

        const category = categorys.value.find(item => item.id === record.cps_link_category_id);

        return category ? category.cps_category_name : '--';
      }
    },
    {
      key: 'cps_link_name',
      title: '名称',
      align: 'center',
      dataIndex: 'cps_link_name',
      width: 80
    },
    {
      key: 'cps_link_status',
      dataIndex: 'cps_link_status',
      title: '链接状态',
      align: 'center',
      width: 50,
      customRender: ({ record }) => {
        if (record.cps_link_status === null) {
          return null;
        }

        const label = record.cps_link_status === 1 ? '启用' : '停用';

        return <Tag style="font-size: 14px; line-height: 22px" color={record.cps_link_status === 1 ? 'blue' : 'default'}>{label}</Tag>;
      }
    },
    {
      key: 'cps_link_type',
      dataIndex: 'cps_link_type',
      title: '链接类型',
      align: 'center',
      width: 90,
      customRender: ({ record }) => {
        if (record.cps_link_type === null) {
          return null;
        }

        const tagMap: Record<Api.CouponManage.CouponLinkType, string> = {
          1: 'pink',
          2: 'cyan',
          3: 'purple'
        };

        const label =
          record.cps_link_type === 1 ? '普通链接' : record.cps_link_type === 2 ? '小程序链接' : 'APP链接';

        return <Tag style="font-size: 14px; line-height: 22px" color={tagMap[record.cps_link_type]}>{label}</Tag>;
      }
    },
    {
      key: 'cps_link_app_id',
      dataIndex: 'cps_link_app_id',
      title: 'APPId',
      align: 'center',
      width: 80
    },
    {
      key: 'cps_link_original_id',
      dataIndex: 'cps_link_original_id',
      title: 'OriginalID',
      align: 'center',
      width: 85
    },
    {
      key: 'cps_link_path',
      dataIndex: 'cps_link_path',
      title: '路径',
      align: 'center',
      width: 180,
      customRender: ({ record }) => {
        if (record.cps_link_path === null) {
          return null;
        }
        // return (
        //   <a-card size="small">
        //       {record.cps_link_path}
        //   </a-card>
        // );

        return <a-collapse accordion>
          <a-collapse-panel key="1" header="点击查看路径">
            <p>{ record.cps_link_path }</p>
          </a-collapse-panel>
        </a-collapse>;
      }
    },
    {
      key: 'cps_link_sort',
      dataIndex: 'cps_link_sort',
      title: '排序值',
      align: 'center',
      width: 50
    },
    {
      key: 'cps_link_icon_url',
      dataIndex: 'cps_link_icon_url',
      title: '图标',
      align: 'center',
      width: 50,
      customRender: ({ record }) =>{
        return (
          <div class="flex-center">
            <img src={`https://private-domin-1327252780.cos.ap-chengdu.myqcloud.com/hqt/admin/${  record.cps_link_icon_url}` } alt="icon" class="w-40px h-40px" />
          </div>
        );
      }
    },
    {
      key: 'cps_link_desc',
      dataIndex: 'cps_link_desc',
      title: '描述',
      align: 'center',
      width: 100
    },
    {
      key: 'update_at',
      dataIndex: 'update_at',
      title: '修改时间',
      align: 'center',
      width: 100
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      customRender: ({ record }) => {
        return generateActionButtons(record, 'coupon:link:edit', 'coupon:link:delete');
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

const categorys = ref<Api.CouponManage.CouponLinkCategory[]>([]);

const getCategorys = async () => {
  const res = await fetchGetAllCategorys({
    current: 1,
    page_size: 1000
  });
  if(res.response.data.code === 200) {
    categorys.value = res.response.data.data.list;
  }
  return true;
};

async function handleDelete(id: number) {
  // request
  const res = await deleteCouponLink({
    // 按钮key，用于后端鉴权
    buttonKey: 'coupon:link:delete',
    id
  });
  if (res.response.data.code === 200) {
    // message.success('删除成功');
    onDeleted();
  } else {
    message.error('删除失败');
  }
}


function edit(id: number) {
  handleEdit(id);
}

onMounted(async () => {
  await getCategorys();
})

</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <CouponLinkSearch v-model:model="searchParams" @reset="resetSearchParams" :categorys="categorys" @search="getData" />
    <ACard
      title="领券链接列表"
      :bordered="false"
      :body-style="{ flex: 1, overflow: 'hidden' }"
      class="flex-col-stretch sm:flex-1-hidden card-wrapper"
    >
      <template #extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          button-perfix="coupon:link"
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

      <CouponOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getData"
      />
    </ACard>
  </div>
</template>

<style scoped></style>
