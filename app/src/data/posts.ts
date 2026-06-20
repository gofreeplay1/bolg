/**
 * Posts data is now managed via the MySQL-backed API.
 * Use the API client in @/api for data fetching.
 *
 * Public (no auth):
 *   fetchPublicPosts()       - GET /api/public/posts
 *   fetchPublicPostBySlug()  - GET /api/public/posts/:slug
 *   fetchPublicTags()        - GET /api/public/tags
 *   fetchPublicPostsByTag()  - GET /api/public/tags/:tag
 *
 * Admin (requires auth):
 *   fetchAllPosts()          - GET /api/posts
 *   fetchPostBySlug()        - GET /api/posts/:slug
 *   createPost()             - POST /api/posts
 *   updatePostBySlug()       - PUT /api/posts/:slug
 *   deletePostBySlug()       - DELETE /api/posts/:slug
 *
 * Or use Zustand stores: usePostsStore, useAuthStore
 */

export {};
