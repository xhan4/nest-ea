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
  name:string
  spiritRoots: string[];
  purities: Record<string, number>;
  gender: GenderEnum;
  comprehension: number;     
}

export function generateMember(): SpiritRootResult {
  // 随机性别 (50%概率)
  const gender = Math.random() < 0.5 ? GenderEnum.MALE : GenderEnum.FEMALE;
  
  // 基础(1-100)
  let comprehension = Math.floor(Math.random() * 100) + 1;

  if (Math.random() < 0.02) {
    const type = ROOT_TYPES.VARIANT[Math.floor(Math.random() * ROOT_TYPES.VARIANT.length)];
    // 保底60
    comprehension = Math.max(comprehension, 60);
    return {
      name:generateName(gender),
      spiritRoots: [type],
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
  }else{
    comprehension = Math.max(comprehension, 10);
  }

  return {
    name:generateName(gender),
    spiritRoots: selectedRoots,
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


// 新增随机姓名生成方法
function generateName(gender: GenderEnum): string {
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const namePool = gender === GenderEnum.MALE ? MALE_NAMES : FEMALE_NAMES;
  const givenName = namePool[Math.floor(Math.random() * namePool.length)];
  
  // 50%概率单字名，50%概率双字名
  return Math.random() > 0.5 
    ? `${surname}${givenName}` 
    : `${surname}${givenName}${namePool[Math.floor(Math.random() * namePool.length)]}`;
}

const SURNAMES = [
  '赵', '钱', '孙', '李', '周', '吴', '郑', '王', 
  '冯', '陈', '褚', '卫', '蒋', '沈', '韩', '杨'
];

const MALE_NAMES = [
  '天', '宇', '浩', '杰', '俊', '明', '强', '伟',
  '飞', '磊', '超', '勇', '军', '波', '涛', '龙'
];

const FEMALE_NAMES = [
  '芳', '娜', '敏', '静', '秀', '娟', '英', '华',
  '慧', '巧', '美', '玉', '兰', '萍', '红', '玲'
];