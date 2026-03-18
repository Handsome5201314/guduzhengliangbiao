import { ScaleDefinition } from './types';
import { simpleSocialSkill } from '../skills';

export const simpleSocialScale: ScaleDefinition = {
  id: 'simple-social',
  name: '简易社交观察量表',
  shortName: '简易社交',
  description: '用于初步观察儿童在日常生活中的社交互动、沟通能力及刻板行为表现。',
  questions: [
    { id: 1, text: '当您叫孩子的名字时，他/她通常会转头看您吗？' },
    { id: 2, text: '孩子会用手指指着他/她想要的东西吗？' },
    { id: 3, text: '孩子会和您有眼神交流吗（例如在玩耍或喂食时）？' },
    { id: 4, text: '孩子会模仿您的动作吗（例如挥手说再见、拍手）？' },
    { id: 5, text: '孩子会对其他儿童表现出兴趣吗（例如看着他们、试图靠近）？' },
    { id: 6, text: '孩子会把东西拿给您看，仅仅是为了分享兴趣吗？' },
    { id: 7, text: '孩子会对您的情绪做出反应吗（例如您笑时他/她也笑，您哭时他/她显得不安）？' },
    { id: 8, text: '孩子有重复性的动作吗（例如反复转圈、摇晃身体、拍手）？', reverse: true },
    { id: 9, text: '孩子对某些特定的声音、光线或触觉会表现出异常的敏感或不敏感吗？', reverse: true },
    { id: 10, text: '孩子在玩玩具时，方式是否比较单一（例如总是把玩具排成一排，或者只盯着玩具的某个部分看）？', reverse: true }
  ],
  options: [
    { value: 0, label: '从不' },
    { value: 1, label: '偶尔' },
    { value: 2, label: '经常' },
    { value: 3, label: '总是' }
  ],
  reverseOptions: [
    { value: 3, label: '从不' },
    { value: 2, label: '偶尔' },
    { value: 1, label: '经常' },
    { value: 0, label: '总是' }
  ],
  getScoreInterpretation: (score: number) => {
    if (score > 20) {
      return {
        level: '高风险',
        description: '孩子在社交互动和行为模式上表现出较多异常。强烈建议尽快寻求专业发育行为儿科医生的全面评估和诊断。',
        color: 'text-rose-600'
      };
    } else if (score > 10) {
      return {
        level: '中等风险',
        description: '孩子在某些社交互动方面可能存在轻微延迟或异常。建议密切关注，必要时可咨询专业儿科医生进行进一步评估。',
        color: 'text-amber-500'
      };
    } else {
      return {
        level: '低风险',
        description: '孩子在社交互动方面表现较好，未见明显异常。建议继续观察并保持良好的亲子互动。',
        color: 'text-green-600'
      };
    }
  },
  aiPromptContext: `
当前正在填写的量表是《简易社交观察量表》。
该量表主要用于初步观察儿童在日常生活中的社交互动、沟通能力及刻板行为表现。
评分标准：0=从不，1=偶尔，2=经常，3=总是。
对于正向社交行为（题1-7），选“从不”得分高，表示风险高。
对于负向刻板行为（题8-10），选“总是”得分高，表示风险高。
请在解答时，结合题目的正负向性质进行解释。
`,
  skillContext: simpleSocialSkill
};
