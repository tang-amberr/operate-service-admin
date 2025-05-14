<script setup lang="ts">
import { $t } from '@/locales';
import { useAntdForm, useFormRules } from '@/hooks/common/form';

defineOptions({
  name: 'ButtonSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, resetFields } = useAntdForm();

const model = defineModel<Api.SystemManage.UserSearchParams>('model', {
  default: () => ({
    admin_user_username: '',
    admin_user_status: null
  })
});


async function reset() {
  await resetFields();
  emit('reset');
}

async function search() {
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
          <AFormItem :label="$t('page.manage.user.userName')" name="admin_user_username" class="m-0">
            <AInput v-model:value="model.admin_user_username" :placeholder="$t('page.manage.user.form.userName')" />
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="6">
          <AFormItem :label="$t('page.manage.user.userStatus')" name="admin_user_status" class="m-0">
            <ASelect
              v-model:value="model.admin_user_status"
              :placeholder="$t('page.manage.user.form.userStatus')"
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
