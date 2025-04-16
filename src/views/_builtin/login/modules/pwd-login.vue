<script setup lang="ts">
import {computed, reactive, ref} from 'vue';
import { $t } from '@/locales';
import { useRouterPush } from '@/hooks/common/router';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import { useAuthStore } from '@/store/modules/auth';
import {fetchGetCaptcha} from "@/service/api";
import { loginModuleRecord } from '@/constants/app';


defineOptions({
  name: 'PwdLogin'
});

const authStore = useAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useAntdForm();

interface FormModel {
  username: string;
  password: string;
  code: string;
  id: string;
}

// 新增验证码相关状态
const captchaImage = ref(''); // 存储Base64图片
const loading = ref(false); // 加载状态
const model: FormModel = reactive({
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  // inside computed to make locale reactive, if not apply i18n, you can define it without computed
  const { formRules } = useFormRules();

  return {
    username: formRules.username,
    password: formRules.password,
    code: formRules.code
  };
});

// 获取验证码
const getCaptcha = async () => {
  try {
    loading.value = true;
    const res = await fetchGetCaptcha();
    if(res.code === 200) {
      captchaImage.value = res.data.image;
      model.id = res.data.id;
    }
  } catch (err) {
    console.error('获取验证码失败', err);
  } finally {
    loading.value = false;
  }
};

// 防抖相关状态
const debounceTimer = ref<number | null>(null)

// 防抖函数（TS实现）
const debounceGetCaptcha = () => {
  // 清除已有定时器
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }

  // 立即进入加载状态
  loading.value = true

  // 设置新定时器
  debounceTimer.value = setTimeout(async () => {
    try {
      await getCaptcha(); // 实际获取验证码的方法
    } finally {
      loading.value = false
      debounceTimer.value = null
    }
  }, 500); //
}
// 初始化时获取验证码
getCaptcha();

async function handleSubmit() {
  await validate();
  setTimeout(async () => {
    debounceGetCaptcha()
  }, 600);
  await authStore.login(model.username, model.password, model.code, model.id);
}
</script>

<template>
  <AForm ref="formRef" :model="model" :rules="rules" @keyup.enter="handleSubmit">
    <AFormItem name="userName">
      <AInput v-model:value="model.username" size="large" :placeholder="$t('page.login.common.userNamePlaceholder')" />
    </AFormItem>
    <AFormItem name="password">
      <AInputPassword
        v-model:value="model.password"
        size="large"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </AFormItem>
    <AFormItem name="code">
      <div class="w-full flex-y-center gap-16px">
        <AInput v-model:value="model.code" size="large" :placeholder="$t('page.login.common.codePlaceholder')" />
        <!-- 替换为验证码图片展示 -->
        <div
          v-if="captchaImage"
          class="captcha-image-wrapper  cursor-pointer"
          @click="debounceGetCaptcha"
        >
          <img
            :src="captchaImage"
            alt="验证码"
            class="h-40px w-170px border-1 border-gray-300"
          />
          <div v-if="loading" class="loading-overlay">
            <ASpin size="small" />
          </div>
        </div>
        <ASkeleton v-else active :paragraph="{ rows: 1 }" class="h-40px w-120px" />
      </div>
    </AFormItem>
    <ASpace direction="vertical" size="large" class="w-full">
<!--      <div class="flex-y-center justify-between">-->
<!--        <ACheckbox>{{ $t('page.login.pwdLogin.rememberMe') }}</ACheckbox>-->
<!--        <AButton type="text" @click="toggleLoginModule('reset-pwd')">-->
<!--          {{ $t('page.login.pwdLogin.forgetPassword') }}-->
<!--        </AButton>-->
<!--      </div>-->
      <AButton type="primary" block size="large" shape="round" :loading="authStore.loginLoading" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </AButton>
      <div class="flex-y-center justify-between">
<!--        <AButton class="h-34px flex-1" block @click="toggleLoginModule('code-login')">-->
<!--          {{ $t(loginModuleRecord['code-login']) }}-->
<!--        </AButton>-->
        <div class="w-12px"></div>
        <AButton class="h-34px flex-1" block @click="toggleLoginModule('register')">
          {{ $t(loginModuleRecord.register) }}
        </AButton>
      </div>
    </ASpace>
  </AForm>
</template>

<style scoped>
.captcha-image-wrapper {
  //position: relative;
  //display: flex;
  width: 190px;
  height: 40px;
  //align-items: center;
  //justify-content: center;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
