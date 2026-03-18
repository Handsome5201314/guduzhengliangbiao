export interface ScaleQuestion {
  id: number;
  text: string;
  reverse?: boolean;
}

export interface ScaleDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  questions: ScaleQuestion[];
  options: { value: number; label: string }[];
  reverseOptions?: { value: number; label: string }[];
  getScoreInterpretation: (score: number) => { text: string; color: string; bg: string; border: string };
  aiPromptContext: string;
}

export const scales: Record<string, ScaleDefinition> = {
  'simple-social': {
    id: 'simple-social',
    name: '简易社交观察量表',
    shortName: '简易量表',
    description: '包含5个核心问题的快速筛查工具，用于初步评估儿童的社交沟通能力。',
    questions: [
      { id: 1, text: "用食指指物表达需求" },
      { id: 2, text: "对其他孩子感兴趣" },
      { id: 3, text: "模仿大人的动作" },
      { id: 4, text: "呼名反应" },
      { id: 5, text: "指物分享兴趣" }
    ],
    options: [
      { value: 1, label: "从不" },
      { value: 2, label: "偶尔" },
      { value: 3, label: "经常" },
      { value: 4, label: "总是" }
    ],
    getScoreInterpretation: (score: number) => {
      if (score >= 16) return { text: "社交沟通发展良好，请继续保持良好的家庭互动。", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
      if (score >= 11) return { text: "部分社交沟通能力仍在发展中，建议在日常生活中增加互动引导。", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
      return { text: "社交沟通互动可能需要更多关注，建议多观察，必要时可咨询专业儿科医生获取发育指导。", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" };
    },
    aiPromptContext: "量表总分20分，分数越低提示社交沟通发展可能需要更多关注。评分标准为：1分=从不，2分=偶尔，3分=经常，4分=总是。"
  },
  'srs': {
    id: 'srs',
    name: '社交反应量表 (SRS)',
    shortName: 'SRS',
    description: '包含65个项目的详细评估工具，用于全面评估儿童在自然社会环境中的社交损伤程度。',
    questions: [
      { id: 1, text: "在社交场合较独处时表现得明显烦躁" },
      { id: 2, text: "面部表情与当时说话情节不符" },
      { id: 3, text: "与别人互动时表现得很自信", reverse: true },
      { id: 4, text: "当受到压力时表现出固定奇特的行为方式" },
      { id: 5, text: "不会意识到被别人利用" },
      { id: 6, text: "宁愿一个人呆着也不愿意与别人一起呆着" },
      { id: 7, text: "能意识到别人的想法和感觉", reverse: true },
      { id: 8, text: "行为方式独特，奇怪" },
      { id: 9, text: "粘着大人，对他们十分依赖" },
      { id: 10, text: "只能理解谈话的字面意思，不能理解其真正含义" },
      { id: 11, text: "很有自信", reverse: true },
      { id: 12, text: "能够向别人传达自己的感受", reverse: true },
      { id: 13, text: "与同伴交谈时显得笨拙（例如在交谈时不懂得轮流说话）" },
      { id: 14, text: "不能很好地与别人合作" },
      { id: 15, text: "能理解别人的语调及面部表情的意思", reverse: true },
      { id: 16, text: "避免目光接触或有不正常的目光接触" },
      { id: 17, text: "能意识到事情的不公平", reverse: true },
      { id: 18, text: "即使很努力，但是也很难与别人做朋友" },
      { id: 19, text: "在谈话中想理解别人的意思时受挫" },
      { id: 20, text: "有不同寻常的感官兴趣（喃喃自语，旋转物体）或特别的玩玩具的方式" },
      { id: 21, text: "能够模仿别人的动作", reverse: true },
      { id: 22, text: "与同年人能够正常，恰当地玩耍", reverse: true },
      { id: 23, text: "除非叫他去，否则不参加集体活动" },
      { id: 24, text: "较之其他儿童，他（她）很难接受常规的改变" },
      { id: 25, text: "不介意与别人不同步或与别人不同调" },
      { id: 26, text: "当别人伤心时能安慰别人", reverse: true },
      { id: 27, text: "避免与同伴或成人开始社会交往" },
      { id: 28, text: "重复地想或重复谈论一样东西" },
      { id: 29, text: "被其他儿童认为古怪或奇特" },
      { id: 30, text: "在一个复杂（很多事情同时发生）的环境中变得不高兴" },
      { id: 31, text: "他（她）一旦开始想一件事就会一直坚持想下去" },
      { id: 32, text: "个人卫生好", reverse: true },
      { id: 33, text: "在交往时即使他（她）努力尝试礼貌，但是仍先得笨拙无礼" },
      { id: 34, text: "逃避想亲近他（她）的人" },
      { id: 35, text: "不能维持正常的交谈" },
      { id: 36, text: "与成人交流有困难" },
      { id: 37, text: "与同伴交流有困难" },
      { id: 38, text: "当别人的情绪改变时能有恰当的反应", reverse: true },
      { id: 39, text: "有不寻常，狭隘的兴趣" },
      { id: 40, text: "富有想象力，会假装（不脱离实际的）", reverse: true },
      { id: 41, text: "毫无目的地在两个活动之间走动" },
      { id: 42, text: "对声音，质地或气味非常敏感" },
      { id: 43, text: "容易与抚养者分开", reverse: true },
      { id: 44, text: "不能理解事件的互相关系（例如因果关系），而同龄人可以" },
      { id: 45, text: "能注意别人看或听的地方", reverse: true },
      { id: 46, text: "有过度严肃的面部表情" },
      { id: 47, text: "表现得很傻或突然大笑" },
      { id: 48, text: "有幽默感，能理解笑话", reverse: true },
      { id: 49, text: "对一些任务完成得极好，但大多数任务不能完成得同样好" },
      { id: 50, text: "有重复的奇怪的行为如拍手或摇晃" },
      { id: 51, text: "不能直接地回答问题且答非所问" },
      { id: 52, text: "会察觉他（她）正在大声谈话或制造了噪音", reverse: true },
      { id: 53, text: "用奇怪的语调与人谈话（如像机器人说话或在演讲）" },
      { id: 54, text: "对人的反应好像把人当物体" },
      { id: 55, text: "能意识到他（她）太靠近别人或侵犯了别人的空间", reverse: true },
      { id: 56, text: "会走到两个正在谈话的人中间" },
      { id: 57, text: "经常被嘲弄" },
      { id: 58, text: "对事物的部分过于专注而忽视了整体。" },
      { id: 59, text: "多疑" },
      { id: 60, text: "感情淡漠，不表达她（他）的感受" },
      { id: 61, text: "固执，要改变他（她）的想法很难" },
      { id: 62, text: "做事的原因很特别或不合逻辑" },
      { id: 63, text: "与他人接触时方式很特别（如碰碰别人后不说话走开）" },
      { id: 64, text: "在社交场合中特别紧张" },
      { id: 65, text: "无目的地凝视或注视" }
    ],
    options: [
      { value: 0, label: "没有" },
      { value: 1, label: "有时" },
      { value: 2, label: "经常" },
      { value: 3, label: "总是" }
    ],
    reverseOptions: [
      { value: 0, label: "总是" },
      { value: 1, label: "经常" },
      { value: 2, label: "有时" },
      { value: 3, label: "没有" }
    ],
    getScoreInterpretation: (score: number) => {
      // SRS scoring interpretation (simplified for this context)
      if (score <= 59) return { text: "社交能力在正常范围内。", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
      if (score <= 75) return { text: "存在轻度到中度的社交损伤，建议关注并增加社交引导。", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
      return { text: "存在重度社交损伤，强烈建议咨询专业医生进行全面评估。", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" };
    },
    aiPromptContext: "SRS量表总分范围0-195分，分数越高提示社交损伤越严重。正常范围通常在59分及以下。正向计分题目的评分标准为：0分=没有，1分=有时，2分=经常，3分=总是。反向计分题目的评分标准为：0分=总是，1分=经常，2分=有时，3分=没有。请根据题目是否为反向计分来指导家长。"
  }
};
