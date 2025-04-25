<script setup lang="ts">
import {computed, reactive, ref, watch} from 'vue';
import type {UploadChangeParam, UploadProps} from 'ant-design-vue';
import {Upload, message} from 'ant-design-vue';
import {useAntdForm, useFormRules} from '@/hooks/common/form';
import {$t} from '@/locales';
import {editCategory, editCouponLink, fetchGetAllCategorys, uploadFile} from '@/service/api';
import {enterpriseList, enterpriseMemberList} from "@/service/api/wechatfans";

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
    company_id: null,
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
  employee_limit: defaultRequiredRule
};

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, props.rowData);
  }
  model.value.type = props.operateType;
}

// 获取企微列表
const companyOptions = ref<CommonType.Option<number>[]>([]);
async function getCompanyOptions() {
  const { error, data } = await enterpriseList(
    {
      current: 1,
      page_size: 10,
    }
  );

  if (!error) {
    const options = data?.list.map(item => ({
      label: item.company_name,
      value: item.company_id
    }));

    companyOptions.value = [...options];
  }
}

// 获取企微下的成员列表
const employeeOptions = ref<CommonType.Option<string>[]>([]);
async function getEmployeeOptions() {
  // const { error, data } = await enterpriseMemberList(
  //   {
  //     company_id: model.value.company_id,
  //     current: 1,
  //     page_size: 10,
  //   }
  // );

  employeeOptions.value = [
    { label: '张三', value: '1' },
    { label: '李四', value: '2' },
    { label: '王五', value: '3' },
    { label: '赵六', value: '4' }
  ];

  // if (!error) {
  //   const options = data?.list.map(item => ({
  //     label: item.company_member_user_name,
  //     value: item.id
  //   }));
  //
  //   // employeeOptions.value = [...options];
  //   // 模拟员工数据
  //   employeeOptions.value = [
  //     { label: '张三', value: '1' },
  //     { label: '李四', value: '2' },
  //     { label: '王五', value: '3' },
  //     { label: '赵六', value: '4' }
  //   ];
  // }
}


// 获取企微下的限制成员列表
const employeeLimitOptions = ref<CommonType.Option<string>[]>([]);
async function getEmployeeLimitOptions() {
  console.log('employee_list', model.employee_list)
  employeeLimitOptions.value = employeeOptions.value.filter(emp =>{
    return model.employee_list.includes(emp.value);
  });
  console.log('employeeLimitOptions', employeeLimitOptions)
}

// 根据ID获取员工名称
const getEmployeeName = (id: string) => {
  const employee = employeeOptions.value.find(emp => emp.value === id);
  return employee ? employee.label : id;
};

// tabs
const activeKey = ref(1);

// 处理标签页切换
const handleTabChange = (key: number) => {
  activeKey.value = key;

  // 根据选择的限制类型准备数据
  if (key === 1) {
    // 不限制
    model.employee_limit = [];
  } else if (key === 2) {
    // 固定限制 - 清空自定义限制
    model.employee_limit = [];
  }
  // 自定义限制(key === '3')保持原有设置
};

const greetActiveKey = ref(1);
function isGreeting(key : number) {
  model.value.enable_greeting = key;
};

// 人数限制时选择的员工
const selectedEmployees = ref<string[]>([]);

// 处理员工选择
const handleEmployeeSelect = (values: string[]) => {
  // 找出新增的员工
  const currentIds = model.employee_limit.map(item => item.EmployeeId);
  const newIds = values.filter(id => !currentIds.includes(id));

  // 添加新员工到限制列表
  newIds.forEach(id => {
    model.employee_limit.push({
      EmployeeId: id,
      EmployeeLimitNum: model.fixedLimitNum, // 默认使用固定限制的值
    });
  });

  // 移除不在选择列表中的员工
  model.employee_limit = model.employee_limit.filter(item =>
    values.includes(item.EmployeeId)
  );
};

// 其他员工限制人数
const otherLimitNum = ref(0);

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  console.log('model.value: ', model)
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
watch(model.employee_list, () => {
  getEmployeeLimitOptions();
})

const loading = ref<boolean>(false);

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    resetFields();
    getCompanyOptions();
    getEmployeeOptions();
  }
});
</script>

<template>
  <ADrawer v-model:open="visible" :title="title" :width="660">
    <AForm ref="formRef" layout="vertical" :model="model" :rules="rules">
      <AFormItem label="选择企微" name="company_id">
        <ASelect
          v-model:value="model.company_id"
          @click="getCompanyOptions"
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
        <a-card class="limit-card" style="padding: 8px">
          <a-tabs v-model:activeKey="activeKey" @change="handleTabChange">
            <a-tab-pane :key="1" tab="不限制"></a-tab-pane>
            <a-tab-pane :key="2" tab="固定限制">
              <span>每日限加</span><a-input-number id="inputNumber" v-model:value="model.fixedLimitNum" :min="1" /><span>个好友</span>
            </a-tab-pane>
            <a-tab-pane :key="3" tab="自定义限制">
              <ASelect
                v-model:value="selectedEmployees"
                multiple
                mode="tags"
                :options="employeeLimitOptions"
                placeholder="请选择员工"
                style="margin-bottom: 20px"
                @click="getEmployeeLimitOptions"
                @change="handleEmployeeSelect"
              />
              <div v-for="(item, index) in model.employee_limit" :key="item.EmployeeId" class="employee-limit-item">
                <div class="limit-setting">
                  <a-tag>{{ getEmployeeName(item.EmployeeId) }}</a-tag>
                  <span>每日限加</span>
                  <a-input-number
                    style="text-align: center"
                    v-model:value="model.employee_limit[index].EmployeeLimitNum"
                    :min="1"
                  />
                  <span>个好友</span>
                </div>
              </div>
              <a-divider />
              其他员工限制人数 <a-input-number v-model:value="otherLimitNum" :min="1" /> 个好友
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </AFormItem>
      <a-divider style="height: 2px" />
      <AFormItem label="欢迎语" name="greeting">
        <a-tabs @click="isGreeting" v-model:activeKey="greetActiveKey">
          <a-tab-pane :key="1" tab="关闭欢迎语"></a-tab-pane>
          <a-tab-pane :key="2" tab="开启欢迎语">
            默认欢迎语 <a-textarea v-model:value="model.greeting" placeholder="请输入欢迎语"/>
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

<style scoped>
</style>
