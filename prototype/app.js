// =============================================
// 拆解 — Application Logic
// =============================================

// === State ===
const state = {
  theme: 'light', // 'light' | 'dark'
  currentTab: 'home',
  pageStack: ['home'],
  isLoggedIn: false,
  user: null,
  authMode: 'login', // 'login' | 'register' | 'forgot'
  onboardingComplete: false,
  
  // Anxiety session
  session: {
    step: 0, // 0=idle, 1=record, 2=classify, 3=reframe, 4=action, 5=summary
    emotion: null,
    text: '',
    factors: [],
    classified: {}, // { factorIndex: 'controllable' | 'uncontrollable' }
    selectedDistortions: [],
    rebuttals: {}, // { distId: 'text' }
    selectedAction: null,
    scoreBefore: 0,
    scoreAfter: 0,
  },
  
  // Compass
  compass: {
    selectedValues: [],
    valueRanking: [],
    radarScores: { work: 0, finance: 0, relationship: 0, health: 0, growth: 0, life: 0 },
  },
  
  // Reminders
  reminders: {
    enabled: false,
    time: '21:00',
    days: ['周一', '周二', '周三', '周四', '周五'],
  },
};

// === Init ===
function init() {
  // Detect system theme
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    state.theme = 'dark';
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  
  // Check login status
  const savedUser = localStorage.getItem('dismantle_user');
  if (savedUser) {
    state.isLoggedIn = true;
    state.user = JSON.parse(savedUser);
  }
  
  // If not logged in, show auth page
  if (!state.isLoggedIn) {
    document.getElementById('tabBar').style.display = 'none';
    renderPage('auth');
  } else {
    document.getElementById('tabBar').style.display = 'flex';
    // Check if onboarding needed
    const onboarded = localStorage.getItem('dismantle_onboarded');
    if (onboarded) {
      state.onboardingComplete = true;
    }
    if (!state.onboardingComplete) {
      renderOnboarding();
    } else {
      renderPage('home');
      switchTab('home');
    }
  }
}

// === Theme ===
function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  showToast(state.theme === 'dark' ? '已切换为夜间模式' : '已切换为日间模式');
  // Re-render radar if visible
  if (state.currentTab === 'compass') renderCompass();
}

// === Navigation ===
function switchTab(tab) {
  state.currentTab = tab;
  state.pageStack = [tab];
  
  // Update tab bar
  document.querySelectorAll('.tab-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
  
  // Update header
  updateHeader(tab);
  
  // Render page
  renderPage(tab);
  
  // Scroll to top
  document.getElementById('pageContainer').scrollTop = 0;
}

function pushPage(page) {
  state.pageStack.push(page);
  updateHeader(page);
  renderPage(page);
  document.getElementById('pageContainer').scrollTop = 0;
}

function goBack() {
  if (state.pageStack.length <= 1) return;
  state.pageStack.pop();
  const page = state.pageStack[state.pageStack.length - 1];
  updateHeader(page);
  renderPage(page);
}

function updateHeader(page) {
  const backBtn = document.getElementById('headerBack');
  const title = document.getElementById('headerTitle');
  
  const titles = {
    home: '拆解',
    compass: '罗盘',
    insight: '洞察',
    profile: '我的',
    'auth': '拆解',
    'session-record': '记录焦虑',
    'session-classify': '可控/不可控',
    'session-reframe': '认知重构',
    'session-action': '微小行动',
    'session-summary': '拆解完成',
    'compass-values': '价值观排序',
    'compass-radar': '满意度评估',
    'compass-analysis': '方向分析',
    'compass-experiment': '小步实验',
    'insight-trend': '焦虑趋势',
    'insight-pattern': '触发模式',
    'profile-reminders': '智能提醒',
    'profile-export': '数据导出',
    'profile-settings': '设置',
    'legal-agreement': '用户协议',
    'legal-privacy': '隐私政策',
  };
  
  title.textContent = titles[page] || '拆解';
  
  if (state.pageStack.length > 1) {
    backBtn.classList.add('visible');
  } else {
    backBtn.classList.remove('visible');
  }
}

// === Page Rendering ===
function renderPage(page) {
  const container = document.getElementById('pageContainer');
  
  switch (page) {
    case 'auth': container.innerHTML = renderAuth(); break;
    case 'home': container.innerHTML = renderHome(); break;
    case 'compass': container.innerHTML = renderCompass(); break;
    case 'insight': container.innerHTML = renderInsight(); break;
    case 'profile': container.innerHTML = renderProfile(); break;
    case 'session-record': container.innerHTML = renderSessionRecord(); break;
    case 'session-classify': container.innerHTML = renderSessionClassify(); break;
    case 'session-reframe': container.innerHTML = renderSessionReframe(); break;
    case 'session-action': container.innerHTML = renderSessionAction(); break;
    case 'session-summary': container.innerHTML = renderSessionSummary(); break;
    case 'compass-values': container.innerHTML = renderCompassValues(); break;
    case 'compass-radar': container.innerHTML = renderCompassRadar(); break;
    case 'compass-analysis': container.innerHTML = renderCompassAnalysis(); break;
    case 'compass-experiment': container.innerHTML = renderCompassExperiment(); break;
    case 'insight-trend': container.innerHTML = renderInsightTrend(); break;
    case 'insight-pattern': container.innerHTML = renderInsightPattern(); break;
    case 'profile-reminders': container.innerHTML = renderProfileReminders(); break;
    case 'profile-export': container.innerHTML = renderProfileExport(); break;
    case 'profile-settings': container.innerHTML = renderProfileSettings(); break;
    case 'legal-agreement': container.innerHTML = renderUserAgreement(); break;
    case 'legal-privacy': container.innerHTML = renderPrivacyPolicy(); break;
  }
  
  // After render hooks
  setTimeout(() => {
    if (page === 'compass-radar') drawRadarChart();
  }, 100);
}

// =============================================
// AUTH PAGES (Login / Register / Forgot Password)
// =============================================
function renderAuth() {
  const isLogin = state.authMode === 'login';
  const isRegister = state.authMode === 'register';
  const isForgot = state.authMode === 'forgot';

  return `
    <div class="page active">
      <div class="auth-container">
        <!-- Logo & Title -->
        <div class="auth-header">
          <div class="auth-logo">🧠</div>
          <div class="auth-app-name">拆解</div>
          <div class="auth-tagline">看清它 · 拆开它 · 解决它</div>
        </div>

        ${isForgot ? `
          <!-- Forgot Password Form -->
          <div class="auth-form">
            <div class="auth-form-title">找回密码</div>
            <p class="auth-form-desc">输入注册邮箱，我们将发送重置链接</p>
            
            <div class="input-group">
              <label class="input-label">邮箱</label>
              <div class="input-wrapper">
                <span class="input-icon">📧</span>
                <input class="input auth-input" type="email" id="forgotEmail" placeholder="请输入注册邮箱">
              </div>
            </div>
            
            <button class="btn btn-primary btn-block btn-lg" onclick="handleForgotPassword()">
              发送重置链接
            </button>
            
            <div class="auth-switch">
              <span onclick="switchAuthMode('login')">← 返回登录</span>
            </div>
          </div>
        ` : isRegister ? `
          <!-- Register Form -->
          <div class="auth-form">
            <div class="auth-form-title">创建账号</div>
            <p class="auth-form-desc">开始你的焦虑拆解之旅</p>
            
            <div class="input-group">
              <label class="input-label">昵称</label>
              <div class="input-wrapper">
                <span class="input-icon">👤</span>
                <input class="input auth-input" type="text" id="regName" placeholder="怎么称呼你？">
              </div>
            </div>
            
            <div class="input-group">
              <label class="input-label">邮箱</label>
              <div class="input-wrapper">
                <span class="input-icon">📧</span>
                <input class="input auth-input" type="email" id="regEmail" placeholder="请输入邮箱">
              </div>
            </div>
            
            <div class="input-group">
              <label class="input-label">密码</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input class="input auth-input" type="password" id="regPassword" placeholder="至少8位，包含字母和数字">
              </div>
            </div>
            
            <div class="input-group">
              <label class="input-label">确认密码</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input class="input auth-input" type="password" id="regPasswordConfirm" placeholder="再次输入密码">
              </div>
            </div>
            
            <div class="auth-agreement">
              <input type="checkbox" id="agreeTerms" checked>
              <label for="agreeTerms">我已阅读并同意 <span class="text-accent" onclick="event.stopPropagation();pushPage('legal-agreement')">用户协议</span> 和 <span class="text-accent" onclick="event.stopPropagation();pushPage('legal-privacy')">隐私政策</span></label>
            </div>
            
            <button class="btn btn-primary btn-block btn-lg" onclick="handleRegister()">
              注册
            </button>
            
            <div class="auth-switch">
              已有账号？<span onclick="switchAuthMode('login')">去登录</span>
            </div>
          </div>
        ` : `
          <!-- Login Form -->
          <div class="auth-form">
            <div class="auth-form-title">欢迎回来</div>
            <p class="auth-form-desc">登录以同步你的拆解记录</p>
            
            <div class="input-group">
              <label class="input-label">邮箱</label>
              <div class="input-wrapper">
                <span class="input-icon">📧</span>
                <input class="input auth-input" type="email" id="loginEmail" placeholder="请输入邮箱" value="demo@dismantle.app">
              </div>
            </div>
            
            <div class="input-group">
              <label class="input-label">密码</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input class="input auth-input" type="password" id="loginPassword" placeholder="请输入密码" value="12345678">
              </div>
            </div>
            
            <div class="auth-extra">
              <label class="auth-remember">
                <input type="checkbox" checked> 记住我
              </label>
              <span class="auth-forgot" onclick="switchAuthMode('forgot')">忘记密码？</span>
            </div>
            
            <button class="btn btn-primary btn-block btn-lg" onclick="handleLogin()">
              登录
            </button>
            
            <!-- Social Login -->
            <div class="auth-divider">
              <span>或</span>
            </div>
            
            <div class="social-login">
              <button class="social-btn wechat-btn" onclick="handleSocialLogin('wechat')" title="微信登录">
                <svg width="22" height="20" viewBox="0 0 24 20"><path d="M8.88 3.02c-5.1-.32-9.46 3.48-9.7 8.58-.14 2.73 1.2 5.24 3.15 6.83l-.7 3.16 3.43-1.76c1.12.43 2.36.66 3.63.62 5.08-.16 9.35-4.12 9.52-9.21.17-5.41-4.33-9.9-9.33-10.22z" fill="#07C160"/><path d="M16.16 5.52c-4.12-.18-7.58 2.88-7.78 7-.12 2.28 1.02 4.37 2.65 5.67l-.58 2.62 2.86-1.46c.92.35 1.96.53 3.02.5 4.2-.14 7.73-3.44 7.87-7.64.15-4.5-3.58-8.22-8.04-8.69z" fill="white" opacity="0.7"/><circle cx="9.2" cy="9.8" r="1.2" fill="white"/><circle cx="14.8" cy="9.8" r="1.2" fill="white"/></svg>
                <span>微信</span>
              </button>
            </div>
            
            <div class="auth-switch">
              还没有账号？<span onclick="switchAuthMode('register')">注册</span>
            </div>
          </div>
        `}
      </div>
    </div>
  `;
}

function switchAuthMode(mode) {
  state.authMode = mode;
  renderPage('auth');
}

function handleLogin() {
  const email = document.getElementById('loginEmail')?.value || '';
  const password = document.getElementById('loginPassword')?.value || '';
  
  if (!email.trim()) { showToast('请输入邮箱'); return; }
  if (!password.trim()) { showToast('请输入密码'); return; }
  if (password.length < 6) { showToast('密码至少6位'); return; }
  
  // Simulate login
  showToast('登录中...');
  setTimeout(() => {
    state.isLoggedIn = true;
    state.user = { email: email, name: email.split('@')[0], avatar: null, loginMethod: 'email' };
    localStorage.setItem('dismantle_user', JSON.stringify(state.user));
    document.getElementById('tabBar').style.display = 'flex';
    showToast('登录成功 👋');
    
    // Go to onboarding or home
    const onboarded = localStorage.getItem('dismantle_onboarded');
    if (!onboarded) {
      renderOnboarding();
    } else {
      state.onboardingComplete = true;
      switchTab('home');
    }
  }, 800);
}

function handleRegister() {
  const name = document.getElementById('regName')?.value || '';
  const email = document.getElementById('regEmail')?.value || '';
  const password = document.getElementById('regPassword')?.value || '';
  const confirm = document.getElementById('regPasswordConfirm')?.value || '';
  const agreed = document.getElementById('agreeTerms')?.checked;
  
  if (!name.trim()) { showToast('请输入昵称'); return; }
  if (!email.trim()) { showToast('请输入邮箱'); return; }
  if (!password) { showToast('请输入密码'); return; }
  if (password.length < 8) { showToast('密码至少8位'); return; }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) { showToast('密码需包含字母和数字'); return; }
  if (password !== confirm) { showToast('两次密码不一致'); return; }
  if (!agreed) { showToast('请阅读并同意用户协议'); return; }
  
  // Simulate register
  showToast('注册中...');
  setTimeout(() => {
    state.isLoggedIn = true;
    state.user = { email: email, name: name, avatar: null, loginMethod: 'email' };
    localStorage.setItem('dismantle_user', JSON.stringify(state.user));
    document.getElementById('tabBar').style.display = 'flex';
    showToast('注册成功！欢迎加入 🎉');
    
    // New users always see onboarding
    renderOnboarding();
  }, 800);
}

