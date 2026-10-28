import mongoose from "mongoose";
import "./config/loadEnv.js";
import bcrypt from "bcrypt";
import User from "./model/User.model.js";
import Cloth from "./model/Cloth.model.js";

const sampleClothes = [
  {
    brand: "Manyavar",
    category: "Sherwani",
    gender: "Men",
    size: "L",
    color: "Ivory Gold",
    description: "Royal Silk Embroidered Sherwani with regal zari motifs and matching stole.",
    purchaseYear: new Date("2024-01-01"),
    condition: "Excellent",
    conditionDescription: "Worn once for a family reception. Fully dry-cleaned.",
    rentalPricePerDay: 3200,
    securityDeposit: 6000,
    doesBill: false,
    pickupAddress: "402 Oberoi Crest, Link Road",
    city: "Mumbai",
    pincode: "400053",
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    brand: "Sabyasachi",
    category: "Bridal Lehenga",
    gender: "Women",
    size: "M",
    color: "Crimson Red",
    description: "Handcrafted Heritage Velvet Lehenga with intricate zardozi craftsmanship.",
    purchaseYear: new Date("2023-11-01"),
    condition: "New",
    conditionDescription: "Pristine designer bridal wear, stored in a breathable garment bag.",
    rentalPricePerDay: 7500,
    securityDeposit: 15000,
    doesBill: false,
    pickupAddress: "12 Defense Colony",
    city: "Delhi",
    pincode: "110024",
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    brand: "Raymond Luxury",
    category: "Tuxedo",
    gender: "Men",
    size: "M",
    color: "Midnight Black",
    description: "Peak-lapel Italian wool evening tuxedo tailored for galas and black-tie events.",
    purchaseYear: new Date("2024-03-01"),
    condition: "Excellent",
    conditionDescription: "Immaculate condition with satin trim lapels.",
    rentalPricePerDay: 2800,
    securityDeposit: 5000,
    doesBill: false,
    pickupAddress: "Indiranagar 100ft Road",
    city: "Bangalore",
    pincode: "560038",
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    brand: "Manish Malhotra",
    category: "Gown",
    gender: "Women",
    size: "S",
    color: "Emerald Green",
    description: "Sequined floor-length cocktail evening gown with trailing cape.",
    purchaseYear: new Date("2024-05-01"),
    condition: "Excellent",
    conditionDescription: "Sparkles flawlessly in evening light. Steamed and ready to wear.",
    rentalPricePerDay: 4200,
    securityDeposit: 8000,
    doesBill: false,
    pickupAddress: "Road No 36, Jubilee Hills",
    city: "Hyderabad",
    pincode: "500033",
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    brand: "Zara Man",
    category: "Blazer",
    gender: "Men",
    size: "XL",
    color: "Camel Beige",
    description: "Structured double-breasted linen blazer for smart-casual events and brunches.",
    purchaseYear: new Date("2024-06-01"),
    condition: "Good",
    conditionDescription: "Comfortable breathable fit, lightly worn.",
    rentalPricePerDay: 1400,
    securityDeposit: 3000,
    doesBill: false,
    pickupAddress: "Viman Nagar",
    city: "Pune",
    pincode: "411014",
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    brand: "Anita Dongre",
    category: "Designer Lehenga",
    gender: "Women",
    size: "L",
    color: "Pastel Pink",
    description: "Silk gotapatti lehenga choli with lightweight organza dupatta.",
    purchaseYear: new Date("2024-02-01"),
    condition: "New",
    conditionDescription: "Like new, vibrant summer festive wear.",
    rentalPricePerDay: 4800,
    securityDeposit: 9000,
    doesBill: false,
    pickupAddress: "Sindhu Bhavan Road, Bodakdev",
    city: "Ahmedabad",
    pincode: "380054",
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB for seeding...");

    // Find or create a default demo lender
    let lender = await User.findOne({ email: "lender.demo@styleswitch.com" });
    if (!lender) {
      const hashedPassword = await bcrypt.hash("StyleSwitch@123", 10);
      lender = await User.create({
        name: "Aarav Sharma",
        email: "lender.demo@styleswitch.com",
        password: hashedPassword,
        number: "9876543210",
        role: "lender",
        address: "Mumbai, India",
      });
      console.log("Created demo lender user: lender.demo@styleswitch.com");
    }

    // Find or create a default demo admin
    let admin = await User.findOne({ email: "admin.demo@styleswitch.com" });
    if (!admin) {
      const hashedAdminPassword = await bcrypt.hash("AdminSwitch@123", 10);
      admin = await User.create({
        name: "Atelier Administrator",
        email: "admin.demo@styleswitch.com",
        password: hashedAdminPassword,
        number: "9876500000",
        role: "admin",
        address: "StyleSwitch HQ, Mumbai",
      });
      console.log("Created demo admin user: admin.demo@styleswitch.com");
    } else if (admin.role !== "admin") {
      admin.role = "admin";
      await admin.save();
      console.log("Updated admin user role to admin: admin.demo@styleswitch.com");
    }

    // Add lenderId to each cloth
    const clothesWithLender = sampleClothes.map((item) => ({
      ...item,
      lenderId: lender._id,
    }));

    // Insert clothes if they don't already exist
    for (const cloth of clothesWithLender) {
      const exists = await Cloth.findOne({
        brand: cloth.brand,
        category: cloth.category,
        color: cloth.color,
      });
      if (!exists) {
        await Cloth.create(cloth);
        console.log(`Added listing: ${cloth.brand} ${cloth.category}`);
      } else {
        console.log(`Already exists: ${cloth.brand} ${cloth.category}`);
      }
    }

    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

seed();
