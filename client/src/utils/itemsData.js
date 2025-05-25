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
    }
  };

  return recipes[itemName] || {
    gridSlots: Array(9).fill(null),
    resultSlot: null,
  };
}; 