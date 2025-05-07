<script setup lang="tsx">
import { Button, Popconfirm, Tag, message } from 'ant-design-vue';
import { useTable, useTableOperate, useTableScroll } from '@/hooks/common/table';
import { companyEmployeeList, companyTagList } from '@/service/api/wechatfans';
import EmployeeSearch from "@/views/wechatfans/employees/modules/employee-search.vue";

const { tableWrapperRef, scrollConfig } = useTableScroll();

const { columns, columnChecks, data, mobilePagination, getData, loading, searchParams, resetSearchParams } = useTable({
  apiFn: companyEmployeeList,
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
      key: 'user_id',
      title: '员工id',
      align: 'center',
      dataIndex: 'user_id',
      width: 100
    },
    {
      key: 'company_name',
      title: '企业名称',
      align: 'center',
      dataIndex: 'company_name',
      width: 100
    },
    {
      key: 'company_employee_name',
      dataIndex: 'company_employee_name',
      title: '员工名称',
      align: 'center',
      width: 150
    },
    {
      key: 'company_employee_status',
      dataIndex: 'company_employee_status',
      title: '员工状态',
      align: 'center',
      width: 200,
      customRender: ({ record }) => {
        const statusMap = {
          1: '正常',
          2: '禁用',
          4: '未激活',
          5: '退出企业'
        };
        const label = statusMap[record.company_employee_status];
        return (
            <Tag style="font-size: 14px; line-height: 22px" color="cyan">
              {label}
            </Tag>
        );
      }
    },
    {
      key: 'company_employee_gender',
      dataIndex: 'company_employee_gender',
      title: '员工性别',
      align: 'center',
      width: 150,
      customRender: ({ record }) => {
        const statusMap = {
          1: '男',
          2: '女'
        }
        const label = statusMap[record.company_employee_gender];
        return (
            <Tag style="font-size: 14px; line-height: 22px" color="cyan">
              默认
            </Tag>
        );
      }
    },
    {
      key: 'company_employee_avatar',
      dataIndex: 'company_employee_avatar',
      title: '员工头像',
      align: 'center',
      width: 150
    }
  ]
});

const { drawerVisible, operateType, editingData } = useTableOperate(data, getData);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <EmployeeSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getData" />
    <ACard
      title="企业员工列表"
      :bordered="false"
      :body-style="{ flex: 1, overflow: 'hidden' }"
      class="flex-col-stretch sm:flex-1-hidden card-wrapper"
    >
      <template #extra>
        <TableHeaderOperation v-model:columns="columnChecks" button-perfix="" :loading="loading" @refresh="getData" />
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
    </ACard>
  </div>
</template>

<style scoped></style>
