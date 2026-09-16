import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaYoutube,
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Tutors', href: '/search' },
      { label: 'Students', href: '#' },
    ],
    company: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Press', href: '#' },
    ],
    support: [
      { label: 'Help Center', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
    social: [
      { icon: FaTwitter, label: 'Twitter', href: '#' },
      { icon: FaLinkedin, label: 'LinkedIn', href: '#' },
      { icon: FaGithub, label: 'GitHub', href: '#' },
      { icon: FaYoutube, label: 'YouTube', href: '#' },
    ],
  };

  return (
    <>
    <p>fuck</p>
    </>
  );
};

export default Footer;