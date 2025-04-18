<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import {editCouponLink, editUser, fetchGetRoleList} from '@/service/api';
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
    add: $t('page.manage.user.addUser'),
    edit: $t('page.manage.user.editUser')
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.EditUser,
  'username' | 'password' | 'status' | 'type' | 'role_ids'
>;

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    password: '',
    username: '',
    status: null,
    type: 'add',
    role_ids: [],
    user_roles: []
  };
}

type RuleKey = Extract<keyof Model, 'username' | 'password' | 'status'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  username: defaultRequiredRule,
  status: defaultRequiredRule,
  password: defaultRequiredRule
};

/** the enabled role options */
const roleOptions = ref<CommonType.Option<string>[]>([]);

async function getRoleOptions() {
  const { error, data } = await fetchGetRoleList({
    current: 1,
    page_size: 10
  });

  if (!error) {
    const options = data.list.map(item => ({
      label: item.role_desc,
      value: item.id
    }));
    console.log('model', model.value)

    // the mock data does not have the roleCode, so fill it
    // if the real request, remove the following code

    roleOptions.value = [...options];
  }
}

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, props.rowData);
  }
  model.value.type = props.operateType;
  // 按钮key，用于后端鉴权
  if (props.operateType === 'edit') {
    Object.assign(model.value, { buttonKey: 'sys:user:edit' });
  } else {
    Object.assign(model.value, { buttonKey: 'sys:user:add' });
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  // request
  await editUser(model.value)
  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    resetFields();
    getRoleOptions();
  }
});
</script>

<template>
  <ADrawer v-model:open="visible" :title="title" :width="360">
    <AForm ref="formRef" layout="vertical" :model="model" :rules="rules">
      <AFormItem :label="$t('page.manage.user.userName')" name="username">
        <AInput v-model:value="model.username" :placeholder="$t('page.manage.user.form.userName')" />
      </AFormItem>
      <AFormItem label="密码" name="password">
        <AInput v-model:value="model.password" placeholder="请输入密码" />
      </AFormItem>
      <AFormItem :label="$t('page.manage.user.userStatus')" name="status">
        <ARadioGroup v-model:value="model.status">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="2">禁用</a-radio>
        </ARadioGroup>
      </AFormItem>
      <AFormItem :label="$t('page.manage.user.userRole')" name="roles">
        <ASelect
          v-model:value="model.role_ids"
          multiple
          mode="tags"
          :options="roleOptions"
          :placeholder="$t('page.manage.user.form.userRole')"
        />
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
