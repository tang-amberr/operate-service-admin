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
  account_login_username: string;
  account_login_password: string;
  account_login_code: string;
  account_login_id: string;
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
    account_login_username: formRules.username,
    account_login_password: formRules.password,
    account_login_code: formRules.code
  };
});

// 获取验证码
const getCaptcha = async () => {
  try {
    loading.value = true;
    const res = await fetchGetCaptcha();
    if(res.code === 200) {
      captchaImage.value = res.data.login_captcha_image;
      model.account_login_id = res.data.login_captcha_id;
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
    debounceGetCaptcha();
  }, 600);
  await authStore.login(
    model.account_login_username,
    model.account_login_password,
    model.account_login_code,
    model.account_login_id
  );
}
</script>

<template>
  <AForm ref="formRef" :model="model" :rules="rules" @keyup.enter="handleSubmit">
    <AFormItem class="h-50px" name="account_login_username">
      <AInput v-model:value="model.account_login_username" class="h-50px"  size="large" :placeholder="$t('page.login.common.userNamePlaceholder')" />
    </AFormItem>
    <AFormItem class="h-50px" name="account_login_password">
      <AInputPassword
        class="h-50px"
        v-model:value="model.account_login_password"
        size="large"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </AFormItem>
    <AFormItem class="h-50px" name="account_login_code">
      <div class="w-full flex-y-center gap-16px w-50px">
        <AInput class="h-50px"  v-model:value="model.account_login_code" size="large" :placeholder="$t('page.login.common.codePlaceholder')" />
        <!-- 替换为验证码图片展示 -->
        <div
          v-if="captchaImage"
          class="captcha-image-wrapper  cursor-pointer w-400px"
          @click="debounceGetCaptcha"
        >
          <img
            :src="captchaImage"
            alt="验证码"
            class="h-50px w-500px border-1 border-gray-300"
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
  width: 540px;
  height: 50px;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
