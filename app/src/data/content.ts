// 10 Cognitive Distortions (认知扭曲卡片)
export interface Distortion {
  id: number;
  name: string;
  desc: string;
  question: string;
  rebuttal: string;
}

export const DISTORTIONS: Distortion[] = [
  {
    id: 1,
    name: '灾难化预测',
    desc: '把最坏情况当成必然结果',
    question: '我在假设最坏的情况一定会发生吗？',
    rebuttal: '试着找3个证据，证明最坏情况不一定发生。过去有多少次你的「灾难预测」真的成真了？',
  },
  {
    id: 2,
    name: '非黑即白',
    desc: '要么完美，要么彻底失败',
    question: '有没有中间地带？有没有部分成功？',
    rebuttal: '在0到100之间，真实情况更接近多少分？即使不完美，你做到了哪些？',
  },
  {
    id: 3,
    name: '读心术',
    desc: '以为自己知道别人在想什么',
    question: '我有证据证明别人是这么想的吗？',
    rebuttal: '别人没有说出来的想法，只是你的猜测。有没有其他可能的解释？',
  },
  {
    id: 4,
    name: '情绪推理',
    desc: '因为感觉糟糕，所以事情一定糟糕',
    question: '我的情绪是事实的证据吗？',
    rebuttal: '情绪是信号，不是事实。如果换一个心情好的时候看同一件事，你会怎么想？',
  },
  {
    id: 5,
    name: '过度概括',
    desc: '用一件事给整个人生下结论',
    question: '我是在用一个例子概括全部吗？',
    rebuttal: '一次失败不代表永远失败。你能想起一个反例吗？',
  },
  {
    id: 6,
    name: '心理过滤',
    desc: '只看到负面，过滤掉正面',
    question: '这件事中有没有好的部分被我忽略了？',
    rebuttal: '试着列出这件事中至少2个积极或中性的方面。',
  },
  {
    id: 7,
    name: '贴标签',
    desc: '给自己或他人贴上全局性标签',
    question: '我是在描述一个行为，还是在定义整个人？',
    rebuttal: '把「我搞砸了这件事」和「我是一个失败者」区分开。行为 ≠ 身份。',
  },
  {
    id: 8,
    name: '个人化',
    desc: '把所有责任都归咎于自己',
    question: '哪些因素是我控制之外的？',
    rebuttal: '画一个圆圈，把你能控制的和不能控制的分开。你只对自己能控制的部分负责。',
  },
  {
    id: 9,
    name: '应该思维',
    desc: '用「应该」给自己施加绝对化要求',
    question: '这个「应该」是客观事实，还是我的主观期待？',
    rebuttal: '把「我应该」换成「我希望」。希望是柔性的，应该是一种暴力。',
  },
  {
    id: 10,
    name: '放大/缩小',
    desc: '放大负面，缩小正面',
    question: '如果我站在第三方视角，会怎么看这件事的比例？',
    rebuttal: '想象你最好的朋友遇到同样的事，你会怎么安慰TA？用同样的语气对自己说话。',
  },
];

// 24 Value Cards
export const VALUES: string[] = [
  '健康', '家庭陪伴', '亲密关系', '友谊', '财富自由', '稳定收入',
  '职业成就', '社会地位', '专业尊重', '持续成长', '工作自主权', '创造力',
  '冒险精神', '安全感', '内心平静', '自由独立', '利他助人', '审美艺术',
  '信仰精神', '快乐享乐', '权力影响力', '传统传承', '多样性', '简洁极简',
];

// Micro Actions by category
export interface MicroAction {
  icon: string;
  title: string;
  hint: string;
}

