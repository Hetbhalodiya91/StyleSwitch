import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./AddClothing.css";
import {
  Camera,
  Star,
  Lightbulb,
  Upload,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { clothService } from "../api/clothService";
import { useAuth } from "../context/AuthContext";

type PhotoType = "main" | "front" | "back" | "left" | "right";

interface Photos {
  main: File | null;
  front: File | null;
  back: File | null;
  left: File | null;
  right: File | null;
}

interface PhotoCardProps {
  type: PhotoType;
  title: string;
  description: string;
  file: File | null;
  onUpload: (type: PhotoType, file: File) => void;
  onRemove: (type: PhotoType) => void;
  large?: boolean;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  type,
  title,
  description,
  file,
  onUpload,
  onRemove,
  large = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    onUpload(type, selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <motion.div
      className={`photo-card ${large ? "large" : ""} ${file ? "has-file" : ""} ${isDragging ? "dragging" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <AnimatePresence mode="wait">
        {file ? (
          <motion.div
            key="preview"
            className="photo-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <img src={URL.createObjectURL(file)} alt={title} />
            <div className="preview-overlay">
              <span className="file-name">{file.name}</span>
              <button
                type="button"
                className="remove-btn"
                onClick={() => onRemove(type)}
              >
                ✕ Remove
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            className="photo-placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="icon-wrapper">
              {large ? (
                <Star size={34} strokeWidth={1.8} />
              ) : (
                <Camera size={28} strokeWidth={1.8} />
              )}
            </div>

            <h3>{title}</h3>
            <p>{description}</p>

            <button
              type="button"
              className="upload-btn"
              onClick={() => inputRef.current?.click()}
            >
              <Upload size={15} strokeWidth={2} />
              Upload Photo
            </button>

            <span className="drop-text">or drag & drop here</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface AddClothingProps {
  onNavigate?: (page: string) => void;
}

const AddClothing: React.FC<AddClothingProps> = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();
  const [photos, setPhotos] = useState<Photos>({
    main: null,
    front: null,
    back: null,
    left: null,
    right: null,
  });

  const [formData, setFormData] = useState({
    clothName: "",
    category: "Suit",
    brand: "",
    size: "M",
    gender: "Men",
    color: "",
    purchaseYear: "",
    pricePerDay: "",
    securityDeposit: "",
    description: "",
    condition: "Good",
    location: "",
    city: "",
    pincode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpload = (type: PhotoType, file: File) => {
    setPhotos((prev) => ({
      ...prev,
      [type]: file,
    }));
  };

  const handleRemove = (type: PhotoType) => {
    setPhotos((prev) => ({
      ...prev,
      [type]: null,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!isAuthenticated) {
      setStatusMessage({
        type: "error",
        text: "Please log in first to list your clothing.",
      });
      if (onNavigate) {
        setTimeout(() => onNavigate("login"), 1500);
      }
      return;
    }

    if (!photos.main) {
      setStatusMessage({
        type: "error",
        text: "Please upload at least the Main cover photo.",
      });
      return;
    }

    if (
      !formData.brand.trim() ||
      !formData.color.trim() ||
      !formData.pricePerDay ||
      !formData.location.trim() ||
      !formData.city.trim() ||
      !formData.pincode.trim()
    ) {
      setStatusMessage({
        type: "error",
        text: "Please fill in all required fields (Brand, Color, Price, Pickup Location, City, and Pincode).",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert uploaded photos to data URLs for storage
      const uploadedImages: string[] = [];
      for (const p of [photos.main, photos.front, photos.back, photos.left, photos.right]) {
        if (p) {
          const b64 = await fileToBase64(p);
          uploadedImages.push(b64);
        }
      }

      const payload = {
        brand: formData.brand.trim(),
        category: formData.category,
        gender: formData.gender,
        size: formData.size,
        color: formData.color.trim(),
        description: formData.description?.trim() || formData.clothName,
        purchaseDate: new Date(`${formData.purchaseYear || new Date().getFullYear()}-01-01`),
        condition: formData.condition,
        conditionDescription: `${formData.clothName} - in ${formData.condition} condition`,
        images: uploadedImages,
        rentalPricePerDay: Number(formData.pricePerDay),
        securityDeposit: Number(formData.securityDeposit || 0),
        doesBill: false,
        pickupAddress: formData.location.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode.trim(),
      };

      const response = await clothService.create(payload);

      setStatusMessage({
        type: "success",
        text: response.message || "Clothing listed successfully on StyleSwitch!",
      });

      if (onNavigate) {
        setTimeout(() => onNavigate("browse"), 1600);
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to create clothing listing",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-clothing-page">
      <div className="page-container">
        {/* HEADER */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="eyebrow">STYLE SWITCH ROTATION</span>
            <h1>Add Your Clothing</h1>
            <p>
              Share your wardrobe with our community. Upload five clear photos
              and provide accurate details for verified listings.
            </p>
          </div>
        </motion.div>

        {statusMessage && (
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "8px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: statusMessage.type === "success" ? "#064e3b" : "#7f1d1d",
              color: "#fff",
            }}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* PHOTO GUIDELINES */}
          <motion.div
            className="guidelines-card"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="guidelines-header">
              <Lightbulb size={20} />
              <h3>Photo Guidelines for Higher Rentals</h3>
            </div>
            <ul>
              <li>Shoot in natural, well-lit spaces against a plain background.</li>
              <li>Include front, back, and side angles to show true fit and drape.</li>
              <li>Clean, press, and hang your clothing before capturing photos.</li>
            </ul>
          </motion.div>

          {/* UPLOAD SECTION */}
          <section className="upload-section">
            <div className="section-heading">
              <div>
                <span className="section-number">01</span>
                <h2>Upload Photos</h2>
                <p>Provide at least the main photo to showcase your item.</p>
              </div>
            </div>

            <div className="photos-grid">
              <PhotoCard
                type="main"
                title="Main Photo (Cover)"
                description="The hero image shown across the search and catalog"
                file={photos.main}
                onUpload={handleUpload}
                onRemove={handleRemove}
                large
              />

              <div className="sub-photos-grid">
                <PhotoCard
                  type="front"
                  title="Front View"
                  description="Straight-on front angle"
                  file={photos.front}
                  onUpload={handleUpload}
                  onRemove={handleRemove}
                />
                <PhotoCard
                  type="back"
                  title="Back View"
                  description="Show the back silhouette"
                  file={photos.back}
                  onUpload={handleUpload}
                  onRemove={handleRemove}
                />
                <PhotoCard
                  type="left"
                  title="Left Profile"
                  description="Side profile details"
                  file={photos.left}
                  onUpload={handleUpload}
                  onRemove={handleRemove}
                />
                <PhotoCard
                  type="right"
                  title="Right Profile"
                  description="Opposite side angle"
                  file={photos.right}
                  onUpload={handleUpload}
                  onRemove={handleRemove}
                />
              </div>
            </div>
          </section>

          {/* BASIC INFORMATION */}
          <motion.section
            className="section-card"
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-heading">
              <div>
                <span className="section-number">02</span>
                <h2>Clothing Information</h2>
                <p>Tell renters a little more about your piece.</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group full">
                <label>
                  Listing Title <span>*</span>
                </label>
                <input
                  type="text"
                  name="clothName"
                  required
                  placeholder="e.g. Royal Blue Velvet Sherwani"
                  value={formData.clothName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Category <span>*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Sherwani">Sherwani</option>
                  <option value="Gown">Gown</option>
                  <option value="Bridal Lehenga">Bridal Lehenga</option>
                  <option value="Suit">Suit</option>
                  <option value="Tuxedo">Tuxedo</option>
                  <option value="Blazer">Blazer</option>
                  <option value="Indowestern Men">Indowestern Men</option>
                  <option value="Indowestern Women">Indowestern Women</option>
                  <option value="Designer Lehenga">Designer Lehenga</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Gender <span>*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Brand <span>*</span>
                </label>
                <input
                  type="text"
                  name="brand"
                  required
                  placeholder="e.g. Manyavar, Sabyasachi, Zara"
                  value={formData.brand}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Size <span>*</span>
                </label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="2XL">2XL</option>
                  <option value="3XL">3XL</option>
                  <option value="4XL">4XL</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Color <span>*</span>
                </label>
                <input
                  type="text"
                  name="color"
                  required
                  placeholder="e.g. Midnight Navy"
                  value={formData.color}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                >
                  <option value="New">New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
            </div>
          </motion.section>

          {/* RENTAL INFORMATION */}
          <motion.section
            className="section-card"
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-heading">
              <div>
                <span className="section-number">03</span>
                <h2>Rental Pricing & Pickup</h2>
                <p>Set your daily rental rate and location details.</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>
                  Rent Per Day <span>*</span>
                </label>
                <div className="input-with-prefix">
                  <span>₹</span>
                  <input
                    type="number"
                    name="pricePerDay"
                    required
                    placeholder="2500"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Security Deposit</label>
                <div className="input-with-prefix">
                  <span>₹</span>
                  <input
                    type="number"
                    name="securityDeposit"
                    placeholder="5000"
                    value={formData.securityDeposit}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group full">
                <label>Description</label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Describe the fabric, fit, tailoring notes, embellishments, etc."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full">
                <label>
                  Pickup Address <span>*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="Street or society address"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  City <span>*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Mumbai"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Pincode (6 digits) <span>*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  maxLength={6}
                  placeholder="400050"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </motion.section>

          {/* SUBMIT BUTTON */}
          <motion.div
            className="submit-section"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div>
              <h3>Publish to StyleSwitch</h3>
              <p>Your piece will be available for rental immediately.</p>
            </div>

            <motion.button
              type="submit"
              className="publish-btn"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? "Uploading & Publishing..." : "Publish Listing"}
              <ArrowRight size={19} strokeWidth={2} />
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default AddClothing;
