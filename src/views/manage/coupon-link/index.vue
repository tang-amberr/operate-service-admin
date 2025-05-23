<script setup lang="tsx">
import { Button, Popconfirm, Tag, message } from 'ant-design-vue';
import {editCouponLink, fetchGetAllCategorys, fetchGetCouponLinkList} from '@/service/api';
import { useTable, useTableOperate, useTableScroll } from '@/hooks/common/table';
import { $t } from '@/locales';
import CouponOperateDrawer from './modules/coupon-operate-drawer.vue';
import CouponLinkSearch from './modules/coupon-search.vue';
import {onMounted, ref} from "vue";

const { tableWrapperRef, scrollConfig } = useTableScroll();

const {
  columns,
  columnChecks,
  data,
  getData,
  getDataByPage,
  loading,
  mobilePagination,
  searchParams,
  resetSearchParams
} = useTable({
  apiFn: fetchGetCouponLinkList,
  apiParams: {
    current: 1,
    page_size: 10,
    // if you want to use the searchParams in Form, you need to define the following properties, and the value is null
    // the value can not be undefined, otherwise the property in Form will not be reactive
    type: 'list'
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
      key: 'op_cps_link_category_id',
      dataIndex: 'op_cps_link_category_id',
      title: '分类',
      align: 'center',
      minWidth: 50,
      customRender: ({ record }) => {
        if (record.op_cps_link_category_id === null) {
          return null;
        }

        const category = categorys.value.find(item => item.id === record.op_cps_link_category_id);

        return category ? category.op_cps_category_name : '--';
      }
    },
    {
      key: 'op_cps_link_name',
      title: '名称',
      align: 'center',
      dataIndex: 'op_cps_link_name',
      width: 100
    },
    {
      key: 'op_cps_link_status',
      dataIndex: 'op_cps_link_status',
      title: '链接状态',
      align: 'center',
      minWidth: 60,
      customRender: ({ record }) => {
        if (record.op_cps_link_status === null) {
          return null;
        }

        const label = record.op_cps_link_status === 1 ? '启用' : '停用';

        return <Tag color={record.op_cps_link_status === 1 ? 'blue' : 'default'}>{label}</Tag>;
      }
    },
    {
      key: 'op_cps_link_type',
      dataIndex: 'op_cps_link_type',
      title: '链接类型',
      align: 'center',
      width: 90,
      customRender: ({ record }) => {
        if (record.op_cps_link_type === null) {
          return null;
        }

        const tagMap: Record<Api.CouponManage.CouponLinkType, string> = {
          1: 'pink',
          2: 'cyan',
          3: 'purple'
        };

        const label =
          record.op_cps_link_type === 1 ? '普通链接' : record.op_cps_link_type === 2 ? '小程序链接' : 'APP链接';

        return <Tag color={tagMap[record.op_cps_link_type]}>{label}</Tag>;
      }
    },
    {
      key: 'op_cps_link_app_id',
      dataIndex: 'op_cps_link_app_id',
      title: 'APPId',
      align: 'center',
      minWidth: 200,
      customRender: ({ record }) => {
        if (record.op_cps_link_app_id === null) {
          return null;
        }
        return (
          <div>
            {record.op_cps_link_app_id} <a-icon type="copy" />
          </div>
        );
      }
    },
    {
      key: 'op_cps_link_original_id',
      dataIndex: 'op_cps_link_original_id',
      title: 'OriginalID',
      align: 'center',
      width: 100
    },
    {
      key: 'op_cps_link_path',
      dataIndex: 'op_cps_link_path',
      title: '路径',
      align: 'center',
      width: 100
    },
    {
      key: 'op_cps_link_sort',
      dataIndex: 'op_cps_link_sort',
      title: '排序值',
      align: 'center',
      width: 50
    },
    {
      key: 'op_cps_link_icon_url',
      dataIndex: 'op_cps_link_icon_url',
      title: '图标',
      align: 'center',
      width: 150,
      customRender: ({ record }) =>{
        return (
          <div class="flex-center">
            <img src={`https://antutu-1321649940.cos.ap-chongqing.myqcloud.com/coupon/coupon_link_icon/${  record.op_cps_link_icon_url}` } alt="icon" class="w-40px h-40px" />
          </div>
        );
      }
    },
    {
      key: 'op_cps_link_desc',
      dataIndex: 'op_cps_link_desc',
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
      customRender: ({ record }) => (
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
      )
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
    page_size: 1000,
    type: 'list'
  });
  console.log(res)
  if(res.response.data.code === 200) {
    categorys.value = res.response.data.data.list;
  }
  return true;
};

async function handleDelete(id: number) {
  // request
  const res = await editCouponLink({
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

onMounted(async () => {
  await getCategorys();
})

</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <CouponLinkSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <ACard
      title="领券链接列表"
      :bordered="false"
      :body-style="{ flex: 1, overflow: 'hidden' }"
      class="flex-col-stretch sm:flex-1-hidden card-wrapper"
    >
      <template #extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
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
        @submitted="getDataByPage"
      />
    </ACard>
  </div>
</template>

<style scoped></style>
