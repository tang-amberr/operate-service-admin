<script setup lang="ts">
import {computed, reactive, ref, watch} from 'vue';
import type {UploadChangeParam, UploadProps} from 'ant-design-vue';
import {Upload, message} from 'ant-design-vue';
import {useAntdForm, useFormRules} from '@/hooks/common/form';
import {$t} from '@/locales';
import {editCategory, editCouponLink, fetchGetAllCategorys, uploadFile} from '@/service/api';

defineOptions({
  name: 'QrcodeOperateDrawer'
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

const {formRef, validate, resetFields} = useAntdForm();
const {defaultRequiredRule} = useFormRules();

const title = computed(() => {
  const titles: Record<AntDesign.TableOperateType, string> = {
    add: '新增企微活码',
    edit: '编辑企微活码'
  };
  return titles[props.operateType];
});

// 人数限制的tabs
const activeKey = ref('1');

/**
 * 数据类型
 */
interface ApiParams {
  id?: number;
  type: string;
  company_id: number;
  channel_name: string;
  auto_tags: number;
  employees_kip_verify: number;
  auto_remark: number;
  employee_demonstrations: string;
  employee_list: string[];
  employee_limit: {
    EmployeeId: string;
    EmployeeLimitNum: number;
  }[];
  backup_members: string[];
  enable_greeting: number;
  greeting: string;
  enable_monitor: number;
  associate_backend_members: string;
}


type Model = Pick<
  ApiParams,
  Extract<
    keyof ApiParams,
    'id',
    |'type',
    |'company_id',
    |'channel_name',
    |'auto_tags',
    |'employees_kip_verify',
    |'auto_remark',
    |'employee_demonstrations',
    |'employee_list',
    |'employee_limit',
    |'backup_members',
    |'enable_greeting',
    |'greeting',
    |'enable_monitor',
    |'associate_backend_members'
  >
>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    id: undefined,
    type: '',
    company_id: 0,
    channel_name: '',
    auto_tags: 0,
    employees_kip_verify: 1,
    auto_remark: 0,
    employee_demonstrations: '',
    employee_list: [],
    employee_limit: [],
    backup_members: [],
    enable_greeting: 0,
    greeting: '',
    enable_monitor: 0,
    associate_backend_members: ''
  };
}

type RuleKey = Extract<keyof Model, string>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  company_id: defaultRequiredRule,
  channel_name: defaultRequiredRule,
  employees_kip_verify: defaultRequiredRule,
  employee_list: defaultRequiredRule,
  employee_limit: defaultRequiredRule,
};

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, props.rowData);
  }
  model.value.type = props.operateType;

  // 按钮key，用于后端鉴权
  if (props.operateType === 'edit') {
    Object.assign(model.value, { buttonKey: 'coupon:category:edit' });
  } else {
    Object.assign(model.value, { buttonKey: 'coupon:category:add' });
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  // request
  const res = await editCategory(model.value);
  console.log('res: ', res);
  if (res.response.data.code !== 200) {
    window.$message?.error(res.response.data.msg);
    return;
  }
  closeDrawer();
  emit('submitted');
}

const loading = ref<boolean>(false);


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
      <AFormItem label="选择企微" name="company_id">
        <ASelect
          v-model:value="model.company_id"
          mode="tags"
          :options="companyOptions"
          placeholder="请选择企微"
        />
      </AFormItem>
      <AFormItem label="渠道名称" name="channel_name">
        <AInput v-model:value="model.channel_name" placeholder="请输入渠道名称"/>
      </AFormItem>
      <AFormItem label="自动通过验证" name="employees_kip_verify">
        <a-switch v-model:checked="model.employees_kip_verify" />
      </AFormItem>
      <AFormItem label="选择员工" name="employee_list">
        <ASelect
          v-model:value="model.employee_list"
          multiple
          mode="tags"
          :options="employeeOptions"
          placeholder="请选择员工"
        />
      </AFormItem>
      <AFormItem label="好友限制" name="employee_limit">
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="1" tab="不限制"></a-tab-pane>
          <a-tab-pane key="2" tab="固定限制">
            每日限加<a-input-number id="inputNumber" v-model:value="model.fixedLimitNum" :min="1" />个好友
          </a-tab-pane>
          <a-tab-pane key="3" tab="自定义限制">
            <ASelect
              v-model:value="model.employee_limit"
              multiple
              mode="tags"
              :options="employeeOptions"
              placeholder="请选择员工"
            />
            每日限加<a-input-number id="inputNumber" v-model:value="value" :min="1" />个好友
          </a-tab-pane>
        </a-tabs>
      </AFormItem>
      <AFormItem label="欢迎语" name="cps_category_name">
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="1" tab="关闭欢迎语"></a-tab-pane>
          <a-tab-pane key="2" tab="开启欢迎语">
            默认欢迎语 <a-textarea v-model:value="model.cps_category_name" placeholder="请输入欢迎语"/>
          </a-tab-pane>
        </a-tabs>
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
