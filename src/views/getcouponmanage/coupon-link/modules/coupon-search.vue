<script setup lang="ts">
import { $t } from '@/locales';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import {onMounted, ref} from "vue";
import {fetchGetAllCategorys} from "@/service/api";

defineOptions({
  name: 'CategorySearch'
});

const categoryOptions = ref<CommonType.Option<number>[]>([]);

async function getCategoryOptions() {
  const { error, data } = await fetchGetAllCategorys(
    {
      current: 1,
      page_size: 10,
    }
  );

  if (!error) {
    const options = data?.list.map(item => ({
      label: item.cps_category_name,
      value: item.id
    }));

    categoryOptions.value = [...options];
  }
}
interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, resetFields } = useAntdForm();

const model = defineModel<Api.CouponManage.CouponLinkSearchParams>('model', {
  default: () => ({
    cps_link_category_id: '',
    cps_link_name: '',
    cps_link_status: null,
    cps_link_type: null,
  })
});

// type RuleKey = Extract<keyof Api.CouponManage.CouponLinkSearchParams, 'userEmail' | 'userPhone'>;
//
// const rules = computed<Record<RuleKey, App.Global.FormRule>>(() => {
//   const { patternRules } = useFormRules(); // inside computed to make locale reactive
//
//   return {
//     userEmail: patternRules.email,
//     userPhone: patternRules.phone
//   };
// });

async function reset() {
  await resetFields();
  emit('reset');
}

async function search() {
  await validate();
  emit('search');
}

onMounted(async () => {
  await getCategoryOptions();
})
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
<!--        <ACol :span="24" :md="12" :lg="6">-->
<!--          <AFormItem label="id" name="id" class="m-0">-->
<!--            <AInput v-model:value.number="model.id" placeholder="请输入领券链接id" />-->
<!--          </AFormItem>-->
<!--        </ACol>-->
        <ACol :span="24" :md="12" :lg="5">
          <AFormItem label="分类id" name="cps_link_category_id" class="m-0">
            <ASelect
              v-model:value="model.cps_link_category_id"
              placeholder="选择分类"
              clearable
              :options="categoryOptions"
            >
            </ASelect>
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="5">
          <AFormItem label="名称" name="cps_link_name" class="m-0">
            <AInput v-model:value="model.cps_link_name" placeholder="请输入领券链接名称" />
          </AFormItem>
        </ACol>
        <ACol :span="12" :md="12" :lg="5">
          <AFormItem label="链接状态" name="cps_link_status" class="m-0">
            <ASelect
              v-model:value="model.cps_link_status"
              placeholder="选择状态"
              clearable
            >
              <a-select-option :value="1">启用</a-select-option>
              <a-select-option :value="2">停用</a-select-option>
            </ASelect>
          </AFormItem>
        </ACol>
        <ACol :span="12" :md="12" :lg="5">
          <AFormItem label="链接类型" name="cps_link_type" class="m-0">
            <ASelect
              v-model:value="model.cps_link_type"
              placeholder="选择类型"
              clearable
            >
              <a-select-option :value="1">普通链接</a-select-option>
              <a-select-option :value="2">小程序</a-select-option>
              <a-select-option :value="3">APP链接</a-select-option>
            </ASelect>
          </AFormItem>
        </ACol>
<!--        <ACol :span="24" :md="12" :lg="6">-->
<!--          <AFormItem label="描述" name="cps_link_desc" class="m-0">-->
<!--            <AInput v-model:value="model.cps_link_desc" placeholder="请输入描述" />-->
<!--          </AFormItem>-->
<!--        </ACol>-->
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
