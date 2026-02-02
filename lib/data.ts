import { Product } from "./types";

export const categories = [
    {
        id: "sarees",
        name: "Sarees",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX_c0wIqK86x8-kHxe0YflK_VlbtZa4xHIhg&s",
        slug: "sarees",
    },
    {
        id: "kurtis",
        name: "Kurtis",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJhgg85rktLLM0HuL5LrkObqIDKUT42918FA&s",
        slug: "kurtis",
    },
    {
        id: "lehengas",
        name: "Lehengas",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjY2K5RL0zNPQpxVQG5MFCS6pFLFB8OQ24sA&s",
        slug: "lehengas",
    },
    {
        id: "dresses",
        name: "Dresses",
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop",
        slug: "dresses",
    },

    {
        id: "apparel",
        name: "Apparel",
        image: "https://images.unsplash.com/photo-1551488852-d81a4d5b6d61?q=80&w=800&auto=format&fit=crop",
        slug: "apparel",
    },
    {
        id: "jhumkas",
        name: "Jhumkas",
        image: "https://images.unsplash.com/photo-1629224316810-9d8805b95076?q=80&w=800&auto=format&fit=crop",
        slug: "jhumkas",
    },
    {
        id: "women-apparel",
        name: "Women Apparel",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop",
        slug: "women-apparel",
    },
];

export const products: Product[] = [
    {
        id: "1",
        name: "Royal Banarasi Silk Saree",
        description: "Handwoven Banarasi silk saree in deep maroon with intricate gold zari work. Perfect for weddings and festive occasions.",
        price: 12999,
        sale_price: 18999,
        currency: "INR",
        category_id: "sarees",
        slug: "royal-banarasi-silk-saree",
        thumbnail_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
        is_active: true,
        is_featured: true,
        stock: 10,
    },
    {
        id: "2",
        name: "Floral Georgette Anarkali",
        description: "Lightweight georgette Anarkali suit with hand-painted floral motifs and a matching dupatta.",
        price: 4599,
        sale_price: 5999,
        currency: "INR",
        category_id: "kurtis",
        slug: "floral-georgette-anarkali",
        thumbnail_url: "https://images.unsplash.com/photo-1596783074918-c84cb06c9ca8?q=80&w=800&auto=format&fit=crop",
        is_active: true,
        is_featured: false,
        stock: 15,
    },
];
