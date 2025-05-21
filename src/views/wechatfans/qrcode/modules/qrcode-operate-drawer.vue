<script setup lang="ts">
import { computed, nextTick, reactive, ref, shallowRef, watch, watchEffect } from 'vue';
import type { TreeSelectProps, UploadChangeParam, UploadProps } from 'ant-design-vue';
import { Upload, message } from 'ant-design-vue';
import EmojiPicker from 'vue3-emoji-picker';
import type { Rule } from 'ant-design-vue/es/form';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import { uploadFile } from '@/service/api';
import {
  addCompanyAttachment,
  companyEmployeeList,
  companyQrcodeAdd,
  companyQrcodeEdit,
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

type Model = Pick<
  Api.LiveCode.CompanyMessageAdd,
  Extract<
    keyof Api.LiveCode.CompanyMessageAdd,
    | 'company_id'
    | 'channel_name'
    | 'tag_ids'
    | 'employee_skip_verify'
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
    company_id: 0,
    channel_name: '',
    tag_ids: '',
    employee_skip_verify: 1,
    remark: '',
    employee_list: '',
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
  employee_skip_verify: defaultRequiredRule,
};

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

// 标签相关
// 标签选项
const treeData = ref<TreeSelectProps['treeData']>([]);
const tagValue = ref<string[]>([]);
// 父标签
const parentTagIds = ref<string[]>([]);
const reloadKey = ref(0); // 用于强制刷新组件

function validSelect() {
  if (companyId.value === null) {
    message.error('请先选择企业');
  }
}
// 获取标签树
async function getTree(id: number = companyId.value) {
  const { error, data } = await companyTagTree({
    company_id: id
  });

  if (!error) {
    treeData.value = recursiveTransform(data);
    console.log('treeData', treeData);
  }

  data?.forEach(tag => {
    if (tag.pid === 0) {
      parentTagIds.value.push(tag.id.toString());
    }
  });
}

// 构建标签树
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

// 上传附件响应

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

// 初始化附件model
async function handleInitAttachmentModel() {
  Object.assign(attachmentModel, createDefaultAttachmentModel());
  attachmentModel.attachment_type = messageType.value;
}

const checkPicture = async (_rule: Rule, value: string) => {};

type AttachmentRuleKey = Extract<keyof AttachmentModel, string>;

const linkRules: Record<AttachmentRuleKey, App.Global.FormRule> = {
  link_url: defaultRequiredRule,
  title: defaultRequiredRule
};

// appid验证
const checkAppId = async (_rule: Rule, value: string) => {
  const regex = /^wx[0-9a-z]{16}$/;
  const isValid = regex.test(value);
  if (!isValid) {
    return Promise.reject('请输入合法的appid');
  }
};

const miniProgramRules: Record<AttachmentRuleKey, App.Global.FormRule> = {
  mini_program_app_id: [{ validator: checkAppId, trigger: 'change' }],
  mini_program_child_title: defaultRequiredRule,
  media_id: [{ validator: checkPicture, trigger: 'change' }]
};
// 回显图片
const imageUrl = ref<string>('');

// 上传本地消息表
async function handleAddMessage() {
  attachmentModel.company_id = companyId.value;
  attachmentModel.attachment_type = messageType.value;
  const res = await addCompanyAttachment(attachmentModel);
  if (res.response.data.code === 200) {
    message.success('上传成功');
  }
  uploadedAttachmentIds.value.push(res.data?.attachment_id);
}

