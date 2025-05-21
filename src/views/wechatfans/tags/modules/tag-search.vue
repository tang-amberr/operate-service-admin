<script setup lang="ts">
import { $t } from '@/locales';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import { fetchGetAllCategorys } from '@/service/api';
import {companyTagList, companyTagPull, enterpriseList} from '@/service/api/wechatfans';
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
  const res = await companyTagPull({
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
        <ACol :span="12" :md="6" :lg="3">
          <a-button type="primary" @click="showModal" >
            拉取企业标签
          </a-button>
          <a-modal width="310px" v-model:open="open" title="选择要拉取标签的企业" @ok="handleOk">
            <ASelect
              v-model:value="companyId"
              :options="companyOptions"
              placeholder="请选择企业"
            />
          </a-modal>
        </ACol>
        <ACol :span="24" :md="12" :lg="5">
          <AFormItem label="父标签" name="pid" class="m-0">
            <ASelect
              v-model:value="model.pid"
              multiple
              :options="parentTagOptions"
              placeholder="请选择父标签"
            />
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="5">
          <AFormItem label="标签名称" name="tag_name" class="m-0">
            <AInput v-model:value="model.tag_name" placeholder="请输入标签名称" />
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="5">
          <AFormItem label="公司" name="company_id" class="m-0">
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
