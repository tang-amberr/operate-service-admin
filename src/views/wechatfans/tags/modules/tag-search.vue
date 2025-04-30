<script setup lang="ts">
import { $t } from '@/locales';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import { fetchGetAllCategorys } from '@/service/api';
import {companyTagList, enterpriseList} from '@/service/api/wechatfans';
import {onMounted, ref} from "vue";

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

const companyOptions = ref<CommonType.Option<number>[]>([]);
// 企业列表
async function getCompanyOptions() {
  const { error, data } = await enterpriseList({
    current: 1,
    page_size: 100
  });

  if (!error) {
    const options = data?.list.map(item => ({
      label: item.company_name,
      value: item.id
    }));

    companyOptions.value = [...options];
  }
}

const parentTagOptions = ref<CommonType.Option<number>[]>([]);
// 父标签列表
async function getParentTagOptions() {
  const { error, data } = await companyTagList({
    current: 1,
    page_size: 100,
    query_pid: 1
  });

  if (!error) {
    const options = data?.list.map(item => ({
      label: item.tags_name,
      value: item.id
    }));

    parentTagOptions.value = [...options];
  }
}

async function search() {
  await validate();
  emit('search');
}
onMounted(() => {
  getCompanyOptions();
  getParentTagOptions();
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
        <ACol :span="24" :md="12" :lg="6">
          <AFormItem label="父标签" name="pid" class="m-0">
            <ASelect
              v-model:value="model.pid"
              multiple
              :options="parentTagOptions"
              placeholder="请选择分类id"
            />
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="6">
          <AFormItem label="标签名称" name="tag_name" class="m-0">
            <AInput v-model:value="model.tag_name" placeholder="请输入标签名称" />
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="6">
          <AFormItem label="公司" name="company_id" class="m-0">
            <ASelect
              v-model:value="model.company_id"
              multiple
              :options="companyOptions"
              placeholder="请选择分类id"
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