// 上传图片变化
const handleChange = async (info: UploadChangeParam, type: string) => {
  console.log('info', info);
  messageType.value = type;
  // await handleInitAttachmentModel();
  console.log('info', info);
  if (info.file.status === 'uploading') {
    uploadLoading.value = true;
    return;
  }
  // 上传完毕
  if (info.file.status === 'done') {
    try {
      const formdata = new FormData();
      formdata.append('file', info.file.originFileObj);
      formdata.append('company_id', String(model.company_id));
      formdata.append('attachment_type', String(messageType.value === 'video' ? 'video' : 'image'));

      attachmentModel.company_id = model.company_id;
      // 上传企业微信为永久图片
      // if (messageType.value === 'image') {
      //   const result = await uploadCompanyImage(formdata);
      //   console.log('res', result);
      //   url.value = result.response.data.data?.url;
      //   if (result.response?.data.code !== 200) {
      //     message.error(result.response?.data.message);
      //   } else {
      //     message.success('上传成功!');
      //   }
      //   // 本地构建消息
      //   attachmentModel.bucket_file_name = bucket_file_name.value;
      //   attachmentModel.url = url.value;
      // }

      // 上传企业微信附件
      const res = await uploadCompanyAttachment(formdata);
      attachmentModel.bucket_file_name = bucket_file_name.value;
      attachmentModel.attachment_type = messageType.value;
      attachmentModel.media_id = res.response.data.data?.media_id;
      attachmentModel.create_at = res.response.data.data?.create_at;

      // 上传消息s
      const ress = await addCompanyAttachment(attachmentModel);
      console.log('res: ', ress);
      console.log('res.data', ress.data);
      uploadedAttachmentIds.value.push(ress.data?.attachment_id);
      console.log('uploadids', uploadedAttachmentIds);
    } catch (err) {
      console.error('上传过程出错:', err);
      message.error(err.message || '上传过程出错');
      uploadLoading.value = false;
    }
  }

  if (info.file.status === 'error') {
    uploadLoading.value = false;
    message.error('upload error');
  }
};

