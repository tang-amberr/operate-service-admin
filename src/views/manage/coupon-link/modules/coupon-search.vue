<script setup lang="ts">
import { $t } from '@/locales';
import { useAntdForm, useFormRules } from '@/hooks/common/form';

defineOptions({
  name: 'CategorySearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, resetFields } = useAntdForm();

const model = defineModel<Api.CouponManage.CouponLinkSearchParams>('model', {
  default: () => ({
    id: null,
    op_cps_link_category_id: '',
    op_cps_link_name: '',
    op_cps_link_status: null,
    op_cps_link_type: null,
    op_cps_link_desc: '',
    type: 'search' // 初始化 type 字段
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
          <AFormItem label="分类id" name="op_cps_link_category_id" class="m-0">
            <AInput v-model:value="model.op_cps_link_category_id" placeholder="请输入领券链接分类id" />
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="5">
          <AFormItem label="名称" name="op_cps_link_name" class="m-0">
            <AInput v-model:value="model.op_cps_link_name" placeholder="请输入领券链接名称" />
          </AFormItem>
        </ACol>
        <ACol :span="12" :md="12" :lg="5">
          <AFormItem label="链接状态" name="op_cps_link_status" class="m-0">
            <ASelect
              v-model:value="model.op_cps_link_status"
              placeholder="选择状态"
              clearable
            >
              <a-select-option :value="1">启用</a-select-option>
              <a-select-option :value="2">停用</a-select-option>
            </ASelect>
          </AFormItem>
        </ACol>
        <ACol :span="12" :md="12" :lg="5">
          <AFormItem label="链接类型" name="op_cps_link_type" class="m-0">
            <ASelect
              v-model:value="model.op_cps_link_type"
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
<!--          <AFormItem label="描述" name="op_cps_link_desc" class="m-0">-->
<!--            <AInput v-model:value="model.op_cps_link_desc" placeholder="请输入描述" />-->
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
