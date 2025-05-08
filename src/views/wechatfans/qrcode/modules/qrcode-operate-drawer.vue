<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, shallowRef, watch } from 'vue';
import type { TreeSelectProps, UploadChangeParam, UploadProps } from 'ant-design-vue';
import { Upload, message } from 'ant-design-vue';
import EmojiPicker from 'vue3-emoji-picker';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import { editCategory, editCouponLink, fetchGetAllCategorys, uploadFile } from '@/service/api';
import {
  addCompanyAttachment,
  companyEmployeeList,
  companyTagTree,
  enterpriseList,
  uploadCompanyAttachment,
  uploadCompanyImage
} from '@/service/api/wechatfans';
import 'vue3-emoji-picker/css';

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

/** 活码数据类型 */
interface ApiParams {
  id?: number;
  type: string;
  company_id: number;
  channel_name: string;
  tag_ids: string;
  employees_kip_verify: number;
  remark: string;
  employee_list: string;
  employee_limit_type: number;
  employee_limit_value: number;
  employee_limit: {
    employee_id: number;
    employee_limit_num: number;
  }[];
  greeting: string;
  attachment_ids: string;
}

type Model = Pick<
  ApiParams,
  Extract<
    keyof ApiParams,
    | 'id'
    | 'type'
    | 'company_id'
    | 'channel_name'
    | 'tag_ids'
    | 'employees_kip_verify'
    | 'remark'
    | 'employee_list'
    | 'employee_limit_type'
    | 'employee_limit_value'
    | 'employee_limit'
    | 'greeting'
    | 'attachment_ids'
  >
>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    id: undefined,
    type: '',
    company_id: 0,
    channel_name: '',
    tag_ids: '',
    employees_kip_verify: 1,
    remark: '',
    employee_list: '0',
    employee_limit_type: 0,
    employee_limit_value: 0,
    employee_limit: [],
    greeting: '',
    attachment_ids: ''
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

// 标签相关 todo 过滤掉父亲标签
// 标签选项
const treeData = ref<TreeSelectProps['treeData']>([]);
const tagValue = ref<string[]>([]);

async function getTree() {
  const { error, data } = await companyTagTree({
    company_id: companyId.value
  });

  if (!error) {
    treeData.value = recursiveTransform(data);
    console.log('treeData', treeData);
  }
}

// 标签树
function recursiveTransform(data: Api.CompanyTag.TagTree[]): TreeSelectProps['treeData'] {
  return data.map(item => {
    const { id: value, name } = item;

    if (item.children) {
      return {
        value,
        label: name,
        children: recursiveTransform(item.children)
      };
    }

    return {
      value,
      label: name
    };
  });
}
// 搜索标签
function filterTreeNode(inputValue: string, treeNode: any) {
  return treeNode.label.toLowerCase().includes(inputValue.toLowerCase());
}

// 标签树部分
const checks = shallowRef<number[]>([]);

async function getChecks() {
  // request
  if (props.operateType === 'add') {
    checks.value = [];
  }
  // checks.value = res.data.ids.filter(id => !halfSelectedNodes.value.includes(id));
}
// 初始化标签树的数据
async function init() {
  await getTree();
  await getChecks();
}

// 备注部分
// 类型声明
type Variable = '{nickname}' | '{sex}' | '{date}' | '{channel}';
// 使用Set存储激活的变量
const activeVars = reactive(new Set<Variable>());
// 按钮配置
const buttons = [
  { var: '{nickname}', label: '昵称' },
  { var: '{sex}', label: '性别' },
  { var: '{date}', label: '日期' },
  { var: '{channel}', label: '渠道' }
];
// 切换变量
const toggleVariable = (variable: Variable) => {
  if (activeVars.has(variable)) {
    activeVars.delete(variable);
  } else {
    activeVars.add(variable);
  }
  model.remark = Array.from(activeVars).join('');
};

