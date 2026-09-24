import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./AddClothing.css";
import {
  Camera,
  Star,
  Lightbulb,
  Upload,
  ArrowRight,
} from "lucide-react";

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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <motion.div
      className={`photo-card ${large ? "photo-card-main" : ""} ${
        isDragging ? "dragging" : ""
      } ${file ? "has-image" : ""}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35 }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <AnimatePresence mode="wait">
        {file ? (
          <motion.div
            className="uploaded-photo"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <img src={URL.createObjectURL(file)} alt={title} />

            <div className="photo-overlay">
              <div className="uploaded-badge">Uploaded</div>

              <div className="photo-actions">
                <button type="button" onClick={() => inputRef.current?.click()}>
                  Replace
                </button>

                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => onRemove(type)}
                >
                  Remove
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="upload-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="photo-icon">
              {type === "main" ? (
                <Star size={28} strokeWidth={1.8} />
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

const AddClothing: React.FC = () => {
  const [photos, setPhotos] = useState<Photos>({
    main: null,
    front: null,
    back: null,
    left: null,
    right: null,
  });

  const [formData, setFormData] = useState({
    clothName: "",
    category: "",
    brand: "",
    size: "",
    color: "",
    purchaseYear: "",
    pricePerDay: "",
    securityDeposit: "",
    description: "",
    location: "",
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!photos.main) {
      alert("Please upload the main photo.");
      return;
    }

    if (!photos.front) {
      alert("Please upload the front photo.");
      return;
    }

    if (!photos.back) {
      alert("Please upload the back photo.");
      return;
    }

    if (!photos.left) {
      alert("Please upload the left side photo.");
      return;
    }

    if (!photos.right) {
      alert("Please upload the right side photo.");
      return;
    }

    console.log("Photos:", photos);
    console.log("Form Data:", formData);

    alert("Clothing listing created successfully!");
  };

  return (
    <div className="add-clothing-page">
      {/* 
        Your existing Navbar can remain above this component.
      */}

      <div className="page-container">
        {/* HEADER */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="eyebrow">RENTA MARKETPLACE</span>

            <h1>Add Your Clothing</h1>

            <p>
              Give your clothing a great presentation. Upload clear photos from
              every angle so renters know exactly what they are getting.
            </p>
          </div>

          <div className="step-indicator">
            <span className="step-number">01</span>
            <span>Listing Details</span>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* PHOTO SECTION */}
          <motion.section
            className="section-card photos-section"
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <div className="section-heading">
              <div>
                <span className="section-number">01</span>

                <h2>Clothing Photos</h2>

                <p>Show renters your clothing from every angle.</p>
              </div>

              <div className="photo-count">
                {Object.values(photos).filter(Boolean).length}/5 uploaded
              </div>
            </div>

            {/* MAIN PHOTO */}
            <div className="main-photo-wrapper">
              <div className="photo-label-row">
                <div>
                  <h3>
                    Main Photo <span>*</span>
                  </h3>

                  <p>
                    This photo will be shown first on your clothing listing.
                  </p>
                </div>

                <span className="recommended-tag">Recommended</span>
              </div>

              <PhotoCard
                type="main"
                title="Main Photo"
                description="Choose your best-looking photo"
                file={photos.main}
                onUpload={handleUpload}
                onRemove={handleRemove}
                large
              />
            </div>

            {/* PHOTO GUIDE */}
            <div className="photo-guide">
              <div className="guide-icon">
                <Lightbulb size={20} strokeWidth={1.8} />
              </div>

              <div>
                <strong>How to take the photos</strong>

                <p>
                  Keep the clothing straight, use good lighting and make sure
                  the entire clothing item is visible.
                </p>
              </div>
            </div>

            {/* FOUR ANGLE PHOTOS */}
            <div className="angle-heading">
              <div>
                <h3>Additional Photos</h3>
                <p>
                  Upload these four views to help renters understand the item.
                </p>
              </div>

              <span>4 photos required</span>
            </div>

            <div className="angle-grid">
              <PhotoCard
                type="front"
                title="Front Photo"
                description="Show the front"
                file={photos.front}
                onUpload={handleUpload}
                onRemove={handleRemove}
              />

              <PhotoCard
                type="back"
                title="Back Photo"
                description="Show the back"
                file={photos.back}
                onUpload={handleUpload}
                onRemove={handleRemove}
              />

              <PhotoCard
                type="left"
                title="Left Side"
                description="Show the left side"
                file={photos.left}
                onUpload={handleUpload}
                onRemove={handleRemove}
              />

              <PhotoCard
                type="right"
                title="Right Side"
                description="Show the right side"
                file={photos.right}
                onUpload={handleUpload}
                onRemove={handleRemove}
              />
            </div>
          </motion.section>

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

                <p>Tell renters a little more about your clothing.</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group full">
                <label>
                  Clothing Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="clothName"
                  placeholder="e.g. Royal Blue Sherwani"
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
                  <option value="">Select category</option>
                  <option value="sherwani">Sherwani</option>
                  <option value="lehenga">Lehenga</option>
                  <option value="gown">Gown</option>
                  <option value="suit">Suit</option>
                  <option value="tuxedo">Tuxedo</option>
                  <option value="kurta">Kurta</option>
                  <option value="saree">Saree</option>
                  <option value="dress">Dress</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Brand</label>

                <input
                  type="text"
                  name="brand"
                  placeholder="e.g. Manyavar"
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
                  <option value="">Select size</option>
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
                <label>Color</label>

                <input
                  type="text"
                  name="color"
                  placeholder="e.g. Navy Blue"
                  value={formData.color}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Purchase Year</label>

                <input
                  type="number"
                  name="purchaseYear"
                  placeholder="2025"
                  value={formData.purchaseYear}
                  onChange={handleChange}
                />
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

                <h2>Rental Information</h2>

                <p>Set your rental price and security deposit.</p>
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
                    placeholder="500"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Security Deposit <span>*</span>
                </label>

                <div className="input-with-prefix">
                  <span>₹</span>

                  <input
                    type="number"
                    name="securityDeposit"
                    placeholder="2000"
                    value={formData.securityDeposit}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group full">
                <label>
                  Description <span>*</span>
                </label>

                <textarea
                  name="description"
                  rows={5}
                  placeholder="Describe the clothing, material, condition, fitting, special details, etc."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full">
                <label>
                  Pickup Location <span>*</span>
                </label>

                <input
                  type="text"
                  name="location"
                  placeholder="Enter pickup location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>
          </motion.section>

          {/* SUBMIT */}
          <motion.div
            className="submit-section"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div>
              <h3>Ready to list your clothing?</h3>

              <p>Make sure all five photos are uploaded before publishing.</p>
            </div>

            <motion.button
              type="submit"
              className="publish-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Publish Listing
              <ArrowRight size={19} strokeWidth={2} />
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default AddClothing;
