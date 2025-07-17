export const AvailableSizes = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
    '28', '30', '32', '34', '36', '38', '40', '42', '44',
    '4', '6', '8', '10', '12', '14', '16', '18', '20',
    'One Size', 'Free Size', 'Custom'
];

export interface AvailableColor {
    name: string;
    code: string;
}

export const AvailableColors: AvailableColor[] = [
    // Basic Colors
    { name: 'Black', code: '#000000' },
    { name: 'White', code: '#FFFFFF' },
    { name: 'Gray', code: '#808080' },
    { name: 'Navy', code: '#001F54' },
    { name: 'Red', code: '#FF0000' },
    { name: 'Blue', code: '#0000FF' },
    { name: 'Green', code: '#008000' },
    { name: 'Yellow', code: '#FFFF00' },
    { name: 'Brown', code: '#8B4513' },
    { name: 'Beige', code: '#F5F5DC' },

    // Pastel Colors
    { name: 'Baby Pink', code: '#F4C2C2' },
    { name: 'Powder Blue', code: '#B0E0E6' },
    { name: 'Lavender', code: '#E6E6FA' },
    { name: 'Mint Green', code: '#98FF98' },
    { name: 'Peach', code: '#FFDAB9' },
    { name: 'Sky Blue', code: '#87CEEB' },
    { name: 'Lilac', code: '#C8A2C8' },
    { name: 'Blush', code: '#FEC5E5' },

    // Bright / Vibrant Colors
    { name: 'Fuchsia', code: '#FF00FF' },
    { name: 'Lime Green', code: '#32CD32' },
    { name: 'Neon Yellow', code: '#FFFF33' },
    { name: 'Turquoise', code: '#40E0D0' },
    { name: 'Coral', code: '#FF7F50' },
    { name: 'Hot Pink', code: '#FF69B4' },
    { name: 'Cobalt Blue', code: '#0047AB' },
    { name: 'Orange', code: '#FFA500' },

    // Earth Tones
    { name: 'Olive', code: '#808000' },
    { name: 'Khaki', code: '#F0E68C' },
    { name: 'Rust', code: '#B7410E' },
    { name: 'Mustard', code: '#FFDB58' },
    { name: 'Terracotta', code: '#E2725B' },
    { name: 'Camel', code: '#C19A6B' },
    { name: 'Taupe', code: '#483C32' },
    { name: 'Forest Green', code: '#228B22' },

    // Muted / Neutral Tones
    { name: 'Charcoal', code: '#36454F' },
    { name: 'Stone', code: '#D2B48C' },
    { name: 'Sand', code: '#C2B280' },
    { name: 'Ash', code: '#B2BEB5' },
    { name: 'Mocha', code: '#967969' },
    { name: 'Sage', code: '#B2AC88' },
    { name: 'Dusty Rose', code: '#C08081' },

    // Metallics
    { name: 'Gold', code: '#FFD700' },
    { name: 'Silver', code: '#C0C0C0' },
    { name: 'Bronze', code: '#CD7F32' },
    { name: 'Rose Gold', code: '#B76E79' },
    { name: 'Metallic Blue', code: '#32527B' },

    // Optionals
    { name: 'Multicolor', code: '' },
    { name: 'Custom', code: '' }
];