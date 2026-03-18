import { ScaleDefinition } from './types';
import { snapIvSkill } from '../skills';

export const snapIvScale: ScaleDefinition = {
  id: 'snap-iv-26',
  name: '注意缺陷多动障碍筛查量表 (SNAP-IV)',
  shortName: 'SNAP-IV量表',
  description: '用于评估儿童及青少年注意力缺陷、多动/冲动以及对立违抗行为的严重程度。',
  questions: [
    { id: 1, text: '在学校做作业或者其他活动时，无法专注于细节的部分或出现粗心的错误' },
    { id: 2, text: '很难持续专注于工作或者游戏活动' },
    { id: 3, text: '看起来好像没有听到别人对他说话的内容' },
    { id: 4, text: '没办法遵循指示，也无法完成学校作业或家事(并是不由于对立性行为或无法了解指示内容)' },
    { id: 5, text: '很难组织规划工作及活动' },
    { id: 6, text: '逃避，或表达不愿意，或很难从事于需要持续性动脑的工作(例如学校作业或是家庭作业)' },
    { id: 7, text: '会弄丢作业或活动所必需的东西(例如:学校作业，铅笔，书，工具，或玩具)' },
    { id: 8, text: '很容易受外在刺激影响而分心' },
    { id: 9, text: '在日常生活中忘东西' },
    { id: 10, text: '在座位上玩弄手脚或不好好坐着' },
    { id: 11, text: '在教室或其它必须持续坐着的场合，会任意离开座位' },
    { id: 12, text: '在不适合的场合，乱跑或爬高爬低' },
    { id: 13, text: '很难安静地玩或参与休闲活动' },
    { id: 14, text: '总是一直在动或是像是装了个马达似的动个不停' },
    { id: 15, text: '话很多' },
    { id: 16, text: '在问题还没问完就急着回答' },
    { id: 17, text: '在游戏中或团体活动中，无法排队或者等待轮流' },
    { id: 18, text: '打断别人或干扰别人(例如:插嘴或打断别人的游戏)' },
    { id: 19, text: '发脾气' },
    { id: 20, text: '与大人争论' },
    { id: 21, text: '主动违抗或拒绝大人的要求与规定' },
    { id: 22, text: '故意地做一些事去干扰别人' },
    { id: 23, text: '经常指责别人的错误或不当行为' },
    { id: 24, text: '易怒或很容易被别人激怒' },
    { id: 25, text: '生气和(或)怨恨' },
    { id: 26, text: '怀有恶意或报复心' }
  ],
  options: [
    { value: 0, label: '无' },
    { value: 1, label: '有一点点' },
    { value: 2, label: '还算不少' },
    { value: 3, label: '非常多' }
  ],
  reverseOptions: [
    { value: 0, label: '无' },
    { value: 1, label: '有一点点' },
    { value: 2, label: '还算不少' },
    { value: 3, label: '非常多' }
  ],
  getScoreInterpretation: (score: number) => {
    // 提醒：SNAP-IV-26 满分为78分（26题 * 3分）。
    if (score >= 34) {
      return {
        level: '疑似存在明显症状',
        description: '在注意力、多动或情绪控制方面存在明显挑战，强烈建议寻求儿童精神科专业医师评估。',
        color: 'text-rose-600'
      };
    } else if (score >= 20) {
      return {
        level: '临界/轻微症状',
        description: '存在部分注意力不集中或多动表现，建议结合儿童日常表现持续观察，必要时咨询专业人士。',
        color: 'text-amber-500'
      };
    } else {
      return {
        level: '正常范围',
        description: '目前评估结果在正常范围内，未见明显的核心症状。',
        color: 'text-green-600'
      };
    }
  },
  aiPromptContext: `
当前正在填写的量表是《注意缺陷多动障碍筛查量表 (SNAP-IV-26)》。
该量表共包含26道题目，严格划分为三个临床评估维度：
- 第1~9题：评估【注意力不足】（Inattention）
- 第10~18题：评估【多动/冲动】（Hyperactivity/Impulsivity）
- 第19~26题：评估【对立违抗行为】（Oppositional Defiant）
评分标准：0=无，1=有一点点，2=还算不少，3=非常多。本量表无反向计分题。

请在解答时，严格遵守以下逻辑：
1. 识别家长描述的行为属于哪个临床维度（例如家长描述“孩子总是跑来跑去”属于多动维度）。
2. 帮助家长将日常口语化的行为程度，映射到0-3分的选项标准中（如：如果某种行为每天发生且难以打断，通常属于2分或3分）。
3. 严格禁止下达诸如“您的孩子是多动症”的确诊结论，只能陈述“该行为表现与选项【X】的描述较为吻合”。
`,
  skillContext: snapIvSkill
};
