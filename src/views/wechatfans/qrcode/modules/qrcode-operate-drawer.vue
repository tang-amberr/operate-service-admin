<script setup lang="ts">
import {computed, nextTick, onMounted, reactive, ref, watch} from 'vue';
import {Tag, UploadChangeParam, UploadProps} from 'ant-design-vue';
import { Upload, message } from 'ant-design-vue';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import { editCategory, editCouponLink, fetchGetAllCategorys, uploadFile } from '@/service/api';
import { companyEmployeeList, enterpriseList, enterpriseMemberList } from '@/service/api/wechatfans';

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

const { formRef, validate, resetFields } = useAntdForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<AntDesign.TableOperateType, string> = {
    add: '新增企微活码',
    edit: '编辑企微活码'
  };
  return titles[props.operateType];
});

/** 数据类型 */
interface ApiParams {
  id?: number;
  type: string;
  company_id: number;
  channel_name: string;
  auto_tags: number;
  employees_kip_verify: number;
  auto_remark: number;
  employee_demonstrations: string;
  employee_list: string;
  employee_limit_type: number;
  employee_limit_value: number;
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
    | 'id'
    | 'type'
    | 'company_id'
    | 'channel_name'
    | 'auto_tags'
    | 'employees_kip_verify'
    | 'auto_remark'
    | 'employee_demonstrations'
    | 'employee_list'
    | 'employee_limit_type'
    | 'employee_limit_value'
    | 'employee_limit'
    | 'backup_members'
    | 'enable_greeting'
    | 'greeting'
    | 'enable_monitor'
    | 'associate_backend_members'
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
    employee_list: '0',
    employee_limit_type: 0,
    employee_limit_value: 0,
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
  employee_limit: defaultRequiredRule
};

async function handleInitModel() {
  Object.assign(model, createDefaultModel());
  if (props.operateType === 'edit' && props.rowData) {
    const data = props.rowData;
    await nextTick();
    Object.assign(model, data);
    model.type = props.operateType;
  }
}

// 企业id
const companyId = ref<number>(null);
// todo 员工列表是字符串
// 员工列表
const employeeList = ref<number[]>([]);

// 获取企微列表
const companyOptions = ref<CommonType.Option<number>[]>([]);
async function getCompanyOptions() {
  const { error, data } = await enterpriseList({
    current: 1,
    page_size: 1000
  });

  if (!error) {
    const options = data?.list.map(item => ({
      label: item.company_name,
      value: item.id
    }));

    companyOptions.value = [...options];
  }
}

// 成员选项 employeeOptions
const employeeOptions = ref<CommonType.Option<number>[]>([]);
// 企业列表
async function getEmployeeOptions() {
  const { error, data } = await companyEmployeeList({
    current: 1,
    page_size: 1000,
    company_id: model.company_id
  });

  if (!error) {
    const options = data?.list.map(item => ({
      label: item.company_employee_name,
      value: item.id
    }));

    employeeOptions.value = [...options];
  }
}

// 过滤员工名称
const filterOption = (value: any, option: any) => {
  return `${option.label}`.toLowerCase().includes(`${value || ''}`.toLowerCase());
};

// 员工限制
// 限制类型
const activeKey = ref(1);
// 统一限制值
const employeeLimitValue = ref(0);
// 所有员工名字和id的map
const employeeMap = ref<Map<number, string>>(new Map());

// 处理tab变化
const handleTabChange = (key: number) => {
  model.employee_limit_type = Number(key);
  activeKey.value = Number(key);

  // 2 统一限制
  if (key === 2) {
    model.employee_limit_value = employeeLimitValue.value;
  }

  // 3 自定义， 指定＋其余统一
  if (key === 3) {
    model.employee_limit_value = employeeLimitValue.value;
  }

  // 构建所有员工名字和id的map
  employeeMap.value = new Map(employeeOptions.value.map(item => [item.value, item.label]));
  console.log('map',employeeMap.value)
};

// 限制成员选项 limitEmployeeOptions
const limitEmployeeOptions = ref<CommonType.Option<number>[]>([]);

