/**
 * TravelEase Services Barrel Export
 * Centralized export point for all frontend API clients, engines, and gateways.
 * @module services
 */

export { default as api, getBlogPosts } from './api';
export * from './auth';
export * from './irctcApi';
export * from './flightApi';
export * from './hotelApi';
export * from './pricingApi';
export * from './paymentService';
export * from './aiEngine';
export * from './realtimeDataEngine';