// 成员选项 employeeOptions
const employeeOptions = ref<CommonType.Option<number>[]>([]);
// 企业列表
async function getEmployeeOptions() {
  const { error, data } = await companyEmployeeList({
    current: 1,
    page_size: 1000,
    company_id: model.company_id,
    employee_status: 1
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
  console.log('map', employeeMap.value);
};

// 限制成员选项 limitEmployeeOptions
const limitEmployeeOptions = ref<CommonType.Option<number>[]>([]);

function getLimitEmployeeOptions() {
  const options = employeeOptions.value.filter(option => employeeList.value.includes(option.value));
  limitEmployeeOptions.value = [...options];
}

// 选中的自定义员工
const selectedEmployees = ref<number[]>([]);

// 设置自定义员工限制
function setLimitNum(value: number | string) {
  model.employee_limit_value = Number(value);
}

// 自定义员工限制
function updateLimit(id: number, num: number) {
  const index = model.employee_limit.findIndex(item => item.employee_id === id);
  if (index !== -1) {
    model.employee_limit[index].employee_limit_num = num;
  } else {
    model.employee_limit.push({
      employee_id: id,
      employee_limit_num: num
    });
  }
}

// 取消选中自定义限制员工选项
function deselectCustomEmployee(value: number) {
  model.employee_limit = model.employee_limit.filter(item => item.employee_id !== value);
}

// 欢迎语部分
// 设置欢迎语
const greetActiveKey = ref<number>(1);

const open = ref<boolean>(false);

const showEmoji = () => {
  open.value = true;
};

const handleOk = (e: MouseEvent) => {
  open.value = false;
};

// 选择表情
const handleEmojiSelect = (emoji: any) => {
  // 将表情添加到输入框中
  model.greeting += emoji.i;
  // 可以选择自动关闭弹窗
  open.value = false;
};

// 欢迎语附件部分
// 上传图片
// 图片消息企微永久url
const url = ref('');
// 企微附件存储桶中的文件名
const bucket_file_name = ref('');
// 已经上传的附件id
const uploadedAttachmentIds = ref<number[]>([]);

interface UploadAttachmentResponseType {
  type: string;
  media_id: string;
  create_at: number;
}
// 上传附件响应
const uploadAttachmentResponse = ref<UploadAttachmentResponseType>({});

const file = ref({});
const uploadLoading = ref<boolean>(false);
const messageType = ref('');
// 数据类型
/** 附件数据类型 */

type AttachmentModel = Pick<
  Api.CompanyAttachment.AddCompanyAttachment,
  Extract<
    keyof Api.CompanyAttachment.AddCompanyAttachment,
    | 'company_id'
    | 'attachment_type'
    | 'media_id'
    | 'create_at'
    | 'url'
    | 'bucket_file_name'
    | 'link_url'
    | 'title'
    | 'description'
    | 'mini_program_app_id'
    | 'mini_program_title'
    | 'mini_program_page_path'
    | 'mini_program_child_title'
  >
>;

const attachmentModel: AttachmentModel = reactive(createDefaultAttachmentModel());

function createDefaultAttachmentModel(): AttachmentModel {
  return {
    company_id: 0,
    attachment_type: '',
    media_id: '',
    create_at: 0,
    url: '',
    bucket_file_name: '',
    link_url: '',
    title: '',
    description: '',
    mini_program_app_id: '',
    mini_program_title: '',
    mini_program_page_path: '',
    mini_program_child_title: ''
  };
}

async function handleInitAttachmentModel() {
  Object.assign(attachmentModel, createDefaultAttachmentModel());
  attachmentModel.attachment_type = messageType.value;
}

const handleChange = async (info: UploadChangeParam, type: string) => {
  messageType.value = type;
  await handleInitAttachmentModel();
  if (info.file.status === 'uploading') {
    uploadLoading.value = true;
    return;
  }
  if (info.file.status === 'error') {
    uploadLoading.value = false;
    message.error('upload error');
  }
};

// 检查大小和类型
const beforeUpload: UploadProps['beforeUpload'] = file => {
  // 图片类型
  if (messageType.value !== 'video') {
    // 支持JPG,PNG
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isImage) {
      message.error(`${file.name} is not an image file`);
      return Upload.LIST_IGNORE;
    }

    // 图片不超过10m，支持JPG,PNG
    const isLt2M = file.size / 1024 / 1024 < 9;
    if (!isLt2M) {
      message.error(`${file.name} must smaller than 2MB`);
      return Upload.LIST_IGNORE;
    }

    return true;
  }
  const isVideo = file.type.startsWith('video/');
  if (!isVideo) {
    message.error(`${file.name} is not a video file`);
    return Upload.LIST_IGNORE;
  }

  // 视频不超过10m
  const isLt2M = file.size / 1024 / 1024 < 10;
  if (!isLt2M) {
    message.error(`${file.name} must smaller than 20MB`);
    return Upload.LIST_IGNORE;
  }

  return true;
};

const customUpload = e => {
  const formdata = new FormData();
  formdata.append('file', e.file);
  formdata.append('type', '3');
  formdata.append('company_id', String(model.company_id));
  formdata.append('attachment_type', String(messageType.value === 'video' ? 'video' : 'image'));

  // 上传存储桶
  uploadFile(formdata)
    .then(res => {
      console.log('上传成功', res.data);
      // 调用实例的成功方法通知组件该文件上传成功
      bucket_file_name.value = res.data?.url;
      e.onSuccess(res.data, e);
    })
    .catch(err => {
      // 调用实例的失败方法通知组件该文件上传失败
      e.onError(err);
    });

  attachmentModel.company_id = model.company_id;
  // 上传企微附件
  if (messageType.value === 'image') {
    // 上传企业微信为永久图片
    const res = uploadCompanyImage(formdata);
    url.value = res.response.data.data?.url;

    // 本地构建消息
    attachmentModel.bucket_file_name = bucket_file_name.value;
    attachmentModel.url = url.value;
  } else if (messageType.value === 'video') {
    // 上传企业微信视频
    const res = uploadCompanyAttachment(formdata);
    uploadAttachmentResponse.value.type = res.reponse.data.data?.type;
    uploadAttachmentResponse.value.media_id = res.reponse.data.data?.media_id;
    uploadAttachmentResponse.value.create_at = res.reponse.data.data?.create_at;

    // 本地构建视频消息
    attachmentModel.bucket_file_name = bucket_file_name.value;
    attachmentModel.attachment_type = res.reponse.data.data?.type;
    attachmentModel.media_id = res.reponse.data.data?.media_id;
    attachmentModel.created_at = res.reponse.data.data?.create_at;
  }

  // 上传本地数据库
  const res = addCompanyAttachment(attachmentModel);
  // 上传后 id放入数组
  uploadedAttachmentIds.value.push(res.reponse.data.data?.attachment_id);

  //小程序 link
};

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
  console.log('companyId', companyId);
  if (companyId.value) {
    init();
    console.log('companyId', companyId);
    model.employee_list = '';
    model.company_id = companyId.value;
    getEmployeeOptions();
  }
});

