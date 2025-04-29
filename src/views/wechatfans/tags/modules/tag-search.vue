<script setup lang="ts">
import { $t } from '@/locales';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import {fetchGetAllCategorys} from "@/service/api";

defineOptions({
  name: 'TagSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, resetFields } = useAntdForm();

const model = defineModel<Api.CompanyTag.SearchParams>('model', {
  default: () => ({
    pid: null,
    tag_name: '',
    company_id: null
  })
});

async function reset() {
  await resetFields();
  emit('reset');
}

async function getCompanyOptions() { // todo
  const { error, data } = await fetchGetAllCategorys(
    {
      current: 1,
      page_size: 10,
      type: 'list'
    }
  );

  if (!error) {
    const options = data?.list.map(item => ({
      label: item.op_cps_category_name,
      value: item.id
    }));

    categoryOptions.value = [...options];
  }
}

async function search() {
  await validate();

  emit('search');
}
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
        <ACol :span="24" :md="12" :lg="6">
          <AFormItem label="父标签" name="pid" class="m-0">
            <AInput v-model:value.number="model.pid" placeholder="请选择父标签" />
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="6">
          <AFormItem label="标签名称" name="tag_name" class="m-0">
            <AInput v-model:value="model.tag_name" placeholder="请输入标签名称" />
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="6">
          <AFormItem label="链接状态" name="company_id" class="m-0">
            <ASelect
              v-model:value="model.company_id"
              placeholder="选择公司"
              clearable
            >
              <a-select-option :value="1">启用</a-select-option>
              <a-select-option :value="2">停用</a-select-option>
            </ASelect>
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