function handleForgotPassword() {
  const email = document.getElementById('forgotEmail')?.value || '';
  if (!email.trim()) { showToast('请输入邮箱'); return; }
  
  showToast('发送中...');
  setTimeout(() => {
    showToast('重置链接已发送到 ' + email + '（模拟）');
    state.authMode = 'login';
    renderPage('auth');
  }, 1000);
}

function handleSocialLogin(provider) {
  showToast('微信登录中...');
  setTimeout(() => {
    state.isLoggedIn = true;
    state.user = { email: 'wechat_user@wx.com', name: '微信用户', avatar: '💬', loginMethod: 'wechat' };
    localStorage.setItem('dismantle_user', JSON.stringify(state.user));
    document.getElementById('tabBar').style.display = 'flex';
    showToast('微信登录成功 👋');
    
    const onboarded = localStorage.getItem('dismantle_onboarded');
    if (!onboarded) {
      renderOnboarding();
    } else {
      state.onboardingComplete = true;
      switchTab('home');
    }
  }, 800);
}

// Update profile page to show real user info and logout
function handleLogout() {
  state.isLoggedIn = false;
  state.user = null;
  localStorage.removeItem('dismantle_user');
  document.getElementById('tabBar').style.display = 'none';
  state.authMode = 'login';
  renderPage('auth');
  showToast('已退出登录');
}

// =============================================
// LEGAL PAGES (User Agreement & Privacy Policy)
// =============================================

function renderUserAgreement() {
  return `
    <div class="page active">
      <div class="legal-container">
        <h1 class="legal-title">拆解用户服务协议</h1>
        <p class="legal-meta">更新日期：2025年6月7日 | 生效日期：2025年6月7日</p>
        
        <div class="legal-section">
          <h2>导言</h2>
          <p>欢迎使用「拆解」！</p>
          <p>「拆解」（以下简称「本软件」或「我们」）是一款帮助用户管理焦虑情绪的心理健康工具。本协议是您（以下简称「用户」或「您」）与「拆解」开发团队（以下简称「我们」）之间关于使用本软件及相关服务所订立的协议。</p>
          <p>请您务必审慎阅读、充分理解本协议各条款内容，特别是免除或限制责任的条款、法律适用和争议解决条款。如您不同意本协议的任何条款，请立即停止使用本软件。您点击「同意」或使用本软件的任何服务，即视为您已阅读并同意本协议的全部内容。</p>
        </div>

        <div class="legal-section">
          <h2>一、服务说明</h2>
          <h3>1.1 服务性质</h3>
          <p>「拆解」是一款基于认知行为疗法（CBT）原理的心理健康辅助工具，提供包括但不限于焦虑记录与拆解、认知重构引导、价值观探索、满意度评估等功能。本软件<strong>不提供医疗诊断、治疗或心理咨询服务</strong>。如您有严重的心理健康问题，请及时寻求专业医疗机构或持证心理咨询师的帮助。</p>
          
          <h3>1.2 服务形式</h3>
          <p>本软件以移动应用程序（iOS及Android）形式提供服务。部分功能可能需要网络连接。我们保留随时变更、中断或终止部分或全部服务的权利，但将尽可能提前通知您。</p>
          
          <h3>1.3 账号注册</h3>
          <p>您可以通过邮箱注册或微信授权登录方式创建账号。您应当提供真实、准确的注册信息，并在信息变更时及时更新。您应对账号下的所有活动负责，请妥善保管您的账号和密码。</p>
        </div>

        <div class="legal-section">
          <h2>二、用户行为规范</h2>
          <h3>2.1 合法使用</h3>
          <p>您承诺在使用本软件过程中遵守中华人民共和国法律法规，不得利用本软件从事任何违法违规行为，包括但不限于：</p>
          <ul>
            <li>发布、传播违法信息或侵犯他人合法权益的内容</li>
            <li>干扰本软件的正常运行，或利用技术手段恶意攻击本软件</li>
            <li>未经授权访问、篡改或使用他人的账号或数据</li>
            <li>利用本软件进行任何形式的商业营利活动（未经我们书面同意）</li>
          </ul>
          
          <h3>2.2 内容责任</h3>
          <p>您在本软件中记录的焦虑事件、认知重构内容、价值观排序等所有信息均由您自行生成。您对您所产生的内容负全部责任。我们不会主动查看或监控您的个人内容，但有权在法律法规要求或合理认为必要时进行审核。</p>
        </div>

        <div class="legal-section">
          <h2>三、知识产权</h2>
          <h3>3.1 软件权利</h3>
          <p>本软件及其所有组成部分（包括但不限于程序代码、界面设计、文案内容、图标、Logo、认知扭曲卡片内容等）的知识产权归我们所有，受著作权法、商标法及其他知识产权法律法规保护。未经我们书面许可，任何人不得以任何方式复制、修改、传播或利用本软件的全部或部分内容。</p>
          
          <h3>3.2 用户内容</h3>
          <p>您在本软件中产生的内容（焦虑记录、认知重构文本、价值观排序结果等）的知识产权归您所有。为向您提供服务，您授予我们在提供服务所必需的范围内存储、备份和处理这些内容的权利。我们不会将您的个人内容用于任何商业目的。</p>
        </div>

        <div class="legal-section">
          <h2>四、免责声明</h2>
          <h3>4.1 非医疗声明</h3>
          <p>本软件是一款心理健康辅助工具，<strong>不能替代专业的心理治疗、医疗诊断或心理咨询</strong>。本软件提供的认知重构引导、微小行动建议等内容基于通用的心理学原理，不构成针对您个人情况的专业建议。如果您正在经历严重的焦虑、抑郁或任何心理健康危机，请立即联系专业医疗机构或拨打心理援助热线。</p>
          
          <h3>4.2 技术免责</h3>
          <p>我们力求服务的稳定性和安全性，但无法保证服务不会中断或完全无错误。因不可抗力、系统维护、网络故障、第三方服务故障等原因导致的服务中断或数据丢失，我们将在合理范围内尽力恢复，但不承担由此产生的直接或间接损失。</p>
          
          <h3>4.3 第三方服务</h3>
          <p>本软件可能包含指向第三方网站或服务的链接。这些第三方服务的内容和隐私政策不在我们的控制范围内，我们对其不承担责任。建议您在使用前阅读相关第三方的用户协议和隐私政策。</p>
        </div>

        <div class="legal-section">
          <h2>五、协议变更</h2>
          <p>我们保留随时修改本协议的权利。如本协议发生重大变更，我们将通过以下至少一种方式通知您：</p>
          <ul>
            <li>在您登录时通过弹窗或公告方式提示</li>
            <li>向您注册的邮箱发送通知</li>
            <li>在本软件内显著位置发布公告</li>
          </ul>
          <p>如您在协议变更后继续使用本软件，即视为您已接受修改后的协议。如您不同意变更内容，您有权停止使用本软件并注销账号。</p>
        </div>

        <div class="legal-section">
          <h2>六、法律适用与争议解决</h2>
          <p>本协议的订立、执行和解释及争议的解决均适用中华人民共和国法律。因本协议引起的或与本协议有关的任何争议，双方应友好协商解决；协商不成的，任何一方均有权向被告住所地有管辖权的人民法院提起诉讼。</p>
        </div>

        <div class="legal-section">
          <h2>七、联系我们</h2>
          <p>如您对本协议有任何疑问、意见或建议，请通过以下方式联系我们：</p>
          <ul>
            <li>电子邮箱：support@dismantle.app</li>
            <li>应用内：「我的」→「设置」→「意见反馈」</li>
          </ul>
        </div>

        <p class="legal-footer">© 2025 拆解开发团队。保留所有权利。</p>
      </div>
    </div>
  `;
}

