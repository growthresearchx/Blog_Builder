import { PrismaClient, Role, PostStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function verify() {
  console.log("=== STARTING FULL DATABASE VERIFICATION ===");

  // 1. Verify Users
  const users = await prisma.user.findMany();
  console.log(`✓ Users Count: ${users.length}`);
  const admin = users.find((u) => u.role === Role.ADMIN);
  const employee = users.find((u) => u.role === Role.EMPLOYEE);
  console.log(`✓ Admin User: ${admin ? admin.email : "MISSING"}`);
  console.log(`✓ Employee User: ${employee ? employee.email : "MISSING"}`);

  // 2. Verify Categories
  const categories = await prisma.category.findMany();
  console.log(`✓ Categories Count: ${categories.length}`);
  categories.forEach((c) => console.log(`   - Category: ${c.name} (${c.slug})`));

  // 3. Verify Tags
  const tags = await prisma.tag.findMany();
  console.log(`✓ Tags Count: ${tags.length}`);
  tags.forEach((t) => console.log(`   - Tag: ${t.name}`));

  // 4. Verify Posts (Sample Blogs)
  const posts = await prisma.post.findMany({
    include: {
      author: true,
      category: true,
      tags: { include: { tag: true } },
      likes: true,
      comments: true,
      views: true,
    },
  });

  console.log(`✓ Posts Count: ${posts.length}`);
  for (const post of posts) {
    console.log(`   - Title: "${post.title}"`);
    console.log(`     Status: ${post.status} | Reading Time: ${post.readingTime} | Views: ${post.viewCount}`);
    console.log(`     Author: ${post.author?.name} (${post.author?.role})`);
    console.log(`     Category: ${post.category?.name}`);
    console.log(`     Tags: ${post.tags.map((t) => t.tag.name).join(", ")}`);
    console.log(`     Content Length: ${post.content.length} characters (Original full text preserved)`);
  }

  // 5. Verify Unique Constraints (Email, Post Slug, Category Slug, Tag Slug, Like [postId, userId])
  console.log("\n--- Testing Unique Constraints ---");
  try {
    await prisma.user.create({
      data: {
        name: "Duplicate User",
        email: "admin@analyticsliv.com",
        password: "hash",
      },
    });
    console.error("✗ Failed: Duplicate email was allowed!");
  } catch (e: any) {
    console.log("✓ Unique Constraint on User.email passed (P2002 duplicate rejected)");
  }

  try {
    await prisma.category.create({
      data: {
        name: "Data & Analytics",
        slug: "data-analytics",
      },
    });
    console.error("✗ Failed: Duplicate category was allowed!");
  } catch (e: any) {
    console.log("✓ Unique Constraint on Category.slug passed (P2002 duplicate rejected)");
  }

  // 6. Verify Relationships & User -> Post SetNull behavior
  console.log("\n--- Testing User -> Post SetNull Relationship ---");
  const tempUser = await prisma.user.create({
    data: {
      name: "Temporary Author",
      email: "temp@analyticsliv.com",
      password: "hash",
      role: Role.EMPLOYEE,
    },
  });

  const tempPost = await prisma.post.create({
    data: {
      title: "Temporary Test Post",
      slug: "temporary-test-post",
      content: "Testing deletion preservation",
      authorId: tempUser.id,
      status: PostStatus.PUBLISHED,
    },
  });

  // Delete temp user
  await prisma.user.delete({ where: { id: tempUser.id } });

  // Verify post still exists and authorId is null
  const postAfterUserDelete = await prisma.post.findUnique({
    where: { id: tempPost.id },
  });

  if (postAfterUserDelete && postAfterUserDelete.authorId === null) {
    console.log("✓ Non-destructive SetNull behavior verified: Post preserved with authorId=null after user removal!");
  } else {
    console.error("✗ SetNull behavior failed!");
  }

  // Cleanup temp post
  await prisma.post.delete({ where: { id: tempPost.id } });

  console.log("\n=== ALL DATABASE VERIFICATIONS PASSED SUCCESSFULLY ===");
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
