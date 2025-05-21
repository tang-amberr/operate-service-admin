<script setup lang="ts">
import { $t } from '@/locales';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import {companyEmployeePull, companyTagPull, enterpriseList} from '@/service/api/wechatfans';
import {onMounted, ref} from "vue";
import {message} from "ant-design-vue";

defineOptions({
  name: 'EmployeeSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, resetFields } = useAntdForm();

const model = defineModel<Api.CompanyEmployee.SearchParams>('model', {
  default: () => ({
    employee_status: null,
    company_employee_name: '',
    company_id: null
  })
});

async function reset() {
  await resetFields();
  emit('reset');
}

// 员工状态选项statusOptions
const statusOptions = ref<CommonType.Option<number>[]>([]);
statusOptions.value = [
  {
    label: '正常',
    value: 1
  },
  {
    label: '禁用',
    value: 2
  },
  {
    label: '未激活',
    value: 4
  },
  {
    label: '退出企业',
    value: 5
  }
];

// 企业选项statusOptions
const companyOptions = ref<CommonType.Option<number>[]>([]);
// 企业列表
async function getCompanyOptions() {
  const { error, data } = await enterpriseList({
    current: 1,
    page_size: 1000
  });

  if (!error) {
    const options = data?.list.map(item => ({
      label: item.company_name,
      value: item.id
    }));

    companyOptions.value = [...options];
  }
}

const open = ref<boolean>(false);

// 拉取标签的modal
const showModal = () => {
  open.value = true;
};

const handleOk = (e: MouseEvent) => {
  reset();
  pullTags();
  open.value = false;
};

// 企业id
const companyId = ref(null);


// 拉取标签
async function pullTags() {
  const res = await companyEmployeePull({
    company_id: companyId.value
  });

  if (res.response.data.code === 200) {
    message.success('拉取成功');
  }

  emit('search');
}

async function search() {
  await validate();
  emit('reset');
  emit('search');
}
onMounted(() => {
  getCompanyOptions();
});

</script>

<template>
  <ACard :bordered="false" class="card-wrapper">
    <AForm
      ref="formRef"
      :model="model"
      :label-col="{
        span: 5,
        md: 7
      }"
    >
      <ARow :gutter="[16, 16]" wrap>
        <ACol :span="12" :md="6" :lg="3">
          <a-button type="primary" @click="showModal" >
            拉取企业员工
          </a-button>
          <a-modal width="310px" v-model:open="open" title="选择要拉取员工的企业" @ok="handleOk">
            <ASelect
              v-model:value="companyId"
              :options="companyOptions"
              placeholder="请选择企业"
            />
          </a-modal>
        </ACol>
        <ACol :span="24" :md="12" :lg="5">
          <AFormItem label="员工名称" name="company_employee_name" class="m-0">
            <AInput v-model:value="model.company_employee_name" placeholder="请输入员工名称" />
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="5">
          <AFormItem label="员工状态" name="employee_status" class="m-0">
            <ASelect
              v-model:value="model.employee_status"
              multiple
              :options="statusOptions"
              placeholder="请选择员工状态"
            />
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="5">
          <AFormItem label="企业" name="company_id" class="m-0">
            <ASelect
              v-model:value="model.company_id"
              multiple
              :options="companyOptions"
              placeholder="请选择企业"
            />
          </AFormItem>
        </ACol>
        <div class="flex-1">
          <AFormItem class="m-0">
            <div class="w-full flex-y-center justify-end gap-12px">
              <AButton @click="reset">
                <template #icon>
                  <icon-ic-round-refresh class="align-sub text-icon" />
                </template>
                <span class="ml-8px">{{ $t('common.reset') }}</span>
              </AButton>
              <AButton type="primary" ghost @click="search">
                <template #icon>
                  <icon-ic-round-search class="align-sub text-icon" />
                </template>
                <span class="ml-8px">{{ $t('common.search') }}</span>
              </AButton>
            </div>
          </AFormItem>
        </div>
      </ARow>
    </AForm>
  </ACard>
</template>

<style scoped></style>
