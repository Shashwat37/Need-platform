/**
 * serviceIcons.js — turns the backend's icon name into a real icon component.
 *
 * WHAT: The backend sends a text key like "electrician". This file maps that
 *       key to a Lucide icon.
 * WHY:  The database stays pure data — no images, no React inside it. And an
 *       admin can add a new service later without a code change; it just gets
 *       the default wrench icon until we add a nicer one here.
 * HOW:  `getServiceIcon('plumber')` returns the Droplets component.
 */

import {
  Bug,
  Car,
  Droplet,
  Droplets,
  Hammer,
  HardHat,
  HeartHandshake,
  Home,
  Paintbrush,
  Plug,
  Scissors,
  Shirt,
  Snowflake,
  Sparkles,
  Sprout,
  Tv,
  Wind,
  Wrench,
  Zap,
  Dog,
} from 'lucide-react'

const ICONS = {
  electrician: Zap,
  plumber: Droplets,
  carpenter: Hammer,
  painter: Paintbrush,
  cleaner: Sparkles,
  gardener: Sprout,
  'house-help': Home,
  caregiver: HeartHandshake,
  driver: Car,
  technician: Wrench,

  'ac-service': Wind,
  refrigerator: Snowflake,
  'washing-machine': Shirt,
  tv: Tv,
  'appliance-repair': Plug,

  'car-washing': Droplet,
  construction: HardHat,
  'pest-control': Bug,
  'pet-grooming': Dog,
  barber: Scissors,
}

/**
 * Always returns a component, never undefined.
 * A missing icon must never be allowed to crash the page.
 */
export function getServiceIcon(iconName) {
  return ICONS[iconName] || Wrench
}


const IMAGES = {
  electrician: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80',
  plumber: 'https://images.unsplash.com/photo-1607472586893-edb57cb31328?w=500&q=80',
  carpenter: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=500&q=80',
  painter: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500&q=80',
  cleaner: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80',
  gardener: 'https://images.unsplash.com/photo-1416879598553-5681a420b925?w=500&q=80',
  'house-help': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80',
  caregiver: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&q=80',
  driver: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500&q=80',
  technician: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&q=80',
  'ac-service': 'https://images.unsplash.com/photo-1599304918731-9a74c423c7df?w=500&q=80',
  refrigerator: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&q=80',
  'washing-machine': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&q=80',
  tv: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80',
  'appliance-repair': 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=500&q=80',
  'car-washing': 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=500&q=80',
  construction: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80',
  'pest-control': 'https://images.unsplash.com/photo-1632832865719-74e899b86029?w=500&q=80',
  'pet-grooming': 'https://images.unsplash.com/photo-1516734212498-132d4314f358?w=500&q=80',
  barber: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&q=80',
}

export function getServiceImage(iconName) {
  return IMAGES[iconName] || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&q=80'
}
