export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
  readingTime: number;
}

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingTime: number;
}

// Site settings types
export interface NavLink {
  to: string;
  label: string;
}

export interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

export interface SiteSettings {
  name: string;
  description: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  postCopyright?: string;
}

export interface HeaderSettings {
  navLinks: NavLink[];
}

export interface FooterSettings {
  brandName: string;
  tagline: string;
  socialLinks: SocialLink[];
  copyright: string;
  icpBeian?: string;
  gonganBeian?: string;
}

export interface AboutSettings {
  name: string;
  tagline: string;
  bio: string;
  socialLinks: SocialLink[];
}

export interface SplashSettings {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  background?: string;
}

export interface AppearanceSettings {
  siteLogo?: string;
  siteBackground?: string;
  loginBackground?: string;
  donateQrCode?: string;
  donateText?: string;
  splash?: SplashSettings;
}

export interface AllSettings {
  site: SiteSettings;
  header: HeaderSettings;
  footer: FooterSettings;
  about: AboutSettings;
  appearance?: AppearanceSettings;
}

// Custom page types
export interface CustomPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  is_published: number;
  created_at: string;
  updated_at: string;
}

// Comment types
export interface Comment {
  id: number;
  post_slug: string;
  author: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// Friend link types
export interface FriendLink {
  id: number;
  name: string;
  url: string;
  description: string;
  sort_order: number;
  is_visible: number;
  created_at: string;
}

// Tag types
export interface Tag {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  post_count: number;
  created_at: string;
  updated_at: string;
}
