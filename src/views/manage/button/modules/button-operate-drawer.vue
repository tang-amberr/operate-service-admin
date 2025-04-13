<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import {editButton} from '@/service/api';
import { $t } from '@/locales';

defineOptions({
  name: 'ButtonOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: AntDesign.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.User | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, resetFields } = useAntdForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<AntDesign.TableOperateType, string> = {
    add:'新增按钮',
    edit: '编辑按钮'
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.EditAdminButton,
  'key' | 'title' | 'status' | 'type'
>;

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    key: '',
    title: '',
    status: null,
    type: 'add',
  };
}

type RuleKey = Extract<keyof Model, 'key' | 'status' | 'title'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  key: defaultRequiredRule,
  status: defaultRequiredRule,
  title: defaultRequiredRule,
};

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, props.rowData);
  }
  model.value.type = props.operateType;
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  // request
  await editButton(model.value)
  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    resetFields();
  }
});
</script>

<template>
  <ADrawer v-model:open="visible" :title="title" :width="360">
    <AForm ref="formRef" layout="vertical" :model="model" :rules="rules">
      <AFormItem label="按钮key" name="key">
        <AInput v-model:value="model.key" placeholder="请输入按钮的键" />
      </AFormItem>
      <AFormItem label="标题" name="title">
        <AInput v-model:value="model.title" placeholder="请输入标题" />
      </AFormItem>
      <AFormItem label="状态" name="status">
        <ARadioGroup v-model:value="model.status">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="2">禁用</a-radio>
        </ARadioGroup>
      </AFormItem>
    </AForm>
    <template #footer>
      <ASpace :size="16">
        <AButton @click="closeDrawer">{{ $t('common.cancel') }}</AButton>
        <AButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</AButton>
      </ASpace>
    </template>
  </ADrawer>
</template>

<style scoped></style>
