export type SEO = {
  title: string;
  description: string;
};

export type Collection = {
  handle: string;
  title: string;
  description: string;
  seo: SEO;
  updatedAt: string;
};
