import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin)

// Fade in animation
export const fadeIn = (element, duration = 1, delay = 0) => {
  return gsap.from(element, {
    opacity: 0,
    duration,
    delay,
    ease: "power2.out"
  })
}

// Slide up animation
export const slideUp = (element, duration = 0.8, delay = 0, distance = 50) => {
  return gsap.from(element, {
    y: distance,
    opacity: 0,
    duration,
    delay,
    ease: "power3.out"
  })
}

// Scale animation
export const scaleIn = (element, duration = 0.6, delay = 0) => {
  return gsap.from(element, {
    scale: 0,
    opacity: 0,
    duration,
    delay,
    ease: "back.out(1.7)"
  })
}

// Stagger animation for multiple elements
export const staggerReveal = (elements, duration = 0.8, stagger = 0.1) => {
  return gsap.from(elements, {
    y: 30,
    opacity: 0,
    duration,
    stagger,
    ease: "power2.out"
  })
}

// Text typing animation
export const typeText = (element, text, duration = 2) => {
  return gsap.to(element, {
    text: text,
    duration,
    ease: "none"
  })
}

// Bounce animation
export const bounceIn = (element, duration = 1, delay = 0) => {
  return gsap.from(element, {
    scale: 0,
    opacity: 0,
    duration,
    delay,
    ease: "elastic.out(1, 0.5)"
  })
}

// Parallax scroll effect
export const parallaxScroll = (element, speed = 0.5) => {
  return gsap.to(element, {
    yPercent: -100 * speed,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  })
}

// Hover animation helper
export const hoverAnimation = (element, scaleValue = 1.05) => {
  const tl = gsap.timeline({ paused: true })
  tl.to(element, {
    scale: scaleValue,
    duration: 0.3,
    ease: "power2.out"
  })

  element.addEventListener('mouseenter', () => tl.play())
  element.addEventListener('mouseleave', () => tl.reverse())

  return tl
}

// Loading animation
export const loadingAnimation = (element) => {
  return gsap.to(element, {
    rotation: 360,
    duration: 1,
    repeat: -1,
    ease: "linear"
  })
}

// Success animation
export const successAnimation = (element) => {
  const tl = gsap.timeline()
  tl.from(element, {
    scale: 0,
    duration: 0.3,
    ease: "back.out(1.7)"
  })
  .to(element, {
    scale: 1.1,
    duration: 0.2,
    ease: "power2.out"
  })
  .to(element, {
    scale: 1,
    duration: 0.2,
    ease: "power2.inOut"
  })

  return tl
}

export default {
  fadeIn,
  slideUp,
  scaleIn,
  staggerReveal,
  typeText,
  bounceIn,
  parallaxScroll,
  hoverAnimation,
  loadingAnimation,
  successAnimation
}