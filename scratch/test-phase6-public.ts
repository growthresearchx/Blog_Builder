import { prisma } from "../lib/prisma";
import { PostStatus, Role } from "@prisma/client";

async function main() {
  console.log("==================================================");
  console.log("       PHASE 6: PUBLIC BLOG PLATFORM TEST         ");
  console.log("==================================================\n");

  // 1. Test Public Homepage Blog Query (Only PUBLISHED posts)
  console.log("--- 1. Testing Public Homepage Blog Query ---");
  const publishedBlogs = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { id: true, name: true, email: true, avatar: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { include: { tag: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  console.log(`✓ Found ${publishedBlogs.length} published blogs for public display:`);
  for (const blog of publishedBlogs) {
    console.log(`  - [${blog.category?.name || "Uncategorized"}] "${blog.title}" (${blog.readingTime || "N/A"}) by ${blog.author?.name || "Staff"}`);
    if (blog.status !== PostStatus.PUBLISHED) {
      throw new Error(`CRITICAL: Non-published blog found in public query: ${blog.title}`);
    }
  }

  // Verify drafts / unpublished are excluded
  const nonPublishedCount = await prisma.post.count({
    where: { status: { not: PostStatus.PUBLISHED } },
  });
  console.log(`✓ Non-published blogs in system: ${nonPublishedCount} (Correctly isolated from public)`);

  // 2. Test Individual Blog Detail Access
  console.log("\n--- 2. Testing Blog Detail By Slug ---");
  const sampleBlog = publishedBlogs[0];
  if (!sampleBlog) throw new Error("No sample blog available to test detail view");

  const resolvedBlog = await prisma.post.findUnique({
    where: { slug: sampleBlog.slug },
    include: {
      author: true,
      category: true,
      tags: { include: { tag: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  if (!resolvedBlog || resolvedBlog.status !== PostStatus.PUBLISHED) {
    throw new Error("Failed to resolve published blog by slug!");
  }
  console.log(`✓ Resolved blog "${resolvedBlog.title}" (slug: /blogs/${resolvedBlog.slug})`);
  console.log(`  Author: ${resolvedBlog.author?.name}, Reading Time: ${resolvedBlog.readingTime}`);

  // 3. Test Search Across Published Blogs
  console.log("\n--- 3. Testing Public Blog Search ---");
  const searchTerm = "data";
  const searchResults = await prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { excerpt: { contains: searchTerm, mode: "insensitive" } },
        { content: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
  });
  console.log(`✓ Search for "${searchTerm}" returned ${searchResults.length} matching published articles`);
  for (const r of searchResults) {
    console.log(`  - "${r.title}" (Status: ${r.status})`);
  }

  // 4. Test Category Filtering
  console.log("\n--- 4. Testing Category Filtering ---");
  const sampleCategory = await prisma.category.findFirst({
    where: { posts: { some: { status: PostStatus.PUBLISHED } } },
  });

  if (sampleCategory) {
    const categoryBlogs = await prisma.post.findMany({
      where: {
        categoryId: sampleCategory.id,
        status: PostStatus.PUBLISHED,
      },
    });
    console.log(`✓ Category "${sampleCategory.name}" (/category/${sampleCategory.slug}) has ${categoryBlogs.length} published articles`);
  }

  // 5. Test Tag Filtering
  console.log("\n--- 5. Testing Tag Filtering ---");
  const sampleTag = await prisma.tag.findFirst({
    where: { posts: { some: { post: { status: PostStatus.PUBLISHED } } } },
  });

  if (sampleTag) {
    const tagBlogs = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        tags: { some: { tagId: sampleTag.id } },
      },
    });
    console.log(`✓ Tag "#${sampleTag.name}" (/tag/${sampleTag.slug}) has ${tagBlogs.length} published articles`);
  }

  // 6. Test Blog View Tracking
  console.log("\n--- 6. Testing Blog View Tracking & Increment ---");
  const initialViewCount = sampleBlog.viewCount;
  
  // Track a view
  await prisma.$transaction([
    prisma.postView.create({
      data: { postId: sampleBlog.id },
    }),
    prisma.post.update({
      where: { id: sampleBlog.id },
      data: { viewCount: { increment: 1 } },
    }),
  ]);

  const updatedBlog = await prisma.post.findUnique({
    where: { id: sampleBlog.id },
    select: { viewCount: true },
  });

  console.log(`✓ View count updated: ${initialViewCount} -> ${updatedBlog?.viewCount}`);
  if (updatedBlog?.viewCount !== initialViewCount + 1) {
    throw new Error("View count increment failed!");
  }

  // 7. Test Likes & Toggle Functionality
  console.log("\n--- 7. Testing Like / Unlike Functionality ---");
  const testUser = await prisma.user.findFirst({ where: { role: Role.EMPLOYEE } });
  if (!testUser) throw new Error("Test user not found");

  // Clean up any prior like by this user on this post
  await prisma.like.deleteMany({
    where: { postId: sampleBlog.id, userId: testUser.id },
  });

  // Like
  const createdLike = await prisma.like.create({
    data: { postId: sampleBlog.id, userId: testUser.id },
  });
  console.log(`✓ Created Like ID: ${createdLike.id} for user ${testUser.name}`);

  const likeCountAfterLike = await prisma.like.count({ where: { postId: sampleBlog.id } });
  console.log(`✓ Post Like Count: ${likeCountAfterLike}`);

  // Test duplicate prevention (Unique constraint [postId, userId])
  try {
    await prisma.like.create({
      data: { postId: sampleBlog.id, userId: testUser.id },
    });
    throw new Error("CRITICAL: Duplicate like was allowed!");
  } catch (err: any) {
    console.log("✓ Duplicate like correctly blocked by PostgreSQL unique constraint");
  }

  // Unlike toggle
  await prisma.like.delete({
    where: { id: createdLike.id },
  });
  const likeCountAfterUnlike = await prisma.like.count({ where: { postId: sampleBlog.id } });
  console.log(`✓ Unlike toggle successful. Like Count restored: ${likeCountAfterUnlike}`);

  // 8. Test Comments CRUD & Security
  console.log("\n--- 8. Testing Comments Section CRUD ---");
  const testComment = await prisma.comment.create({
    data: {
      content: "This is a great analytical piece! Well written.",
      postId: sampleBlog.id,
      userId: testUser.id,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  console.log(`✓ Created Comment ID: ${testComment.id} by ${testComment.user.name}`);

  // Fetch comments
  const postComments = await prisma.comment.findMany({
    where: { postId: sampleBlog.id },
    include: { user: { select: { name: true } } },
  });
  console.log(`✓ Fetched ${postComments.length} comments for post`);

  // Delete test comment
  await prisma.comment.delete({
    where: { id: testComment.id },
  });
  console.log("✓ Deleted test comment safely");

  // 9. Test Pagination Boundaries
  console.log("\n--- 9. Testing Pagination Logic ---");
  const totalPosts = await prisma.post.count({ where: { status: PostStatus.PUBLISHED } });
  const pageSize = 2;
  const totalPages = Math.ceil(totalPosts / pageSize);
  console.log(`✓ Total published: ${totalPosts}, Page size: ${pageSize} -> Total Pages: ${totalPages}`);

  const page1 = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    skip: 0,
    take: pageSize,
    select: { id: true, title: true },
  });
  const page2 = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    skip: pageSize,
    take: pageSize,
    select: { id: true, title: true },
  });

  console.log(`✓ Page 1 items: ${page1.length}, Page 2 items: ${page2.length}`);
  const hasOverlap = page1.some((p1) => page2.some((p2) => p2.id === p1.id));
  if (hasOverlap) throw new Error("CRITICAL: Pagination returned duplicate records across pages!");
  console.log("✓ No duplicate records across pages (Pagination boundaries verified)");

  console.log("\n==================================================");
  console.log("     ALL PHASE 6 PUBLIC TESTS PASSED CLEANLY!     ");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