// 检查大小和类型
const beforeUpload: UploadProps['beforeUpload'] = file => {
  if (companyId.value === null) {
    message.error('请先选择企微');
    return false;
  }
  if (uploadedAttachmentIds.value.length >= 9) {
    message.error('最多上传9个附件,无法再上传了');
    return Upload.LIST_IGNORE;
  }

  console.log('messagetype', messageType.value)
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

// 上传文件
const customUpload = async e => {
  const formdata = new FormData();
  formdata.append('file', e.file);
  formdata.append('type', '3');

  // 上传存储桶
  const result = await uploadFile(formdata);
  if (result.response?.data.code !== 200) {
    message.error(result.response?.data.message);
  } else {
    bucket_file_name.value = result.response.data.data?.url;
    e.onSuccess(result.response.data.data?.url, e.file);
  }
  // 回显路径
  if (messageType.value === 'link' || messageType.value === 'miniprogram') {
    imageUrl.value = `https://store.ssccn.cn${bucket_file_name.value}`;
  }
};

// 点击视频
function clickVideo() {
  if(uploadedAttachmentIds.value.length >= 9) {
    message.error('最多上传9个附件,再上传无法生效！');
    return;
  }
  messageType.value = 'video';
}

// 点击图片
function clickImage() {
  if(uploadedAttachmentIds.value.length >= 9) {
    message.error('最多上传9个附件,再上传无法生效！');
    return;
  }
  messageType.value = 'image';
}


// 第一级抽屉
const open = ref<boolean>(false);
// 二级链接抽屉
const linkChildrenDrawer = ref<boolean>(false);
// 展示二级链接抽屉
const showLinkChildrenDrawer = () => {
  if (companyId.value === null) {
    message.error('请先选择企微');
    return;
  }

  if(uploadedAttachmentIds.value.length >= 9) {
    message.error('最多上传9个附件,再上传无法生效！');
    return;
  }

  messageType.value = 'link';
  imageUrl.value = '';
  // 初始化附件model
  handleInitAttachmentModel();
  linkChildrenDrawer.value = true;
};

// 关闭二级链接抽屉
function closeLinkChildDrawer() {
  imageUrl.value = '';
  linkChildrenDrawer.value = false;
}
// 提交二级链接抽屉
function handleLinkChildSubmit() {
  if(attachmentModel.link_url === '' || attachmentModel.title === '') {
    message.error('请填写必填字段');
    return;
  }
  closeLinkChildDrawer();
  // todo
  handleAddMessage();
}

// 二级小程序抽屉
const miniProgramModal = ref<boolean>(false);
// 展示二级小程序抽屉
const showMiniProgramModal = () => {
  if (companyId.value === null) {
    message.error('请先选择企微');
    return;
  }

  if(uploadedAttachmentIds.value.length >= 9) {
    message.error('最多上传9个附件,再上传无法生效！');
    return;
  }

  messageType.value = 'miniprogram';

  imageUrl.value = '';
  // 初始化附件model
  handleInitAttachmentModel();
  miniProgramModal.value = true;
};

// 关闭二级小程序抽屉
function closeMiniProgramChildDrawer() {
  imageUrl.value = '';
  miniProgramModal.value = false;
}
// 提交二级小程序抽屉
function handleMiniprogramChildSubmit() {
  if(attachmentModel.mini_program_app_id === '' || attachmentModel.mini_program_child_title === '') {
    message.error('请填写必填字段');
    return;
  }
  closeMiniProgramChildDrawer();
  handleAddMessage();
}

// 开启表情modal
const showEmoji = () => {
  open.value = true;
};
// 关闭表情modal
const handleEmojiOk = (e: MouseEvent) => {
  open.value = false;
};

// 关闭一级抽屉
function closeDrawer() {
  visible.value = false;
  handleInitModel();
}

// 是否开启标签
const activeTagKey = ref(1);

// 设置model数据
function setModelData() {
  const tagIds = tagValue.value.filter(item => {
    return !parentTagIds.value.includes(item);
  });
  model.tag_ids = tagIds.join(',');

  // 附件id
  model.attachment_ids = uploadedAttachmentIds.value.join(',');

  // 处理bool
  model.employee_skip_verify = model.employee_skip_verify ? 1 : 2;

  // 关闭欢迎语时，欢迎语为空
  if (greetActiveKey.value === 1) {
    model.greeting = '';
  }

  // 限制方式
  model.employee_limit_type = activeKey.value;

  // 标签
  if (activeTagKey.value === 1) {
    model.tag_ids = '';
  }
}

async function handleSubmit() {
  await validate();
  // 检查变量
  if(model.employee_list === '') {
    message.error('请选择员工');
    return;
  }

  setModelData();
  // request
  if (props.operateType === 'add') {
    const res = await companyQrcodeAdd(model);
    if (res.response.data.code === 200) {
      message.success('添加成功');
    }
  } else {
    const res = await companyQrcodeEdit(model);
    if (res.response.data.code === 200) {
      message.success('更新成功');
    }
  }

  closeDrawer();
  emit('submitted');
}

const loading = ref<boolean>(false);
const limitNumMap = ref<Map<number, number>>(new Map());

async function handleInitModel() {
  Object.assign(model, createDefaultModel());
  if (props.operateType === 'edit' && props.rowData) {
    const data = props.rowData;
    await getTree(data.company_id);

    const strArr = data.attachment_ids.split(',');
    uploadedAttachmentIds.value = strArr.map(str => {
      const num = Number.parseInt(str, 10);
      if (Number.isNaN(num)) {
        message.error('attachment_ids转换失败');
      }
      return num;
    });

    console.log('uploadedAttachmentIds: ', uploadedAttachmentIds)
    console.log('data: ', data);
    Object.assign(model, data);
    console.log('model: ', model);
    // 公司
    companyId.value = model.company_id;
    // 是否自动跳过
    model.employee_skip_verify = model.employee_skip_verify === 1;

    // 好友限制
    activeKey.value = model.employee_limit_type;

    // 员工
    const stringEmployeeIds = model.employee_list.split(',');
    const numberEmployeeIds: number[] = [];
    stringEmployeeIds.forEach(item => {
      numberEmployeeIds.push(Number(item));
    });
    employeeList.value = numberEmployeeIds;

    // 解析json
    if (data.employee_limit.length) {
      const limitInfo = JSON.parse(data.employee_limit);
      model.employee_limit = limitInfo.employee_limits;
      employeeLimitValue.value = limitInfo.employee_limit_value;
    }

    if (model.employee_limit_type === 3) {
      console.log('asdfasdfaasdfasfd', data.associated_employee);
      employeeMap.value = new Map(data.associated_employee.map(item => [item.employee_id, item.employee_name]));
      // 回显选中的自定义员工\
      const options = data.associated_employee.map(item => ({
        label: item.employee_name,
        value: item.employee_id
      }));
      await nextTick();

      limitEmployeeOptions.value = [...options];
      // console.log('limitEmployeeOptions.value', limitEmployeeOptions.value)
      selectedEmployees.value = model.employee_limit.map(item => {
        return item.employee_id;
      });
      // 每个员工对应的限制数量
      limitNumMap.value = model.employee_limit.reduce((map, item) => {
        map.set(item.employee_id, item.employee_limit_num);
        return map;
      }, new Map<number, number>());
      await nextTick();
      console.log('limitNumMap.value', limitNumMap.value);
    }

    // 招呼语
    greetActiveKey.value = model.greeting.length ? 2 : 1;

    await nextTick();
    activeTagKey.value = 2;
    tagValue.value = model.tag_ids.split(',');

    await nextTick();
    console.log('model', model);
    console.log('data', data);
  } else {
    companyId.value = null;
    tagValue.value = [];
    activeTagKey.value = 1;
    employeeList.value = [];
    activeKey.value = 1;
    greetActiveKey.value = 1;
    await nextTick();
    Object.assign(model, createDefaultModel());
  }
}

watch(visible, () => {
  getCompanyOptions();
  if (visible.value) {
    handleInitModel();
    resetFields();
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
    tagValue.value = [];
  }
});

// 监听员工
watch(employeeList, () => {
  console.log('employeeList', employeeList);
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
  if (model.employee_limit.length > 0) {
    model.employee_limit = model.employee_limit.filter(item => item.employee_id !== val);
  }
  console.log('model.employee_limit: ', typeof model.employee_limit);
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
      <AFormItem label="自动通过验证" name="employee_skip_verify">
        <ACard>
          <ASwitch v-model:checked="model.employee_skip_verify" />
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
          <ATabs v-model:active-key="activeTagKey">
            <ATabPane :key="1" tab="不打标签"></ATabPane>
            <ATabPane :key="2" tab="自动打标签">
              <ATreeSelect
                :key="reloadKey"
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
                @click="validSelect"
              ></ATreeSelect>
            </ATabPane>
          </ATabs>
        </ACard>
      </AFormItem>
      <AFormItem label="选择员工">
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
      <AFormItem label="好友限制">
        <ACard class="limit-card">
          <ATabs v-model:active-key="activeKey" @change="handleTabChange">
            <ATabPane :key="1" tab="不限制"></ATabPane>
            <ATabPane :key="2" tab="固定限制">
              <ATag style="font-size: 14px; line-height: 19px" color="orange">每日限加</ATag>
              <AInputNumber
                id="inputNumber"
                v-model:value="employeeLimitValue"
                style="vertical-align: middle"
                :min="0"
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
                    :min="0"
                    :value="limitNumMap.get(employeeId)"
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
                :min="0"
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
              <AModal v-model:open="open" title="选择表情" centered style="width: 540px" @ok="handleEmojiOk">
                <EmojiPicker :native="true" style="width: 500px; height: 500px" @select="handleEmojiSelect" />
              </AModal>
              <ATooltip placement="top" title="附件 不超过9条">
                <ATag style="font-size: 16px; line-height: 32px; margin-left: 16px; margin-right: 5px" color="blue">
                  其他消息
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
                  @click="clickImage"
                >
                  <AButton>图片</AButton>
                </AUpload>
              </ATooltip>
              <ATooltip placement="top" title="视频不超过10M">
                <AUpload
                  v-model:file="file"
                  style="margin-top: 8px; margin-right: 15px; display: inline-block"
                  name="file"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                  :custom-request="customUpload"
                  @change="info => handleChange(info, 'video')"
                  @click="clickVideo"
                >
                  <AButton>视频</AButton>
                </AUpload>
              </ATooltip>
              <AButton type="dashed" style="margin-top: 8px; margin-right: 5px" @click="showLinkChildrenDrawer">
                链接
              </AButton>
              <ADrawer v-model:open="linkChildrenDrawer" title="h5链接" width="460">
                <AForm ref="formRef" layout="vertical" :model="attachmentModel" :rules="linkRules">
                  <AFormItem label="链接" name="link_url">
                    <ATextarea v-model:value="attachmentModel.link_url" placeholder="请输入链接" />
                  </AFormItem>
                  <AFormItem label="标题" name="title">
                    <AInput v-model:value="attachmentModel.title" placeholder="请输入标题" />
                  </AFormItem>
                  <AFormItem label="封面图片" name="pic">
                    <ATooltip placement="top" class="w-full" title="大小不超过10M">
                      <AUpload
                        v-model:file="file"
                        style="margin-top: 8px; margin-right: 5px; display: inline-block"
                        class="w-full"
                        name="file"
                        :show-upload-list="false"
                        :before-upload="beforeUpload"
                        :custom-request="customUpload"
                        @change="info => handleChange(info, 'link')"
                      >
                        <img v-if="imageUrl" :src="imageUrl" alt="icon" />
                        <AButton style="width: 410px">上传</AButton>
                      </AUpload>
                    </ATooltip>
                  </AFormItem>
                  <AFormItem label="描述" name="description">
                    <ATextarea v-model:value="attachmentModel.description" placeholder="请输入描述" />
                  </AFormItem>
                </AForm>
                <template #footer>
                  <ASpace :size="16">
                    <AButton @click="closeLinkChildDrawer">{{ $t('common.cancel') }}</AButton>
                    <AButton type="primary" @click="handleLinkChildSubmit">{{ $t('common.confirm') }}</AButton>
                  </ASpace>
                </template>
              </ADrawer>
              <AButton type="dashed" style="margin-top: 8px; margin-right: 5px" @click="showMiniProgramModal">
                小程序
              </AButton>
              <ADrawer v-model:open="miniProgramModal" title="小程序链接" width="460">
                <AForm ref="formRef" layout="vertical" :model="attachmentModel" :rules="miniProgramRules">
                  <AFormItem label="小程序标题" name="mini_program_title">
                    <ATextarea v-model:value="attachmentModel.mini_program_title" placeholder="请输入小程序标题" />
                  </AFormItem>
                  <AFormItem label="appid" name="mini_program_app_id">
                    <AInput v-model:value="attachmentModel.mini_program_app_id" placeholder="请输入appid" />
                  </AFormItem>
                  <AFormItem label="小程序路径" name="mini_program_page_path">
                    <AInput v-model:value="attachmentModel.mini_program_page_path" placeholder="请输入小程序路径" />
                  </AFormItem>
                  <AFormItem label="小程序子标题" name="mini_program_child_title">
                    <AInput v-model:value="attachmentModel.mini_program_child_title" placeholder="请输入小程序子标题" />
                  </AFormItem>
                  <AFormItem label="封面图片" name="pic">
                    <ATooltip placement="top" class="w-full" title="大小不超过10M">
                      <AUpload
                        v-model:file="file"
                        style="margin-top: 8px; margin-right: 5px; display: inline-block"
                        class="w-full"
                        name="file"
                        :value="0"
                        :show-upload-list="false"
                        :before-upload="beforeUpload"
                        :custom-request="customUpload"
                        @change="info => handleChange(info, 'miniprogram')"
                      >
                        <img v-if="imageUrl" :src="imageUrl" alt="icon" />
                        <AButton style="width: 410px">上传</AButton>
                      </AUpload>
                    </ATooltip>
                  </AFormItem>
                </AForm>
                <template #footer>
                  <ASpace :size="16">
                    <AButton @click="closeMiniProgramChildDrawer">{{ $t('common.cancel') }}</AButton>
                    <AButton type="primary" @click="handleMiniprogramChildSubmit">{{ $t('common.confirm') }}</AButton>
                  </ASpace>
                </template>
              </ADrawer>
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

// todo 选择关闭，提交时要是空 // 修改添加附件，要往attachment_ids添加
