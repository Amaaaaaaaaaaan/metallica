import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils';
import { ToastContainer } from 'react-toastify';
import styles from '../styles/home.module.css';
import { motion } from 'framer-motion';
import { 
  FaDrum, FaMousePointer, FaTshirt, FaPalette, FaRulerCombined, FaRobot, 
  FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaCheckCircle 
} from 'react-icons/fa';
import Sidenav from '../components/sidenav';

const Home = () => {
  const wrapperRef = useRef(null);
  const [scrollYProgress, setScrollYProgress] = useState(0);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (wrapperRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = wrapperRef.current;
        setScrollYProgress(scrollTop / (scrollHeight - clientHeight));
      }
    };
    
    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (wrapper) {
        wrapper.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    const user = localStorage.getItem('loggedInUser');
    if (!user) {
      navigate('/signup');
    } else {
      setLoggedInUser(user);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    handleSuccess('User Logged out');
    setTimeout(() => navigate('/login'), 1000);
  };

  if (loggedInUser === null) {
    return <p>Loading...</p>;
  }

  const reviews = [
    { initials: 'JD', name: 'Jon Doe', review: 'Designing custom clothes has never been easier!' },
    { initials: 'MS', name: 'Mark Smith', review: 'The customizer is so easy to use. I love it!' },
    { initials: 'JA', name: 'Jane Doe', review: 'Customizing clothes has never been more fun and easy!' }
  ];

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <motion.div
        id="scroll-indicator"
        style={{
          scaleX: scrollYProgress,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          transformOrigin: "0%",
          backgroundColor: "#008080",
          zIndex: 1000,
        }}
      />
      <Sidenav />
      <div className={styles.container}>
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.header}><FaDrum fontSize={50} /> METALLICA</h1>
            <p>Revolutionizing the way you experience technology.</p>
          </div>
        </header>

        <section id="features" className={styles.features}>
          <h2>How It Works</h2>
          <p>Metallica: A virtual instrument hub where you can play, record, and save custom audio—unlocking endless musical possibilities.</p>
          <div className={styles.featureCards}>
            {[ 
              { icon: FaTshirt, title: "Choose Your Style", desc: "Pick from various styles to start your customization process." },
              { icon: FaPalette, title: "Pick Your Colors", desc: "Choose your favorite colors for each part of your outfit." },
              { icon: FaRulerCombined, title: "Select Your Size", desc: "Pick your desired size that suits your comfort and style." },
              { icon: FaRobot, title: "Leverage AI", desc: "Use AI to generate ideas or create your own sounds." },
              { icon: FaMousePointer, title: "User-Friendly Interface", desc: "Enjoy a seamless and intuitive interface." },
              { icon: FaCheckCircle, title: "Review Your Playlist", desc: "Take a final look at your custom creation." }
            ].map(({ icon: Icon, title, desc }, index) => (
              <div key={index} className={styles.featureCard}>
                <Icon className={styles.featureCardIcon} />
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className={styles.about}>
          <h2>About Our Project</h2>
          <p>Our project merges art and technology to provide a unique, immersive user experience with modern design principles.</p>
        </section>

        <section id="contact" className={styles.contact}>
          <h2>Contact Us</h2>
          <p>Have questions or want to collaborate? Reach out now!</p>
          <button className={styles.ctaButton}>Contact</button>
        </section>

        <section className={styles.reviewsSection}>
          <h2>Customer Reviews</h2>
          <p>Hear from our satisfied customers.</p>
          <div className={styles.reviewCards}>
            {reviews.map(({ initials, name, review }, index) => (
              <div key={index} className={styles.reviewCard}>
                <div className={styles.avatar}><span>{initials}</span></div>
                <h3>{name}</h3>
                <p className={styles.reviewText}>{review}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerContainer}>
            <p>© 2023 SnX. All rights reserved.</p>
            <div className={styles.footerIcons}>
              {[
                { icon: FaEnvelope, href: 'mailto:metallica@gmail.com', label: 'Email' },
                { icon: FaPhone, href: 'tel:+91 9876543210', label: 'Phone' },
                { icon: FaLinkedin, href: 'https://www.linkedin.com/company/metallica', label: 'LinkedIn' },
                { icon: FaGithub, href: 'https://github.com/metallica', label: 'GitHub' }
              ].map(({ icon: Icon, href, label }, index) => (
                <a key={index} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Home;
