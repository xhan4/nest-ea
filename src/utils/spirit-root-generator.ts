import { GenderEnum } from "src/core/enums/gender.enum";

// 类型定义
const ROOT_TYPES = {
  NORMAL: ['METAL', 'WOOD', 'WATER', 'FIRE', 'EARTH'],
  VARIANT: ['ICE', 'WIND', 'THUNDER', 'DARK']
};

// 固定纯度值
const PURITY_VALUES = {
  VARIANT: [120],
  SINGLE: [120], 
  DOUBLE: [80, 80], 
  TRIPLE: [60, 60, 60],
  QUADRUPLE: [40, 40, 40, 40],
  QUINTUPLE: [20, 20, 20, 20, 20] 
};

// 修改返回类型定义
interface SpiritRootResult {
  roots: string[];
  purities: Record<string, number>;
  gender: GenderEnum;
  comprehension: number;     
}

export function generateSpiritRoot(): SpiritRootResult {
  // 随机性别 (50%概率)
  const gender = Math.random() < 0.5 ? GenderEnum.MALE : GenderEnum.FEMALE;
  
  // 基础悟性 (1-100)
  let comprehension = Math.floor(Math.random() * 100) + 1;

  if (Math.random() < 0.02) {
    const type = ROOT_TYPES.VARIANT[Math.floor(Math.random() * ROOT_TYPES.VARIANT.length)];
    // 异灵根保底悟性60
    comprehension = Math.max(comprehension, 60);
    return {
      roots: [type],
      purities: { [type]: PURITY_VALUES.VARIANT[0] },
      gender,
      comprehension
    };
  }

  //（1-5种，种类越少概率越低）
  const rootCount = weightedRandom([
    { value: 1, weight: 0.04 },  
    { value: 2, weight: 0.1 },  
    { value: 3, weight: 0.2 },  
    { value: 4, weight: 0.3 }, 
    { value: 5, weight: 0.36 }
  ]);

  // 使用Fisher-Yates洗牌算法获得更均匀的随机分布
  const shuffledRoots = [...ROOT_TYPES.NORMAL];
  for (let i = shuffledRoots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledRoots[i], shuffledRoots[j]] = [shuffledRoots[j], shuffledRoots[i]];
  }
  const selectedRoots = shuffledRoots.slice(0, rootCount);

  // 分配固定纯度
  const purities = {};
  const purityArray = 
    rootCount === 1 ? PURITY_VALUES.SINGLE :
    rootCount === 2 ? PURITY_VALUES.DOUBLE :
    rootCount === 3 ? PURITY_VALUES.TRIPLE :
    rootCount === 4 ? PURITY_VALUES.QUADRUPLE : 
    PURITY_VALUES.QUINTUPLE;

  selectedRoots.forEach((root, index) => {
    purities[root] = Array.isArray(purityArray) ? purityArray[index] : purityArray;
  });

  // 单灵根保底悟性50
  if (rootCount === 1) {
    comprehension = Math.max(comprehension, 50);
  }

  return {
    roots: selectedRoots,
    purities,
    gender,
    comprehension
  };
}

// 加权随机函数
function weightedRandom(options: {value: number, weight: number}[]) {
  const total = options.reduce((sum, opt) => sum + opt.weight, 0);
  let random = Math.random() * total;
  for (const opt of options) {
    if (random < opt.weight) return opt.value;
    random -= opt.weight;
  }
  return options[options.length - 1].value;
}