function renderPrivacyPolicy() {
  return `
    <div class="page active">
      <div class="legal-container">
        <h1 class="legal-title">拆解隐私保护指引</h1>
        <p class="legal-meta">更新日期：2025年6月7日 | 生效日期：2025年6月7日</p>
        
        <div class="legal-section">
          <h2>导言</h2>
          <p>「拆解」（以下简称「我们」）深知个人信息对您的重要性，我们将按照法律法规的规定，保护您的个人信息安全。本《隐私保护指引》将帮助您了解以下内容：</p>
          <ul>
            <li>我们收集哪些信息，以及如何使用这些信息</li>
            <li>我们如何存储和保护您的信息</li>
            <li>我们如何共享、转让和公开披露您的信息</li>
            <li>您对个人信息享有的权利</li>
            <li>本指引的更新方式</li>
          </ul>
          <p>请您在使用本软件前仔细阅读本指引。<strong>本软件的核心功能（焦虑拆解）属于高度隐私的个人数据，我们采取了行业标准的加密和安全措施来保护您的数据。</strong></p>
        </div>

        <div class="legal-section">
          <h2>一、我们收集的信息</h2>
          
          <h3>1.1 账号信息</h3>
          <p>当您注册「拆解」账号时，我们会收集以下信息：</p>
          <ul>
            <li><strong>邮箱注册</strong>：您的电子邮箱地址、您设置的昵称和密码（加密存储）</li>
            <li><strong>微信登录</strong>：您在微信平台的OpenID、昵称和头像（由微信授权后获取）</li>
          </ul>
          <p>上述信息用于创建和管理您的账号，以及向您提供跨设备数据同步服务。</p>
          
          <h3>1.2 您主动提供的内容</h3>
          <p>当您使用本软件的核心功能时，您会主动产生以下内容：</p>
          <ul>
            <li><strong>焦虑拆解内容</strong>：您记录的焦虑事件文本、语音转录文本、焦虑评分、分类结果、选择的认知扭曲类型、反驳文本、选择的微小行动</li>
            <li><strong>人生罗盘内容</strong>：价值观排序结果、各维度满意度评分</li>
            <li><strong>实验计划</strong>：您在小步实验中填写的文本内容</li>
          </ul>
          <p><strong>特别声明：焦虑拆解内容属于高度敏感的个人信息。我们仅在您主动使用相关功能时收集这些信息，且仅用于为您提供该功能本身的服务。我们不会对您的焦虑内容进行任何形式的自动化分析用于广告或其他商业目的。</strong></p>
          
          <h3>1.3 使用信息</h3>
          <p>当您使用本软件时，我们会自动收集以下使用信息：</p>
          <ul>
            <li><strong>日志信息</strong>：IP地址、操作时间戳、功能使用记录、崩溃日志</li>
            <li><strong>设备信息</strong>：设备型号、操作系统版本、设备标识符、网络状态</li>
          </ul>
          <p>这些信息用于保障服务安全、排查故障、优化产品体验。</p>
          
          <h3>1.4 语音数据</h3>
          <p>当您使用语音录入功能时，语音数据在您的设备本地进行转录处理，<strong>原始语音文件不会上传至我们的服务器</strong>。转录后的文本与您的其他焦虑记录内容同等保护。</p>
          
          <h3>1.5 不收集的信息</h3>
          <p>我们明确承诺<strong>不会</strong>收集以下信息：</p>
          <ul>
            <li>您的位置信息（GPS、基站定位等）</li>
            <li>您的通讯录</li>
            <li>您设备中的照片、文件或其他应用数据</li>
            <li>您的浏览历史或其他应用的使用记录</li>
          </ul>
        </div>

        <div class="legal-section">
          <h2>二、信息的使用</h2>
          <p>我们将收集的信息用于以下目的：</p>
          <ul>
            <li><strong>提供核心服务</strong>：实现焦虑拆解、认知重构、人生罗盘、数据洞察等核心功能</li>
            <li><strong>账号管理</strong>：创建和管理您的账号，实现云端数据同步</li>
            <li><strong>改善体验</strong>：基于使用数据分析功能使用频率，优化产品体验（仅使用聚合后的统计数据）</li>
            <li><strong>安全防护</strong>：检测和防止欺诈、滥用行为，保护用户账号安全</li>
            <li><strong>客户服务</strong>：响应您的反馈、问题和投诉</li>
            <li><strong>法律法规要求</strong>：遵守适用的法律法规要求</li>
          </ul>
          <p><strong>我们不会将您的焦虑拆解内容、认知重构记录等个人敏感数据用于任何形式的个性化广告、用户画像分析或商业变现。</strong></p>
        </div>

        <div class="legal-section">
          <h2>三、信息的存储</h2>
          <h3>3.1 存储地点</h3>
          <p>您的个人信息（包括焦虑拆解数据）原则上存储于中华人民共和国境内的服务器上。我们使用Supabase提供的数据存储服务，数据存储区域为用户注册时所在区域的数据中心。</p>
          
          <h3>3.2 存储期限</h3>
          <p>我们仅在实现本指引所述目的所必需的期限内保留您的个人信息：</p>
          <ul>
            <li>账号信息：在您注销账号之前持续保存</li>
            <li>焦虑拆解内容：在您主动删除或注销账号之前持续保存</li>
            <li>使用日志：保留期限不超过12个月</li>
          </ul>
          <p>当您注销账号后，我们将在合理期限内（不超过30个工作日）删除或匿名化处理您的所有个人信息。</p>
          
          <h3>3.3 跨境传输</h3>
          <p>目前，您的个人信息不会跨境传输至中华人民共和国境外。如未来因服务需要确需跨境传输，我们将提前告知您并获得您的单独同意，同时确保数据接收方提供同等水平的保护。</p>
        </div>

        <div class="legal-section">
          <h2>四、信息安全</h2>
          <p>我们采取以下安全措施保护您的个人信息：</p>
          <ul>
            <li><strong>传输加密</strong>：所有数据传输均使用TLS/SSL加密</li>
            <li><strong>存储加密</strong>：敏感数据（焦虑记录内容、密码等）在数据库中使用AES-256加密存储</li>
            <li><strong>访问控制</strong>：严格限制内部人员对用户数据的访问权限，访问记录留痕</li>
            <li><strong>本地优先架构</strong>：您的数据优先存储在您的设备上，云端为加密备份</li>
            <li><strong>安全审计</strong>：定期进行安全评估和漏洞扫描</li>
          </ul>
          <p>尽管我们采取了上述安全措施，但请注意，互联网上没有任何安全措施是绝对安全的。如发生个人信息安全事件，我们将按照法律法规的要求及时通知您。</p>
        </div>

        <div class="legal-section">
          <h2>五、信息的共享、转让与公开披露</h2>
          <h3>5.1 共享</h3>
          <p>我们<strong>不会</strong>与任何第三方公司、组织和个人共享您的个人信息，但以下情况除外：</p>
          <ul>
            <li><strong>获得您的明确同意</strong>：在获得您的明示授权后，我们将按照授权范围共享信息</li>
            <li><strong>数据导出功能</strong>：当您使用数据导出功能时，导出文件仅由您自行处理</li>
            <li><strong>法律法规要求</strong>：根据法律法规规定、诉讼争议解决需要，或按行政、司法机关依法提出的要求</li>
            <li><strong>服务提供商</strong>：与为我们提供技术基础设施服务的合作伙伴（如云服务提供商Supabase）共享必要的最小数据集，且要求其遵守保密义务</li>
          </ul>
          
          <h3>5.2 转让</h3>
          <p>我们不会将您的个人信息转让给任何公司、组织和个人。如发生合并、收购或破产清算情形，我们将要求新的持有您个人信息的公司继续受本指引约束，否则我们将要求其重新征求您的授权同意。</p>
          
          <h3>5.3 公开披露</h3>
          <p>我们不会公开披露您的个人信息。本软件不包含任何形式的社区、评论或公开发布功能，您的所有焦虑拆解内容均为私密信息。</p>
        </div>

        <div class="legal-section">
          <h2>六、您的权利</h2>
          <p>我们保障您对个人信息享有以下权利：</p>
          
          <h3>6.1 查阅与复制</h3>
          <p>您可以在「我的」页面查看您的焦虑日志时间线。您可以使用「数据导出」功能将全部个人数据导出为PDF或文本文件。</p>
          
          <h3>6.2 更正与删除</h3>
          <p>您可以在焦虑日志中逐条删除记录。您可以在「设置」中修改您的个人资料。如您无法通过上述路径自行操作，可联系我们协助处理。</p>
          
          <h3>6.3 注销账号</h3>
          <p>您可以在「我的」→「设置」→「注销账号」中申请注销。注销后，您的所有个人信息（包括焦虑记录、罗盘数据等）将被永久删除，无法恢复。</p>
          
          <h3>6.4 撤回同意</h3>
          <p>您可以随时在系统设置中撤回已授予的权限（如麦克风权限）。撤回后，相关功能将受到限制，但不影响撤回前基于您同意已进行的个人信息处理活动的效力。</p>
          
          <h3>6.5 投诉举报</h3>
          <p>如您认为我们对您个人信息的处理违反了法律法规，您可以通过本指引所述联系方式向我们投诉，或向相关监管机构投诉。</p>
        </div>

        <div class="legal-section">
          <h2>七、未成年人保护</h2>
          <p>本软件主要面向18岁以上的成年人。如果您未满18周岁，请在监护人的陪同下阅读本指引，并在获得监护人同意后使用本软件。如果您是14周岁以下儿童的监护人，请您不要为儿童创建账号。如我们发现无意中收集了14周岁以下儿童的个人信息，将立即删除。</p>
        </div>

        <div class="legal-section">
          <h2>八、本指引的更新</h2>
          <p>我们可能会适时更新本隐私保护指引。当本指引发生重大变更时，我们将通过以下方式通知您：</p>
          <ul>
            <li>在您登录时通过弹窗提示</li>
            <li>向您注册的邮箱发送通知</li>
          </ul>
          <p>重大变更包括但不限于：收集信息的目的、范围和方式发生实质性变化；信息共享的对象和目的发生变化；您行使权利的方式发生重大变化等。</p>
        </div>

        <div class="legal-section">
          <h2>九、联系我们</h2>
          <p>如您对本指引有任何疑问、意见或建议，或需要行使您的个人信息相关权利，请通过以下方式联系我们：</p>
          <ul>
            <li>电子邮箱：privacy@dismantle.app</li>
            <li>应用内路径：「我的」→「设置」→「意见反馈」</li>
          </ul>
          <p>我们将在收到您的请求后15个工作日内予以回复。</p>
        </div>

        <p class="legal-footer">© 2025 拆解开发团队。保留所有权利。</p>
      </div>
    </div>
  `;
}

