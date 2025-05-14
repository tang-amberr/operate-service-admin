<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useBoolean } from '@sa/hooks';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import { enableStatusOptions } from '@/constants/business';
import MenuAuthModal from './menu-auth-modal.vue';
import {editRole, editUser} from "@/service/api";

defineOptions({
  name: 'RoleOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: AntDesign.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.Role | null;
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
const { bool: menuAuthVisible, setTrue: openMenuAuthModal } = useBoolean();

const title = computed(() => {
  const titles: Record<AntDesign.TableOperateType, string> = {
    add: $t('page.manage.role.addRole'),
    edit: $t('page.manage.role.editRole')
  };
  return titles[props.operateType];
});

type Model = Pick<Api.SystemManage.Role, 'admin_role_name' | 'type' | 'admin_role_desc' | 'admin_role_router_ids' | 'admin_role_button_ids'>;

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    type: 'add',
    admin_role_name: '',
    admin_role_desc: '',
    admin_role_router_ids: '',
    admin_role_button_ids: []
  };
}

type RuleKey = Exclude<keyof Model, 'admin_role_name'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  admin_role_name: defaultRequiredRule
};

const roleId = computed(() => props.rowData?.id || -1);

const isEdit = computed(() => props.operateType === 'edit');

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, props.rowData);
  }
  model.value.type = props.operateType;
  // 按钮key，用于后端鉴权
  if (props.operateType === 'edit') {
    Object.assign(model.value, { buttonKey: 'sys:role:edit' });
  } else {
    Object.assign(model.value, { buttonKey: 'sys:role:add' });
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  // request
  await editRole(model.value)
  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

// 关闭权限抽屉时，这个抽屉也关闭
watch(menuAuthVisible, (childVisible)=> {
  if(!childVisible) {
    closeDrawer();
  }
});

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
      <AFormItem :label="$t('page.manage.role.roleName')" name="admin_role_name">
        <AInput v-model:value="model.admin_role_name" :placeholder="$t('page.manage.role.form.roleName')" />
      </AFormItem>
      <AFormItem :label="$t('page.manage.role.roleDesc')" name="admin_role_desc">
        <AInput v-model:value="model.admin_role_desc" :placeholder="$t('page.manage.role.form.roleDesc')" />
      </AFormItem>
    </AForm>
    <ASpace v-if="isEdit" class="w-full">
      <AButton type="primary" @click="openMenuAuthModal" class="w-312px">{{ $t('page.manage.role.menuAuth') }}</AButton>
      <MenuAuthModal v-model:visible="menuAuthVisible" :role-id="roleId" :row-data="props.rowData" />
<!--      <AButton @click="openButtonAuthModal">{{ $t('page.manage.role.buttonAuth') }}</AButton>-->
<!--      <ButtonAuthModal v-model:visible="buttonAuthVisible" :role-id="roleId" :row-data="props.rowData" />-->
    </ASpace>
    <template #footer>
      <div class="flex-y-center justify-end gap-12px">
        <AButton @click="closeDrawer">{{ $t('common.cancel') }}</AButton>
        <AButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</AButton>
      </div>
    </template>
  </ADrawer>
</template>

<style scoped></style>
