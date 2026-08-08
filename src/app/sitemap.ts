import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/features`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/how-it-works`, lastModified: new Date(), priority: 0.8 },
  ];
}