// 监听员工
watch(employeeList, () => {
  model.employee_list = employeeList.value.join(',');
  getLimitEmployeeOptions();
  // 删除的员工
  let val: number;
  selectedEmployees.value = selectedEmployees.value.filter(employee => {
    if (employeeList.value.includes(employee)) {
      return true;
    }
    val = employee;
    return false;
  });
  // 删除取消选中的
  model.employee_limit = model.employee_limit.filter(item => item.employee_id !== val);
  console.log('model.employee_limit: ', model.employee_limit);
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
        <ACard>
          <ASwitch v-model:checked="model.employees_kip_verify" />
        </ACard>
      </AFormItem>
      <AFormItem label="备注" name="remark">
        <ACard>
          <ATooltip placement="top" title="不超过20字">
            <ATextarea v-model:value="model.remark" placeholder="请输入备注" />
          </ATooltip>
          <AButton
            v-for="btn in buttons"
            :key="btn.var"
            style="margin-right: 5px; margin-top: 5px"
            :type="activeVars.has(btn.var) ? 'primary' : 'dashed'"
            @click="toggleVariable(btn.var)"
          >
            {{ btn.label }}
          </AButton>
        </ACard>
      </AFormItem>
      <AFormItem label="选择标签" name="tag_ids">
        <ACard>
          <ATabs>
            <ATabPane :key="1" tab="不打标签"></ATabPane>
            <ATabPane :key="2" tab="自动打标签">
              <ATreeSelect
                v-model:value="tagValue"
                show-search
                style="width: 100%"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                placeholder="选择标签"
                allow-clear
                multiple
                :tree-data="treeData"
                :filter-tree-node="filterTreeNode"
                tree-node-filter-prop="label"
              ></ATreeSelect>
            </ATabPane>
          </ATabs>
        </ACard>
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
              <ATag style="font-size: 14px; line-height: 19px" color="orange">每日限加</ATag>
              <AInputNumber
                id="inputNumber"
                v-model:value="employeeLimitValue"
                style="vertical-align: middle"
                :min="1"
              />
              <div style="margin-left: 4px; display: inline-block">个好友</div>
            </ATabPane>
            <ATabPane :key="3" tab="自定义限制">
              <ASelect
                v-model:value="selectedEmployees"
                multiple
                mode="multiple"
                :options="limitEmployeeOptions"
                placeholder="请选择员工"
                style="margin-bottom: 20px"
                @deselect="deselectCustomEmployee"
              />
              <div v-for="employeeId in selectedEmployees" :key="employeeId" class="employee-limit-item">
                <div class="limit-setting" style="margin-bottom: 6px">
                  <ATag style="font-size: 14px; line-height: 19px" color="cyan">{{ employeeMap.get(employeeId) }}</ATag>
                  <div style="margin-right: 4px; display: inline-block">每日限加</div>
                  <AInputNumber
                    name="employee_limit_num"
                    style="vertical-align: middle"
                    :min="1"
                    @update:value="val => updateLimit(employeeId, val)"
                  />
                  <div style="margin-left: 4px; display: inline-block">个好友</div>
                </div>
                <ADivider style="height: 1px; margin: 5px" />
              </div>
              <ATag style="font-size: 14px; line-height: 19px" color="orange">其他员工</ATag>
              每日限加
              <AInputNumber
                v-model:value="employeeLimitValue"
                style="vertical-align: middle"
                :min="1"
                @change="setLimitNum"
              />
              <div style="margin-left: 4px; display: inline-block">个好友</div>
            </ATabPane>
          </ATabs>
        </ACard>
      </AFormItem>
      <AFormItem label="欢迎语" name="greeting">
        <ACard>
          <ATabs v-model:active-key="greetActiveKey">
            <ATabPane :key="1" tab="关闭欢迎语"></ATabPane>
            <ATabPane :key="2" tab="开启欢迎语">
              默认欢迎语
              <ATextarea v-model:value="model.greeting" placeholder="请输入欢迎语" />
              <AButton type="dashed" style="margin-top: 8px" @click="showEmoji">表情</AButton>
              <AModal v-model:open="open" title="选择表情" centered style="width: 540px" @ok="handleOk">
                <EmojiPicker :native="true" style="width: 500px; height: 500px" @select="handleEmojiSelect" />
              </AModal>
              <ATooltip placement="top" title="附件 不超过9条">
                <ATag style="font-size: 16px; line-height: 32px; margin-left: 16px; margin-right: 5px" color="blue">
                  其他消息》》》
                </ATag>
              </ATooltip>
              <ATooltip placement="top" title="图片支持jpeg和png且不超过10M">
                <AUpload
                  v-model:file="file"
                  style="margin-top: 8px; margin-right: 5px; display: inline-block"
                  name="file"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                  :custom-request="customUpload"
                  @change="info => handleChange(info, 'image')"
                >
                  <AButton>图片</AButton>
                </AUpload>
              </ATooltip>
              <ATooltip placement="top" title="视频不超过10M">
                <AUpload
                  v-model:file="file"
                  style="margin-top: 8px; margin-right: 5px; display: inline-block"
                  name="file"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                  :custom-request="customUpload"
                  @change="info => handleChange(info, 'video')"
                >
                  <AButton>视频</AButton>
                </AUpload>
              </ATooltip>
              <AButton type="dashed" style="margin-top: 8px; margin-right: 5px" @click="showEmoji">链接</AButton>
              <AButton type="dashed" style="margin-top: 8px; margin-right: 5px" @click="showEmoji">小程序</AButton>
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
  padding: 3px 3px 6px 9px;
}
</style>
