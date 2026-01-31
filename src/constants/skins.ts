import { SnakeSkin } from '../types';

export const SNAKE_SKINS: SnakeSkin[] = [
  {
    id: 'neon_green',
    name: 'Neon Green',
    price: 0,
    colors: ['#00ff88', '#004422'],
    description: 'Klasyczny neonowy zielony',
  },
  {
    id: 'neon_pink',
    name: 'Neon Pink',
    price: 300,
    colors: ['#ff0066', '#660033'],
    description: 'Różowy gradient',
  },
  {
    id: 'neon_blue',
    name: 'Neon Blue',
    price: 500,
    colors: ['#00ccff', '#003366'],
    description: 'Niebieski gradient',
  },
  {
    id: 'purple',
    name: 'Purple',
    price: 800,
    colors: ['#cc66ff', '#4400aa'],
    description: 'Fioletowy gradient',
  },
  {
    id: 'orange',
    name: 'Orange',
    price: 800,
    colors: ['#ff8800', '#663300'],
    description: 'Pomarańczowy gradient',
  },
  {
    id: 'golden',
    name: 'Golden',
    price: 1500,
    colors: ['#ffd700', '#b8860b'],
    description: 'Złoty wąż',
  },
  {
    id: 'ice',
    name: 'Ice',
    price: 2000,
    colors: ['#aaffff', '#004466'],
    description: 'Lodowy błękit',
  },
];

export const DEFAULT_SKIN_ID = 'neon_green';

export const getSkinById = (id: string): SnakeSkin | undefined => {
  return SNAKE_SKINS.find(skin => skin.id === id);
};

export const getSkinColors = (id: string): [string, string] => {
  const skin = getSkinById(id);
  return skin ? skin.colors : SNAKE_SKINS[0].colors;
};
