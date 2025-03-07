import React from "react";
import { motion } from "framer-motion";
import "./Aboutus.module.css";

const AboutUs = () => {
  return (
    <div className="about-container">
      {/* Background Overlay */}
      <div className="background-overlay"></div>

      {/* Content */}
      <div className="about-content">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="about-title"
        >
          About Us
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="about-text"
        >
          We are committed to providing high-quality services with a dedicated team of experts.
        </motion.p>

        {/* Image Section */}
        <motion.div
          className="about-image"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <img src={teamImage} alt="Our Team" />
        </motion.div>

        {/* Highlights */}
        <motion.div
          className="about-highlights"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="highlight">
            <h3>10+</h3>
            <p>Years of Experience</p>
          </div>
          <div className="highlight">
            <h3>50+</h3>
            <p>Expert Team Members</p>
          </div>
          <div className="highlight">
            <h3>100+</h3>
            <p>Successful Projects</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;