// =============================================
// HOME PAGE
// =============================================
function renderHome() {
  const todayComplete = state.session.step === 5;
  const hasHistory = SAMPLE_HISTORY.length > 0;
  
  return `
    <div class="page active">
      <div class="section-title">今日状态</div>
      <div class="card text-center" style="padding:28px 20px;">
        <div style="font-size:48px;margin-bottom:8px;">${todayComplete ? '✅' : '🧠'}</div>
        <div style="font-size:17px;font-weight:600;color:var(--text-primary);margin-bottom:4px;">
          ${todayComplete ? '今日拆解已完成' : '今天感觉怎么样？'}
        </div>
        <div style="font-size:13px;color:var(--text-tertiary);margin-bottom:20px;">
          ${todayComplete ? '你已理清了思绪，做得很好' : '花几分钟，把焦虑拆解开'}
        </div>
        ${!todayComplete ? `
          <button class="btn btn-primary btn-block btn-lg" onclick="startSession()">
            开始拆解
          </button>
        ` : `
          <button class="btn btn-secondary" onclick="startSession()" style="margin-right:8px;">
            再做一次
          </button>
        `}
      </div>
      
      <div class="section-title">最近记录</div>
      ${hasHistory ? renderRecentHistory() : `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-title">还没有拆解记录</div>
          <div class="empty-desc">感到焦虑时，我在这里。开始你的第一次拆解吧。</div>
        </div>
      `}
    </div>
  `;
}

function renderRecentHistory() {
  const recent = SAMPLE_HISTORY.slice(0, 3);
  return recent.map(group => `
    <div class="card card-interactive" onclick="showToast('查看详情')" style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-size:12px;color:var(--text-tertiary);">${group.date}</span>
        <span class="badge badge-info">${group.entries.length}次拆解</span>
      </div>
      ${group.entries.map(e => `
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:4px;line-height:1.4;">
          ${e.text.substring(0, 60)}${e.text.length > 60 ? '...' : ''}
        </div>
      `).join('')}
    </div>
  `).join('');
}

// =============================================
// ANXIETY SESSION FLOW
// =============================================
function startSession() {
  state.session = {
    step: 1,
    emotion: null,
    text: '',
    factors: [],
    classified: {},
    selectedDistortions: [],
    rebuttals: {},
    selectedAction: null,
    scoreBefore: 0,
    scoreAfter: 0,
  };
  pushPage('session-record');
}

// Step 1: Record
function renderSessionRecord() {
  return `
    <div class="page active">
      <div class="progress-bar"><div class="fill" style="width:25%"></div></div>
      <p style="font-size:13px;color:var(--text-tertiary);text-align:center;margin:8px 0;">步骤 1/4 · 记录</p>
      
      <div style="font-size:20px;font-weight:600;color:var(--text-primary);margin:16px 0 8px;">
        描述让你焦虑的事情
      </div>
      <p style="font-size:13px;color:var(--text-tertiary);margin-bottom:16px;">
        命名情绪本身就能降低焦虑。写下或说出你的感受。
      </p>
      
      <textarea class="input" id="anxietyInput" rows="6" 
        placeholder="比如：周一要汇报，担心方案不完善被领导质疑..."
        style="margin-bottom:12px;">${state.session.text}</textarea>
      
      <div style="display:flex;gap:10px;margin-bottom:16px;">
        <button class="btn btn-secondary flex-1" onclick="simulateVoice()" style="flex:1;">
          🎤 语音录入
        </button>
        <button class="btn btn-ghost btn-sm" onclick="document.getElementById('anxietyInput').value=''">
          清空
        </button>
      </div>
      
      <p style="font-size:13px;color:var(--text-tertiary);margin-bottom:16px;">
        焦虑强度（1-10）
      </p>
      <div style="display:flex;gap:8px;margin-bottom:20px;">
        ${[1,2,3,4,5,6,7,8,9,10].map(n => `
          <button class="chip ${state.session.scoreBefore === n ? 'selected' : ''}" 
            onclick="selectScore(${n})" style="flex:1;text-align:center;">${n}</button>
        `).join('')}
      </div>
      
      <button class="btn btn-primary btn-block btn-lg" onclick="goToClassify()" 
        ${!state.session.text.trim() ? 'disabled style="opacity:0.4;pointer-events:none;"' : ''}>
        下一步：分类
      </button>
    </div>
  `;
}

function simulateVoice() {
  const input = document.getElementById('anxietyInput');
  if (input) {
    input.value = '周一上午要向上级汇报Q2规划，我的方案还没有完全打磨好，数据支撑不够充分。上次汇报老板说我的数据维度太单一，这次担心又被质疑。另外同事小李的方案看起来很完整，比较之下压力更大。';
    state.session.text = input.value;
    showToast('语音识别完成 ✓');
  }
}

function selectScore(n) {
  state.session.scoreBefore = n;
  renderPage('session-record');
}

function goToClassify() {
  const input = document.getElementById('anxietyInput');
  state.session.text = input ? input.value : state.session.text;
  if (!state.session.text.trim()) return;
  
  // Parse factors from text
  const sentences = state.session.text.split(/[。！？；\n]/).filter(s => s.trim());
  state.session.factors = sentences.length > 1 ? sentences : [state.session.text];
  state.session.classified = {};
  
  pushPage('session-classify');
}

// Step 2: Classify
function renderSessionClassify() {
  const allClassified = state.session.factors.every((_, i) => state.session.classified[i]);
  
  return `
    <div class="page active">
      <div class="progress-bar"><div class="fill" style="width:50%"></div></div>
      <p style="font-size:13px;color:var(--text-tertiary);text-align:center;margin:8px 0;">步骤 2/4 · 分类</p>
      
      <div style="font-size:20px;font-weight:600;color:var(--text-primary);margin:16px 0 4px;">
        区分可控与不可控
      </div>
      <p style="font-size:13px;color:var(--text-tertiary);margin-bottom:16px;">
        把焦虑因素拖到对应区域。把精力放在你能改变的事情上。
      </p>
      
      <div class="drag-zones">
        <div class="drag-zone controllable" id="zoneControllable"
          ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, 'controllable')">
          <div class="drag-zone-label">✅ 我可控</div>
          ${state.session.factors.map((f, i) => state.session.classified[i] === 'controllable' ? 
            `<div class="drag-item placed" draggable="true" ondragstart="handleDragStart(event, ${i})" data-idx="${i}">${f.trim()}</div>` : ''
          ).join('')}
        </div>
        
        <div class="drag-zone uncontrollable" id="zoneUncontrollable"
          ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, 'uncontrollable')">
          <div class="drag-zone-label">🌊 不可控</div>
          ${state.session.factors.map((f, i) => state.session.classified[i] === 'uncontrollable' ? 
            `<div class="drag-item placed" draggable="true" ondragstart="handleDragStart(event, ${i})" data-idx="${i}">${f.trim()}</div>` : ''
          ).join('')}
        </div>
      </div>
      
      <div style="margin:12px 0;">
        <p style="font-size:12px;color:var(--text-tertiary);margin-bottom:8px;">待分类：</p>
        <div id="unclassifiedZone" style="display:flex;flex-wrap:wrap;gap:8px;">
          ${state.session.factors.map((f, i) => state.session.classified[i] === undefined ? 
            `<div class="drag-item" draggable="true" ondragstart="handleDragStart(event, ${i})" data-idx="${i}">${f.trim()}</div>` : ''
          ).join('')}
          ${state.session.factors.every((_, i) => state.session.classified[i] !== undefined) ? 
            '<span style="font-size:12px;color:var(--text-tertiary);">全部已分类 ✓</span>' : ''}
        </div>
      </div>
      
      <button class="btn btn-primary btn-block btn-lg" onclick="goToReframe()"
        ${!allClassified ? 'disabled style="opacity:0.4;pointer-events:none;"' : ''}>
        下一步：认知重构
      </button>
      ${!allClassified ? '<p style="text-align:center;font-size:12px;color:var(--text-tertiary);margin-top:8px;">还有未分类的事项</p>' : ''}
    </div>
  `;
}

