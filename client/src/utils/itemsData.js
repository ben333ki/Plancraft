export const getRecipeByName = (itemName) => {
  const recipes = {
    'Iron Pickaxe': {
      gridSlots: [
        { name: 'Iron', image: 'iron.png' },
        { name: 'Iron', image: 'iron.png' },
        { name: 'Iron', image: 'iron.png' },
        null,
        { name: 'Stick', image: 'Stick.webp' },
        null,
        null,
        { name: 'Stick', image: 'Stick.webp' },
        null
      ],
      resultSlot: { name: 'Iron Pickaxe', image: 'Iron_Pickaxe.webp' },
      levelRequirements: {
        level3: [
          { name: 'Stick', image: 'Stick.webp', amount: 2 },
          { name: 'Iron', image: 'iron.png', amount: 3 }
        ],
        level2: [
          { name: 'Oak Planks', image: 'Oak_Planks.webp', amount: 2 }
        ],
        level1: [
          { name: 'Oak', image: 'Oak.webp', amount: 1 }
        ]
      }
    },
    'Oak Planks': {
      gridSlots: [
        null,
        null,
        null,
        null,
        { name: 'Oak', image: 'Oak.webp' },
        null,
        null,
        null,
        null
      ],
      resultSlot: { name: 'Oak Planks', image: 'Oak_Planks.webp' },
      levelRequirements: {
        level3: [],
        level2: [],
        level1: [
          { name: 'Oak', image: 'Oak.webp', amount: 1 }
        ]
      }
    },
    'Iron Axe': {
      gridSlots: [
        { name: 'Iron', image: 'iron.png' },
        { name: 'Iron', image: 'iron.png' },
        null,
        { name: 'Iron', image: 'iron.png' },
        { name: 'Stick', image: 'Stick.webp' },
        null,
        null,
        { name: 'Stick', image: 'Stick.webp' },
        null
      ],
      resultSlot: { name: 'Iron Axe', image: 'Iron_axe.webp' },
      levelRequirements: {
        level3: [
          { name: 'Stick', image: 'Stick.webp', amount: 2 },
          { name: 'Iron', image: 'iron.png', amount: 3 }
        ],
        level2: [
          { name: 'Oak Planks', image: 'Oak_Planks.webp', amount: 2 }
        ],
        level1: [
          { name: 'Oak', image: 'Oak.webp', amount: 1 }
        ]
      }
    },
    'Crafting Table': {
      gridSlots: [
        null,
        null,
        null,
        null,
        { name: 'Oak Planks', image: 'Oak_Planks.webp' },
        { name: 'Oak Planks', image: 'Oak_Planks.webp' },
        null,
        { name: 'Oak Planks', image: 'Oak_Planks.webp' },
        { name: 'Oak Planks', image: 'Oak_Planks.webp' }
      ],
      resultSlot: { name: 'Crafting Table', image: 'Crafting_Table.webp' },
      levelRequirements: {
        level3: [],
        level2: [
          { name: 'Oak Planks', image: 'Oak_Planks.webp', amount: 4 }
        ],
        level1: [
          { name: 'Oak', image: 'Oak.webp', amount: 1 }
        ]
      }
    }
  };

  return recipes[itemName] || {
    gridSlots: Array(9).fill(null),
    resultSlot: null,
    levelRequirements: { level3: [], level2: [], level1: [] }
  };
}; 