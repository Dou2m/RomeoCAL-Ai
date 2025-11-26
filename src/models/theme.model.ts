export interface ColorTheme {
    key: string;
    name: string;
    calories: string;
    protein: string;
    carbohydrates: string;
    fat: string;
    sugar: string;
}

export const COLOR_THEMES: ColorTheme[] = [
    {
        key: 'sky',
        name: 'Default Sky',
        calories: '#38bdf8', // sky-400
        protein: '#f0abfc', // fuchsia-300
        carbohydrates: '#a3e635', // lime-400
        fat: '#facc15', // amber-400
        sugar: '#f87171' // red-400
    },
    {
        key: 'sunset',
        name: 'Sunset',
        calories: '#fb923c', // orange-400
        protein: '#f472b6', // pink-400
        carbohydrates: '#c084fc', // purple-400
        fat: '#fbbf24', // amber-400
        sugar: '#ef4444' // red-500
    },
    {
        key: 'forest',
        name: 'Forest',
        calories: '#4ade80', // green-400
        protein: '#34d399', // emerald-400
        carbohydrates: '#2dd4bf', // teal-400
        fat: '#a3e635', // lime-400
        sugar: '#f59e0b' // amber-500
    },
    {
        key: 'neon',
        name: 'Neon',
        calories: '#a78bfa', // violet-400
        protein: '#ec4899', // pink-500
        carbohydrates: '#22d3ee', // cyan-400
        fat: '#eab308', // yellow-500
        sugar: '#ef4444' // red-500
    }
];