function handleDragStart(e, idx) {
  e.dataTransfer.setData('text/plain', idx.toString());
  e.target.classList.add('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e, zone) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const idx = parseInt(e.dataTransfer.getData('text/plain'));
  state.session.classified[idx] = zone;
  renderPage('session-classify');
}

// Also support click-to-classify for mobile
document.addEventListener('click', function(e) {
  if (e.target.closest('#unclassifiedZone .drag-item')) {
    const item = e.target.closest('.drag-item');
    const idx = parseInt(item.dataset.idx);
    // Toggle between controllable and uncontrollable on click
    if (state.session.classified[idx] === undefined) {
      state.session.classified[idx] = 'controllable';
    } else if (state.session.classified[idx] === 'controllable') {
      state.session.classified[idx] = 'uncontrollable';
    } else {
      state.session.classified[idx] = undefined;
    }
    renderPage('session-classify');
  }
});

function goToReframe() {
  pushPage('session-reframe');
}

// Step 3: Reframe
function renderSessionReframe() {
  return `
    <div class="page active">
      <div class="progress-bar"><div class="fill" style="width:75%"></div></div>
      <p style="font-size:13px;color:var(--text-tertiary);text-align:center;margin:8px 0;">步骤 3/4 · 认知重构</p>
      
      <div style="font-size:20px;font-weight:600;color:var(--text-primary);margin:16px 0 4px;">
        挑战你的思维模式
      </div>
      <p style="font-size:13px;color:var(--text-tertiary);margin-bottom:16px;">
        左右滑动浏览认知扭曲卡片，选择符合你当前思维的，然后写下反驳。
      </p>
      
      <div class="distortion-carousel" id="distortionCarousel">
        ${DISTORTIONS.map(d => `
          <div class="distortion-card ${state.session.selectedDistortions.includes(d.id) ? 'selected' : ''}" 
            onclick="selectDistortion(${d.id})" id="dist-${d.id}">
            <div class="dist-num">#${d.id}</div>
            <div class="dist-name">${d.name}</div>
            <div class="dist-desc">${d.desc}</div>
            <div class="dist-question">${d.question}</div>
            ${state.session.selectedDistortions.includes(d.id) ? `
              <div style="margin-top:12px;">
                <p style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px;">反驳引导：</p>
                <p style="font-size:12px;color:var(--accent);line-height:1.5;">${d.rebuttal}</p>
                <textarea class="input" id="rebuttal-${d.id}" rows="2" 
                  placeholder="写下你自己的反驳..."
                  style="margin-top:8px;font-size:13px;"
                  onchange="updateRebuttal(${d.id}, this.value)">${state.session.rebuttals[d.id] || ''}</textarea>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
      
      <p style="font-size:12px;color:var(--text-tertiary);text-align:center;margin:8px 0;">
        ${state.session.selectedDistortions.length === 0 ? '选择至少一张卡片，看看你的思维模式' : `已选择 ${state.session.selectedDistortions.length} 种认知扭曲`}
      </p>
      
      <button class="btn btn-primary btn-block btn-lg" onclick="goToAction()">
        下一步：微小行动
      </button>
    </div>
  `;
}

function selectDistortion(id) {
  const idx = state.session.selectedDistortions.indexOf(id);
  if (idx >= 0) {
    state.session.selectedDistortions.splice(idx, 1);
    delete state.session.rebuttals[id];
  } else {
    state.session.selectedDistortions.push(id);
  }
  renderPage('session-reframe');
}

function updateRebuttal(id, text) {
  state.session.rebuttals[id] = text;
}

function goToAction() {
  pushPage('session-action');
}

// Step 4: Action
function renderSessionAction() {
  // Determine anxiety category from text
  let category = '默认';
  const text = state.session.text;
  if (text.includes('工作') || text.includes('汇报') || text.includes('老板') || text.includes('同事') || text.includes('升职') || text.includes('跳槽')) category = '工作';
  else if (text.includes('钱') || text.includes('财务') || text.includes('存款') || text.includes('房') || text.includes('账单')) category = '财务';
  else if (text.includes('妈妈') || text.includes('催婚') || text.includes('关系') || text.includes('朋友') || text.includes('家人')) category = '关系';
  else if (text.includes('身体') || text.includes('熬夜') || text.includes('健康') || text.includes('累') || text.includes('体检')) category = '健康';
  else if (text.includes('意义') || text.includes('空虚') || text.includes('迷茫') || text.includes('方向')) category = '意义感';
  
  const actions = MICRO_ACTIONS[category] || MICRO_ACTIONS['默认'];
  
  return `
    <div class="page active">
      <div class="progress-bar"><div class="fill" style="width:100%"></div></div>
      <p style="font-size:13px;color:var(--text-tertiary);text-align:center;margin:8px 0;">步骤 4/4 · 行动</p>
      
      <div style="font-size:20px;font-weight:600;color:var(--text-primary);margin:16px 0 4px;">
        选择一个微小行动
      </div>
      <p style="font-size:13px;color:var(--text-tertiary);margin-bottom:16px;">
        不需要彻底解决所有问题。今天只做一件小事。行动是最好的解药。
      </p>
      
      <div class="action-cards">
        ${actions.map((a, i) => `
          <div class="action-card ${state.session.selectedAction === i ? 'selected' : ''}" 
            onclick="selectAction(${i})">
            <div class="action-icon">${a.icon}</div>
            <div class="action-text">
              <div class="action-title">${a.title}</div>
              <div class="action-hint">${a.hint}</div>
            </div>
            <div class="action-check"></div>
          </div>
        `).join('')}
      </div>
      
      <button class="btn btn-primary btn-block btn-lg" onclick="completeSession()"
        ${state.session.selectedAction === null ? 'disabled style="opacity:0.4;pointer-events:none;"' : ''}>
        完成拆解
      </button>
    </div>
  `;
}

function selectAction(i) {
  state.session.selectedAction = i;
  renderPage('session-action');
}

function completeSession() {
  state.session.step = 5;
  // Simulate score improvement
  state.session.scoreAfter = Math.max(1, state.session.scoreBefore - Math.floor(Math.random() * 3 + 2));
  pushPage('session-summary');
}

// Step 5: Summary
function renderSessionSummary() {
  const actions = MICRO_ACTIONS['默认'];
  const selectedActionData = state.session.selectedAction !== null ? 
    (() => {
      let cat = '默认';
      const text = state.session.text;
      if (text.includes('工作') || text.includes('汇报') || text.includes('老板')) cat = '工作';
      else if (text.includes('财务') || text.includes('存款') || text.includes('房')) cat = '财务';
      else if (text.includes('催婚') || text.includes('关系')) cat = '关系';
      else if (text.includes('身体') || text.includes('熬夜') || text.includes('健康')) cat = '健康';
      else if (text.includes('意义') || text.includes('空虚') || text.includes('迷茫')) cat = '意义感';
      return (MICRO_ACTIONS[cat] || MICRO_ACTIONS['默认'])[state.session.selectedAction];
    })() : null;
  
  const improvement = state.session.scoreBefore - state.session.scoreAfter;
  
  return `
    <div class="page active">
      <div class="summary-card" style="margin-top:20px;">
        <div class="summary-icon">${improvement >= 3 ? '🎉' : improvement >= 1 ? '😌' : '💪'}</div>
        <div style="font-size:17px;font-weight:600;color:var(--text-primary);margin-bottom:16px;">
          拆解完成！
        </div>
        
        <div style="display:flex;justify-content:center;gap:32px;margin-bottom:20px;">
          <div style="text-align:center;">
            <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:4px;">拆解前</div>
            <div style="font-size:36px;font-weight:700;color:var(--danger);">${state.session.scoreBefore}</div>
          </div>
          <div style="display:flex;align-items:center;font-size:24px;color:var(--text-tertiary);">→</div>
          <div style="text-align:center;">
            <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:4px;">拆解后</div>
            <div style="font-size:36px;font-weight:700;color:var(--success);">${state.session.scoreAfter}</div>
          </div>
        </div>
        
        <div style="background:var(--bg-input);border-radius:var(--radius-sm);padding:12px 16px;margin-bottom:16px;text-align:left;">
          <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:4px;">焦虑下降了</div>
          <div style="font-size:24px;font-weight:700;color:var(--accent);">-${improvement} 分</div>
        </div>
        
        ${selectedActionData ? `
          <div style="text-align:left;margin-bottom:16px;">
            <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:6px;">你的微小行动</div>
            <div style="display:flex;align-items:center;gap:10px;background:var(--accent-glow);padding:12px 16px;border-radius:var(--radius-sm);">
              <span style="font-size:24px;">${selectedActionData.icon}</span>
              <div>
                <div style="font-size:15px;font-weight:600;color:var(--text-primary);">${selectedActionData.title}</div>
                <div style="font-size:12px;color:var(--text-secondary);">${selectedActionData.hint}</div>
              </div>
            </div>
          </div>
        ` : ''}
        
        <div style="display:flex;gap:10px;">
          <button class="btn btn-primary" onclick="switchTab('home')" style="flex:1;">返回首页</button>
          <button class="btn btn-secondary" onclick="showToast('已分享')">分享</button>
        </div>
      </div>
    </div>
  `;
}

// =============================================
// COMPASS (人生罗盘)
// =============================================
function renderCompass() {
  const valuesDone = state.compass.selectedValues.length === 5;
  const radarDone = Object.values(state.compass.radarScores).some(v => v > 0);
  
  return `
    <div class="page active">
      <div class="section-title">人生罗盘</div>
      
      <div class="card card-interactive" onclick="pushPage('compass-values')">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:16px;font-weight:600;color:var(--text-primary);">价值观排序</div>
            <div style="font-size:13px;color:var(--text-tertiary);margin-top:4px;">
              ${valuesDone ? `Top 5: ${state.compass.valueRanking.slice(0,3).join('、')}...` : '从24张卡牌中选出最重要的5个'}
            </div>
          </div>
          <div style="font-size:24px;">${valuesDone ? '✅' : '→'}</div>
        </div>
      </div>
      
      <div class="card card-interactive" onclick="pushPage('compass-radar')">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:16px;font-weight:600;color:var(--text-primary);">满意度评估</div>
            <div style="font-size:13px;color:var(--text-tertiary);margin-top:4px;">
              ${radarDone ? '6维度已完成评估' : '评估6个生活维度的满意度'}
            </div>
          </div>
          <div style="font-size:24px;">${radarDone ? '✅' : '→'}</div>
        </div>
      </div>
      
      ${valuesDone && radarDone ? `
        <div class="card card-interactive" onclick="pushPage('compass-analysis')">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:16px;font-weight:600;color:var(--text-primary);">方向分析</div>
              <div style="font-size:13px;color:var(--text-tertiary);margin-top:4px;">价值观 vs 满意度对比</div>
            </div>
            <div style="font-size:24px;">🧭</div>
          </div>
        </div>
        
        <div class="card card-interactive" onclick="pushPage('compass-experiment')">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:16px;font-weight:600;color:var(--text-primary);">小步实验</div>
              <div style="font-size:13px;color:var(--text-tertiary);margin-top:4px;">设计一个2周可验证的实验</div>
            </div>
            <div style="font-size:24px;">🧪</div>
          </div>
        </div>
      ` : `
        <div class="card" style="opacity:0.5;">
          <div style="text-align:center;padding:16px;color:var(--text-tertiary);font-size:13px;">
            完成价值观排序和满意度评估后解锁
          </div>
        </div>
      `}
    </div>
  `;
}

function renderCompassValues() {
  const selected = state.compass.selectedValues;
  const ranked = state.compass.valueRanking;
  
  return `
    <div class="page active">
      <div style="font-size:20px;font-weight:600;color:var(--text-primary);margin:16px 0 4px;">
        选择你的核心价值观
      </div>
      <p style="font-size:13px;color:var(--text-tertiary);margin-bottom:4px;">
        从24个价值观中选出最重要的5个 ${selected.length === 5 ? '✅' : `(${selected.length}/5)`}
      </p>
      
      ${ranked.length === 5 ? `
        <div style="background:var(--accent-glow);border-radius:var(--radius-md);padding:16px;margin:12px 0;">
          <p style="font-size:12px;color:var(--text-tertiary);margin-bottom:8px;">你的 Top 5（拖拽调整顺序）</p>
          <div id="rankedZone" style="display:flex;flex-direction:column;gap:6px;">
            ${ranked.map((v, i) => `
              <div class="drag-item" style="display:flex;align-items:center;gap:10px;" draggable="true">
                <span style="font-size:18px;font-weight:700;color:var(--accent);width:24px;">${i+1}.</span>
                <span>${v}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <p style="font-size:12px;color:var(--text-tertiary);margin:12px 0 8px;">全部价值观</p>
      <div class="value-grid">
        ${VALUES.map(v => {
          const isSelected = selected.includes(v);
          return `<div class="value-card ${isSelected ? 'selected' : ''}" onclick="toggleValue('${v}')">${v}</div>`;
        }).join('')}
      </div>
      
      <button class="btn btn-primary btn-block btn-lg mt-2" onclick="confirmValues()"
        ${selected.length !== 5 ? 'disabled style="opacity:0.4;pointer-events:none;"' : ''}>
        确认排序
      </button>
      ${selected.length !== 5 ? `<p style="text-align:center;font-size:12px;color:var(--text-tertiary);margin-top:8px;">请选择5个价值观 (已选${selected.length}/5)</p>` : ''}
    </div>
  `;
}

function toggleValue(v) {
  const idx = state.compass.selectedValues.indexOf(v);
  if (idx >= 0) {
    state.compass.selectedValues.splice(idx, 1);
    state.compass.valueRanking = state.compass.valueRanking.filter(x => x !== v);
  } else if (state.compass.selectedValues.length < 5) {
    state.compass.selectedValues.push(v);
  } else {
    showToast('最多选择5个价值观');
    return;
  }
  renderPage('compass-values');
}

function confirmValues() {
  if (state.compass.selectedValues.length === 5) {
    state.compass.valueRanking = [...state.compass.selectedValues];
    showToast('价值观已保存 ✓');
    goBack();
  }
}

function renderCompassRadar() {
  const scores = state.compass.radarScores;
  const dims = [
    { key: 'work', label: '工作' },
    { key: 'finance', label: '财务' },
    { key: 'relationship', label: '关系' },
    { key: 'health', label: '健康' },
    { key: 'growth', label: '成长' },
    { key: 'life', label: '生活' },
  ];
  
  return `
    <div class="page active">
      <div style="font-size:20px;font-weight:600;color:var(--text-primary);margin:16px 0 4px;">
        满意度评估
      </div>
      <p style="font-size:13px;color:var(--text-tertiary);margin-bottom:16px;">
        对6个生活维度分别打分（1=非常不满意，10=非常满意）
      </p>
      
      <div class="radar-container">
        <canvas id="radarCanvas" width="240" height="240"></canvas>
      </div>
      
      <div class="slider-group">
        ${dims.map(d => `
          <div class="slider-item">
            <span class="slider-label">${d.label}</span>
            <input type="range" class="slider-input" min="1" max="10" value="${scores[d.key] || 5}" 
              oninput="updateRadarScore('${d.key}', this.value)" id="slider-${d.key}">
            <span class="slider-value" id="val-${d.key}">${scores[d.key] || 5}</span>
          </div>
        `).join('')}
      </div>
      
      <button class="btn btn-primary btn-block btn-lg" onclick="saveRadar()">
        保存评估
      </button>
    </div>
  `;
}

function updateRadarScore(key, value) {
  state.compass.radarScores[key] = parseInt(value);
  const valEl = document.getElementById(`val-${key}`);
  if (valEl) valEl.textContent = value;
  drawRadarChart();
}

function drawRadarChart() {
  const canvas = document.getElementById('radarCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const w = 240, h = 240;
  const cx = w / 2, cy = h / 2;
  const r = 90;
  const dims = ['work', 'finance', 'relationship', 'health', 'growth', 'life'];
  const labels = ['工作', '财务', '关系', '健康', '成长', '生活'];
  const scores = dims.map(d => state.compass.radarScores[d] || 5);
  
  ctx.clearRect(0, 0, w, h);
  
  const isDark = state.theme === 'dark';
  const gridColor = isDark ? '#363A44' : '#E0D8CF';
  const accentColor = isDark ? '#E8A940' : '#C47B5A';
  const fillColor = isDark ? 'rgba(232,169,64,0.15)' : 'rgba(196,123,90,0.15)';
  const textColor = isDark ? '#9B9489' : '#6B5E4F';
  
  // Grid
  for (let level = 2; level <= 10; level += 2) {
    const lr = r * level / 10;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
      const x = cx + lr * Math.cos(angle);
      const y = cy + lr * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  // Axes
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    ctx.strokeStyle = gridColor;
    ctx.stroke();
  }
  
  // Data polygon
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
    const dr = r * scores[i] / 10;
    const x = cx + dr * Math.cos(angle);
    const y = cy + dr * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Data points
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
    const dr = r * scores[i] / 10;
    const x = cx + dr * Math.cos(angle);
    const y = cy + dr * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();
  }
  
  // Labels
  ctx.font = '12px -apple-system, PingFang SC, sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
    const lx = cx + (r + 22) * Math.cos(angle);
    const ly = cy + (r + 22) * Math.sin(angle) + 4;
    ctx.fillText(labels[i], lx, ly);
  }
}

function saveRadar() {
  showToast('满意度评估已保存 ✓');
  goBack();
}

function renderCompassAnalysis() {
  const ranking = state.compass.valueRanking;
  const scores = state.compass.radarScores;
  const dimMap = {
    '健康': 'health', '家庭陪伴': 'relationship', '亲密关系': 'relationship', '友谊': 'relationship',
    '财富自由': 'finance', '稳定收入': 'finance', '职业成就': 'work', '社会地位': 'work',
    '专业尊重': 'work', '持续成长': 'growth', '工作自主权': 'work', '创造力': 'growth',
    '冒险精神': 'growth', '安全感': 'finance', '内心平静': 'health', '自由独立': 'life',
    '利他助人': 'life', '审美艺术': 'life', '信仰精神': 'life', '快乐享乐': 'life',
    '权力影响力': 'work', '传统传承': 'life', '多样性': 'growth', '简洁极简': 'life',
  };
  
  // Find gaps
  const gaps = [];
  ranking.forEach((v, i) => {
    const dim = dimMap[v];
    if (dim && scores[dim]) {
      const gap = 10 - scores[dim];
      if (gap >= 3 && i < 3) gaps.push({ value: v, dim, score: scores[dim], gap, rank: i + 1 });
    }
  });
  
  return `
    <div class="page active">
      <div style="font-size:20px;font-weight:600;color:var(--text-primary);margin:16px 0 4px;">
        方向分析
      </div>
      <p style="font-size:13px;color:var(--text-tertiary);margin-bottom:16px;">
        对比你的价值观优先级和当前满意度，发现差距和方向。
      </p>
      
      <div class="card">
        <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">📊 价值观 vs 满意度</div>
        ${ranking.map((v, i) => {
          const dim = dimMap[v];
          const score = dim && scores[dim] ? scores[dim] : '?';
          const gap = typeof score === 'number' ? 10 - score : null;
          return `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-light);">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:13px;font-weight:600;color:var(--accent);">#${i+1}</span>
                <span style="font-size:14px;color:var(--text-primary);">${v}</span>
              </div>
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="font-size:13px;color:${typeof score === 'number' && score <= 5 ? 'var(--danger)' : 'var(--text-secondary)'};">${score}/10</span>
                ${gap !== null && gap >= 3 ? `<span class="badge badge-warning">差距大</span>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      ${gaps.length > 0 ? `
        <div class="card" style="border-left:3px solid var(--accent);">
          <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:8px;">💡 关键发现</div>
          <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
            你最重要的价值观「${gaps[0].value}」目前满意度偏低（${gaps[0].score}/10）。
            这不是说你需要彻底改变生活，而是提示你：可以在「${gaps[0].value}」方向上做一些小调整。
            试试下面的小步实验。
          </p>
        </div>
      ` : `
        <div class="card">
          <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:8px;">💡 状态不错</div>
          <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
            你的核心价值观和当前满意度基本匹配。继续保持，同时留意是否有被忽略的维度。
          </p>
        </div>
      `}
      
      <button class="btn btn-primary btn-block btn-lg" onclick="pushPage('compass-experiment')">
        创建小步实验 →
      </button>
    </div>
  `;
}

function renderCompassExperiment() {
  return `
    <div class="page active">
      <div style="font-size:20px;font-weight:600;color:var(--text-primary);margin:16px 0 4px;">
        小步实验
      </div>
      <p style="font-size:13px;color:var(--text-tertiary);margin-bottom:16px;">
        不需要做重大决定。设计一个2周的小实验，用行动验证你的方向。
      </p>
      
      <div class="card">
        <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">🧪 实验模板</div>
        
        <div style="margin-bottom:12px;">
          <label style="font-size:12px;color:var(--text-tertiary);display:block;margin-bottom:4px;">我想要验证的是...</label>
          <input class="input" placeholder="比如：我是否适合转行做产品经理？" value="">
        </div>
        
        <div style="margin-bottom:12px;">
          <label style="font-size:12px;color:var(--text-tertiary);display:block;margin-bottom:4px;">具体的实验动作</label>
          <input class="input" placeholder="比如：每周约一位产品经理朋友聊1小时" value="">
        </div>
        
        <div style="margin-bottom:12px;">
          <label style="font-size:12px;color:var(--text-tertiary);display:block;margin-bottom:4px;">实验周期</label>
          <div style="display:flex;gap:8px;">
            <span class="chip selected">2周</span>
            <span class="chip">4周</span>
          </div>
        </div>
        
        <div>
          <label style="font-size:12px;color:var(--text-tertiary);display:block;margin-bottom:4px;">成功标准（怎么知道实验有结论了？）</label>
          <input class="input" placeholder="比如：了解真实工作内容后，我是否依然感兴趣？" value="">
        </div>
      </div>
      
      <div class="card" style="border-left:3px solid var(--info);">
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
          <strong>💡 小步实验的原则：</strong><br>
          • 低成本：不需要辞职、搬家等重大改变<br>
          • 可验证：2周内能得出初步结论<br>
          • 可逆的：不是一次性的豪赌
        </div>
      </div>
      
      <button class="btn btn-primary btn-block btn-lg" onclick="showToast('实验计划已保存 ✓')">
        保存实验计划
      </button>
    </div>
  `;
}

// =============================================
// INSIGHT (数据洞察)
// =============================================
function renderInsight() {
  const totalSessions = SAMPLE_HISTORY.reduce((sum, g) => sum + g.entries.length, 0);
  const avgImprovement = 3.2;
  const topDistortion = '灾难化预测';
  const peakTime = '周日晚 20:00-23:00';
  
  return `
    <div class="page active">
      <div class="section-title">数据洞察</div>
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        <div class="card text-center">
          <div class="insight-stat"><span class="insight-number">${totalSessions}</span><span class="insight-unit">次</span></div>
          <div style="font-size:12px;color:var(--text-tertiary);">累计拆解</div>
        </div>
        <div class="card text-center">
          <div class="insight-stat"><span class="insight-number">${avgImprovement}</span><span class="insight-unit">分</span></div>
          <div style="font-size:12px;color:var(--text-tertiary);">平均焦虑下降</div>
        </div>
      </div>
      
      <div class="card card-interactive" onclick="pushPage('insight-trend')">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:16px;font-weight:600;color:var(--text-primary);">焦虑趋势</div>
            <div style="font-size:13px;color:var(--text-tertiary);margin-top:4px;">过去4周焦虑强度变化</div>
          </div>
          <div style="font-size:20px;">📈</div>
        </div>
      </div>
      
      <div class="card card-interactive" onclick="pushPage('insight-pattern')">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:16px;font-weight:600;color:var(--text-primary);">触发模式</div>
            <div style="font-size:13px;color:var(--text-tertiary);margin-top:4px;">你最容易被什么触发焦虑？</div>
          </div>
          <div style="font-size:20px;">🔍</div>
        </div>
      </div>
      
      <div class="card">
        <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">📊 关键发现</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;">
          • 最常见认知扭曲：<strong style="color:var(--accent);">${topDistortion}</strong><br>
          • 焦虑高峰期：<strong style="color:var(--accent);">${peakTime}</strong><br>
          • 最常见焦虑类型：<strong style="color:var(--accent);">工作焦虑</strong>（占60%）<br>
          • 拆解效果最佳时段：<strong style="color:var(--accent);">晚上21:00-22:00</strong>
        </div>
      </div>
    </div>
  `;
}

function renderInsightTrend() {
  return `
    <div class="page active">
      <div style="font-size:20px;font-weight:600;color:var(--text-primary);margin:16px 0 4px;">
        焦虑趋势
      </div>
      <p style="font-size:13px;color:var(--text-tertiary);margin-bottom:16px;">
        过去4周的焦虑强度变化（蓝色=拆解前，绿色=拆解后）
      </p>
      
      <div class="card" style="padding:24px;">
        <div style="text-align:center;margin-bottom:16px;font-size:14px;font-weight:600;color:var(--text-primary);">
          周平均焦虑评分变化
        </div>
        
        <!-- Simplified trend chart with CSS bars -->
        <div style="display:flex;align-items:flex-end;justify-content:space-around;height:160px;gap:20px;padding:0 8px;">
          ${[
            { week: 'W1', before: 6.8, after: 4.5 },
            { week: 'W2', before: 6.2, after: 3.8 },
            { week: 'W3', before: 5.5, after: 3.2 },
            { week: 'W4', before: 5.0, after: 2.8 },
          ].map(w => `
            <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;">
              <div style="display:flex;gap:6px;align-items:flex-end;height:130px;">
                <div style="width:20px;height:${w.before * 16}px;background:var(--danger);border-radius:4px 4px 0 0;opacity:0.7;transition:height 0.5s;"></div>
                <div style="width:20px;height:${w.after * 16}px;background:var(--success);border-radius:4px 4px 0 0;transition:height 0.5s;"></div>
              </div>
              <span style="font-size:11px;color:var(--text-tertiary);">${w.week}</span>
            </div>
          `).join('')}
        </div>
        
        <div style="display:flex;justify-content:center;gap:20px;margin-top:12px;">
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:10px;height:10px;background:var(--danger);opacity:0.7;border-radius:2px;"></div>
            <span style="font-size:11px;color:var(--text-tertiary);">拆解前</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:10px;height:10px;background:var(--success);border-radius:2px;"></div>
            <span style="font-size:11px;color:var(--text-tertiary);">拆解后</span>
          </div>
        </div>
      </div>
      
      <div class="card" style="border-left:3px solid var(--success);">
        <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:4px;">📉 趋势向好</div>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
          4周内，你的周平均焦虑评分从6.8下降到5.0（拆解前），下降26%。拆解后的评分也在持续降低。这说明你不仅在学会管理焦虑，焦虑本身也在减轻。
        </p>
      </div>
    </div>
  `;
}

function renderInsightPattern() {
  return `
    <div class="page active">
      <div style="font-size:20px;font-weight:600;color:var(--text-primary);margin:16px 0 4px;">
        触发模式识别
      </div>
      <p style="font-size:13px;color:var(--text-tertiary);margin-bottom:16px;">
        系统自动识别你最容易被触发焦虑的场景和模式。
      </p>
      
      <div class="card">
        <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">⏰ 时间模式</div>
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-light);">
          <span style="font-size:24px;">🌙</span>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:500;color:var(--text-primary);">周日夜晚</div>
            <div style="font-size:12px;color:var(--text-tertiary);">20:00-23:00，占总记录的40%</div>
          </div>
          <span class="badge badge-warning">高峰</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-light);">
          <span style="font-size:24px;">🌅</span>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:500;color:var(--text-primary);">周一早晨</div>
            <div style="font-size:12px;color:var(--text-tertiary);">07:00-09:00，占总记录的25%</div>
          </div>
          <span class="badge badge-info">次高峰</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;">
          <span style="font-size:24px;">📊</span>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:500;color:var(--text-primary);">绩效评估季</div>
            <div style="font-size:12px;color:var(--text-tertiary);">每季度末，占总记录的15%</div>
          </div>
          <span class="badge badge-info">周期</span>
        </div>
      </div>
      
      <div class="card">
        <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">🧠 思维模式</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <span class="chip selected">灾难化预测 (60%)</span>
          <span class="chip">心理过滤 (45%)</span>
          <span class="chip">过度概括 (30%)</span>
          <span class="chip">应该思维 (25%)</span>
          <span class="chip">情绪推理 (20%)</span>
        </div>
      </div>
      
      <div class="card" style="border-left:3px solid var(--accent);">
        <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:4px;">💡 建议</div>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
          你的焦虑有明显的「周日夜晚」模式。建议在周日晚上20:00设置一个固定提醒，主动做一次拆解，而不是让焦虑积累到睡前。
        </p>
        <button class="btn btn-secondary btn-sm mt-2" onclick="pushPage('profile-reminders')">
          设置提醒 →
        </button>
      </div>
    </div>
  `;
}

// =============================================
// PROFILE (我的)
// =============================================
function renderProfile() {
  const totalSessions = SAMPLE_HISTORY.reduce((sum, g) => sum + g.entries.length, 0);
  const daysActive = SAMPLE_HISTORY.length;
  
  return `
    <div class="page active">
      <div class="card text-center" style="padding:28px;">
        <div style="width:64px;height:64px;border-radius:50%;background:var(--accent-glow);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 12px;">${state.user?.avatar || '🧠'}</div>
        <div style="font-size:17px;font-weight:600;color:var(--text-primary);">${state.user?.name || '拆解用户'}</div>
        <div style="font-size:13px;color:var(--text-tertiary);">${state.user?.email || ''} · 已使用 ${daysActive} 天 · 完成 ${totalSessions} 次拆解</div>
        <button class="btn btn-ghost btn-sm mt-1" onclick="handleLogout()" style="color:var(--danger);">退出登录</button>
      </div>
      
      <div class="section-title">记录</div>
      <div class="card card-interactive" onclick="pushPage('home');switchTab('home')" style="display:none;">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:24px;">📋</span>
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:500;color:var(--text-primary);">焦虑日志</div>
            <div style="font-size:12px;color:var(--text-tertiary);">查看所有拆解记录</div>
          </div>
          <span style="color:var(--text-tertiary);">→</span>
        </div>
      </div>
      
      <div class="card card-interactive" onclick="pushPage('profile-reminders')">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:24px;">⏰</span>
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:500;color:var(--text-primary);">智能提醒</div>
            <div style="font-size:12px;color:var(--text-tertiary);">${state.reminders.enabled ? `已开启 · ${state.reminders.time}` : '未开启'}</div>
          </div>
          <span style="color:var(--text-tertiary);">→</span>
        </div>
      </div>
      
      <div class="card card-interactive" onclick="pushPage('profile-export')">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:24px;">📤</span>
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:500;color:var(--text-primary);">数据导出</div>
            <div style="font-size:12px;color:var(--text-tertiary);">导出PDF或文本，可分享给咨询师</div>
          </div>
          <span style="color:var(--text-tertiary);">→</span>
        </div>
      </div>
      
      <div class="card card-interactive" onclick="pushPage('profile-settings')">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:24px;">⚙️</span>
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:500;color:var(--text-primary);">设置</div>
            <div style="font-size:12px;color:var(--text-tertiary);">主题、隐私、关于</div>
          </div>
          <span style="color:var(--text-tertiary);">→</span>
        </div>
      </div>
      
      <!-- Timeline -->
      <div class="section-title">焦虑日志</div>
      <div class="timeline">
        ${SAMPLE_HISTORY.map(group => `
          <div class="timeline-group">
            <div class="timeline-date">${group.date}</div>
            ${group.entries.map(e => `
              <div class="timeline-entry" onclick="showToast('查看详情')">
                <div class="entry-time">${e.time}</div>
                <div class="entry-text">${e.text}</div>
                <div class="entry-tags">
                  <span class="chip">${e.category}</span>
                  <span style="font-size:11px;color:var(--text-tertiary);">${e.scoreBefore}→${e.scoreAfter}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderProfileReminders() {
  return `
    <div class="page active">
      <div style="font-size:20px;font-weight:600;color:var(--text-primary);margin:16px 0 4px;">
        智能提醒
      </div>
      <p style="font-size:13px;color:var(--text-tertiary);margin-bottom:16px;">
        在你最容易焦虑的时间点，提醒你做一次拆解。
      </p>
      
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div>
            <div style="font-size:15px;font-weight:500;color:var(--text-primary);">开启提醒</div>
            <div style="font-size:12px;color:var(--text-tertiary);">基于你的焦虑模式自动推荐时间</div>
          </div>
          <div class="toggle-switch ${state.reminders.enabled ? 'active' : ''}" 
            onclick="toggleReminder()" id="reminderToggle"></div>
        </div>
        
        ${state.reminders.enabled ? `
          <div style="border-top:1px solid var(--border-light);padding-top:16px;">
            <div style="margin-bottom:12px;">
              <label style="font-size:12px;color:var(--text-tertiary);display:block;margin-bottom:4px;">提醒时间</label>
              <input type="time" class="input" value="${state.reminders.time}" 
                onchange="updateReminderTime(this.value)" style="width:auto;">
            </div>
            
            <div>
              <label style="font-size:12px;color:var(--text-tertiary);display:block;margin-bottom:8px;">重复日</label>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                ${['周一','周二','周三','周四','周五','周六','周日'].map(d => `
                  <span class="chip ${state.reminders.days.includes(d) ? 'selected' : ''}" 
                    onclick="toggleReminderDay('${d}')">${d}</span>
                `).join('')}
              </div>
            </div>
            
            <div style="background:var(--accent-glow);border-radius:var(--radius-sm);padding:12px;margin-top:16px;">
              <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;">
                💡 系统检测到你的焦虑高峰期是 <strong>周日晚上 20:00-23:00</strong>。建议在周日 20:00 设置提醒。
              </p>
            </div>
          </div>
        ` : `
          <div style="text-align:center;padding:16px;color:var(--text-tertiary);font-size:13px;">
            开启后，系统会在你最容易焦虑的时间提醒你做拆解
          </div>
        `}
      </div>
    </div>
  `;
}

function toggleReminder() {
  state.reminders.enabled = !state.reminders.enabled;
  const toggle = document.getElementById('reminderToggle');
  if (toggle) toggle.classList.toggle('active', state.reminders.enabled);
  renderPage('profile-reminders');
  showToast(state.reminders.enabled ? '提醒已开启 ✓' : '提醒已关闭');
}

function updateReminderTime(time) {
  state.reminders.time = time;
}

function toggleReminderDay(day) {
  const idx = state.reminders.days.indexOf(day);
  if (idx >= 0) {
    state.reminders.days.splice(idx, 1);
  } else {
    state.reminders.days.push(day);
  }
  renderPage('profile-reminders');
}

function renderProfileExport() {
  return `
    <div class="page active">
      <div style="font-size:20px;font-weight:600;color:var(--text-primary);margin:16px 0 4px;">
        数据导出
      </div>
      <p style="font-size:13px;color:var(--text-tertiary);margin-bottom:16px;">
        你的数据属于你。导出后可以分享给心理咨询师，或自己存档。
      </p>
      
      <div class="card card-interactive" onclick="simulateExport('pdf')">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:28px;">📄</span>
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:500;color:var(--text-primary);">导出为 PDF</div>
            <div style="font-size:12px;color:var(--text-tertiary);">包含焦虑日志、雷达图、价值观结果</div>
          </div>
          <span style="color:var(--text-tertiary);">→</span>
        </div>
      </div>
      
      <div class="card card-interactive" onclick="simulateExport('txt')">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:28px;">📝</span>
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:500;color:var(--text-primary);">导出为文本</div>
            <div style="font-size:12px;color:var(--text-tertiary);">纯文本格式，方便粘贴到其他工具</div>
          </div>
          <span style="color:var(--text-tertiary);">→</span>
        </div>
      </div>
      
      <div class="card" style="border-left:3px solid var(--info);">
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
          <strong>🔒 隐私说明：</strong><br>
          所有数据默认存储在你的设备和加密云端。导出文件不会包含任何可识别个人身份的信息。分享前请确认接收方是你信任的人。
        </div>
      </div>
    </div>
  `;
}

function simulateExport(format) {
  showToast(`正在生成${format.toUpperCase()}文件...`);
  setTimeout(() => {
    showToast('导出完成 ✓（模拟）');
  }, 1500);
}

function renderProfileSettings() {
  return `
    <div class="page active">
      <div class="section-title">外观</div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:15px;font-weight:500;color:var(--text-primary);">深色模式</div>
            <div style="font-size:12px;color:var(--text-tertiary);">${state.theme === 'dark' ? '已开启' : '已关闭'}</div>
          </div>
          <div class="toggle-switch ${state.theme === 'dark' ? 'active' : ''}" onclick="toggleTheme()"></div>
        </div>
      </div>
      
      <div class="section-title">隐私</div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:15px;font-weight:500;color:var(--text-primary);">本地优先存储</div>
            <div style="font-size:12px;color:var(--text-tertiary);">数据优先保存在设备，云端为备份</div>
          </div>
          <span style="color:var(--success);font-size:13px;">已开启</span>
        </div>
      </div>
      
      <div class="section-title">关于</div>
      <div class="card">
        <div style="font-size:15px;font-weight:500;color:var(--text-primary);margin-bottom:4px;">拆解 v1.0.0</div>
        <div style="font-size:13px;color:var(--text-tertiary);line-height:1.6;">
          一款帮助25-35岁职场人把模糊焦虑拆解为可行动作的心理健康工具。<br><br>
          CBT认知行为疗法 × 斯多葛控制二分法 × 行为激活
        </div>
      </div>
      
      <button class="btn btn-ghost btn-block mt-1" onclick="pushPage('legal-agreement')">
        用户服务协议
      </button>
      <button class="btn btn-ghost btn-block mt-1" onclick="pushPage('legal-privacy')">
        隐私保护指引
      </button>
      <button class="btn btn-ghost btn-block mt-3" onclick="resetOnboarding()">
        重新查看引导页
      </button>
    </div>
  `;
}

// =============================================
// ONBOARDING
// =============================================
function renderOnboarding() {
  return `
    <div class="page active" style="display:flex;flex-direction:column;min-height:100%;">
      <div id="onboardingContent" style="flex:1;display:flex;align-items:center;justify-content:center;">
        ${ONBOARDING_SLIDES.map((slide, i) => `
          <div class="onboarding-slide" id="onboard-${i}" style="${i === 0 ? '' : 'display:none;'}">
            <div class="onboarding-illustration">${slide.emoji}</div>
            <div class="onboarding-title">${slide.title}</div>
            <div class="onboarding-desc">${slide.desc}</div>
          </div>
        `).join('')}
      </div>
      
      <div style="text-align:center;padding:20px;">
        <div class="onboarding-dots" style="justify-content:center;">
          ${[0,1,2].map(i => `<div class="onboarding-dot ${i === 0 ? 'active' : ''}" id="dot-${i}"></div>`).join('')}
        </div>
        <button class="btn btn-primary btn-block btn-lg" id="onboardBtn" onclick="nextOnboardSlide()">
          下一步
        </button>
        <button class="btn btn-ghost btn-block mt-1" onclick="completeOnboarding()" style="font-size:13px;">
          跳过
        </button>
      </div>
    </div>
  `;
}

let onboardCurrent = 0;
function nextOnboardSlide() {
  onboardCurrent++;
  if (onboardCurrent >= ONBOARDING_SLIDES.length) {
    completeOnboarding();
    return;
  }
  
  ONBOARDING_SLIDES.forEach((_, i) => {
    const el = document.getElementById(`onboard-${i}`);
    const dot = document.getElementById(`dot-${i}`);
    if (el) el.style.display = i === onboardCurrent ? 'flex' : 'none';
    if (dot) dot.classList.toggle('active', i === onboardCurrent);
  });
  
  const btn = document.getElementById('onboardBtn');
  if (btn) btn.textContent = onboardCurrent === 2 ? '开始使用' : '下一步';
}

function completeOnboarding() {
  state.onboardingComplete = true;
  localStorage.setItem('dismantle_onboarded', 'true');
  onboardCurrent = 0;
  switchTab('home');
}

function resetOnboarding() {
  localStorage.removeItem('dismantle_onboarded');
  state.onboardingComplete = false;
  onboardCurrent = 0;
  renderOnboarding();
}

// =============================================
// UTILS
// =============================================
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  document.getElementById('modalSheet').classList.remove('show');
}

// === Init on load ===
window.addEventListener('DOMContentLoaded', init);

// === Handle textarea input in session ===
document.addEventListener('input', function(e) {
  if (e.target.id === 'anxietyInput') {
    state.session.text = e.target.value;
  }
});