export const MICRO_ACTIONS: Record<string, MicroAction[]> = {
  '工作': [
    { icon: '📝', title: '写下3个关键任务', hint: '把模糊的工作压力变成具体的待办事项' },
    { icon: '📊', title: '整理一份数据清单', hint: '用事实替代想象，看看真实情况' },
    { icon: '💬', title: '约一个同事聊聊', hint: '把你的担忧说给一个信任的人听' },
    { icon: '⏰', title: '设定一个番茄钟', hint: '25分钟专注一件小事，用行动打破焦虑' },
    { icon: '📧', title: '发送那封拖延的邮件', hint: '把一直回避的沟通完成掉' },
    { icon: '🎯', title: '定义今天的「最小胜利」', hint: '今天结束时，什么能让你觉得今天没白过？' },
  ],
  '财务': [
    { icon: '📋', title: '打开记账App看一眼', hint: '不确定性往往来自不了解真实情况' },
    { icon: '💰', title: '设定一个本周储蓄小目标', hint: '哪怕只有100元，掌控感从行动开始' },
    { icon: '📚', title: '花15分钟学一个理财概念', hint: '知识是最好的抗焦虑药' },
    { icon: '🔔', title: '取消一个不必要的订阅', hint: '微小的财务清理带来巨大的掌控感' },
    { icon: '📊', title: '算一下你的净资产', hint: '知道自己站在哪里，比盲目焦虑更有用' },
    { icon: '🎯', title: '写下你的财务底线', hint: '最坏情况你能承受吗？通常答案是可以' },
  ],
  '关系': [
    { icon: '💌', title: '给在意的人发一条消息', hint: '不需要解决问题，只需要表达关心' },
    { icon: '🚶', title: '独自散步15分钟', hint: '先和自己的情绪待一会，再处理关系' },
    { icon: '📖', title: '写下你想说但没说的话', hint: '不是发给对方，只是写给自己看' },
    { icon: '🤝', title: '设定一个边界', hint: '今天对一件你不想做的事，温和而坚定地说不' },
    { icon: '🧘', title: '做3次深呼吸', hint: '关系冲突时，先照顾自己的身体反应' },
    { icon: '📞', title: '给家人打一个5分钟电话', hint: '不需要解决催婚问题，只是聊聊日常' },
  ],
  '健康': [
    { icon: '🚶', title: '站起来走动5分钟', hint: '身体活动是最快的焦虑缓解剂' },
    { icon: '💧', title: '喝一杯水', hint: '有时候焦虑只是身体缺水的信号' },
    { icon: '🧘', title: '做1分钟腹式呼吸', hint: '吸气4秒，屏住4秒，呼气6秒' },
    { icon: '😴', title: '今晚提前30分钟放下手机', hint: '睡眠是焦虑最好的解药' },
    { icon: '🏃', title: '做一个拉伸动作', hint: '紧绷的身体会强化焦虑感' },
    { icon: '📱', title: '预约一次体检', hint: '把担忧变成行动，消除不确定性' },
  ],
  '意义感': [
    { icon: '📝', title: '写下今天让你有能量的一件事', hint: '哪怕很小，意义感来自被注意到的瞬间' },
    { icon: '🌟', title: '回忆一个你曾帮助别人的时刻', hint: '你比自己以为的更有价值' },
    { icon: '🎨', title: '花15分钟做一件纯粹喜欢的事', hint: '不为了产出，只为了过程' },
    { icon: '📖', title: '写下你理想的一天', hint: '不需要宏大目标，从一天开始想象' },
    { icon: '🔍', title: '找一个你佩服的人的故事', hint: '看看他们是否也曾迷茫' },
    { icon: '🌱', title: '学一个新技能的5分钟教程', hint: '成长感是最好的意义感来源' },
  ],
  '默认': [
    { icon: '🫁', title: '做5分钟深呼吸', hint: '吸气4秒，屏住4秒，呼气6秒，重复' },
    { icon: '✍️', title: '写下此刻三个让你感恩的事', hint: '感恩练习是经过验证的情绪调节方法' },
    { icon: '💬', title: '给一个朋友发条消息', hint: '不需要倾诉焦虑，只是随便聊聊' },
  ],
};

// Emotion options
export const EMOTIONS = [
  { id: 'anxiety', emoji: '😰', label: '焦虑' },
  { id: 'irritable', emoji: '😤', label: '烦躁' },
  { id: 'lost', emoji: '😶‍🌫️', label: '迷茫' },
  { id: 'stress', emoji: '😮‍💨', label: '压力' },
  { id: 'insomnia', emoji: '😵', label: '失眠' },
  { id: 'other', emoji: '🤔', label: '其他' },
];

// Helper: categorize anxiety text
export function categorizeAnxiety(text: string): string {
  if (/工作|汇报|老板|同事|升职|跳槽|职业|加班|绩效/.test(text)) return '工作';
  if (/钱|财务|存款|房|账单|理财|工资|消费/.test(text)) return '财务';
  if (/妈妈|催婚|关系|朋友|家人|伴侣|恋爱|分手/.test(text)) return '关系';
  if (/身体|熬夜|健康|累|体检|失眠|头疼/.test(text)) return '健康';
  if (/意义|空虚|迷茫|方向|人生|目标/.test(text)) return '意义感';
  return '默认';
}

// Parse factors from text
export function parseFactors(text: string): string[] {
  const sentences = text.split(/[。！？；\n]/).filter(s => s.trim());
  return sentences.length > 1 ? sentences.map(s => s.trim()) : [text.trim()];
}
