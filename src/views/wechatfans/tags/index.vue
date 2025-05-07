<script setup lang="tsx">
import { Button, Popconfirm, Tag, message } from "ant-design-vue";
import {
  useTable,
  useTableOperate,
  useTableScroll,
} from "@/hooks/common/table";
import TagSearch from "./modules/tag-search.vue";
import { companyTagList } from "@/service/api/wechatfans";

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
  resetSearchParams,
} = useTable({
  apiFn: companyTagList,
  apiParams: {
    current: 1,
    page_size: 10,
    // if you want to use the searchParams in Form, you need to define the following properties, and the value is null
    // the value can not be undefined, otherwise the property in Form will not be reactive
  },
  columns: () => [
    {
      key: "id",
      title: "id",
      dataIndex: "id",
      align: "center",
      width: 50,
    },
    {
      key: "fans_tags_id",
      title: "标签id",
      align: "center",
      dataIndex: "fans_tags_id",
      width: 100,
    },
    {
      key: "tags_name",
      title: "标签名称",
      align: "center",
      dataIndex: "tags_name",
      width: 100,
    },
    {
      key: "company_name",
      dataIndex: "company_name",
      title: "企业名称",
      align: "center",
      width: 150,
    },
    {
      key: "father_name",
      dataIndex: "father_name",
      title: "父标签名称",
      align: "center",
      width: 200,
      customRender: ({ record }) => {
        return (
          <Tag
            v-if="record.employee_status === 1"
            style="font-size: 14px; line-height: 22px"
            color="cyan"
          >
            {record.father_name}
          </Tag>
        );
      },
    },
  ],
});

const {
  drawerVisible,
  operateType,
  editingData,
} = useTableOperate(data, getData);
</script>

<template>
  <div
    class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto"
  >
    <TagSearch
      v-model:model="searchParams"
      @reset="resetSearchParams"
      @search="getData"
    />
    <ACard
      title="企业标签列表"
      :bordered="false"
      :body-style="{ flex: 1, overflow: 'hidden' }"
      class="flex-col-stretch sm:flex-1-hidden card-wrapper"
    >
      <template #extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          button-perfix=""
          :loading="loading"
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
        :pagination="mobilePagination"
        class="h-full"
      />

      <QrcodeOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getData"
      />
    </ACard>
  </div>
</template>

<style scoped></style>