function getLimitEmployeeOptions() {
  const options = employeeOptions.value.filter(option =>
    employeeList.value.includes(option.value)
  );
  limitEmployeeOptions.value = [...options];
};

// 选中的自定义员工
const selectedEmployees = ref<number[]>([]);


function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  console.log('model.value: ', model);
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

// 选的员工变化，限制选中的员工也变化
// watch(model.employee_list, () => {
//   getEmployeeLimitOptions();
// });

const loading = ref<boolean>(false);

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    resetFields();
    getCompanyOptions();
    console.log('company', companyOptions);
  }
});

// 企业变化，员工选项也变化
watch(companyId, () => {
  console.log('companyId', companyId)
  if (companyId.value) {
    console.log('companyId', companyId)
    model.employee_list = '';
    model.company_id = companyId.value;
    getEmployeeOptions();
  }
});

// 监听员工
watch(employeeList, () => {
  model.employee_list = employeeList.value.join(',');
  getLimitEmployeeOptions();
});
</script>

<template>
  <ADrawer v-model:open="visible" :title="title" :width="660">
    <AForm ref="formRef" layout="vertical" :model="model" :rules="rules">
      <AFormItem label="选择企微" name="company_id">
        <ASelect v-model:value="companyId" :options="companyOptions" placeholder="请选择企微" />
      </AFormItem>
      <AFormItem label="渠道名称" name="channel_name">
        <AInput v-model:value="model.channel_name" placeholder="请输入渠道名称" />
      </AFormItem>
      <AFormItem label="自动通过验证" name="employees_kip_verify">
        <ASwitch v-model:checked="model.employees_kip_verify" />
      </AFormItem>
      <AFormItem label="选择员工" name="employee_list">
        <ASelect
          v-model:value="employeeList"
          multiple
          :filter-option="filterOption"
          mode="multiple"
          :allow-clear="true"
          :options="employeeOptions"
          placeholder="请选择员工"
        />
      </AFormItem>
      <AFormItem label="好友限制" name="employee_limit">
        <ACard class="limit-card">
          <ATabs v-model:active-key="activeKey" @change="handleTabChange">
            <ATabPane :key="1" tab="不限制"></ATabPane>
            <ATabPane :key="2" tab="固定限制">
              <span>每日限加</span>
              <AInputNumber id="inputNumber" v-model:value="employeeLimitValue" :min="1" />
              <span>个好友</span>
            </ATabPane>
            <ATabPane :key="3" tab="自定义限制">
              <ASelect
                v-model:value="selectedEmployees"
                multiple
                mode="tags"
                :options="limitEmployeeOptions"
                placeholder="请选择员工"
                style="margin-bottom: 20px"
                @click="getEmployeeLimitOptions"
                @change="handleEmployeeSelect"
              />
              <div v-for="item in selectedEmployees" :key="item" class="employee-limit-item">
                <div class="limit-setting" style="margin-bottom: 6px">
                  <ATag style="font-size: 14px; line-height: 19px"
                        color="cyan">{{employeeMap.get(item)}}</ATag>
                  <div style="margin-right: 4px; display: inline-block">每日限加</div>
                  <AInputNumber
                    v-model:value="model.employee_limit[item]"
                    style="text-align: center"
                    :min="1"
                  />
                  <div style="margin-left: 4px; display: inline-block">个好友</div>
                </div>
              </div>
              <ADivider />
              其他员工限制人数
              <AInputNumber v-model:value="employeeLimitValue" :min="1" />
              个好友
            </ATabPane>
          </ATabs>
        </ACard>
      </AFormItem>
      <ADivider style="height: 2px" />
      <AFormItem label="欢迎语" name="greeting">
        <ACard>
          <ATabs v-model:active-key="greetActiveKey" @click="isGreeting">
            <ATabPane :key="1" tab="关闭欢迎语"></ATabPane>
            <ATabPane :key="2" tab="开启欢迎语">
              默认欢迎语
              <ATextarea v-model:value="model.greeting" placeholder="请输入欢迎语" />
            </ATabPane>
          </ATabs>
        </ACard>
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

<style scoped>
::v-deep .ant-card-body {
  padding: 1px 3px 1px 9px;
}
</style>
